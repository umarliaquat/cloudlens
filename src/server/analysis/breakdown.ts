import type { CostRecord } from "@/lib/domain";
export type GroupDimension = "service" | "account" | "region";
export function filterCosts(
  records: CostRecord[],
  filters: Partial<Record<GroupDimension, string>>,
) {
  return records.filter(
    (record) =>
      !record.partial &&
      Object.entries(filters).every(
        ([key, value]) =>
          !value || value === "all" || record[key as GroupDimension] === value,
      ),
  );
}
export function groupCosts(records: CostRecord[], dimension: GroupDimension) {
  const totals = new Map<string, number>();
  for (const r of records)
    if (!r.partial)
      totals.set(r[dimension], (totals.get(r[dimension]) || 0) + r.amount);
  const total = [...totals.values()].reduce((s, amount) => s + amount, 0);
  return [...totals.entries()]
    .map(([name, amount]) => ({
      name,
      amount,
      share: total ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}
