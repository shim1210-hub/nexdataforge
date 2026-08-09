import type { InputHTMLAttributes } from "react";

import styles from "./components.module.css";
import { type FieldContractProps, useFieldContract } from "./field";
import { mergeClassNames } from "./foundation";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type">,
    FieldContractProps {}

export function Checkbox({
  id,
  label,
  helperText,
  error,
  className,
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxProps) {
  const { controlId, helperId, errorId, describedBy } = useFieldContract({
    id,
    helperText,
    error,
    "aria-describedby": ariaDescribedBy,
  });

  return (
    <div className={styles.choiceField}>
      <label className={styles.choiceLabel} htmlFor={controlId}>
        <input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={mergeClassNames(styles.checkbox, className)}
          id={controlId}
          type="checkbox"
        />
        <span>{label}</span>
      </label>
      {helperText && <span className={styles.choiceMessage} id={helperId}>{helperText}</span>}
      {error && <span className={mergeClassNames(styles.choiceMessage, styles.error)} id={errorId}>{error}</span>}
    </div>
  );
}
