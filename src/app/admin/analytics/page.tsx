import Link from "next/link";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { dailySeries, getTrafficSummary, topBy } from "@/lib/admin";
import { percentChange } from "@/lib/format";
import { BarList, Card, PageHeader, StatTile, param } from "@/components/admin/ui";
import { ColumnChart } from "@/components/admin/ColumnChart";

export const metadata = { title: "Site visits" };

const RANGES = [7, 30, 90];

const countryName = (code: string) => {
  if (code === "??") return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};
// Turns "NG" into the 🇳🇬 flag emoji.
const flag = (code: string) =>
  code === "??" ? "🌐" : String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const DEVICE_ICON = { desktop: Monitor, mobile: Smartphone, tablet: Tablet } as const;

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const days = RANGES.includes(Number(param(sp, "range"))) ? Number(param(sp, "range")) : 30;

  const [t, visitors, views, pages, sources, countries, devices, browsers] = await Promise.all([
    getTrafficSummary(days),
    dailySeries("visitors", days),
    dailySeries("views", days),
    topBy("path", days, 10),
    topBy("referrer", days, 8),
    topBy("country", days, 8),
    topBy("device", days, 3),
    topBy("browser", days, 6),
  ]);

  return (
    <>
      <PageHeader title="Site visits" description="Counted without cookies. A visitor is counted once per day.">
        <div className="flex rounded-full border border-line bg-white p-1" role="tablist" aria-label="Time range">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={r === 30 ? "/admin/analytics" : `/admin/analytics?range=${r}`}
              role="tab"
              aria-selected={r === days}
              className={`rounded-full px-3.5 h-8 grid place-items-center text-sm font-medium ${r === days ? "bg-forest text-white" : "text-muted hover:text-ink"}`}
            >
              {r} days
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Visitors" value={t.visitors} change={percentChange(t.visitors, t.visitorsPrev)} hint={`vs previous ${days} days`} />
        <StatTile label="Page views" value={t.views} change={percentChange(t.views, t.viewsPrev)} hint={`vs previous ${days} days`} />
        <StatTile label="Views per visitor" value={t.visitors ? (t.views / t.visitors).toFixed(1) : "0"} />
        <StatTile label="Public form views" value={t.formViews} hint="Clients opening /f/ links" />
        <StatTile label="Online now" value={t.online} hint="Last 5 minutes" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Visitors per day" subtitle={`Last ${days} days`}>
          <ColumnChart data={visitors} unit="visitors" />
        </Card>
        <Card title="Page views per day" subtitle={`Last ${days} days`}>
          <ColumnChart data={views} unit="page views" />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Top pages" subtitle="Page views">
          <BarList items={pages.map((p) => ({ key: p.label, label: <span className="font-mono text-[13px]">{p.label}</span>, value: p.views }))} />
        </Card>
        <Card title="Where visitors come from" subtitle="Referring sites · visitors">
          <BarList
            valueLabel="visitors"
            items={sources.map((s) => ({ key: s.label, label: s.label === "(direct)" ? "Direct / no referrer" : s.label, value: s.visitors }))}
          />
        </Card>
        <Card title="Countries" subtitle="Visitors · from Vercel's location data (empty when running locally)">
          <BarList
            valueLabel="visitors"
            items={countries.map((c) => ({ key: c.label, label: `${flag(c.label)}  ${countryName(c.label)}`, value: c.visitors }))}
          />
        </Card>
        <div className="grid gap-5">
          <Card title="Devices" subtitle="Visitors">
            <BarList
              valueLabel="visitors"
              items={devices.map((d) => {
                const Icon = DEVICE_ICON[d.label as keyof typeof DEVICE_ICON] ?? Monitor;
                return { key: d.label, label: <span className="inline-flex items-center gap-2 capitalize"><Icon className="size-4 text-muted" />{d.label}</span>, value: d.visitors };
              })}
            />
          </Card>
          <Card title="Browsers" subtitle="Visitors">
            <BarList valueLabel="visitors" items={browsers.map((b) => ({ key: b.label, label: b.label, value: b.visitors }))} />
          </Card>
        </div>
      </div>
    </>
  );
}
