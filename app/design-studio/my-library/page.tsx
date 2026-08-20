import { VariantPage } from "../_components/VariantPages";

export const metadata = { title: "My Library | NexDataForge" };

export default function MyLibraryPage() {
  return <VariantPage params={Promise.resolve({ variant: "variant-04" })} />;
}
