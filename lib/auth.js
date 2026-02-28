import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-dev-secret-change-in-production");
const COOKIE_NAME = "bc_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ── Password Hashing ───────────────────────────────────────────────────────

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ── JWT Token Management ────────────────────────────────────────────────

export async function createToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// ── Session Cookie Management ───────────────────────────────────────────

export async function setSessionCookie(userId, email, role) {
  const token = await createToken({ userId, email, role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ── Admin Check ─────────────────────────────────────────────────────────

export function isAdminLogin(email, password) {
  return (
    email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase() &&
    password === process.env.ADMIN_PASSWORD
  );
}

// ── Invite Code Generator ───────────────────────────────────────────────

export function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BRO-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
