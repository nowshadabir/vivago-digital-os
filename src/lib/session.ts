const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const textEncoder = new TextEncoder();

function getSessionSecret() {
  return (
    process.env.AUTH_SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.DATABASE_URL ??
    "vivago-dev-session-secret"
  );
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(userId: string) {
  const issuedAt = Date.now().toString();
  const payload = `${userId}.${issuedAt}`;
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));

  return `${userId}.${issuedAt}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [userId, issuedAt, signature] = parts;
  const issuedAtNumber = Number(issuedAt);

  if (!userId || !Number.isFinite(issuedAtNumber)) {
    return null;
  }

  if (Date.now() - issuedAtNumber > SESSION_TTL_SECONDS * 1000) {
    return null;
  }

  const payload = `${userId}.${issuedAt}`;
  const key = await getKey();
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64Url(signature),
    textEncoder.encode(payload)
  );

  return isValid ? userId : null;
}

export function isSameOrigin(request: { headers: Headers; nextUrl?: { origin: string } }) {
  const origin = request.headers.get("origin");
  const expectedOrigin = request.nextUrl?.origin ?? null;

  return Boolean(origin && expectedOrigin && origin === expectedOrigin);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
  secure: process.env.NODE_ENV === "production",
};
