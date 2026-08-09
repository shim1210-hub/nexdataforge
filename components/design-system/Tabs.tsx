"use client";

import {
  createContext,
  useContext,
  useId,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import styles from "./components.module.css";
import { mergeClassNames } from "./foundation";

type TabsContextValue = {
  baseId: string;
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tab components must be rendered inside Tabs.");
  return context;
}

function valueId(value: string) {
  return encodeURIComponent(value).replaceAll("%", "-");
}

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  const baseId = useId();
  return <TabsContext value={{ baseId, value, onValueChange }}>{children}</TabsContext>;
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
}

export function TabList({ label, className, onKeyDown, ...props }: TabListProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (!(["ArrowLeft", "ArrowRight", "Home", "End"] as string[]).includes(event.key)) return;

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
    );
    const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (currentIndex < 0 || tabs.length === 0) return;

    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  }

  return (
    <div
      {...props}
      aria-label={label}
      className={mergeClassNames(styles.tabList, className)}
      onKeyDown={handleKeyDown}
      role="tablist"
    />
  );
}

export interface TabProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onSelect"> {
  value: string;
  disabled?: boolean;
}

export function Tab({ value, disabled, className, children, ...props }: TabProps) {
  const context = useTabsContext();
  const selected = context.value === value;
  const idPart = valueId(value);

  return (
    <button
      {...props}
      aria-controls={`${context.baseId}-panel-${idPart}`}
      aria-selected={selected}
      className={mergeClassNames(styles.tab, className)}
      disabled={disabled}
      id={`${context.baseId}-tab-${idPart}`}
      onClick={() => context.onValueChange(value)}
      role="tab"
      tabIndex={selected ? 0 : -1}
      type="button"
    >
      {children}
    </button>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabPanel({ value, className, children, ...props }: TabPanelProps) {
  const context = useTabsContext();
  const idPart = valueId(value);
  const selected = context.value === value;

  return (
    <div
      {...props}
      aria-labelledby={`${context.baseId}-tab-${idPart}`}
      className={mergeClassNames(styles.tabPanel, className)}
      hidden={!selected}
      id={`${context.baseId}-panel-${idPart}`}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
