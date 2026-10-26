import { notFound } from "next/navigation";
import Home from "../page";
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
  return <Home searchParams={Promise.resolve(query)} />;
}
