import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteUrl } from "./site";

/**
 * The picture shown when a Formtified link is shared on WhatsApp, X, LinkedIn, Slack...
 * One design, used by the homepage, template pages and clients' form links.
 */

export const OG_SIZE = { width: 1200, height: 630 };

// Read once per server, not on every request.
const assets = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Kanit-SemiBold.ttf")),
  readFile(join(process.cwd(), "assets/fonts/RussoOne-Regular.ttf")),
  readFile(join(process.cwd(), "src/app/icon.svg"), "base64"),
]);

export async function ogCard({ eyebrow, title, chips = [] }: { eyebrow: string; title: string; chips?: string[] }) {
  const [kanit, russo, icon] = await assets;
  const host = new URL(siteUrl()).host;
  const size = title.length > 70 ? 56 : title.length > 40 ? 66 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#123826",
          backgroundImage: "radial-gradient(circle at 92% 0%, rgba(201,239,107,0.28), rgba(18,56,38,0) 55%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={`data:image/svg+xml;base64,${icon}`} width={64} height={64} />
          <div style={{ width: 2, height: 40, backgroundColor: "rgba(255,255,255,0.3)" }} />
          <div style={{ fontFamily: "Russo One", fontSize: 34, letterSpacing: 2 }}>FORMTIFIED</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#c9ef6b",
              fontSize: 26,
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: "flex", marginTop: 26, fontFamily: "Kanit", fontSize: size, lineHeight: 1.08, maxWidth: 1000 }}>{title}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {chips.map((c) => (
              <div key={c} style={{ display: "flex", padding: "10px 22px", borderRadius: 999, backgroundColor: "#c9ef6b", color: "#123826", fontSize: 24 }}>
                {c}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.65)" }}>{host}</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Kanit", data: kanit, weight: 600, style: "normal" },
        { name: "Russo One", data: russo, weight: 400, style: "normal" },
      ],
    },
  );
}
