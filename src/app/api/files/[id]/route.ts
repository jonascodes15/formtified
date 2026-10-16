import { get } from "@vercel/blob";
import { apiUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { notFound, unauthorized } from "@/lib/api";
import { PREVIEWABLE_IMAGES } from "@/lib/files";

/**
 * Opens a file a client attached to a response. Only the form's owner can open it.
 * Photos open in the browser; every other file downloads, so nothing a client uploads can run as a web page.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const file = await queryOne<{ url: string; name: string; content_type: string }>(
    `SELECT u.url, u.name, u.content_type FROM uploads u JOIN forms f ON f.id = u.form_id WHERE u.id = $1 AND f.user_id = $2`,
    [Number((await params).id), user.id],
  );
  if (!file) return notFound();

  const blob = await get(file.url, { access: "private" }).catch(() => null);
  if (!blob || blob.statusCode !== 200) return notFound();

  const inline = PREVIEWABLE_IMAGES.includes(file.content_type) && !new URL(req.url).searchParams.has("download");
  const ascii = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return new Response(blob.stream, {
    headers: {
      "Content-Type": inline ? file.content_type : "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Content-Length": String(blob.blob.size),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; sandbox",
      "Cache-Control": "private, max-age=300",
    },
  });
}
