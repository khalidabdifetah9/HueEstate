export const MEDIA_BUCKET = process.env.NEXT_PUBLIC_MEDIA_BUCKET ?? "house-media";

// The database stores keys like "houses/maple/panorama/ab12-living.jpg"
export function mediaUrl(key: string | null | undefined) {
  if (!key) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${key}`;
}