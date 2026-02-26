const BASE64_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// note: Precompute reverse lookup for O(1) decoding
const REVERSE_LOOKUP = new Uint8Array(256);
for (let i = 0; i < BASE64_TABLE.length; i++) {
  REVERSE_LOOKUP[BASE64_TABLE.charCodeAt(i)] = i;
}

export function encodeBase64(value: string): string {
  if (!value) return "";

  const bytes = new TextEncoder().encode(value);
  let output = "";
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const first = bytes[i];
    const second = i + 1 < len ? bytes[i + 1] : 0;
    const third = i + 2 < len ? bytes[i + 2] : 0;

    const chunk = (first << 16) | (second << 8) | third;

    output += BASE64_TABLE[(chunk >> 18) & 63];
    output += BASE64_TABLE[(chunk >> 12) & 63];
    output += i + 1 < len ? BASE64_TABLE[(chunk >> 6) & 63] : "=";
    output += i + 2 < len ? BASE64_TABLE[chunk & 63] : "=";
  }

  return output;
}

export function decodeBase64(value: string): string {
  const normalized = value.replace(/\s+/g, "");
  if (!normalized) return "";

  if (normalized.length % 4 !== 0) {
    throw new Error("Invalid Base64 length");
  }

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error("Invalid Base64 characters");
  }

  // pre-allocate Uint8Array
  let padding = 0;
  if (normalized.endsWith("==")) padding = 2;
  else if (normalized.endsWith("=")) padding = 1;

  const byteLength = (normalized.length * 3) / 4 - padding;
  const bytes = new Uint8Array(byteLength);
  let byteIndex = 0;

  for (let i = 0; i < normalized.length; i += 4) {
    const a = REVERSE_LOOKUP[normalized.charCodeAt(i)];
    const b = REVERSE_LOOKUP[normalized.charCodeAt(i + 1)];
    const cCode = normalized.charCodeAt(i + 2);
    const dCode = normalized.charCodeAt(i + 3);

    // 61 is '='
    const c = cCode === 61 ? 0 : REVERSE_LOOKUP[cCode];
    const d = dCode === 61 ? 0 : REVERSE_LOOKUP[dCode];

    bytes[byteIndex++] = (a << 2) | (b >> 4);
    if (cCode !== 61) bytes[byteIndex++] = ((b & 15) << 4) | (c >> 2);
    if (dCode !== 61) bytes[byteIndex++] = ((c & 3) << 6) | d;
  }

  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
