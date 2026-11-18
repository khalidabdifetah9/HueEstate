import { badRequest, readJson, respond } from "@/lib/api";
import { bookAppointment } from "@/lib/services/appointments";

export async function POST(req: Request) {
  const body = await readJson<Record<string, unknown>>(req);
  if (!body || typeof body.date !== "string" || typeof body.time !== "string") return badRequest();

  return respond(
    await bookAppointment({
      date: body.date,
      time: body.time,
      houseId: typeof body.houseId === "string" && body.houseId ? body.houseId : null,
      note: typeof body.note === "string" ? body.note : "",
    }),
    201
  );
}