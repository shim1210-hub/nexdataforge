import { useId, type ReactNode } from "react";

export interface FieldContractProps {
  id?: string;
  label: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  "aria-describedby"?: string;
}

type FieldAssociationProps = Pick<
  FieldContractProps,
  "id" | "helperText" | "error" | "aria-describedby"
>;

export function useFieldContract({
  id,
  helperText,
  error,
  "aria-describedby": ariaDescribedBy,
}: FieldAssociationProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const helperId = helperText ? `${controlId}-helper` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(" ") || undefined;

  return { controlId, helperId, errorId, describedBy };
}
