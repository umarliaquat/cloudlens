"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBulb,
  IconChartLine,
  IconCheck,
  IconLayoutDashboard,
  IconX,
} from "@tabler/icons-react";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import "@/styles/workspace-tour.css";

const tourKey = "cloudlens-overview-tour-v1";
let hasShownWithoutStorage = false;

export function markFirstWorkspaceTourVisit() {
  if (hasShownWithoutStorage) return false;
  try {
    if (localStorage.getItem(tourKey)) return false;
    localStorage.setItem(tourKey, "seen");
  } catch {
    hasShownWithoutStorage = true;
  }
  return true;
}

const steps = [
  {
    title: "Welcome to CloudLens",
    description:
      "Take a quick tour of your sample workspace. See what you’re spending, find what changed, and review opportunities to save.",
    target: null,
  },
  {
    title: "Start with your cost overview",
    description:
      "Use the account filter to narrow the overview to one demo account. Check the spend trend and forecast to see how costs are tracking.",
    target: "accounts",
  },
  {
    title: "Find what drove a change",
    description:
      "In Cost breakdown, group spend by service, account, or region and compare it with the previous period.",
    target: "costs",
  },
  {
    title: "Review ways to save",
    description:
      "Open Ways to save to review the evidence behind each recommendation. Check estimated savings and verified outcomes separately.",
    target: "recommendations",
  },
] as const;

const previewItems = [
  [IconLayoutDashboard, "Cost overview"],
  [IconChartLine, "Cost breakdown"],
  [IconBulb, "Ways to save"],
] as const;

type Placement = {
  target: DOMRect;
  left: number;
  top: number;
  side: "right" | "below" | "above";
  arrow: number;
};

function measurePlacement(
  target: HTMLElement,
  card: HTMLElement,
): Placement | null {
  const rect = target.getBoundingClientRect();
  const { width, height } = card.getBoundingClientRect();
  const gutter = 16;
  const gap = 16;
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  if (
    !rect.width ||
    !rect.height ||
    rect.top < gutter ||
    rect.left < 0 ||
    rect.bottom > viewportHeight - gutter ||
    rect.right > viewportWidth
  )
    return null;

  if (rect.right + gap + width + gutter <= viewportWidth) {
    const top = Math.max(
      gutter,
      Math.min(centerY - height / 2, viewportHeight - height - gutter),
    );
    return {
      target: rect,
      left: rect.right + gap,
      top,
      side: "right",
      arrow: centerY - top,
    };
  }

  const left = Math.max(
    gutter,
    Math.min(centerX - width / 2, viewportWidth - width - gutter),
  );
  const arrow = centerX - left;
  if (rect.bottom + gap + height + gutter <= viewportHeight)
    return { target: rect, left, top: rect.bottom + gap, side: "below", arrow };
  if (rect.top >= height + gap + gutter)
    return {
      target: rect,
      left,
      top: rect.top - gap - height,
      side: "above",
      arrow,
    };
  return null;
}

export function WorkspaceTour({
  onDismiss,
  onRestoreFocus,
}: {
  onDismiss: () => void;
  onRestoreFocus: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [card, setCard] = useState<HTMLDivElement | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const step = steps[index];
  const welcome = index === 0;
  const last = index === steps.length - 1;

  useLayoutEffect(() => {
    if (!card) return;
    heading.current?.focus({ preventScroll: true });
  }, [card, index]);

  useLayoutEffect(() => {
    if (!card || !step.target) return;
    const selector = `[data-tour-anchor="${step.target}"]`;
    const anchor = document.querySelector<HTMLElement>(selector);
    let frame = 0;
    function update() {
      const target = document.querySelector<HTMLElement>(selector);
      setPlacement(target && card ? measurePlacement(target, card) : null);
    }
    function scheduleUpdate() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }
    update();
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(card);
    if (anchor) observer.observe(anchor);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [card, step.target]);

  function move(offset: number) {
    setPlacement(null);
    setIndex(index + offset);
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className="tour-overlay"
          data-spotlight={Boolean(placement)}
        >
          {placement && (
            <div
              className="tour-spotlight"
              aria-hidden="true"
              style={{
                left: placement.target.left,
                top: placement.target.top,
                width: placement.target.width,
                height: placement.target.height,
              }}
            />
          )}
        </Dialog.Overlay>
        <Dialog.Content
          ref={setCard}
          className={`tour-card${welcome ? " tour-welcome" : ""}`}
          data-side={placement?.side}
          style={
            placement
              ? ({
                  left: placement.left,
                  top: placement.top,
                  "--tour-arrow": `${placement.arrow}px`,
                } as CSSProperties)
              : undefined
          }
          onPointerDownOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            heading.current?.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onRestoreFocus();
          }}
        >
          <div className="tour-surface">
            <div className="tour-progress" aria-hidden="true">
              {steps.map(({ title }, i) => (
                <span key={title} data-reached={i <= index} />
              ))}
            </div>
            <Dialog.Close asChild>
              <button
                className="icon-button tour-close"
                type="button"
                aria-label="Close tour"
              >
                <IconX aria-hidden="true" />
              </button>
            </Dialog.Close>
            <div className="tour-body">
              <div className="tour-copy">
                <p className="tour-step">
                  Step {index + 1} of {steps.length}
                </p>
                <Dialog.Title ref={heading} tabIndex={-1}>
                  {step.title}
                </Dialog.Title>
                <Dialog.Description>{step.description}</Dialog.Description>
              </div>
              {welcome && (
                <div className="tour-preview" aria-hidden="true">
                  <div className="tour-preview-panel">
                    {previewItems.map(([Icon, label]) => (
                      <div key={label}>
                        <Icon /> {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <footer className="tour-actions">
              {!welcome && (
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => move(-1)}
                >
                  <IconArrowLeft aria-hidden="true" /> Back
                </button>
              )}
              <div className="tour-actions-end">
                {!last && (
                  <Dialog.Close asChild>
                    <button className="text-button" type="button">
                      Skip tour
                    </button>
                  </Dialog.Close>
                )}
                <button
                  className="button primary"
                  type="button"
                  onClick={last ? onDismiss : () => move(1)}
                >
                  {welcome ? "Start tour" : last ? "Finish tour" : "Next"}
                  {last ? (
                    <IconCheck aria-hidden="true" />
                  ) : (
                    <IconArrowRight aria-hidden="true" />
                  )}
                </button>
              </div>
            </footer>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
