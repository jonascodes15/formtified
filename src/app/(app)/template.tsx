/**
 * Wraps every page in the signed-in app. Unlike layout.tsx, a template is re-created on each
 * navigation, so the page content gently rises in every time you move between pages.
 * The sidebar and bottom bar (in layout.tsx) stay put.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
