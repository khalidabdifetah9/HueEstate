import { checkPayment } from "@/lib/services/check-payment";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  return Response.json({ status: await checkPayment(reference) });
}