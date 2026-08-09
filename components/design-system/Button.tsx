import type { ButtonHTMLAttributes } from "react";

import styles from "./components.module.css";
import { mergeClassNames } from "./foundation";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  small: styles.buttonSmall,
  medium: styles.buttonMedium,
  large: styles.buttonLarge,
};

export function Button({
  variant = "primary",
  size = "medium",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={mergeClassNames(styles.button, styles[variant], sizeClasses[size], className)}
      disabled={disabled || loading}
    >
      {loading && <span aria-hidden="true" className={styles.spinner} />}
      <span className={loading ? styles.loadingContent : undefined}>{children}</span>
    </button>
  );
}
