import { createClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET } from "./media-url";

export { mediaUrl } from "./media-url";

let admin: ReturnType<typeof createClient> | null = null;

function files() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase storage is not configured.");
  admin ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin.storage.from(MEDIA_BUCKET);
}

type Fail = { ok: false; error: unknown };

export function storage() {
  return {
    async createUploadUrl(key: string): Promise<{ ok: true; token: string } | Fail> {
      const { data, error } = await files().createSignedUploadUrl(key);
      return error || !data ? { ok: false, error } : { ok: true, token: data.token };
    },

    async downloadAsBytes(key: string): Promise<{ ok: true; value: Buffer } | Fail> {
      const { data, error } = await files().download(key);
      if (error || !data) return { ok: false, error };
      return { ok: true, value: Buffer.from(await data.arrayBuffer()) };
    },

    async exists(key: string): Promise<{ ok: boolean; value: boolean }> {
      const slash = key.lastIndexOf("/");
      const name = key.slice(slash + 1);
      const { data, error } = await files().list(key.slice(0, slash), { search: name, limit: 100 });
      return { ok: !error, value: !!data?.some((f) => f.name === name) };
    },

    async delete(key: string): Promise<{ ok: boolean }> {
      const { error } = await files().remove([key]);
      return { ok: !error };
    },
  };
}