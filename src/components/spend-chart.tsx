"use client";
import { useId, useState } from "react";
import type { TrendPoint } from "@/lib/domain";
import { money, shortDate } from "@/lib/format";
import { chartTheme } from "@/styles/theme";
export function SpendChart({
  points,
  compare,
  onPoint,
}: {
  points: TrendPoint[];
  compare: boolean;
  onPoint: (date: string) => void;
}) {
  const id = useId().replaceAll(":", "");
  const [hover, setHover] = useState<number | null>(null);
  const width = 900,
    height = 250,
    left = 62,
    top = 20,
    bottom = 35,
    right = 18;
  const high =
    Math.ceil(
      Math.max(
        ...points.flatMap((p) => [
          p.actual || 0,
          compare ? p.previous || 0 : 0,
          p.forecast || 0,
        ]),
      ) / 50000,
    ) * 50000;
  const x = (i: number) =>
    left + (i / Math.max(1, points.length - 1)) * (width - left - right);
  const y = (v: number) =>
    top + (1 - v / (high || 1)) * (height - top - bottom);
  const line = (key: "actual" | "previous" | "forecast") => {
    let pen = false;
    return points
      .map((p, i) => {
        if (p[key] === null) {
          pen = false;
          return "";
        }
        const d = `${pen ? "L" : "M"} ${x(i)} ${y(p[key]!)}`;
        pen = true;
        return d;
      })
      .join(" ");
  };
  const actual = points
    .map((p, i) => ({ ...p, i }))
    .filter((p) => p.actual !== null);
  const area = actual.length
    ? `${line("actual")} L ${x(actual.at(-1)!.i)} ${height - bottom} L ${left} ${height - bottom} Z`
    : "";
  const ticks = Array.from({ length: 5 }, (_, i) => i * (high / 4));
  const dateTicks = [
    ...new Set([
      0,
      Math.floor((points.length - 1) / 4),
      Math.floor((points.length - 1) / 2),
      Math.floor(((points.length - 1) * 3) / 4),
      points.length - 1,
    ]),
  ];
  const selected = hover === null ? null : points[hover];
  return (
    <div className="chart-wrap">
      <svg
        className="spend-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Daily cloud spend in USD. Solid orange is actual spend; dashed lines show comparisons and estimates."
      >
        <defs>
          <linearGradient id={`area-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={chartTheme.spend} stopOpacity="0.12" />
            <stop offset="1" stopColor={chartTheme.spend} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={left}
              x2={width - right}
              y1={y(v)}
              y2={y(v)}
              stroke={chartTheme.grid}
              strokeDasharray="3 5"
            />
            <text
              x={left - 14}
              y={y(v) + 4}
              textAnchor="end"
              className="chart-label"
            >
              {money(v, true)}
            </text>
          </g>
        ))}
        {area && <path d={area} fill={`url(#area-${id})`} />}
        {compare && (
          <path
            d={line("previous")}
            stroke={chartTheme.baseline}
            strokeDasharray="5 5"
            fill="none"
            strokeWidth="1.5"
          />
        )}
        <path
          d={line("actual")}
          stroke={chartTheme.spend}
          fill="none"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d={line("forecast")}
          stroke={chartTheme.forecast}
          strokeDasharray="4 5"
          fill="none"
          strokeWidth="1.8"
        />
        {dateTicks.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={height - 7}
            textAnchor="middle"
            className="chart-label"
          >
            {shortDate(points[i].date)}
          </text>
        ))}
        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={top}
            y2={height - bottom}
            stroke={chartTheme.axis}
            strokeDasharray="3 4"
          />
        )}
        {points.map((p, i) => (
          <g key={p.date}>
            <rect
              className="chart-hit"
              x={x(i) - (width - left - right) / points.length / 2}
              y={top}
              width={(width - left - right) / points.length}
              height={height - top - bottom}
              fill="transparent"
              tabIndex={0}
              role="button"
              aria-label={`${shortDate(p.date)}: ${money(p.actual ?? p.forecast ?? 0)} ${p.actual === null ? "estimated" : "actual"}. Open breakdown.`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => onPoint(p.date)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPoint(p.date);
                }
              }}
            />
            {hover === i && (
              <circle
                cx={x(i)}
                cy={y(p.actual ?? p.forecast ?? 0)}
                r="4"
                fill={chartTheme.spend}
                className="chart-point"
              />
            )}
          </g>
        ))}
      </svg>
      {selected && (
        <div className="chart-tooltip" role="status">
          <span>
            {shortDate(selected.date)}{" "}
            {selected.actual === null ? "· estimate" : ""}
          </span>
          <strong>{money(selected.actual ?? selected.forecast ?? 0)}</strong>
          {compare && selected.previous !== null && (
            <small>Previous period {money(selected.previous)}</small>
          )}
        </div>
      )}
    </div>
  );
}
export function Sparkline({
  values,
  tone = "orange",
  dashed = false,
}: {
  values: number[];
  tone?: "orange" | "green" | "blue";
  dashed?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  if (values.length === 0) return null;
  const min = Math.min(...values) * 0.8;
  const max = Math.max(...values) * 1.05;
  const path = values
    .map(
      (v, i) =>
        `${i ? "L" : "M"} ${(i / Math.max(1, values.length - 1)) * 220} ${36 - ((v - min) / Math.max(1, max - min)) * 32}`,
    )
    .join(" ");
  return (
    <svg
      className={`sparkline ${tone} ${dashed ? "forecast-projection" : ""}`}
      viewBox="0 0 220 42"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x2="0" y2="1">
          <stop stopColor="currentColor" stopOpacity=".12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L 220 42 L 0 42 Z`} fill={`url(#${id})`} />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray={dashed ? "4 3" : undefined}
      />
    </svg>
  );
}
