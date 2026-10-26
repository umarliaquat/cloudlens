"use client";
import { useEffect, useRef, useState } from "react";
import type { HomepageModel, SpendChartMode } from "@/server/analysis/homepage";
import { chartTheme, homeChartLayout } from "@/styles/theme";
import { money, shortDate } from "@/lib/format";

export function HomeSpendChart({
  points,
  mode,
  onPoint,
}: {
  points: HomepageModel["points"];
  mode: SpendChartMode;
  onPoint: (date: string, estimated: boolean) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(680);
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    if (!root.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(280, Math.round(entry.contentRect.width))),
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => setSelected(null), [points.length, mode]);
  const { height: H, left: L, right: R, top: T, bottom: B } = homeChartLayout;
  const W = width;
  const max = Math.max(
    1,
    ...points.flatMap((p) => [p.actual || 0, p.forecast || 0, p.budget || 0]),
  );
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const high =
    ([1, 2, 2.5, 5, 10].find((v) => v >= max / magnitude) || 10) * magnitude;
  const x = (i: number) =>
    L + (i / Math.max(1, points.length - 1)) * (W - L - R);
  const y = (value: number) => T + (1 - value / high) * (H - T - B);
  const line = (key: "actual" | "forecast" | "budget") => {
    let pen = false;
    return points
      .map((p, i) => {
        if (p[key] === null) {
          pen = false;
          return "";
        }
        const d = `${pen ? "L" : "M"}${x(i)},${y(p[key]!)}`;
        pen = true;
        return d;
      })
      .join(" ");
  };
  const last = points.findLastIndex((p) => p.actual !== null);
  const index = selected !== null && selected < points.length ? selected : last;
  const chosen = points[index];
  const hasForecast = points.some((p) => p.forecast !== null),
    hasBudget = points.some((p) => p.budget !== null);
  const ticks =
    points.length === 31
      ? [0, 7, 15, 23, 30]
      : [
          0,
          Math.round((points.length - 1) / 4),
          Math.round((points.length - 1) / 2),
          Math.round(((points.length - 1) * 3) / 4),
          points.length - 1,
        ];
  const tipX = Math.max(L, Math.min(W - R - 174, x(index) - 87));
  const tipY = Math.max(
    T,
    Math.min(H - B - 70, y(chosen?.actual ?? chosen?.forecast ?? 0) - 80),
  );
  const cell = (W - L - R) / Math.max(1, points.length - 1);
  return (
    <div className="home-chart-wrap" ref={root}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="home-spend-chart"
        role="group"
        aria-label={`${mode === "daily" ? "Daily" : "Cumulative"} spend in USD. Orange actual${hasForecast ? ", dashed orange estimate" : ""}${hasBudget ? `, dashed gray ${mode === "daily" ? "daily budget allowance" : "budget pace"}` : ""}.`}
        onMouseLeave={() => setSelected(null)}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1={L}
              x2={W - R}
              y1={y((high * i) / 4)}
              y2={y((high * i) / 4)}
              stroke={chartTheme.grid}
              strokeDasharray="2 5"
            />
            <text
              x={L - 10}
              y={y((high * i) / 4) + 4}
              textAnchor="end"
              className="chart-label"
            >
              {money((high * i) / 4, true)}
            </text>
          </g>
        ))}
        {last >= 0 && (
          <path
            d={`${line("actual")}L${x(last)},${H - B}L${L},${H - B}Z`}
            fill={chartTheme.spend}
            opacity=".055"
          />
        )}
        <path
          d={line("budget")}
          fill="none"
          stroke={chartTheme.baseline}
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
        <path
          d={line("actual")}
          fill="none"
          stroke={chartTheme.spend}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d={line("forecast")}
          fill="none"
          stroke={chartTheme.forecast}
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {[...new Set(ticks)].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            className="chart-label"
          >
            {shortDate(points[i].date)}
          </text>
        ))}
        {points.map((p, i) => (
          <rect
            key={p.date}
            className="home-chart-hit"
            x={Math.max(L - 4, x(i) - cell / 2)}
            y={T}
            width={i === 0 || i === points.length - 1 ? cell / 2 + 4 : cell}
            height={H - T - B}
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${shortDate(p.date)}: ${money(p.actual ?? p.forecast ?? 0)} ${mode} ${p.actual === null ? "estimated" : "actual"}. ${p.actual === null ? "View forecast method" : "Open daily costs"}.`}
            onMouseEnter={() => setSelected(i)}
            onFocus={() => setSelected(i)}
            onBlur={() => setSelected(null)}
            onClick={() => onPoint(p.date, p.actual === null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPoint(p.date, p.actual === null);
              } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const next =
                  e.key === "ArrowRight"
                    ? Math.min(points.length - 1, i + 1)
                    : Math.max(0, i - 1);
                root.current
                  ?.querySelectorAll<SVGElement>(".home-chart-hit")
                  [next]?.focus();
              }
            }}
          />
        ))}
        {chosen && (
          <g pointerEvents="none" aria-hidden="true">
            {selected !== null && (
              <line
                x1={x(index)}
                x2={x(index)}
                y1={T}
                y2={H - B}
                stroke={chartTheme.axis}
                strokeDasharray="3 4"
              />
            )}
            <circle
              cx={x(index)}
              cy={y(chosen.actual ?? chosen.forecast ?? 0)}
              r="3.5"
              fill={chartTheme.spend}
              stroke={chartTheme.surface}
              strokeWidth="2"
            />
            {selected === null ? (
              <g>
                <rect
                  x={x(index) - 38}
                  y={Math.min(H - B - 20, y(chosen.actual ?? 0) + 10)}
                  width="76"
                  height="20"
                  rx="4"
                  fill={chartTheme.surface}
                />
                <text
                  x={x(index)}
                  y={Math.min(H - B - 6, y(chosen.actual ?? 0) + 24)}
                  textAnchor="middle"
                  className="home-chart-value"
                >
                  {money(chosen.actual ?? 0)}
                </text>
              </g>
            ) : (
              <g>
                <rect
                  x={tipX}
                  y={tipY}
                  width="174"
                  height={chosen.budget === null ? 54 : 72}
                  rx="6"
                  fill={chartTheme.surface}
                  stroke={chartTheme.grid}
                />
                <text x={tipX + 12} y={tipY + 18} className="chart-label">
                  {shortDate(chosen.date)} ·{" "}
                  {chosen.actual === null ? "Estimate" : "Actual"}
                </text>
                <text x={tipX + 12} y={tipY + 39} className="home-chart-value">
                  {money(chosen.actual ?? chosen.forecast ?? 0)}
                  {mode === "daily" ? " / day" : " cumulative"}
                </text>
                {chosen.budget !== null && (
                  <text x={tipX + 12} y={tipY + 59} className="chart-label">
                    {mode === "daily" ? "Daily allowance" : "Budget pace"}:{" "}
                    {money(chosen.budget)}
                  </text>
                )}
              </g>
            )}
          </g>
        )}
      </svg>
      <span className="sr-only" aria-live="polite">
        {chosen
          ? `${shortDate(chosen.date)}: ${money(chosen.actual ?? chosen.forecast ?? 0)} ${mode} ${chosen.actual === null ? "estimate" : "actual"}`
          : ""}
      </span>
    </div>
  );
}
