import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listVisits } from "@/lib/api";
import { formatAriary, formatDateTime } from "@/lib/dental";

export const Route = createFileRoute("/_authenticated/consultations")({
  head: () => ({
    meta: [
      { title: "Consultations — DentaSuite" },
      {
        name: "description",
        content: "Historique des consultations du cabinet : motif, diagnostic, traitements et coût.",
      },
      { property: "og:title", content: "Consultations — DentaSuite" },
      { property: "og:description", content: "Historique clinique complet du cabinet dentaire." },
    ],
  }),
  component: ConsultationsPage,
});

function ConsultationsPage() {
  const [search, setSearch] = useState("");
  const { data: visits = [], isLoading } = useQuery({ queryKey: ["visits", "all"], queryFn: () => listVisits() });

  const term = search.trim().toLowerCase();
  const filtered = term
    ? visits.filter((v) =>
        [
          v.consultation_no,
          v.motif,
          v.diagnostic ?? "",
          v.actes ?? "",
          v.patients?.nom ?? "",
          v.patients?.prenom ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
    : visits;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Consultations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historique clinique : motif, diagnostic, traitements réalisés et honoraires.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par n° de consultation, patient, diagnostic…"
          className="pl-9"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement de l'historique…</p>}
      {!isLoading && filtered.length === 0 && (
        <p className="surface-panel p-6 text-sm text-muted-foreground">Aucune consultation enregistrée.</p>
      )}

      <div className="space-y-3">
        {filtered.map((v) => (
          <article key={v.id} className="surface-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" aria-hidden />
                  <span className="font-medium">{v.motif}</span>
                  <Badge variant="outline">{v.consultation_no}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(v.date_visite)} · {v.duree_min} min ·{" "}
                  <Link
                    to="/patients/$patientId"
                    params={{ patientId: v.patient_id }}
                    className="text-primary hover:underline"
                  >
                    {v.patients?.nom} {v.patients?.prenom}
                  </Link>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatAriary(v.honoraires)}</p>
                <Badge variant={v.statut_paiement === "Payé" ? "default" : "secondary"}>{v.statut_paiement}</Badge>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Diagnostic</dt>
                <dd>{v.diagnostic || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Dents (FDI)</dt>
                <dd>{v.dents || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Traitements</dt>
                <dd>{v.traitements?.length ? v.traitements.join(", ") : v.actes || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Prescription</dt>
                <dd>{v.prescription || "—"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
