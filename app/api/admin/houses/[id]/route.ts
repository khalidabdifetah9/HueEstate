import { badRequest, readJson, respond } from "@/lib/api";
import { deleteHouse, setPublished, updateHouse } from "@/lib/services/houses";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return badRequest();
  return respond(await updateHouse({ ...body, id }));
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await readJson<{ published?: unknown }>(req);
  if (!body || typeof body.published !== "boolean") return badRequest();
  return respond(await setPublished(id, body.published));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return respond(await deleteHouse(id));
}
