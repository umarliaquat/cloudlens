import { CloudLensApp } from "@/components/cloudlens-app";
import { clients, provider } from "@/server/providers/mock";
import { natProcessingComparison } from "@/server/analysis/research-workflows";

const sample = provider.getOverview("brightloop", "month");
const nat = natProcessingComparison(
  sample.monthRecords,
  sample.previousMonthRecords,
);
const previewCost = nat.prior.gb > 0 ? nat.delta : 0;

export async function WorkspaceScreen({
  searchParams,
  section,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  section?: string;
}) {
  const params = await searchParams;
  const client =
    typeof params.client === "string" &&
    clients.some((c) => c.id === params.client)
      ? params.client
      : "brightloop";
  const period =
    params.period === "7d" || params.period === "30d" ? params.period : "month";
  return (
    <CloudLensApp
      previewCost={previewCost}
      initialOverview={
        client === sample.client.id && period === sample.period
          ? sample
          : provider.getOverview(client, period)
      }
      clients={clients}
      initialVariant="a"
      initialRole={
        params.role === "consultant" || params.role === "executive"
          ? params.role
          : "engineer"
      }
      portfolioOverviews={
        section === "portfolio" || section === "budgets"
          ? clients.map((c) =>
              c.id === sample.client.id
                ? sample
                : provider.getOverview(c.id, "month"),
            )
          : undefined
      }
    />
  );
}
