import { randomBytes } from "node:crypto";
import { getAdminSession } from "@/lib/admin";
import { badRequest, readJson } from "@/lib/api";
import { storage } from "@/lib/storage";
import { LIMITS, MB, TYPES, isKind, isSlug } from "@/lib/upload-rules";

export async function POST(req: Request) {
  if (!(await getAdminSession())) return Response.json({ error: "Not allowed." }, { status: 403 });

  const body = await readJson<{
    houseId?: string; kind?: string; filename?: string; contentType?: string; size?: number;
  }>(req);
  if (!body) return badRequest();

  const { houseId = "", kind = "", filename = "image", contentType = "", size = 0 } = body;

  if (!isSlug(houseId)) return badRequest("Invalid home ID.");
  if (!isKind(kind)) return badRequest("Invalid image type.");
  const ext = TYPES[contentType];
  if (!ext) return badRequest("Only JPG and PNG images are allowed.");
  if (!Number.isFinite(size) || size <= 0 || size > LIMITS[kind]) {
    return badRequest(`File is too large (max ${LIMITS[kind] / MB} MB).`);
  }

  // A random key every time, so an upload can never overwrite another file
  const base =
    filename.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) ||
    "image";
  const key = `houses/${houseId}/${kind}/${randomBytes(4).toString("hex")}-${base}.${ext}`;

  const upload = await storage().createUploadUrl(key);
  if (!upload.ok) {
    console.error("createUploadUrl failed:", upload.error);
    return Response.json({ error: "We couldn't prepare the upload. Please try again." }, { status: 500 });
  }

  return Response.json({ key, token: upload.token });
}