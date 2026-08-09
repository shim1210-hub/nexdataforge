import type { ButtonHTMLAttributes } from "react";

import styles from "./components.module.css";
import { mergeClassNames } from "./foundation";
import type { ButtonSize } from "./Button";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  size?: ButtonSize;
}

const sizeClasses: Record<ButtonSize, string> = {
  small: styles.iconSmall,
  medium: styles.iconMedium,
  large: styles.iconLarge,
};

export function IconButton({
  size = "medium",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      className={mergeClassNames(styles.iconButton, sizeClasses[size], className)}
    >
      {children}
    </button>
  );
}
