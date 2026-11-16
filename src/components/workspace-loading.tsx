export function WorkspaceLoadingContent({ title }: { title?: string }) {
  return (
    <section aria-busy="true">
      <span className="sr-only" role="status">
        {title ? `Loading ${title}` : "Loading CloudLens"}
      </span>
      {title ? (
        <h1 className="route-loading-title">{title}</h1>
      ) : (
        <div className="skeleton route-loading-heading" aria-hidden="true" />
      )}
      <div className="route-loading-grid" aria-hidden="true">
        <div className="skeleton route-loading-metrics" />
        <div className="skeleton route-loading-panel" />
        <div className="skeleton route-loading-panel" />
      </div>
    </section>
  );
}

export function WorkspaceLoading() {
  return (
    <div className="app-shell route-loading-shell">
      <aside className="sidebar desktop-sidebar" aria-hidden="true">
        <span className="route-loading-brand">CloudLens</span>
        <div className="skeleton route-loading-client" />
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="skeleton route-loading-nav" />
        ))}
      </aside>
      <div className="workspace">
        <main className="main-content">
          <WorkspaceLoadingContent />
        </main>
      </div>
    </div>
  );
}
