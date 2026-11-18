import { createClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET } from "@/lib/media-url";

export type UploadKind = "panorama" | "mask" | "thumb";

let browser: ReturnType<typeof createClient> | null = null;

function supabase() {
  browser ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // change this name if yours is different
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return browser;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Upload failed.");
  return data as T;
}

// Resolves with the object key to put into the home data
export async function uploadMedia(
  file: File,
  houseId: string,
  kind: UploadKind,
  _onProgress?: (percent: number) => void, // kept so existing calls still compile
): Promise<string> {
  // 1. ask the server for permission
  const init = await post<{ key: string; token: string }>(
    "/api/admin/uploads",
    {
      houseId,
      kind,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    },
  );

  // 2. send the file straight to Supabase (no 4.5 MB server limit)
  const { error } = await supabase()
    .storage.from(MEDIA_BUCKET)
    .uploadToSignedUrl(init.key, init.token, file, {
      contentType: file.type,
      cacheControl: "31536000",
    });
  if (error) throw new Error("The upload failed. Please try again.");

  // 3. the server verifies the real file, and deletes it if it isn't a valid image
  await post("/api/admin/uploads/complete", { key: init.key, kind });
  return init.key;
}
