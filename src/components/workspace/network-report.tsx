"use client";
import { useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconDownload,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  networkFlows,
  flowTotals,
  sankeyLayout,
  type NetworkFlow,
} from "@/server/analysis/research-workflows";
import { money } from "@/lib/format";
import { workspaceHref } from "@/lib/workspace";
import {
  PageHeader,
  Section,
  Select,
  Summary,
  ExportButton,
  downloadCsv,
  type PageContext,
} from "./shared";
import { Modal } from "./operations-pages";
import { chartTheme, networkChartLayout } from "@/styles/theme";
import { useChartWidth } from "../use-chart-width";

export function NetworkReportPage({ context: c }: { context: PageContext }) {
  const { ref: diagramRef, width: diagramWidth } = useChartWidth(1010);
  const graphWidth = Math.max(640, diagramWidth);
  const [source, setSource] = useState("all"),
    [category, setCategory] = useState("all"),
    [weight, setWeight] = useState<"cost" | "gb">("cost");
  const [selected, setSelected] = useState<string[]>([]),
    [detail, setDetail] = useState<NetworkFlow | null>(null);
  const all = networkFlows(c.overview.client.id, 24);
  const flows = all.filter(
    (f) =>
      (source === "all" || f.source === source) &&
      (category === "all" || f.category === category),
  );
  const totals = flowTotals(flows),
    layout = sankeyLayout(flows, weight, graphWidth);
  const rows = selected.length
    ? flows.filter((f) => selected.includes(f.id))
    : flows;
  const billing = c.overview.monthRecords
    .filter((r) => r.service === "Amazon VPC")
    .reduce((s, r) => s + r.amount, 0);
  const colors = [chartTheme.spend, chartTheme.secondary, "var(--chart-3)"];
  const label = (value: number) =>
    weight === "cost" ? money(value) : `${value.toLocaleString()} GB`;
  function exportFlows() {
    downloadCsv("cloudlens-network-flow-report.csv", [
      [
        "SIMULATED VPC flow-log attribution",
        "Oct 1–24, 2026 UTC · Production · us-east-1",
      ],
      [
        "Source",
        "Category",
        "Destination",
        "GB",
        "Estimated NAT processing USD",
      ],
      ...rows.map((f) => [
        f.source,
        f.category,
        f.destination,
        f.gb,
        (f.cost / 100).toFixed(2),
      ]),
      [
        "Caution",
        "NAT processing only, modeled at $0.045/GB; not total transfer charges or a flow-log ingestion integration.",
      ],
    ]);
    c.notify("Filtered flow report downloaded.");
  }
  return (
    <>
      <PageHeader
        title="Network flow report"
        subtitle="Trace modeled NAT processing costs from workload to destination"
      >
        <ExportButton onClick={exportFlows} />
      </PageHeader>
      <div className="research-evidence-strip">
        <strong>Simulated flow-log attribution</strong>
        <span>
          Oct 1–24, 2026 · Production · us-east-1 · outbound through NAT ·
          decimal GB · causes require investigation
        </span>
      </div>
      {!all.length ? (
        <Section title="Network scenario scope">
          <div className="section-body">
            <p>
              The modeled flow records belong to Brightloop’s production NAT
              investigation. No flow records are invented for this client.
            </p>
            <Link
              className="button secondary"
              href={workspaceHref(
                "network",
                "brightloop",
                c.overview.period,
                c.role,
              )}
            >
              Open Brightloop investigation
              <IconArrowRight />
            </Link>
          </div>
        </Section>
      ) : (
        <>
          <Summary
            items={[
              {
                label: "Estimated NAT processing",
                value: money(totals.cost),
                hint: "Selected modeled flows · $0.045/GB",
              },
              {
                label: "Data processed",
                value: `${totals.gb.toLocaleString()} GB`,
                hint: "Source and destination attribution",
              },
              {
                label: "VPC billing total",
                value: money(billing),
                hint: "Includes other VPC charges; different scope",
              },
            ]}
          />
          <Section
            title="Where network costs flow"
            subtitle="Source workload → destination category → destination. Band width follows the selected measure."
          >
            <div className="workspace-toolbar">
              <Select
                label="Source workload"
                value={source}
                onChange={(v) => {
                  setSource(v);
                  setSelected([]);
                }}
                options={[
                  { value: "all", label: "All source workloads" },
                  ...[...new Set(all.map((f) => f.source))].map((s) => ({
                    value: s,
                    label: s,
                  })),
                ]}
              />
              <Select
                label="Traffic category"
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  setSelected([]);
                }}
                options={[
                  { value: "all", label: "All destination categories" },
                  ...[...new Set(all.map((f) => f.category))].map((s) => ({
                    value: s,
                    label: s,
                  })),
                ]}
              />
              <Select
                label="Flow weight"
                value={weight}
                onChange={(v) => setWeight(v as "cost" | "gb")}
                options={[
                  { value: "cost", label: "Weight: estimated cost" },
                  { value: "gb", label: "Weight: data processed" },
                ]}
              />
              <button
                className="text-button"
                onClick={() => {
                  setSource("all");
                  setCategory("all");
                  setSelected([]);
                }}
              >
                Reset filters
              </button>
            </div>
            <div className="network-sankey" ref={diagramRef}>
              <svg
                viewBox={`0 0 ${graphWidth} ${networkChartLayout.height}`}
                role="group"
                aria-label={`NAT processing flow diagram weighted by ${weight === "cost" ? "estimated USD cost" : "GB"}`}
              >
                {["Source workload", "Destination category", "Destination"].map(
                  (name, i) => (
                    <text
                      key={name}
                      x={[20, (graphWidth - 200) / 2, graphWidth - 200][i]}
                      y="13"
                      className="network-column-heading"
                    >
                      {name}
                    </text>
                  ),
                )}
                {layout.links.map((link, i) => (
                  <path
                    key={i}
                    d={link.path}
                    fill="none"
                    stroke={
                      colors[
                        layout.nodes
                          .filter((n) => n.column === 0)
                          .findIndex((n) => n.name === link.source) % 3
                      ] || chartTheme.secondary
                    }
                    strokeWidth={link.width}
                    opacity={
                      selected.length &&
                      !link.flowIds.some((id) => selected.includes(id))
                        ? 0.08
                        : 0.24
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={`${link.source} to ${link.target}: ${label(link.value)}. Show matching flows.`}
                    onClick={() => setSelected(link.flowIds)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(link.flowIds);
                      }
                    }}
                  >
                    <title>
                      {link.source} → {link.target}: {label(link.value)}
                    </title>
                  </path>
                ))}
                {layout.nodes.map((n) => (
                  <g
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.name}: ${label(n.value)}. Filter related flows.`}
                    onClick={() =>
                      setSelected(
                        flows
                          .filter((f) =>
                            [f.source, f.category, f.destination].includes(
                              n.name,
                            ),
                          )
                          .map((f) => f.id),
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(
                          flows
                            .filter((f) =>
                              [f.source, f.category, f.destination].includes(
                                n.name,
                              ),
                            )
                            .map((f) => f.id),
                        );
                      }
                    }}
                  >
                    <rect
                      x={n.x}
                      y={n.y}
                      width="10"
                      height={n.height}
                      rx="2"
                      fill={
                        n.column === 0
                          ? colors[
                              layout.nodes
                                .filter((p) => p.column === 0)
                                .indexOf(n) % 3
                            ]
                          : chartTheme.secondary
                      }
                    />
                    <rect
                      x={n.x + 16}
                      y={n.y + n.height / 2 - 19}
                      width="172"
                      height="39"
                      rx="4"
                      fill={chartTheme.surface}
                      opacity=".95"
                    />
                    <text
                      x={n.x + 24}
                      y={n.y + n.height / 2 - 3}
                      className="network-label"
                    >
                      {n.name}
                    </text>
                    <text
                      x={n.x + 24}
                      y={n.y + n.height / 2 + 13}
                      className="chart-label"
                    >
                      {label(n.value)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="research-chart-footer">
              <span>
                Estimated processing only · no inter-region or internet-transfer
                fees included
              </span>
              {selected.length > 0 && (
                <button
                  className="text-button accent"
                  onClick={() => setSelected([])}
                >
                  Show all filtered paths
                </button>
              )}
            </div>
          </Section>
          <Section
            title="Flow evidence"
            subtitle={`${rows.length} matching paths · table and diagram use the same source records`}
          >
            <div className="workspace-table-scroll">
              <table className="workspace-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Category</th>
                    <th>Destination</th>
                    <th className="align-right">Data · GB</th>
                    <th className="align-right">Est. processing</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f) => (
                    <tr key={f.id}>
                      <td className="mono">{f.source}</td>
                      <td>{f.category}</td>
                      <td>{f.destination}</td>
                      <td className="align-right num">
                        {f.gb.toLocaleString()}
                      </td>
                      <td className="align-right num">{money(f.cost)}</td>
                      <td>
                        <button
                          className="text-button accent"
                          onClick={() => setDetail(f)}
                        >
                          Evidence
                          <IconArrowRight />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3}>Matching path total</th>
                    <td className="align-right num">
                      {flowTotals(rows).gb.toLocaleString()} GB
                    </td>
                    <td className="align-right num">
                      {money(flowTotals(rows).cost)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Section>
          <Section title="Investigation, not a prescribed fix">
            <div className="research-two-column section-body">
              <div>
                <h3>Observed</h3>
                <p>
                  Modeled NAT processing rose from 40,000 GB to 59,400 GB,
                  adding $873 at the same effective rate. Current processing
                  estimate: $2,673, within the $3,935 VPC bill; remaining $1,262
                  represents other VPC charges.
                </p>
              </div>
              <div>
                <h3>Validate before changing</h3>
                <p>
                  S3 traffic is the largest modeled destination. Evaluate
                  whether a VPC endpoint is suitable, confirm route coverage and
                  application requirements, and estimate net cost before
                  proposing a change. The $873 increase is not an automatic
                  savings estimate.
                </p>
              </div>
            </div>
          </Section>
        </>
      )}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Network path evidence"
        description="Modeled flow record · not a live AWS connection"
      >
        {detail && (
          <div className="workspace-modal-body">
            <h3>
              {detail.source} → {detail.destination}
            </h3>
            <dl className="detail-facts">
              <div>
                <dt>Scope</dt>
                <dd>
                  {detail.account} · {detail.region}
                </dd>
              </div>
              <div>
                <dt>Data processed</dt>
                <dd>{detail.gb.toLocaleString()} GB</dd>
              </div>
              <div>
                <dt>Effective processing rate</dt>
                <dd>$0.045/GB · scenario assumption</dd>
              </div>
              <div>
                <dt>Estimated charge</dt>
                <dd>{money(detail.cost)}</dd>
              </div>
            </dl>
            <p>
              Flow attribution requires additional logs beyond a bill total.
              These paths and their proportional range estimates are fictional
              records for this concept. Costs do not include other transfer
              rates or NAT hourly charges.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
