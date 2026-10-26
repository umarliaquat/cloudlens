"use client";
import type { ReactNode } from "react";
import {
  IconCalendar,
  IconChevronDown,
  IconSearch,
  IconArrowRight,
  IconDownload,
} from "@tabler/icons-react";
import type {
  Anomaly,
  AuditEvent,
  Client,
  Overview,
  Period,
  Recommendation,
  Role,
} from "@/lib/domain";
import { csvCell } from "@/lib/format";

export type PageContext = {
  overview: Overview;
  clients: Client[];
  portfolio: Overview[];
  role: Role;
  budget: number;
  recommendations: Recommendation[];
  anomalies: Anomaly[];
  events: AuditEvent[];
  onOpen: (panel: string) => void;
  onPeriod: (period: Period) => void;
  notify: (message: string) => void;
  audit: (action: string, object: string, reason?: string) => void;
};
export function Status({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function riskTone(risk: string) {
  return risk === "High" ? "danger" : risk === "Medium" ? "warning" : "info";
}
export function statusTone(status: string) {
  return ["Verified", "Active", "Resolved", "On track", "Implemented"].includes(
    status,
  )
    ? "success"
    : ["Changes requested", "Investigating", "At risk", "Pending"].includes(
          status,
        )
      ? "warning"
      : ["Stale", "High"].includes(status)
        ? "danger"
        : "neutral";
}
export function PageHeader({
  title,
  subtitle,
  children,
  period,
  onPeriod,
}: {
  title: string;
  subtitle: ReactNode;
  children?: ReactNode;
  period?: Period;
  onPeriod?: (period: Period) => void;
}) {
  return (
    <div className="page-heading research-page-heading">
      <div className="page-heading-copy">
        <h1>{title}</h1>
        <div className="page-subtext">
          <p>{subtitle}</p>
          <span className="research-data-note">
            Demo data · Complete through Oct 24, 2026 UTC
          </span>
        </div>
      </div>
      <div className="page-actions">
        {period && onPeriod && (
          <label className="date-select button secondary">
            <IconCalendar />
            <select
              aria-label="Date range"
              value={period}
              onChange={(e) => onPeriod(e.target.value as Period)}
            >
              <option value="month">October 2026</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <IconChevronDown />
          </label>
        )}
        {children}
      </div>
    </div>
  );
}
export function Section({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel workspace-panel ${className}`}>
      {title && (
        <div className="workspace-panel-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Search({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search records",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <label className="table-search">
      <IconSearch />
      <input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<string | { value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="filter-select">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
      <IconChevronDown />
    </label>
  );
}
export function Tabs({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="workspace-tabs" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          role="tab"
          aria-selected={value === o.value}
          tabIndex={value === o.value ? 0 : -1}
          key={o.value}
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => {
            if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
              e.preventDefault();
              const current = options.findIndex((v) => v.value === o.value);
              const next =
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? options.length - 1
                    : (current +
                        (e.key === "ArrowRight" ? 1 : -1) +
                        options.length) %
                      options.length;
              onChange(options[next].value);
              e.currentTarget.parentElement
                ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                [next]?.focus();
            }
          }}
        >
          {o.label}
          {o.count !== undefined && <span>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
export function Summary({
  items,
}: {
  items: {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    icon?: ReactNode;
  }[];
}) {
  return (
    <div className="page-summary">
      {items.map((item) => (
        <div key={item.label}>
          <span className="summary-label">
            {item.icon}
            {item.label}
          </span>
          <strong className="num">{item.value}</strong>
          {item.hint && <small>{item.hint}</small>}
        </div>
      ))}
    </div>
  );
}
export function TableFoot({
  count,
  label,
  children,
}: {
  count: number;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className="workspace-table-footer">
      <span>
        {count} {label}
      </span>
      {children}
    </div>
  );
}
export function ExportButton({
  onClick,
  label = "Export CSV",
  primary = false,
}: {
  onClick: () => void;
  label?: string;
  primary?: boolean;
}) {
  return (
    <button
      className={`button ${primary ? "primary" : "secondary"}`}
      onClick={onClick}
    >
      <IconDownload />
      {label}
    </button>
  );
}
export function ViewButton({
  onClick,
  label = "View details",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button className="text-button accent" onClick={onClick}>
      {label}
      <IconArrowRight />
    </button>
  );
}
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const blob = new Blob(
    ["\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n")],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ReportArt({
  kind,
}: {
  kind: "report" | "savings" | "activity" | "costs";
}) {
  return (
    <svg viewBox="0 0 140 116" className="report-tile-art" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      >
        <path className="art-back" d="m53 17 56 9-12 78-56-9z" />
        <path className="art-paper" d="m31 12 59-5 8 80-59 5z" />
        <path d="m44 28 31-3m-30 12 19-2" />
        {kind === "activity" ? (
          <>
            <circle className="art-back" cx="87" cy="77" r="22" />
            <path d="M87 64v15l10 6" />
          </>
        ) : kind === "savings" ? (
          <>
            <circle className="art-back" cx="87" cy="77" r="22" />
            <path d="m76 77 7 7 16-16" />
          </>
        ) : (
          <path d="m47 76-1-20 7-1 2 20m10-1-2-29 7-1 3 29m10-1-4-38 7-1 4 38" />
        )}
      </g>
    </svg>
  );
}
