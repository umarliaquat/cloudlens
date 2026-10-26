export type Role = "executive" | "engineer" | "consultant";
export type Period = "month" | "7d" | "30d";
export type Severity = "High" | "Medium" | "Low";
export type RecommendationStatus =
  | "Open"
  | "Approved"
  | "Changes requested"
  | "Dismissed"
  | "Implemented"
  | "Verified"
  | "Stale";
export type CostRecord = {
  date: string;
  service: string;
  account: string;
  region: string;
  amount: number;
  partial: boolean;
};
export type Client = {
  id: string;
  name: string;
  industry: string;
  initials: string;
  budget: number;
  accounts: number;
};
export type Anomaly = {
  id: string;
  title: string;
  service: string;
  account: string;
  region: string;
  impact: number;
  percent: number;
  severity: Severity;
  status: string;
  since: string;
  explanation: string;
};
export type Recommendation = {
  evidenceReady?: boolean;
  id: string;
  title: string;
  resource: string;
  account: string;
  type: string;
  savings: number;
  risk: Severity;
  confidence: string;
  status: RecommendationStatus;
  version: number;
  evidence: string;
  explanation: string;
  owner: string;
};
export type AuditEvent = {
  clientId?: string;
  id: string;
  actor: string;
  action: string;
  object: string;
  time: string;
  reason?: string;
};
export type TrendPoint = {
  date: string;
  actual: number | null;
  previous: number | null;
  forecast: number | null;
};
export type Overview = {
  client: Client;
  asOf: string;
  period: Period;
  rangeLabel: string;
  spend: number;
  previousSpend: number;
  change: number | null;
  mtd: number;
  mtdChange: number | null;
  forecast: number | null;
  forecastProjection: number[];
  budget: number;
  completeDays: number;
  identifiedSavings: number;
  verifiedSavings: number;
  trend: TrendPoint[];
  services: {
    name: string;
    amount: number;
    previous: number;
    change: number | null;
    share: number;
  }[];
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  records: CostRecord[];
  previousRecords: CostRecord[];
  monthRecords: CostRecord[];
  previousMonthRecords: CostRecord[];
};
