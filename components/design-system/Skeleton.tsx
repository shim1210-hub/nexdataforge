import type { CSSProperties, HTMLAttributes } from "react";

import styles from "./components.module.css";
import { mergeClassNames } from "./foundation";

export type SkeletonVariant = "text" | "rectangular" | "circular";

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  variant?: SkeletonVariant;
}

export function Skeleton({
  width = "100%",
  height,
  variant = "text",
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={mergeClassNames(styles.skeleton, styles[`skeleton${variant}`], className)}
      style={{ width, height, ...style }}
    />
  );
}
