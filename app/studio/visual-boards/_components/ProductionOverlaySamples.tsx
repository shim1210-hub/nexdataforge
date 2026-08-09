"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  Drawer,
  ToastAction,
  ToastProvider,
  useToast,
} from "@/components/design-system";

type OpenOverlay = "dialog" | "critical" | "drawer" | "sheet" | null;

export function ProductionOverlaySamples() {
  return <ToastProvider><OverlayControls /></ToastProvider>;
}

function OverlayControls() {
  const [open, setOpen] = useState<OpenOverlay>(null);
  const { toast } = useToast();

  return (
    <div className="core-stack">
      <div className="core-row">
        <Button onClick={() => setOpen("dialog")}>Open dialog</Button>
        <Button onClick={() => setOpen("critical")} variant="danger">Protected confirmation</Button>
        <Button onClick={() => setOpen("drawer")} variant="outline">Right drawer</Button>
        <Button onClick={() => setOpen("sheet")} variant="secondary">Bottom sheet</Button>
      </div>

      <Dialog
        description="Review the details before saving this request."
        footer={<><Button onClick={() => setOpen(null)} variant="ghost">Cancel</Button><Button data-ndf-autofocus onClick={() => setOpen(null)}>Save request</Button></>}
        onOpenChange={(nextOpen) => setOpen(nextOpen ? "dialog" : null)}
        open={open === "dialog"}
        title="Save this request?"
      >
        <p>The request remains editable after it is saved.</p>
      </Dialog>

      <Dialog
        closeOnOutside={false}
        description="Outside interaction is disabled for this destructive workflow. Use Cancel, Delete, or Escape."
        footer={<><Button data-ndf-autofocus onClick={() => setOpen(null)} variant="ghost">Cancel</Button><Button onClick={() => setOpen(null)} variant="danger">Delete request</Button></>}
        onOpenChange={(nextOpen) => setOpen(nextOpen ? "critical" : null)}
        open={open === "critical"}
        title="Delete this request?"
      >
        <p>This action cannot be undone.</p>
      </Dialog>

      <Drawer
        description="A modal side surface with the same focus and dismissal contract as Dialog."
        footer={<Button onClick={() => setOpen(null)}>Done</Button>}
        onOpenChange={(nextOpen) => setOpen(nextOpen ? "drawer" : null)}
        open={open === "drawer"}
        placement="right"
        title="Request details"
      >
        <p>Drawer content scrolls independently when it is longer than the viewport.</p>
        <p>Focus remains inside until the drawer closes.</p>
      </Drawer>

      <Drawer
        description="A mobile-ready modal surface that includes bottom Safe Area padding."
        footer={<><Button onClick={() => setOpen(null)} variant="ghost">Not now</Button><Button onClick={() => setOpen(null)}>Continue</Button></>}
        onOpenChange={(nextOpen) => setOpen(nextOpen ? "sheet" : null)}
        open={open === "sheet"}
        placement="bottom"
        title="Choose the next step"
      >
        <p>The sheet avoids a fixed content height and allows internal scrolling.</p>
      </Drawer>

      <div className="core-row">
        <Button onClick={() => toast({ message: "The latest data is available.", variant: "info" })} size="small" variant="outline">Info toast</Button>
        <Button onClick={() => toast({ title: "Request saved", description: "You can continue editing it.", variant: "success" })} size="small" variant="outline">Success toast</Button>
        <Button onClick={() => toast({ title: "Could not save", message: "Check the connection and try again.", variant: "error" })} size="small" variant="outline">Error toast</Button>
        <Button onClick={() => toast({ title: "Draft archived", action: <ToastAction>Undo</ToastAction>, duration: 8000, variant: "warning" })} size="small" variant="outline">Action toast</Button>
        <Button onClick={() => toast({ message: "This notification remains until dismissed.", duration: 0 })} size="small" variant="outline">Persistent toast</Button>
      </div>
      <p className="studio-note">Toast는 focus를 이동하지 않으며 최대 3개만 동시에 표시됩니다. 추가 항목은 queue에서 대기합니다.</p>
    </div>
  );
}
