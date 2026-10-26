import type { CostRecord, Recommendation } from "../../lib/domain";

// Reconciled fictional billing scenario. Amounts are USD cents, not AWS quotations.
export const brightloopServices = [
  ["Amazon EC2", 1333700, 1224200],
  ["Amazon RDS", 685800, 685100],
  ["Amazon VPC", 393500, 306200],
  ["Amazon S3", 259200, 259700],
  ["Amazon CloudFront", 189700, 189900],
  ["Other AWS services", 288500, 298500],
] as const;
const cumulative = [
  1160, 2325, 3430, 4580, 5800, 7020, 8220, 9510, 10800, 12030, 13250, 14420,
  15680, 16920, 18190, 19480, 20913, 22220, 23780, 25360, 26910, 28500, 30080,
  31504,
].map((v) => v * 100);
export const demoAccounts = ["Production", "Staging", "Development", "Shared"];

function allocate(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  let remaining = total;
  return weights.map((weight, i) => {
    const value =
      i === weights.length - 1 ? remaining : Math.floor((total * weight) / sum);
    remaining -= value;
    return value;
  });
}
// Distribute integer row totals across day totals without losing a cent.
function matrix(rows: number[], columns: number[]): number[][] {
  const remaining = [...columns];
  return rows.map((total, i) => {
    const values =
      i === rows.length - 1 ? [...remaining] : allocate(total, remaining);
    values.forEach((v, j) => (remaining[j] -= v));
    return values;
  });
}
export function brightloopRecords(): CostRecord[] {
  const out: CostRecord[] = [];
  for (const month of ["2026-09", "2026-10"]) {
    const current = month.endsWith("10");
    const daily = current
      ? cumulative.map((v, i) => v - (cumulative[i - 1] || 0))
      : allocate(2963600, Array(24).fill(1));
    const byService = matrix(
      brightloopServices.map((s) => (current ? s[1] : s[2])),
      daily,
    );
    brightloopServices.forEach(([service, now, prior], i) => {
      const accounts = allocate(prior, [72, 8, 12, 8]);
      if (current) accounts[0] += now - prior;
      const daysByAccount = matrix(accounts, byService[i]);
      daysByAccount.forEach((days, j) =>
        days.forEach((amount, d) =>
          out.push({
            service,
            account: demoAccounts[j],
            region: "us-east-1",
            date: `${month}-${String(d + 1).padStart(2, "0")}`,
            amount,
            partial: false,
          }),
        ),
      );
    });
  }
  return out;
}
export function brightloopRecommendations(
  base: Recommendation[],
): Recommendation[] {
  return base
    .filter((r) => r.id !== "rec-4")
    .map((r) => {
      if (r.id === "rec-1")
        return {
          ...r,
          title: "Rightsize 3 production instances",
          owner: "Daniel Chen",
          evidence:
            "Three m6i.2xlarge workers averaged 18% CPU over Oct 11–24. Estimated move: m6i.xlarge. Memory data is incomplete; review application requirements and run a load test before implementation.",
          explanation:
            "The $640/month estimate assumes unchanged workload and effective pricing. CPU alone does not establish a safe instance size. Approval records a decision only; CloudLens does not change AWS resources.",
        };
      if (r.id === "rec-2")
        return {
          ...r,
          title: "Schedule dev-worker-03 outside office hours",
          owner: "Daniel Chen",
          explanation:
            "Confirm out-of-hours batch jobs and an agreed restart schedule before reducing runtime. The $186/month estimate assumes the proposed schedule. No AWS changes are executed by this demo.",
        };
      if (r.id === "rec-3")
        return {
          ...r,
          title: "Review legacy gp2 volume configuration",
      evidenceReady: false,
          resource: "production-data-volumes",
          account: "Production",
          savings: 24000,
          status: "Changes requested" as const,
          evidence:
            "Consultant must supply IOPS, throughput and retention requirements before an instance-specific recommendation can be reviewed.",
          explanation:
            "Potential $240/month. Supporting storage performance evidence is still requested; this is not ready for approval.",
          owner: "Maya Brooks",
        };
      if (r.id === "rec-5")
        return {
          ...r,
          title: "Scheduled development shutdown",
          account: "Development",
          resource: "dev-scheduled-workers",
          savings: 32500,
          evidence:
            "Implemented Oct 10. Baseline Sep 27–Oct 10; observation Oct 11–24. Simulated daily reduction $10.8333, normalized to 30 days = $325/month. Assumes comparable workload and unchanged effective rates.",
          explanation:
            "Measured monthly run rate, not cash saved during October. The observation is simulated.",
        };
      if (r.id === "rec-6")
        return {
          ...r,
          title: "Removed unattached EBS volumes",
          account: "Production",
          resource: "vol-unattached-archive",
          savings: 24000,
          evidence:
            "Implemented Oct 10. Baseline Sep 27–Oct 10; observation Oct 11–24. Simulated daily reduction $8, normalized to 30 days = $240/month. Assumes comparable workload and unchanged effective rates.",
          explanation:
            "Measured monthly run rate, not cash saved during October. The observation is simulated.",
        };
      return r;
    });
}
