import { PortalComingSoon } from "@/components/portal-coming-soon";

export default function MalakProductsPage() {
  return (
    <PortalComingSoon
      theme="malak"
      section="MALAK / CATALOGUE"
      headline="Objects in progress."
      description="The catalogue is being prepared. Check back soon."
      backHref="/malak"
      backLabel="BACK TO MALAK"
    />
  );
}
