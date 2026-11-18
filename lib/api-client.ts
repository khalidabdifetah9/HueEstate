import type { HouseData } from "@/lib/admin-schema";

type Failure = { error: string };

async function call<T>(url: string, method: string, body?: unknown): Promise<T | Failure> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.error ?? "Something went wrong. Please try again." };
    return data as T;
  } catch {
    return { error: "Network error. Please check your connection and try again." };
  }
}

/* reservations and payments */
export const reserveHouse = (houseId: string, days: number) =>
  call<{ checkoutUrl: string; reference: string }>("/api/reservations", "POST", { houseId, days });

export async function checkPayment(reference: string): Promise<"SUCCESS" | "PENDING" | "FAILED"> {
  try {
    const res = await fetch(`/api/payments/${encodeURIComponent(reference)}`, { cache: "no-store" });
    if (res.status === 401 || res.status === 404) return "FAILED";
    if (!res.ok) return "PENDING"; // temporary problem: the next check retries
    return (await res.json()).status;
  } catch {
    return "PENDING";
  }
}

/* appointments */
export const bookAppointment = (input: {
  date: string;
  time: string;
  houseId: string | null;
  note: string;
}) => call<{ ok: true }>("/api/appointments", "POST", input);

export const cancelAppointment = (id: string) =>
  call<{ ok: true }>(`/api/appointments/${encodeURIComponent(id)}`, "DELETE");

/* admin: homes */
type Saved = { ok: true; id: string };

export const createHouse = (data: HouseData) => call<Saved>("/api/admin/houses", "POST", data);

export const updateHouse = (data: HouseData) =>
  call<Saved>(`/api/admin/houses/${encodeURIComponent(data.id)}`, "PUT", data);

export const setPublished = (id: string, published: boolean) =>
  call<Saved>(`/api/admin/houses/${encodeURIComponent(id)}`, "PATCH", { published });

export const deleteHouse = (id: string) =>
  call<Saved>(`/api/admin/houses/${encodeURIComponent(id)}`, "DELETE");