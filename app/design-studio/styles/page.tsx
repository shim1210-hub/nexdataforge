import { VariantPage } from "../_components/VariantPages";

export const metadata = { title: "Styles | NexDataForge" };

export default function StylesPage() {
  return <VariantPage params={Promise.resolve({ variant: "variant-03" })} />;
}
