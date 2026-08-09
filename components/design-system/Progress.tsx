import type { ProgressHTMLAttributes, ReactNode } from "react";

import styles from "./components.module.css";
import { mergeClassNames } from "./foundation";

export interface ProgressProps extends Omit<ProgressHTMLAttributes<HTMLProgressElement>, "children"> {
  label: ReactNode;
  showValue?: boolean;
}

export function Progress({
  label,
  value,
  max = 100,
  showValue = true,
  className,
  ...props
}: ProgressProps) {
  const numericValue = typeof value === "number" ? value : undefined;
  const percentage = numericValue === undefined ? undefined : Math.round((numericValue / Number(max)) * 100);

  return (
    <label className={styles.progressField}>
      <span className={styles.progressLabel}>
        <span>{label}</span>
        {showValue && percentage !== undefined && <strong>{percentage}%</strong>}
      </span>
      <progress
        {...props}
        className={mergeClassNames(styles.progress, className)}
        max={max}
        value={value}
      />
    </label>
  );
}
