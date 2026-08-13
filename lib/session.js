// Signature HMAC du cookie de session via l'API Web Crypto (crypto.subtle) —
// disponible à la fois dans les Route Handlers Node.js et dans le Middleware
// Next.js qui tourne en Edge Runtime. Aucune dépendance externe.

export const SESSION_COOKIE = "sema_session";

async function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET manquant côté serveur (voir .env.example) — impossible de signer la session."
    );
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signSession(identifiant) {
  const key = await getKey();
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(identifiant));
  return `${identifiant}.${toHex(sigBuffer)}`;
}

export async function verifySession(value) {
  if (!value) return null;
  const [identifiant, sig] = value.split(".");
  if (!identifiant || !sig) return null;

  try {
    const key = await getKey();
    const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(identifiant));
    const expected = toHex(sigBuffer);
    if (expected.length !== sig.length) return null;

    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
    }
    return diff === 0 ? identifiant : null;
  } catch {
    return null;
  }
}
