"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => undefined;

export interface PortalProps {
  children: ReactNode;
  container?: Element | DocumentFragment | null;
}

export function Portal({ children, container }: PortalProps) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  if (!isClient) return null;
  return createPortal(children, container ?? document.body);
}
