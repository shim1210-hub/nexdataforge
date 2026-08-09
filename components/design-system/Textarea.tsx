import type { TextareaHTMLAttributes } from "react";

import styles from "./components.module.css";
import { type FieldContractProps, useFieldContract } from "./field";
import { mergeClassNames } from "./foundation";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldContractProps {}

export function Textarea({
  id,
  label,
  helperText,
  error,
  className,
  "aria-describedby": ariaDescribedBy,
  rows = 4,
  ...props
}: TextareaProps) {
  const { controlId, helperId, errorId, describedBy } = useFieldContract({
    id,
    helperText,
    error,
    "aria-describedby": ariaDescribedBy,
  });

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={controlId}>{label}</label>
      <textarea
        {...props}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={mergeClassNames(styles.input, styles.textarea, className)}
        id={controlId}
        rows={rows}
      />
      {helperText && <span className={styles.helper} id={helperId}>{helperText}</span>}
      {error && <span className={styles.error} id={errorId}>{error}</span>}
    </div>
  );
}
