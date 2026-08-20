import { VariantPage } from "../_components/VariantPages";

export const metadata = { title: "Create Studio | NexDataForge" };

export default function CreatePage() {
  return <VariantPage params={Promise.resolve({ variant: "variant-02" })} />;
}
