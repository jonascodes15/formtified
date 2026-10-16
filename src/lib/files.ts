/** File-upload rules shared by the client form (browser) and the server. */

export const UPLOAD_MAX_MB = 10;
export const UPLOAD_MAX_BYTES = UPLOAD_MAX_MB * 1024 * 1024;
/** Files a client can attach to one question. */
export const UPLOAD_MAX_FILES = 5;

/** What clients usually send with a brief: logos, photos, documents, spreadsheets, voice notes and short videos. */
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  svg: "image/svg+xml",
  psd: "image/vnd.adobe.photoshop",
  ai: "application/postscript",
  eps: "application/postscript",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  csv: "text/csv",
  zip: "application/zip",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  opus: "audio/ogg",
  wav: "audio/wav",
  mp4: "video/mp4",
  mov: "video/quicktime",
};

export const UPLOAD_CONTENT_TYPES = Array.from(new Set([...Object.values(TYPES), "application/x-zip-compressed", "audio/x-m4a", "audio/webm"]));

/** For the file picker's "accept" list. */
export const UPLOAD_ACCEPT = Object.keys(TYPES).map((ext) => `.${ext}`).join(",");

const ext = (name: string) => name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";

/** The file's type, from the browser if it knows, otherwise from its extension. Null if we don't accept it. */
export function uploadContentType(name: string, browserType: string): string | null {
  const fromExt = TYPES[ext(name)];
  if (browserType && UPLOAD_CONTENT_TYPES.includes(browserType)) return browserType;
  return fromExt ?? null;
}

/** Images a browser can show safely inline (SVG is excluded: it can contain scripts). */
export const PREVIEWABLE_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** A file name that is safe to use in a storage path: letters, numbers, dots, dashes and underscores. */
export function safeFileName(name: string) {
  const e = ext(name);
  const base = name.replace(/\.[^.]*$/, "").normalize("NFKD").replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
  return e ? `${base}.${e}` : base;
}

/** Where a client's file for one question is stored: responses/<form slug>/<question id>/<file name>. */
export const uploadFolder = (slug: string, fieldId: string) => `responses/${slug}/${fieldId}/`;
