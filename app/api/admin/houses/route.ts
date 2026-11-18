import { badRequest, readJson, respond } from "@/lib/api";
import { createHouse } from "@/lib/services/houses";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return badRequest();
  return respond(await createHouse(body), 201);
}