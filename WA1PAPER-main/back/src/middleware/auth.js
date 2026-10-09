import { query } from "../db/pool.js";
import { unauthorized } from "../utils/http.js";
import { SESSION_COOKIE, verifySessionToken } from "../services/tokens.js";

const USER_COLUMNS = `
  id, name, email, username, avatar_url, is_private,
  plan, plan_expires_at, credits, created_at
`;

/** Formato do usuario devolvido ao frontend (nunca inclui password_hash). */
export function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    avatar_url: row.avatar_url,
    isPrivate: row.is_private,
    plan: row.plan,
    plan_expires_at: row.plan_expires_at,
    credits: row.credits,
    created_at: row.created_at,
  };
}

async function loadUserFromRequest(req) {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[SESSION_COOKIE] || bearer;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload?.sub) return null;

  const { rows } = await query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [payload.sub]);
  return rows[0] ?? null;
}

/** Popula req.user quando houver sessao valida, mas nunca bloqueia. */
export async function optionalAuth(req, _res, next) {
  try {
    req.user = await loadUserFromRequest(req);
    next();
  } catch (error) {
    next(error);
  }
}

/** Exige sessao valida. */
export async function requireAuth(req, _res, next) {
  try {
    req.user = await loadUserFromRequest(req);
    if (!req.user) throw unauthorized();
    next();
  } catch (error) {
    next(error);
  }
}

export { USER_COLUMNS };
