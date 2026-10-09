import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <LogoMark className="mx-auto size-14" />
        <h1 className="display mt-6 text-4xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted">This link may be wrong, or the form was deleted.</p>
        <Link href="/" className="btn-primary mt-6">Go home</Link>
      </div>
    </div>
  );
}
