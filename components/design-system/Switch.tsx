import type { InputHTMLAttributes } from "react";

import styles from "./components.module.css";
import { type FieldContractProps, useFieldContract } from "./field";
import { mergeClassNames } from "./foundation";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "role" | "type">,
    Omit<FieldContractProps, "error"> {}

export function Switch({
  id,
  label,
  helperText,
  className,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SwitchProps) {
  const { controlId, helperId, describedBy } = useFieldContract({
    id,
    helperText,
    "aria-describedby": ariaDescribedBy,
  });

  return (
    <div className={styles.choiceField}>
      <label className={styles.switchLabel} htmlFor={controlId}>
        <span>{label}</span>
        <span className={styles.switchTrack}>
          <input
            {...props}
            aria-describedby={describedBy}
            className={mergeClassNames(styles.switchInput, className)}
            id={controlId}
            role="switch"
            type="checkbox"
          />
          <span aria-hidden="true" className={styles.switchThumb} />
        </span>
      </label>
      {helperText && <span className={styles.helper} id={helperId}>{helperText}</span>}
    </div>
  );
}
