import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { fail, readJson } from "@/lib/api";
import { getFormBySlug } from "@/lib/forms";
import { UPLOAD_CONTENT_TYPES, UPLOAD_MAX_BYTES } from "@/lib/files";
import { checkUploadRequest } from "@/lib/uploads";

/**
 * A client filling a form asks to upload a file. If the form has a file question and is open,
 * the browser gets a short-lived permission to upload that one file straight to private storage.
 */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await readJson<HandleUploadBody>(req);
  // Only token requests are accepted. No upload-finished callback is used: the file is checked when the form is submitted.
  if (body?.type !== "blob.generate-client-token") return fail("Invalid request.");
  const form = await getFormBySlug(slug);
  if (!form) return fail("This form does not exist.", 404);

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        await checkUploadRequest(form, pathname);
        return {
          allowedContentTypes: UPLOAD_CONTENT_TYPES,
          maximumSizeInBytes: UPLOAD_MAX_BYTES,
          addRandomSuffix: true,
          validUntil: Date.now() + 15 * 60 * 1000,
        };
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not upload this file.");
  }
}
