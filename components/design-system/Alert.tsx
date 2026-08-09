import type { HTMLAttributes, ReactNode } from "react";

import styles from "./components.module.css";
import { mergeClassNames } from "./foundation";

export type AlertVariant = "info" | "success" | "warning" | "error";
export type AlertLive = "off" | "polite" | "assertive";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  title: ReactNode;
  action?: ReactNode;
  live?: AlertLive;
}

export function Alert({
  variant = "info",
  title,
  action,
  live = "off",
  className,
  children,
  ...props
}: AlertProps) {
  const role = live === "assertive" ? "alert" : live === "polite" ? "status" : undefined;
  return (
    <div
      {...props}
      className={mergeClassNames(styles.alert, styles[`alert${variant}`], className)}
      role={role}
    >
      <div className={styles.alertContent}>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
      {action && <div className={styles.alertAction}>{action}</div>}
    </div>
  );
}
