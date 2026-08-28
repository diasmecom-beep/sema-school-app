import crypto from "crypto";

// Alphabet sans caractères ambigus (pas de 0/O, 1/I).
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomFromAlphabet(length) {
  return Array.from(crypto.randomBytes(length))
    .map((b) => CHARS[b % CHARS.length])
    .join("");
}

export function generateIdentifiant(prefix = "SEMA") {
  return `${prefix}-${randomFromAlphabet(6)}`;
}

export function generateCodeAcces() {
  return randomFromAlphabet(8);
}

export function hashCode(code) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(code, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyCode(code, stored) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(code, salt, 64).toString("hex");
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = Buffer.from(test, "hex");
  if (hashBuf.length !== testBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, testBuf);
}
