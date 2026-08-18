import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import { listAppointments } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/dental";

const FILTERS = ["Tous", "Planifié", "Confirmé", "Honoré", "Annulé", "Absent"] as const;

export const Route = createFileRoute("/_authenticated/rendez-vous")({
  head: () => ({
    meta: [
      { title: "Rendez-vous — DentaSuite" },
      { name: "description", content: "Agenda du cabinet : planification et suivi des rendez-vous par statut." },
      { property: "og:title", content: "Rendez-vous — DentaSuite" },
      { property: "og:description", content: "Agenda et planification du cabinet dentaire." },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Tous");
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", "all"],
    queryFn: () => listAppointments(),
  });

  const filtered = appointments.filter((a) => filter === "Tous" || a.statut === filter);
  const groups = filtered.reduce<Record<string, typeof filtered>>((acc, a) => {
    const key = formatDate(a.date_rdv);
    (acc[key] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Rendez-vous</h1>
          <p className="mt-1 text-sm text-muted-foreground">Agenda des séances et suivi des présences.</p>
        </div>
        <AppointmentDialog />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement de l'agenda…</p>}
      {!isLoading && filtered.length === 0 && (
        <p className="surface-panel p-6 text-sm text-muted-foreground">Aucun rendez-vous pour ce filtre.</p>
      )}

      <div className="space-y-5">
        {Object.entries(groups).map(([day, items]) => (
          <section key={day} className="surface-panel overflow-hidden">
            <h2 className="border-b border-border bg-secondary/50 px-5 py-3 text-sm font-semibold">{day}</h2>
            <ul className="divide-y divide-border">
              {items.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    {a.patient_id ? (
                      <Link
                        to="/patients/$patientId"
                        params={{ patientId: a.patient_id }}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {a.patients?.nom} {a.patients?.prenom}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium">Patient</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(a.date_rdv)} · {a.motif} · {a.duree_min} min
                    </p>
                  </div>
                  <Badge variant={a.statut === "Annulé" || a.statut === "Absent" ? "destructive" : "secondary"}>
                    {a.statut}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
