import { PageHeader } from "@/components/PageHeader";
import { ClientForm } from "../ClientForm";
import { createClient } from "../actions";

export default function NewClientPage() {
  return (
    <div>
      <PageHeader
        title="New client"
        back={{ href: "/clients", label: "Clients" }}
      />
      <ClientForm action={createClient} cancelHref="/clients" />
    </div>
  );
}
