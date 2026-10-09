import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query, transaction } from "../db/pool.js";
import { DEFAULT_PLAN } from "../config/plans.js";
import { optionalAuth, publicUser, requireAuth, USER_COLUMNS } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import {
  clearSessionCookie,
  createResetToken,
  hashResetToken,
  setSessionCookie,
  signSessionToken,
} from "../services/tokens.js";
import { sendPasswordResetEmail } from "../services/mailer.js";
import { asyncHandler, badRequest, conflict, unauthorized } from "../utils/http.js";
import { parseBody } from "../utils/validate.js";

const router = Router();
const BCRYPT_ROUNDS = 12;

const passwordRule = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(200, "A senha e longa demais.");

const emailRule = z
  .string()
  .trim()
  .min(1, "Informe o e-mail.")
  .max(200, "O e-mail e longo demais.")
  .email("Informe um e-mail valido.")
  .toLowerCase();

const registerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(100, "O nome e longo demais."),
  email: emailRule,
  password: passwordRule,
});

const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Informe a senha."),
});

/** Cria a conta e ja deixa o usuario logado. */
router.post("/register", authLimiter, asyncHandler(async (req, res) => {
  const { name, email, password } = parseBody(registerSchema, req.body);

  const existing = await query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (existing.rowCount > 0) {
    throw conflict("Ja existe uma conta com este e-mail.");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, plan)
     VALUES ($1, $2, $3, $4)
     RETURNING ${USER_COLUMNS}`,
    [name, email, passwordHash, DEFAULT_PLAN],
  );

  const user = rows[0];
  setSessionCookie(res, signSessionToken(user));
  res.status(201).json({ user: publicUser(user) });
}));

router.post("/login", authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = parseBody(loginSchema, req.body);

  const { rows } = await query(
    `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = $1`,
    [email],
  );
  const row = rows[0];

  // Compara sempre, mesmo sem usuario, para nao revelar quais e-mails existem.
  const fallbackHash = "$2a$12$0000000000000000000000000000000000000000000000000000";
  const matches = await bcrypt.compare(password, row?.password_hash ?? fallbackHash);

  if (!row || !matches) {
    throw unauthorized("E-mail ou senha incorretos.");
  }

  setSessionCookie(res, signSessionToken(row));
  res.json({ user: publicUser(row) });
}));

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ message: "Sessao encerrada." });
});

/** Usado pelo frontend ao carregar a pagina para restaurar a sessao. */
router.get("/me", optionalAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Informe a senha atual."),
  new_password: passwordRule,
});

router.post("/change-password", requireAuth, asyncHandler(async (req, res) => {
  const { current_password: currentPassword, new_password: newPassword } =
    parseBody(changePasswordSchema, req.body);

  const { rows } = await query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
  const matches = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!matches) throw badRequest("A senha atual esta incorreta.");

  if (await bcrypt.compare(newPassword, rows[0].password_hash)) {
    throw badRequest("A nova senha precisa ser diferente da atual.");
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, req.user.id]);

  res.json({ message: "Senha alterada com sucesso." });
}));

const forgotSchema = z.object({ email: emailRule });

/**
 * Sempre responde a mesma coisa, exista a conta ou nao, para nao expor
 * quais e-mails estao cadastrados.
 */
router.post("/forgot-password", authLimiter, asyncHandler(async (req, res) => {
  const { email } = parseBody(forgotSchema, req.body);
  const genericMessage = "Se existir uma conta com este e-mail, enviamos um link de recuperacao.";

  const { rows } = await query("SELECT id, name, email FROM users WHERE email = $1", [email]);
  const user = rows[0];

  if (user) {
    const { token, tokenHash } = createResetToken();
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, now() + interval '1 hour')`,
      [user.id, tokenHash],
    );
    await sendPasswordResetEmail(user, token);
  }

  res.json({ message: genericMessage });
}));

const resetSchema = z.object({
  token: z.string().trim().min(10, "O link de recuperacao e invalido."),
  password: passwordRule,
});

router.post("/reset-password", authLimiter, asyncHandler(async (req, res) => {
  const { token, password } = parseBody(resetSchema, req.body);
  const tokenHash = hashResetToken(token);

  await transaction(async (client) => {
    const { rows } = await client.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
       FOR UPDATE`,
      [tokenHash],
    );
    const reset = rows[0];
    if (!reset) {
      throw badRequest("Este link de recuperacao expirou ou ja foi usado. Peca um novo.");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, reset.user_id]);
    await client.query("UPDATE password_resets SET used_at = now() WHERE id = $1", [reset.id]);
    // Invalida outros pedidos pendentes da mesma conta.
    await client.query(
      "UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
      [reset.user_id],
    );
  });

  res.json({ message: "Senha redefinida com sucesso. Entre com a nova senha." });
}));

export default router;
