"use client";

import {
  useEffect,
  useId,
  useRef,
  type PointerEvent,
  type ReactNode,
} from "react";

import styles from "./components.module.css";
import { mergeClassNames } from "./foundation";
import { IconButton } from "./IconButton";
import { Portal } from "./Portal";

const focusableSelector = [
  "button:not(:disabled)",
  "[href]",
  "input:not(:disabled)",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export type ModalPlacement = "center" | "left" | "right" | "bottom";

export interface ModalSurfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  placement?: ModalPlacement;
  container?: Element | DocumentFragment | null;
}

export function ModalSurface({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeLabel = "Close",
  closeOnEscape = true,
  closeOnOutside = true,
  placement = "center",
  container,
}: ModalSurfaceProps) {
  const titleId = useId();
  const descriptionId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const closeOnEscapeRef = useRef(closeOnEscape);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
    closeOnEscapeRef.current = closeOnEscape;
  }, [closeOnEscape, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let bodyChild: HTMLElement | null = overlay;
    while (bodyChild.parentElement && bodyChild.parentElement !== document.body) {
      bodyChild = bodyChild.parentElement;
    }

    const background = Array.from(document.body.children).filter(
      (element): element is HTMLElement => element instanceof HTMLElement && element !== bodyChild,
    );
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });

    const getFocusable = () => Array.from(
      panel.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");

    const initialFocus = panel.querySelector<HTMLElement>("[data-ndf-autofocus]")
      ?? getFocusable()[0]
      ?? panel;
    initialFocus.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && closeOnEscapeRef.current) {
        event.preventDefault();
        onOpenChangeRef.current(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        panel?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function containFocus(event: FocusEvent) {
      if (panel && event.target instanceof Node && !panel.contains(event.target)) {
        (getFocusable()[0] ?? panel).focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", containFocus, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", containFocus, true);
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      returnFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  function handleOutside(event: PointerEvent<HTMLDivElement>) {
    if (closeOnOutside && event.target === event.currentTarget) onOpenChange(false);
  }

  return (
    <Portal container={container}>
      <div
        className={styles.overlayBackdrop}
        onPointerDown={handleOutside}
        ref={overlayRef}
      >
        <div
          aria-describedby={description ? descriptionId : undefined}
          aria-labelledby={titleId}
          aria-modal="true"
          className={mergeClassNames(styles.modalSurface, styles[`modal${placement}`])}
          ref={panelRef}
          role="dialog"
          tabIndex={-1}
        >
          <header className={styles.modalHeader}>
            <div>
              <h2 id={titleId}>{title}</h2>
              {description && <p id={descriptionId}>{description}</p>}
            </div>
            <IconButton aria-label={closeLabel} onClick={() => onOpenChange(false)} size="small">×</IconButton>
          </header>
          <div className={styles.modalBody}>{children}</div>
          {footer && <footer className={styles.modalFooter}>{footer}</footer>}
        </div>
      </div>
    </Portal>
  );
}
