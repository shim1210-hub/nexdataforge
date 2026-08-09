"use client";

import type { ReactNode } from "react";

import { ModalSurface, type ModalPlacement } from "./ModalSurface";

export type DrawerPlacement = Exclude<ModalPlacement, "center">;

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  placement?: DrawerPlacement;
  closeLabel?: string;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  container?: Element | DocumentFragment | null;
}

export function Drawer({ placement = "right", ...props }: DrawerProps) {
  return <ModalSurface {...props} placement={placement} />;
}
