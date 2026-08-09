import { DocsLayout, DocsSection, GuidelineList } from "../_components/DocsBoard";

function Example({ children }: { children: string }) {
  return <pre className="docs-code"><code>{children}</code></pre>;
}

export default function Usage() {
  return (
    <DocsLayout eyebrow="PRODUCTION CORE USAGE" title="Adopt the smallest production layer" summary="Import the shared implementation, preserve native semantics, and record manual evidence before service adoption.">
      <DocsSection title="Import">
        <p>Use the public entry point. Portal, ModalSurface, and field association utilities are internal APIs.</p>
        <Example>{`import {
  Button, Input, Select, Tabs, TabList, Tab, TabPanel,
  Alert, Progress, Dialog, Drawer, ToastProvider, useToast,
} from "@/components/design-system";`}</Example>
      </DocsSection>
      <DocsSection title="Foundation">
        <GuidelineList items={["Prefer semantic --ndf-color-* variables over raw palette values.", "Use breakpoints for JavaScript decisions; CSS follows the same 320 / 720 / 960 standards.", "Use Safe Area variables for fixed mobile surfaces and bottom actions."]} />
        <Example>{`import { breakpoints, safeAreaVariables } from "@/components/design-system";

const mobileMax = breakpoints.tablet;
const bottomInset = safeAreaVariables.bottom;

/* CSS */
.surface { background: var(--ndf-color-bg-surface); }`}</Example>
      </DocsSection>
      <DocsSection title="Form and action">
        <Example>{`<Input label="Project name" helperText="Use a recognizable name." required />

<Select label="Status" placeholder="Choose status" required>
  <option value="ready">Ready</option>
</Select>

<Button loading={saving} type="submit">Save project</Button>`}</Example>
      </DocsSection>
      <DocsSection title="Navigation">
        <p>Tabs are controlled. Keep values stable so tab and panel IDs remain associated.</p>
        <Example>{`<Tabs value={tab} onValueChange={setTab}>
  <TabList label="Project sections">
    <Tab value="overview">Overview</Tab>
    <Tab value="evidence">Evidence</Tab>
  </TabList>
  <TabPanel value="overview">...</TabPanel>
  <TabPanel value="evidence">...</TabPanel>
</Tabs>`}</Example>
      </DocsSection>
      <DocsSection title="Feedback">
        <Example>{`<Alert title="Saved" variant="success" live="polite">
  The project is ready to review.
</Alert>
<Progress label="Uploading evidence" value={68} />

function SaveFeedback() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ message: "Saved", variant: "success" })}>Save</Button>;
}

<ToastProvider><Application /></ToastProvider>`}</Example>
      </DocsSection>
      <DocsSection title="Overlay">
        <GuidelineList items={["Use closeOnOutside={false} for destructive or interruption-sensitive work.", "Keep a visible close path when outside dismissal is disabled.", "Do not mount nested modals; v1.0 supports one modal surface at a time."]} />
        <Example>{`<Dialog open={open} onOpenChange={setOpen}
  title="Delete request?" description="This action cannot be undone."
  closeOnOutside={false} footer={<Button variant="danger">Delete</Button>}>
  Review the request before continuing.
</Dialog>

<Drawer open={sheetOpen} onOpenChange={setSheetOpen}
  title="Next step" placement="bottom">...</Drawer>`}</Example>
      </DocsSection>
    </DocsLayout>
  );
}
