import { badRequest, readJson, respond } from "@/lib/api";
import { reserveHouse } from "@/lib/services/reserve";

export async function POST(req: Request) {
  const body = await readJson<{ houseId?: unknown; days?: unknown }>(req);
  if (!body || typeof body.houseId !== "string" || typeof body.days !== "number") return badRequest();
  return respond(await reserveHouse(body.houseId, body.days));
}