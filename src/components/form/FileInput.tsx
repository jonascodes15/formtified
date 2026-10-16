"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Paperclip, UploadCloud, X } from "lucide-react";
import { UPLOAD_ACCEPT, UPLOAD_MAX_BYTES, UPLOAD_MAX_FILES, UPLOAD_MAX_MB, safeFileName, uploadContentType, uploadFolder } from "@/lib/files";
import { formatBytes } from "@/lib/format";

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

interface Pending {
  key: string;
  name: string;
  progress: number;
}

/**
 * Lets a client attach files to one question. Each file goes straight from the browser to private storage;
 * the form only sends the files' addresses, which the server checks before saving the response.
 */
export function FileInput({
  id,
  slug,
  fieldId,
  files,
  onAdd,
  onRemove,
  onBusy,
  disabled,
  disabledNote,
  invalid,
}: {
  id: string;
  slug?: string;
  fieldId: string;
  files: UploadedFile[];
  onAdd: (file: UploadedFile) => void;
  onRemove: (url: string) => void;
  onBusy: (busy: boolean) => void;
  disabled?: boolean;
  disabledNote?: string;
  invalid?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [error, setError] = useState("");

  async function pick(list: FileList | null) {
    if (!list || !slug) return;
    setError("");
    const room = UPLOAD_MAX_FILES - files.length - pending.length;
    const chosen = Array.from(list);
    if (chosen.length > room) setError(`You can attach up to ${UPLOAD_MAX_FILES} files here.`);
    const ok = chosen.slice(0, Math.max(0, room)).filter((file) => {
      if (file.size > UPLOAD_MAX_BYTES) {
        setError(`${file.name} is larger than ${UPLOAD_MAX_MB} MB.`);
        return false;
      }
      if (!uploadContentType(file.name, file.type)) {
        setError(`${file.name} isn't a supported file type.`);
        return false;
      }
      return true;
    });
    if (!ok.length) return;

    const { upload } = await import("@vercel/blob/client");
    onBusy(true);
    await Promise.all(
      ok.map(async (file, i) => {
        const key = `${Date.now()}-${i}`;
        setPending((p) => [...p, { key, name: file.name, progress: 0 }]);
        try {
          const blob = await upload(`${uploadFolder(slug, fieldId)}${safeFileName(file.name)}`, file, {
            access: "private",
            handleUploadUrl: `/api/public/${slug}/upload`,
            contentType: uploadContentType(file.name, file.type)!,
            onUploadProgress: ({ percentage }) => setPending((p) => p.map((x) => (x.key === key ? { ...x, progress: percentage } : x))),
          });
          onAdd({ url: blob.url, name: file.name, size: file.size });
        } catch {
          setError(`Couldn't upload ${file.name}. Check your connection and try again.`);
        } finally {
          setPending((p) => p.filter((x) => x.key !== key));
        }
      }),
    );
    onBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const full = files.length + pending.length >= UPLOAD_MAX_FILES;

  return (
    <div>
      <label
        htmlFor={id}
        className={`flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
          disabled || full ? "cursor-not-allowed border-line bg-canvas/60 text-soft" : `cursor-pointer bg-white hover:border-brand hover:bg-brand-50/40 ${invalid ? "border-red-400" : "border-line"}`
        }`}
      >
        <UploadCloud className={`size-7 ${disabled || full ? "text-soft" : "text-brand"}`} />
        <span className="font-semibold">{disabled ? "File upload" : full ? "File limit reached" : "Tap to add files"}</span>
        <span className="text-xs text-muted">
          {disabled && disabledNote ? disabledNote : `Up to ${UPLOAD_MAX_FILES} files, ${UPLOAD_MAX_MB} MB each. Images, PDFs, documents, audio and video.`}
        </span>
        <input
          ref={inputRef}
          id={id}
          type="file"
          multiple
          accept={UPLOAD_ACCEPT}
          disabled={disabled || full}
          onChange={(e) => pick(e.target.files)}
          className="sr-only"
        />
      </label>

      {(files.length > 0 || pending.length > 0) && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li key={f.url} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2.5 animate-rise">
              <FileIcon name={f.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{f.name}</span>
                <span className="text-xs text-soft">{formatBytes(f.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(f.url)}
                className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink"
                aria-label={`Remove ${f.name}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
          {pending.map((p) => (
            <li key={p.key} className="rounded-2xl border border-line bg-white px-3 py-2.5">
              <span className="flex items-center gap-3">
                <Paperclip className="size-4 shrink-0 text-soft" />
                <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                <span className="text-xs tabular-nums text-soft">{Math.round(p.progress)}%</span>
              </span>
              <span className="mt-2 block h-1 overflow-hidden rounded-full bg-brand-50">
                <span className="block h-full rounded-full bg-brand transition-[width]" style={{ width: `${p.progress}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-sm text-red-600 animate-error-in" role="alert">{error}</p>}
    </div>
  );
}

function FileIcon({ name }: { name: string }) {
  const Icon = /\.(jpe?g|png|webp|gif|heic|heif|svg)$/i.test(name) ? ImageIcon : FileText;
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
      <Icon className="size-4" />
    </span>
  );
}
