import { CloudLensApp } from "@/components/cloudlens-app";
import { clients, provider } from "@/server/providers/mock";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
      initialOverview={provider.getOverview(client, period)}
      clients={clients}
      initialVariant="a"
      initialRole={
        params.role === "consultant" || params.role === "executive"
          ? params.role
          : "engineer"
      }
      portfolioOverviews={clients.map((c) =>
        provider.getOverview(c.id, "month"),
      )}
    />
  );
}
