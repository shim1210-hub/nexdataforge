"use client";

import type { ReactNode } from "react";

import { ModalSurface } from "./ModalSurface";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  container?: Element | DocumentFragment | null;
}

export function Dialog(props: DialogProps) {
  return <ModalSurface {...props} placement="center" />;
}
