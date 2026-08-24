import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CalendarClock, Coins, Stethoscope, UserPlus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import { PatientDialog } from "@/components/PatientDialog";
import { listAppointments, listPatients, listVisits } from "@/lib/api";
import { formatAriary, formatDateTime } from "@/lib/dental";

export const Route = createFileRoute("/_authenticated/tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — DentaSuite" },
      { name: "description", content: "Activité du jour du cabinet dentaire : rendez-vous, consultations, patients." },
      { property: "og:title", content: "Tableau de bord — DentaSuite" },
      { property: "og:description", content: "Activité du jour du cabinet dentaire." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: patients = [] } = useQuery({ queryKey: ["patients", ""], queryFn: () => listPatients("") });
  const { data: visits = [] } = useQuery({ queryKey: ["visits", "all"], queryFn: () => listVisits() });
  const { data: appointments = [] } = useQuery({ queryKey: ["appointments", "all"], queryFn: () => listAppointments() });

  const today = new Date().toDateString();
  const todayAppointments = appointments.filter((a) => new Date(a.date_rdv).toDateString() === today);
  const upcoming = appointments
    .filter((a) => new Date(a.date_rdv) >= new Date() && a.statut !== "Annulé")
    .slice(0, 6);
  const revenue = visits.reduce((sum, v) => sum + Number(v.honoraires ?? 0), 0);
  const impayes = visits
    .filter((v) => v.statut_paiement !== "Payé")
    .reduce((sum, v) => sum + Number(v.honoraires ?? 0), 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const nouveauxPatients = patients.filter((p) => new Date(p.created_at) >= monthStart).length;

  const cards = [
    { label: "Patients (file active)", value: patients.length, icon: Users },
    { label: "Nouveaux patients (mois)", value: nouveauxPatients, icon: UserPlus },
    { label: "Consultations réalisées", value: visits.length, icon: Stethoscope },
    { label: "RDV aujourd'hui", value: todayAppointments.length, icon: CalendarClock },
    { label: "Honoraires cumulés", value: formatAriary(revenue), icon: Coins },
    { label: "Impayés", value: formatAriary(impayes), icon: AlertCircle },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">Vue d'ensemble de l'activité du cabinet.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PatientDialog />
          <AppointmentDialog />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="surface-panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-panel p-6">
          <h2 className="text-lg font-semibold">Prochains rendez-vous</h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucun rendez-vous planifié.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {a.patients?.nom} {a.patients?.prenom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(a.date_rdv)} · {a.motif}
                    </p>
                  </div>
                  <Badge variant="secondary">{a.statut}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-panel p-6">
          <h2 className="text-lg font-semibold">Dernières consultations</h2>
          {visits.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucune consultation enregistrée.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {visits.slice(0, 6).map((v) => {
                const patient = patients.find((p) => p.id === v.patient_id);
                return (
                  <li key={v.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <Link
                        to="/patients/$patientId"
                        params={{ patientId: v.patient_id }}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {patient ? `${patient.nom} ${patient.prenom}` : "Patient"}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(v.date_visite)} · {v.diagnostic}
                      </p>
                    </div>
                    <Badge variant="outline">{v.actes}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
