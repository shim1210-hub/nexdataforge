import { notFound, redirect } from "next/navigation";
import { DESIGN_STUDIO_ROUTES } from "../_components/routes";

export default async function LegacyVariantRedirect({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  if (variant === "variant-01") redirect(DESIGN_STUDIO_ROUTES.main);
  if (variant === "variant-02") redirect(DESIGN_STUDIO_ROUTES.create);
  if (variant === "variant-03") redirect(DESIGN_STUDIO_ROUTES.styles);
  if (variant === "variant-04") redirect(DESIGN_STUDIO_ROUTES.myLibrary);
  notFound();
}
