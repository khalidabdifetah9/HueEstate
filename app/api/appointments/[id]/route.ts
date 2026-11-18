import { respond } from "@/lib/api";
import { cancelAppointment } from "@/lib/services/appointments";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return respond(await cancelAppointment(id));
}