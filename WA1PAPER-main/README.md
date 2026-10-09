# WA1PAPER

Galeria de wallpapers com geração por inteligência artificial.
Frontend em React + Vite, backend em Node.js + Express + PostgreSQL.

```
WA1PAPER-main/
├── src/     frontend React
└── back/    API Node.js + PostgreSQL
```

---

## Começar

Você só precisa do **Node.js 20+**. O PostgreSQL já vem junto com o projeto —
não precisa instalar nada além disso.

São **dois terminais**, rodando ao mesmo tempo:

**Terminal 1 — a API:**

```bash
cd back
npm install
npm run dev
```

**Terminal 2 — o site:**

```bash
npm install
npm run dev
```

Depois abra <http://localhost:5173>.

Na primeira vez a API demora alguns segundos a mais: ela prepara o banco, cria
as tabelas e enche a galeria sozinha. Já vem uma conta pronta para testar:

```
demo@wa1paper.app / wa1paper123
```

## O que funciona

| Recurso | Onde |
|---|---|
| Cadastro, login e logout | `/criar-conta`, `/cadastro` |
| Perfil (nome, @usuário, conta privada) | `/perfil` |
| Trocar a senha | `/alterar-senha` |
| Recuperar a senha por e-mail | `/esqueci-senha` |
| Galeria com busca e filtro por categoria | `/` |
| Favoritar e listar favoritos | `/favoritados` |
| Publicar wallpaper por URL | `/wallpapers/novo` |
| Gerar wallpaper com IA | botão de conversa, em qualquer tela |
| Planos e saldo de créditos | `/planos`, `/credito` |

A documentação completa da API, os endpoints e as decisões de segurança estão
em [`back/README.md`](back/README.md).

---

## Observações

**Geração por IA** — a chave do Gemini já está em `back/.env`. Ela precisa de
saldo no Google AI Studio: sem saldo, a API responde com uma mensagem clara e o
resto do site continua normal.

**Pagamentos** — o checkout do Mercado Pago está implementado, mas precisa de
`MERCADOPAGO_ACCESS_TOKEN` em `back/.env`. Sem o token, apenas o botão de
compra avisa que o pagamento não foi configurado.

**E-mails** — em desenvolvimento, o link de recuperação de senha é impresso no
terminal da API em vez de enviado. Para produção, veja a seção 11 do
`back/README.md`.
