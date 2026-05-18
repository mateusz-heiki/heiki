import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata = { title: "Ingredient Database — HEIKI HEIKI Pro" };

export default function Page() {
  return (
    <PlaceholderPage
      pathname="/ingredients"
      title="Ingredient Database"
      description="Every functional ingredient we work with, profiled with source, role, evidence, and compatibility."
    />
  );
}
