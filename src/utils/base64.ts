const BASE64_TABLE =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function encodeBase64(value: string): string {
  if (!value) return "";

  const bytes = new TextEncoder().encode(value);
  let output = "";

  for (let i = 0; i < bytes.length; i += 3) {
    const first = bytes[i] ?? 0;
    const second = bytes[i + 1] ?? 0;
    const third = bytes[i + 2] ?? 0;

    const chunk = (first << 16) | (second << 8) | third;

    output += BASE64_TABLE[(chunk >> 18) & 63];
    output += BASE64_TABLE[(chunk >> 12) & 63];
    output += i + 1 < bytes.length ? BASE64_TABLE[(chunk >> 6) & 63] : "=";
    output += i + 2 < bytes.length ? BASE64_TABLE[chunk & 63] : "=";
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

  const bytes: number[] = [];

  for (let i = 0; i < normalized.length; i += 4) {
    const chars = normalized.slice(i, i + 4);
    const sextets = chars.split("").map(char => {
      if (char === "=") return 64;
      const index = BASE64_TABLE.indexOf(char);
      if (index < 0) {
        throw new Error("Invalid Base64 character");
      }
      return index;
    });

    const [a, b, c, d] = sextets;

    bytes.push((a << 2) | (b >> 4));

    if (c !== 64) {
      bytes.push(((b & 15) << 4) | (c >> 2));
    }

    if (d !== 64) {
      bytes.push(((c & 3) << 6) | d);
    }
  }

  return new TextDecoder("utf-8", { fatal: true }).decode(
    Uint8Array.from(bytes)
  );
}
