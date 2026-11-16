import { WorkspaceScreen } from "@/components/workspace-screen";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <WorkspaceScreen searchParams={searchParams} />;
}
