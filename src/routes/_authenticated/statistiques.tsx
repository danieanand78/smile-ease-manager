import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { listAppointments, listPatients, listVisits } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/statistiques")({
  head: () => ({
    meta: [
      { title: "Statistiques — DentaSuite" },
      { name: "description", content: "Indicateurs du cabinet : actes réalisés, honoraires, taux d'absentéisme." },
      { property: "og:title", content: "Statistiques — DentaSuite" },
      { property: "og:description", content: "Indicateurs d'activité du cabinet dentaire." },
    ],
  }),
  component: StatsPage,
});

function Bars({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  if (data.length === 0) return <p className="mt-4 text-sm text-muted-foreground">Pas encore de données.</p>;
  return (
    <ul className="mt-4 space-y-3">
      {data.map(([label, n]) => (
        <li key={label}>
          <div className="flex items-center justify-between text-sm">
            <span>{label}</span>
            <span className="text-muted-foreground">{n}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-secondary">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatsPage() {
  const { data: patients = [] } = useQuery({ queryKey: ["patients", ""], queryFn: () => listPatients("") });
  const { data: visits = [] } = useQuery({ queryKey: ["visits", "all"], queryFn: () => listVisits() });
  const { data: appointments = [] } = useQuery({ queryKey: ["appointments", "all"], queryFn: () => listAppointments() });

  const tally = (values: (string | null | undefined)[]) =>
    Object.entries(
      values.reduce<Record<string, number>>((acc, v) => {
        if (!v) return acc;
        acc[v] = (acc[v] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8) as [string, number][];

  const revenue = visits.reduce((s, v) => s + Number(v.honoraires ?? 0), 0);
  const impayes = visits
    .filter((v) => v.statut_paiement !== "Payé")
    .reduce((s, v) => s + Number(v.honoraires ?? 0), 0);
  const absents = appointments.filter((a) => a.statut === "Absent").length;
  const noShow = appointments.length ? (absents / appointments.length) * 100 : 0;
  const panier = visits.length ? revenue / visits.length : 0;

  const kpis = [
    { label: "File active patients", value: patients.length },
    { label: "Consultations", value: visits.length },
    { label: "Honoraires", value: `${revenue.toFixed(2)} €` },
    { label: "Panier moyen / séance", value: `${panier.toFixed(2)} €` },
    { label: "Impayés", value: `${impayes.toFixed(2)} €` },
    { label: "Taux d'absentéisme", value: `${noShow.toFixed(1)} %` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Statistiques</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Indicateurs d'activité, épidémiologie des diagnostics et suivi des honoraires.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="surface-panel p-5">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="surface-panel p-6">
          <h2 className="text-lg font-semibold">Motifs de consultation</h2>
          <Bars data={tally(visits.map((v) => v.motif))} />
        </section>
        <section className="surface-panel p-6">
          <h2 className="text-lg font-semibold">Diagnostics posés</h2>
          <Bars data={tally(visits.map((v) => v.diagnostic))} />
        </section>
        <section className="surface-panel p-6">
          <h2 className="text-lg font-semibold">Actes réalisés</h2>
          <Bars data={tally(visits.map((v) => v.actes))} />
        </section>
      </div>

      <section className="surface-panel p-6">
        <h2 className="text-lg font-semibold">Répartition des rendez-vous</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {tally(appointments.map((a) => a.statut)).map(([statut, n]) => (
            <Badge key={statut} variant="secondary">
              {statut} : {n}
            </Badge>
          ))}
          {appointments.length === 0 && <p className="text-sm text-muted-foreground">Aucun rendez-vous.</p>}
        </div>
      </section>
    </div>
  );
}
