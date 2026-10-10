/** Re-created on each navigation, so every admin page gently rises in (the sidebar stays put). */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
