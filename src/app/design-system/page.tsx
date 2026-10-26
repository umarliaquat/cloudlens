import Link from "next/link";
import tokens from "../../../design/theme-study.tokens.json";
import {
  IconLayoutDashboard,
  IconChartLine,
  IconBulb,
  IconFileText,
  IconCheck,
  IconArrowLeft,
} from "@tabler/icons-react";
export default function DesignSystem() {
  return (
    <main className="ds-page">
      <Link className="text-button" href="/">
        <IconArrowLeft />
        Back to the application
      </Link>
      <p className="eyebrow">CLOUDLENS / LOCKED FOUNDATION 01</p>
      <h1>One system. A clearer cloud.</h1>
      <p className="ds-intro">
        The approved visual direction, translated into shared application
        tokens. Light mode · Geist · Tabler Outline.
      </p>
      <section className="ds-section">
        <h2>Color roles</h2>
        <div className="ds-color-grid">
          {Object.entries(tokens.colors).map(([name, hex]) => (
            <div className="ds-color" key={name}>
              <div style={{ background: `var(--${name})` }} />
              <strong>{name}</strong>
              <code>{hex}</code>
            </div>
          ))}
        </div>
      </section>
      <section className="ds-section">
        <h2>Typography</h2>
        <div className="ds-type-display">Cloud clarity. Human control.</div>
        <h3>Understand what changed.</h3>
        <p>
          Body / Geist 14, with a generous 1.5 line height. Explanations stay
          readable.
        </p>
        <code>i-0c42e7 / eu-west-1</code>
      </section>
      <section className="ds-section">
        <h2>Actions & states</h2>
        <div className="ds-actions">
          <button className="button primary">
            <IconFileText />
            Create report
          </button>
          <button className="button primary ds-hover">Hover</button>
          <button className="button primary ds-pressed">Pressed</button>
          <button className="button primary" disabled>
            Disabled
          </button>
          <button className="button secondary">
            <IconCheck />
            Secondary action
          </button>
        </div>
        <p>
          The primary action has a light inset shadow and a dimensional edge.
          Keyboard focus uses the shared focus ring.
        </p>
      </section>
      <section className="ds-section">
        <h2>Status & navigation</h2>
        <div className="ds-actions">
          <span className="badge success">Verified</span>
          <span className="badge warning">Budget at risk</span>
          <span className="badge danger">High severity</span>
          <span className="badge info">Estimated</span>
        </div>
        <div className="ds-nav">
          <div className="nav-item active">
            <IconLayoutDashboard />
            <span>Overview</span>
          </div>
          <div className="nav-item">
            <IconChartLine />
            <span>Cost Explorer</span>
          </div>
          <div className="nav-item">
            <IconBulb />
            <span>Recommendations</span>
          </div>
        </div>
        <p>
          16 px icons · 36 px rows · 8 px icon-label gap · #FFE1D1 active stroke
          · subtle Scout-inspired shadow.
        </p>
      </section>
      <section className="ds-section">
        <h2>Homepage states</h2>
        <p>
          Use the demo toolbar on the overview to inspect loading, empty,
          error and limited-history states. Working dialogs handle focus,
          Escape, validation, role restrictions and confirmation.
        </p>
        <div className="ds-actions">
          <Link className="button secondary" href="/">
            Open cost overview
          </Link>
        </div>
      </section>
    </main>
  );
}
