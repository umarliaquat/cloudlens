"use client";

import { lazy, Suspense, type ComponentProps } from "react";
import { AccountEntry } from "./account-entry";
import { WorkspaceLoading } from "./workspace-loading";

const WorkspaceApp = lazy(() =>
  import("./workspace-app").then(({ WorkspaceApp }) => ({
    default: WorkspaceApp,
  })),
);

type Props = Omit<ComponentProps<typeof WorkspaceApp>, "leave" | "guest"> & {
  previewCost: number;
};

export function CloudLensApp({ previewCost, ...workspace }: Props) {
  return (
    <AccountEntry previewCost={previewCost}>
      {(leave, guest) => (
        <Suspense fallback={<WorkspaceLoading />}>
          <WorkspaceApp {...workspace} leave={leave} guest={guest} />
        </Suspense>
      )}
    </AccountEntry>
  );
}
