import type { ChangeEventHandler, ReactNode } from "react";

import styles from "./components.module.css";
import { type FieldContractProps, useFieldContract } from "./field";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends FieldContractProps {
  name: string;
  options: readonly RadioOption[];
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export function RadioGroup({
  id,
  label,
  name,
  options,
  value,
  defaultValue,
  disabled,
  required,
  helperText,
  error,
  onChange,
  "aria-describedby": ariaDescribedBy,
}: RadioGroupProps) {
  const { controlId, helperId, errorId, describedBy } = useFieldContract({
    id,
    helperText,
    error,
    "aria-describedby": ariaDescribedBy,
  });

  return (
    <fieldset
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      className={styles.group}
      disabled={disabled}
      id={controlId}
    >
      <legend className={styles.label}>{label}</legend>
      <div className={styles.choiceList}>
        {options.map((option) => (
          <label className={styles.choiceLabel} key={option.value}>
            <input
              aria-describedby={describedBy}
              checked={value === undefined ? undefined : value === option.value}
              defaultChecked={value === undefined && defaultValue === option.value}
              disabled={option.disabled}
              name={name}
              onChange={onChange}
              required={required}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {helperText && <span className={styles.helper} id={helperId}>{helperText}</span>}
      {error && <span className={styles.error} id={errorId}>{error}</span>}
    </fieldset>
  );
}
