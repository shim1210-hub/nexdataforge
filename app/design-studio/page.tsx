import { VariantPage } from "./_components/VariantPages";

export const metadata = { title: "Design Studio | NexDataForge" };

export default function DesignStudioPage() {
  return <VariantPage params={Promise.resolve({ variant: "variant-01" })} />;
}