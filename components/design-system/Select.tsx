import type { ReactNode, SelectHTMLAttributes } from "react";

import styles from "./components.module.css";
import { type FieldContractProps, useFieldContract } from "./field";
import { mergeClassNames } from "./foundation";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldContractProps {
  children: ReactNode;
  placeholder?: string;
}

export function Select({
  id,
  label,
  helperText,
  error,
  placeholder,
  children,
  className,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SelectProps) {
  const { controlId, helperId, errorId, describedBy } = useFieldContract({
    id,
    helperText,
    error,
    "aria-describedby": ariaDescribedBy,
  });

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={controlId}>{label}</label>
      <select
        {...props}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={mergeClassNames(styles.input, styles.select, className)}
        id={controlId}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      {helperText && <span className={styles.helper} id={helperId}>{helperText}</span>}
      {error && <span className={styles.error} id={errorId}>{error}</span>}
    </div>
  );
}
