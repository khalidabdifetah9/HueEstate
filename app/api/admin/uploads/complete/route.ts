import { getAdminSession } from "@/lib/admin";
import { badRequest, readJson } from "@/lib/api";
import { storage } from "@/lib/storage";
import { LIMITS, MB, isKind, readImage } from "@/lib/upload-rules";

export const maxDuration = 30;

export async function POST(req: Request) {
  if (!(await getAdminSession())) return Response.json({ error: "Not allowed." }, { status: 403 });

  const body = await readJson<{ key?: string; kind?: string }>(req);
  const key = body?.key ?? "";
  const kind = body?.kind ?? "";

  const match = /^houses\/[a-z0-9]+(?:-[a-z0-9]+)*\/(panorama|mask|thumb)\/[\w.-]+$/.exec(key);
  if (!match || key.includes("..") || match[1] !== kind || !isKind(kind)) return badRequest("Invalid image.");

  const file = await storage().downloadAsBytes(key);
  if (!file.ok) return badRequest("The upload didn't arrive. Please try again.");

  const reject = async (message: string) => {
    await storage().delete(key); // never keep a file that failed the checks
    return badRequest(message);
  };

  const bytes = file.value;
  if (bytes.length > LIMITS[kind]) return reject(`File is too large (max ${LIMITS[kind] / MB} MB).`);

  const img = readImage(bytes);
  if (!img) return reject("Only JPG and PNG images are allowed.");

  if (kind === "thumb") {
    if (img.width < 200) return reject("Thumbnail is too small.");
  } else {
    if (Math.abs(img.width / img.height - 2) > 0.02) {
      return reject(
        `${kind === "mask" ? "Mask" : "Panorama"} must be 2:1 (for example 4096×2048). This one is ${img.width}×${img.height}.`
      );
    }
    if (img.width < 1024 || img.width > 8192) return reject("Width must be between 1024 and 8192 pixels.");
  }

  return Response.json({ key, width: img.width, height: img.height });
}