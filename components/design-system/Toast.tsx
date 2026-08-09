"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import styles from "./components.module.css";
import { Button } from "./Button";
import { mergeClassNames } from "./foundation";
import { IconButton } from "./IconButton";
import { Portal } from "./Portal";

export type ToastVariant = "info" | "success" | "warning" | "error";
export type ToastLive = "polite" | "assertive";

type ToastContent =
  | { title: ReactNode; message?: ReactNode }
  | { title?: ReactNode; message: ReactNode };

export type ToastOptions = ToastContent & {
  description?: ReactNode;
  action?: ReactNode;
  variant?: ToastVariant;
  live?: ToastLive;
  duration?: number;
};

type ToastRecord = ToastOptions & { id: number };

type ToastContextValue = {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
let nextToastId = 0;

export interface ToastProviderProps {
  children: ReactNode;
  maxVisible?: number;
  container?: Element | DocumentFragment | null;
}

export function ToastProvider({
  children,
  maxVisible = 3,
  container,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = ++nextToastId;
    setToasts((current) => [...current, { ...options, id }]);
    return id;
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [dismiss, toast]);
  const visible = toasts.slice(0, Math.max(1, maxVisible));

  return (
    <ToastContext value={value}>
      {children}
      <Portal container={container}>
        <section aria-label="Notifications" className={styles.toastRegion}>
          {visible.map((item) => (
            <ToastItem dismiss={dismiss} item={item} key={item.id} />
          ))}
        </section>
      </Portal>
    </ToastContext>
  );
}

function ToastItem({ item, dismiss }: { item: ToastRecord; dismiss: (id: number) => void }) {
  const {
    id,
    title,
    message,
    description,
    action,
    variant = "info",
    live = variant === "error" ? "assertive" : "polite",
    duration = 5000,
  } = item;

  useEffect(() => {
    if (duration <= 0) return;
    const timeout = window.setTimeout(() => dismiss(id), duration);
    return () => window.clearTimeout(timeout);
  }, [dismiss, duration, id]);

  return (
    <article
      aria-atomic="true"
      className={mergeClassNames(styles.toast, styles[`toast${variant}`])}
      role={live === "assertive" ? "alert" : "status"}
    >
      <div className={styles.toastContent}>
        {title && <strong>{title}</strong>}
        {message && <span>{message}</span>}
        {description && <small>{description}</small>}
        {action && <div className={styles.toastAction}>{action}</div>}
      </div>
      <IconButton aria-label="Dismiss notification" onClick={() => dismiss(id)} size="small">×</IconButton>
    </article>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}

export function ToastAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <Button onClick={onClick} size="small" variant="outline">{children}</Button>;
}
