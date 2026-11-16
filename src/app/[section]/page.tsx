import { notFound } from "next/navigation";
import { WorkspaceScreen } from "@/components/workspace-screen";
import { workspacePages } from "@/lib/workspace";
export default async function WorkspaceRoute({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { section } = await params;
  if (!Object.values(workspacePages).some((p) => p.path === `/${section}`))
    notFound();
  const query = await searchParams;
  if ((section === "portfolio" || section === "users") && !query.role)
    query.role = "consultant";
  return (
    <WorkspaceScreen searchParams={Promise.resolve(query)} section={section} />
  );
}
