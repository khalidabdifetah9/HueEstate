// Reads a JSON body, or returns null. Requiring the JSON content type also
// blocks plain cross-site form posts.
export async function readJson<T = unknown>(req: Request): Promise<T | null> {
  if (!req.headers.get("content-type")?.includes("application/json")) return null;
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export const badRequest = (error = "Invalid request.") =>
  Response.json({ error }, { status: 400 });

// Turns a service result ({ error } or data) into an HTTP response.
// Simple rule: the message decides the status code.
export function respond(result: unknown, okStatus = 200) {
  if (result && typeof result === "object" && "error" in result) {
    const message = String((result as { error: unknown }).error);
    let status = 400;
    if (/sign in/i.test(message)) status = 401;
    else if (/not allowed/i.test(message)) status = 403;
    else if (/already|just taken/i.test(message)) status = 409;
    else if (/not found|could not be found/i.test(message)) status = 404;
    else if (/couldn.t|unable|could not start/i.test(message)) status = 500;
    return Response.json(result, { status });
  }
  return Response.json(result, { status: okStatus });
}