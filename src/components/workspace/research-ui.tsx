"use client";
import { useState } from "react";
import { IconDots, IconArrowRight } from "@tabler/icons-react";
import { chartTheme } from "@/styles/theme";
import { money, shortDate } from "@/lib/format";
import { publicAsset } from "@/lib/paths";
import { currencyAxis } from "@/lib/chart-layout";
import { useChartWidth } from "../use-chart-width";
import { groupedChartLayout } from "@/styles/theme";
import type { comparisonReport } from "@/server/analysis/research-workflows";
export const serviceIcons: Record<string, string> = {
  "Amazon EC2": "ec2",
  "Amazon RDS": "rds",
  "Amazon S3": "s3",
  "Amazon VPC": "vpc",
  "Data Transfer": "vpc",
  "Amazon CloudFront": "cloudfront",
};
export function ServiceIcon({ name }: { name: string }) {
  return serviceIcons[name] ? (
    <img
      src={publicAsset(`/aws/${serviceIcons[name]}.svg`)}
      className="research-service-icon"
      width={24}
      height={24}
      alt=""
    />
  ) : (
    <IconDots className="research-service-icon" aria-hidden="true" />
  );
}
export function Delta({ value }: { value: number }) {
  return (
    <>
      {value > 0 ? "+" : value < 0 ? "−" : ""}
      {money(Math.abs(value))}
    </>
  );
}
export function EvidenceStrip({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="research-evidence-strip">
      <strong>{title}</strong>
      <span>{children}</span>
    </div>
  );
}
export function GroupedCostChart({
  report,
  onDay,
}: {
  report: ReturnType<typeof comparisonReport>;
  onDay: (date: string) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const { ref, width } = useChartWidth();
  const { height, left, right, top, bottom } = groupedChartLayout;
  const plotRight = width - right,
    plotBottom = height - bottom;
  const colors = [
    chartTheme.spend,
    chartTheme.secondary,
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-other)",
  ];
  const chosen = report.series.slice(0, 5);
  const rest = report.series.slice(5);
  const series = rest.length
    ? [
        ...chosen,
        {
          name: "Other groups",
          points:
            chosen[0]?.points.map((p, i) => ({
              date: p.date,
              amount: rest.reduce((s, r) => s + r.points[i].amount, 0),
            })) || [],
        },
      ]
    : chosen;
  const points = series[0]?.points || [];
  const { high, ticks } = currencyAxis(
    series.flatMap((s) => s.points.map((p) => p.amount)),
  );
  const x = (i: number) =>
      left + (i / Math.max(1, points.length - 1)) * (width - left - right),
    y = (v: number) => plotBottom - (v / high) * (plotBottom - top);
  const selectedIndex =
    selected !== null && selected < points.length ? selected : null;
  const cell = (width - left - right) / Math.max(1, points.length - 1);
  return (
    <div className="research-chart" ref={ref}>
      <div className="research-chart-readout" aria-live="polite">
        {selectedIndex === null
          ? "Daily costs · hover or focus a date for values"
          : `${shortDate(points[selectedIndex].date)} · ${series.map((s) => `${s.name}: ${money(s.points[selectedIndex].amount)}`).join(" · ")}`}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Daily costs by selected grouping in USD"
      >
        {ticks.map((value) => (
          <g key={value}>
            <line
              x1={left}
              x2={plotRight}
              y1={y(value)}
              y2={y(value)}
              stroke={chartTheme.grid}
              strokeDasharray="2 5"
            />
            <text
              x={left - 10}
              y={y(value) + 4}
              textAnchor="end"
              className="chart-label"
            >
              {money(value, true)}
            </text>
          </g>
        ))}
        {series.map((s, i) => (
          <path
            key={s.name}
            d={s.points
              .map((p, j) => `${j ? "L" : "M"}${x(j)},${y(p.amount)}`)
              .join(" ")}
            stroke={colors[i]}
            fill="none"
            strokeWidth="2"
          />
        ))}
        {[
          ...new Set([
            0,
            Math.floor((points.length - 1) / 2),
            points.length - 1,
          ]),
        ]
          .filter((i) => i >= 0)
          .map((i) => (
            <text
              key={i}
              x={x(i)}
              y={height - 8}
              textAnchor="middle"
              className="chart-label"
            >
              {shortDate(points[i].date)}
            </text>
          ))}
        {points.map((p, i) => (
          <rect
            key={p.date}
            x={i === 0 ? left : x(i) - cell / 2}
            y={top}
            width={i === 0 || i === points.length - 1 ? cell / 2 : cell}
            height={plotBottom - top}
            fill="transparent"
            role="button"
            tabIndex={0}
            aria-label={`Investigate ${shortDate(p.date)}`}
            onFocus={() => setSelected(i)}
            onBlur={() => setSelected(null)}
            onMouseEnter={() => setSelected(i)}
            onMouseLeave={() => setSelected(null)}
            onClick={() => onDay(p.date)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onDay(p.date);
              }
            }}
          />
        ))}
        {selectedIndex !== null && (
          <g pointerEvents="none">
            <line
              x1={x(selectedIndex)}
              x2={x(selectedIndex)}
              y1={top}
              y2={plotBottom}
              stroke={chartTheme.axis}
              strokeDasharray="3 4"
            />
            {series.map((s, i) => (
              <circle
                key={s.name}
                cx={x(selectedIndex)}
                cy={y(s.points[selectedIndex].amount)}
                r="3"
                fill={colors[i]}
                stroke={chartTheme.surface}
                strokeWidth="1.5"
              />
            ))}
          </g>
        )}
      </svg>
      <div className="research-chart-legend">
        {series.map((s, i) => (
          <span key={s.name}>
            <i style={{ background: colors[i] }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
