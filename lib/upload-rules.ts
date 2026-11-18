export const MB = 1024 * 1024;
export const LIMITS = {
  panorama: 25 * MB,
  mask: 25 * MB,
  thumb: 3 * MB,
} as const;
export type Kind = keyof typeof LIMITS;

export const isKind = (v: string): v is Kind => Object.hasOwn(LIMITS, v);
export const TYPES: Record<string, "png" | "jpg" | "avif"> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/avif": "avif",
};
export const isSlug = (v: string) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) && v.length <= 40;
export function readImage(
  buf: Buffer,
): { ext: "png" | "jpg" | "avif"; width: number; height: number } | null {
  if (
    buf.length > 24 &&
    buf.readUInt32BE(0) === 0x89504e47 &&
    buf.readUInt32BE(4) === 0x0d0a1a0a
  ) {
    return {
      ext: "png",
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
    };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      if (marker === 0xff) {
        i++;
        continue;
      }
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return {
          ext: "jpg",
          height: buf.readUInt16BE(i + 5),
          width: buf.readUInt16BE(i + 7),
        };
      }
      if (
        marker === 0xd8 ||
        marker === 0x01 ||
        (marker >= 0xd0 && marker <= 0xd7)
      ) {
        i += 2;
        continue;
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  if (buf.length > 32 && buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") {
      const at = buf.indexOf("ispe");
      if (at > 0 && at + 16 <= buf.length) {
        return {
          ext: "avif",
          width: buf.readUInt32BE(at + 8),
          height: buf.readUInt32BE(at + 12),
        };
      }
    }
  }
  return null;
}
