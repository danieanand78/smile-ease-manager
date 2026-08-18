import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PatientDialog } from "@/components/PatientDialog";
import { listPatients } from "@/lib/api";
import { ageFromDate, formatDate } from "@/lib/dental";

export const Route = createFileRoute("/_authenticated/patients/")({
  head: () => ({
    meta: [
      { title: "Patients — DentaSuite" },
      { name: "description", content: "Recherchez un patient par nom, téléphone ou numéro de dossier." },
      { property: "og:title", content: "Patients — DentaSuite" },
      { property: "og:description", content: "Dossiers patients du cabinet dentaire." },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  const [search, setSearch] = useState("");
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients", search],
    queryFn: () => listPatients(search),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="mt-1 text-sm text-muted-foreground">Dossiers médicaux et fiches d'anamnèse.</p>
        </div>
        <PatientDialog />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher : nom, prénom, téléphone, email ou n° de dossier…"
          className="pl-9"
          aria-label="Recherche patient"
        />
      </div>

      <div className="surface-panel divide-y divide-border">
        {isLoading && <p className="p-6 text-sm text-muted-foreground">Chargement…</p>}
        {!isLoading && patients.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">Aucun patient trouvé.</p>
        )}
        {patients.map((p) => {
          const age = ageFromDate(p.date_naissance);
          return (
            <Link
              key={p.id}
              to="/patients/$patientId"
              params={{ patientId: p.id }}
              className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-secondary/60"
            >
              <div>
                <p className="font-medium">
                  {p.nom} {p.prenom}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dossier {p.dossier_no} · {p.sexe}
                  {age !== null ? ` · ${age} ans` : ""} · créé le {formatDate(p.created_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {p.allergies && <Badge variant="destructive">Allergie</Badge>}
                {p.tabac && <Badge variant="outline">Tabac</Badge>}
                {p.telephone && <span className="text-sm text-muted-foreground">{p.telephone}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
