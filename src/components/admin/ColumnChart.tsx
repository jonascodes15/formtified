"use client";

import { useState } from "react";

/** Rounds the top of the axis up to a clean number (4, 10, 20, 50, 100...). */
function niceMax(max: number) {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  for (const step of [1, 2, 2.5, 5, 10]) if (max <= step * pow) return step * pow;
  return 10 * pow;
}

const dayLabel = (iso: string, long = false) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", long ? { weekday: "short", day: "numeric", month: "short" } : { day: "numeric", month: "short" });

/**
 * One value per day as thin columns. Hover (or focus) a day to see its exact value.
 * A hidden table carries the same numbers for screen readers.
 */
export function ColumnChart({ data, unit, height = 180 }: { data: { day: string; value: number }[]; unit: string; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const top = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const ticks = [top, top / 2, 0];
  const total = data.reduce((s, d) => s + d.value, 0);
  const h = hover != null ? data[hover] : null;

  return (
    <figure>
      <div className="flex gap-2">
        {/* y-axis */}
        <div className="flex w-8 shrink-0 flex-col justify-between text-right text-[11px] tabular-nums text-soft" style={{ height }}>
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{t >= 1000 ? `${t / 1000}K` : t}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* gridlines */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" style={{ height }} aria-hidden="true">
            {ticks.map((t) => (
              <div key={t} className="h-px w-full bg-line" />
            ))}
          </div>

          {/* columns */}
          <div className="relative flex items-end" style={{ height }} onMouseLeave={() => setHover(null)}>
            {data.map((d, i) => (
              <div
                key={d.day}
                tabIndex={0}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${dayLabel(d.day, true)}: ${d.value} ${unit}`}
                className="group flex h-full flex-1 cursor-default items-end justify-center px-px outline-none"
              >
                <div
                  className={`w-full max-w-6 rounded-t-[4px] transition-colors ${hover === i ? "bg-brand-700" : "bg-brand"} ${d.value === 0 ? "opacity-0" : ""}`}
                  style={{ height: `${(d.value / top) * 100}%`, minHeight: d.value > 0 ? 3 : 0 }}
                />
              </div>
            ))}

            {h && hover != null && (
              <div
                className={`pointer-events-none absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-xl bg-forest px-3 py-2 text-xs text-white shadow-[var(--shadow-float)] ${
                  hover < data.length * 0.15 ? "-translate-x-4" : hover > data.length * 0.85 ? "-translate-x-[calc(100%-1rem)]" : "-translate-x-1/2"
                }`}
                style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
              >
                <span className="block text-white/70">{dayLabel(h.day, true)}</span>
                <span className="font-semibold">{h.value.toLocaleString("en-US")}</span> {unit}
              </div>
            )}
          </div>

          {/* x-axis: first, middle and last day */}
          <div className="mt-2 flex justify-between text-[11px] text-soft">
            <span>{data[0] && dayLabel(data[0].day)}</span>
            <span>{data[Math.floor(data.length / 2)] && dayLabel(data[Math.floor(data.length / 2)].day)}</span>
            <span>{data.at(-1) && dayLabel(data.at(-1)!.day)}</span>
          </div>
        </div>
      </div>

      <figcaption className="sr-only">
        {total} {unit} in total.
      </figcaption>
      <table className="sr-only">
        <thead>
          <tr><th>Day</th><th>{unit}</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}><td>{d.day}</td><td>{d.value}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
