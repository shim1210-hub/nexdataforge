import type { InputHTMLAttributes } from "react";

import styles from "./components.module.css";
import { type FieldContractProps, useFieldContract } from "./field";
import { mergeClassNames } from "./foundation";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldContractProps {}

export function Input({
  id,
  label,
  error,
  helperText,
  className,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const { controlId, helperId, errorId, describedBy } = useFieldContract({
    id,
    helperText,
    error,
    "aria-describedby": ariaDescribedBy,
  });

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={controlId}>{label}</label>
      <input
        {...props}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={mergeClassNames(styles.input, className)}
        id={controlId}
      />
      {helperText && <span className={styles.helper} id={helperId}>{helperText}</span>}
      {error && <span className={styles.error} id={errorId}>{error}</span>}
    </div>
  );
}
