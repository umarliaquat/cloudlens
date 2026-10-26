"use client";
import type { WorkspacePage } from "@/lib/workspace";
import type { PageContext } from "./shared";
import { RecommendationsPage } from "./analysis-pages";
import { BudgetsPage, ReportsPage, AuditPage } from "./operations-pages";
import { PortfolioPage, UsersPage, SettingsPage } from "./consultant-pages";
import { NetworkReportPage } from "./network-report";
import { ResearchedCostPage } from "./cost-report";
import { InvestigationsPage } from "./investigations-page";
const pages = {
  costs: ResearchedCostPage,
  anomalies: InvestigationsPage,
  recommendations: RecommendationsPage,
  budget: BudgetsPage,
  reports: ReportsPage,
  audit: AuditPage,
  portfolio: PortfolioPage,
  users: UsersPage,
  settings: SettingsPage,
  network: NetworkReportPage,
};
export function WorkspacePages({
  page,
  context,
}: {
  page: Exclude<WorkspacePage, "overview">;
  context: PageContext;
}) {
  const Page = pages[page];
  if (
    (page === "users" || page === "portfolio") &&
    context.role !== "consultant"
  ) {
    return (
      <div className="workspace-page">
        <h1>Consultant workspace</h1>
        <p>
          Client users can review their own costs and decisions. Switch the demo
          persona to Consultant to review assigned clients and manage demo
          access. This is a preview restriction, not production authentication.
        </p>
      </div>
    );
  }
  return (
    <div className={`workspace-page page-${page}`}>
      <Page key={context.overview.client.id} context={context} />
      <footer className="page-footer">
        <span>CloudLens · Simulated AWS data</span>
        <span>All costs in USD · Daily buckets in UTC</span>
      </footer>
    </div>
  );
}
