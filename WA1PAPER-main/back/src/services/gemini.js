import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import env from "../config/env.js";
import { HttpError, badRequest } from "../utils/http.js";

/*
 * O Gemini tem duas portas de entrada, com faturamento SEPARADO:
 *
 *  - vertex    (padrao): aiplatform.googleapis.com. Cobra do Google Cloud
 *              Billing, entao consome os creditos do seu projeto no Cloud.
 *  - aistudio: generativelanguage.googleapis.com. Cobra do saldo pre-pago
 *              proprio do AI Studio, que NAO usa os creditos do Cloud.
 *
 * A chave precisa combinar com a porta escolhida: uma chave do AI Studio da
 * 403 no Vertex e vice-versa. Troque pela variavel GEMINI_PROVIDER no .env.
 */
const PROVIDERS = {
  vertex: "https://aiplatform.googleapis.com/v1/publishers/google",
  aistudio: "https://generativelanguage.googleapis.com/v1beta",
};

const API_BASE = PROVIDERS[env.geminiProvider] ?? PROVIDERS.vertex;
const GENERATION_TIMEOUT_MS = 120_000;

const MIME_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

/** Dá ao modelo um enquadramento de wallpaper sem descartar o pedido do usuario. */
function buildPrompt(userPrompt, isEdit) {
  if (isEdit) {
    return [
      "Edit the provided image according to the user's request.",
      "Preserve the original subject, characters, composition, and art style unless the user explicitly asks to change them.",
      "Do not turn an illustration into a photograph or replace its subject with a different scene.",
      "Make only the requested changes and keep the result suitable as a wallpaper.",
      "",
      `User request: ${userPrompt}`,
    ].join("\n");
  }

  return [
    "Generate a high-quality vertical mobile wallpaper image.",
    "Composition: clean, striking, suitable as a phone background,",
    "with no text, watermarks, logos or UI elements.",
    "",
    `User request: ${userPrompt}`,
  ].join("\n");
}

/** Traduz os erros da API do Google em mensagens que o usuario entende. */
function translateApiError(status, payload) {
  const message = payload?.error?.message ?? "";

  if (status === 400 && /API key not valid/i.test(message)) {
    return new HttpError(503, "A chave da API do Gemini e invalida. Confira GEMINI_API_KEY no arquivo back/.env.");
  }
  if (status === 402) {
    const onde = env.geminiProvider === "vertex"
      ? "Confira o faturamento do projeto no Google Cloud (console.cloud.google.com/billing)."
      : "Ative o faturamento em https://ai.studio/projects.";
    return new HttpError(503, `A conta esta sem creditos para gerar imagens. ${onde}`);
  }
  if (status === 403) {
    // Causa mais comum: chave de um provedor usada no endpoint do outro.
    const outro = env.geminiProvider === "vertex" ? "aistudio" : "vertex";
    return new HttpError(
      503,
      `A chave nao tem permissao neste endpoint (GEMINI_PROVIDER=${env.geminiProvider}). `
        + `Verifique se ela foi criada para esse provedor -- uma chave de "${outro}" da 403 aqui.`,
    );
  }
  if (status === 404) {
    return new HttpError(
      503,
      `O modelo "${env.geminiImageModel}" nao esta disponivel para esta chave. `
        + "Ajuste GEMINI_IMAGE_MODEL no arquivo back/.env.",
    );
  }
  if (status === 429) {
    return new HttpError(
      503,
      "O limite de geracoes por minuto foi atingido. Espere um pouco e tente de novo.",
    );
  }
  if (status >= 500) {
    return new HttpError(503, "O servico de IA esta instavel no momento. Tente de novo em instantes.");
  }

  // Prompt recusado por politica de conteudo
  if (/safety|blocked|policy/i.test(message)) {
    return badRequest("Este pedido foi recusado pelo filtro de conteudo da IA. Tente descrever de outro jeito.");
  }

  return new HttpError(503, `Nao foi possivel gerar a imagem: ${message || `erro ${status}`}`);
}

/**
 * Gera uma imagem com o Gemini e salva em back/uploads/wallpapers.
 * Devolve { imageUrl, relativePath, model, mimeType }.
 */
export async function generateWallpaperImage(userPrompt, { sourceImage } = {}) {
  if (!env.geminiApiKey) {
    throw new HttpError(
      503,
      "A geracao por IA ainda nao foi configurada. Preencha GEMINI_API_KEY no arquivo back/.env.",
    );
  }

  const model = env.geminiImageModel;
  const url = `${API_BASE}/models/${encodeURIComponent(model)}:generateContent`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        // A chave vai no cabecalho, nunca na URL (evita vazamento em logs).
        "x-goog-api-key": env.geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            ...(sourceImage
              ? [{ inlineData: { mimeType: sourceImage.mimeType, data: sourceImage.data } }]
              : []),
            { text: buildPrompt(userPrompt, Boolean(sourceImage)) },
          ],
        }],
        // O Vertex recusa IMAGE sozinho; o AI Studio aceita os dois formatos.
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          // 9:16 e o formato de tela de celular; "2K" sai em 1536x2752, acima
          // de Full HD (1080x1920), para o download valer a pena.
          imageConfig: { aspectRatio: "9:16", imageSize: "2K" },
        },
      }),
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new HttpError(504, "A IA demorou demais para responder. Tente de novo.");
    }
    throw new HttpError(503, "Nao foi possivel falar com o servico de IA. Verifique sua conexao.");
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw translateApiError(response.status, payload);
  }

  const candidate = payload?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart) {
    const refusal = parts.find((part) => part.text)?.text;
    const blockReason = payload?.promptFeedback?.blockReason ?? candidate?.finishReason;
    if (blockReason && blockReason !== "STOP") {
      throw badRequest("A IA recusou este pedido. Tente descrever o wallpaper de outro jeito.");
    }
    throw new HttpError(503, refusal
      ? `A IA respondeu sem imagem: ${refusal.slice(0, 180)}`
      : "A IA nao devolveu nenhuma imagem. Tente de novo.");
  }

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  const extension = MIME_EXTENSIONS[mimeType] ?? "png";
  const buffer = Buffer.from(imagePart.inlineData.data, "base64");

  if (!buffer.length) {
    throw new HttpError(503, "A IA devolveu uma imagem vazia. Tente de novo.");
  }

  const fileName = `${crypto.randomUUID()}.${extension}`;
  const directory = resolve(env.uploadsDir, "wallpapers");
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, fileName), buffer);

  // Guardamos o caminho relativo: assim trocar a porta ou o dominio
  // (desenvolvimento -> producao) nao quebra as imagens ja geradas.
  const storedPath = `/uploads/wallpapers/${fileName}`;

  return {
    storedPath,
    imageUrl: `${env.publicUrl}${storedPath}`,
    model,
    mimeType,
    bytes: buffer.length,
  };
}

/** Sugere um titulo curto a partir do prompt, para a galeria. */
export function titleFromPrompt(prompt) {
  const clean = prompt.replace(/\s+/g, " ").trim();
  if (clean.length <= 60) return clean;
  return `${clean.slice(0, 57).trimEnd()}...`;
}
