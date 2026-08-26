import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, HeartPulse } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import { PatientDialog } from "@/components/PatientDialog";
import { VisitDialog } from "@/components/VisitDialog";
import { getPatient, listAppointments, listVisits } from "@/lib/api";
import { ageFromDate, formatDate, formatDateTime, toothLabel } from "@/lib/dental";

export const Route = createFileRoute("/_authenticated/patients/$patientId")({
  head: () => ({
    meta: [
      { title: "Dossier patient — DentaSuite" },
      { name: "description", content: "Fiche patient : anamnèse, historique des consultations et rendez-vous." },
      { property: "og:title", content: "Dossier patient — DentaSuite" },
      { property: "og:description", content: "Anamnèse, historique des consultations et rendez-vous." },
    ],
  }),
  component: PatientDetail,
});

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value || "—"}</dd>
    </div>
  );
}

function PatientDetail() {
  const { patientId } = Route.useParams();
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patients", patientId],
    queryFn: () => getPatient(patientId),
  });
  const { data: visits = [] } = useQuery({ queryKey: ["visits", patientId], queryFn: () => listVisits(patientId) });
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", patientId],
    queryFn: () => listAppointments(patientId),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement du dossier…</p>;
  if (!patient) return <p className="text-sm text-muted-foreground">Dossier introuvable.</p>;

  const age = ageFromDate(patient.date_naissance);
  const total = visits.reduce((s, v) => s + Number(v.honoraires ?? 0), 0);

  return (
    <div className="space-y-6">
      <Link to="/patients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Retour aux patients
      </Link>

      <div className="surface-panel flex flex-wrap items-start justify-between gap-4 p-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {patient.nom} {patient.prenom}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dossier {patient.dossier_no} · {patient.sexe}
            {age !== null ? ` · ${age} ans` : ""}
            {patient.date_naissance ? ` (né(e) le ${formatDate(patient.date_naissance)})` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {patient.allergies && <Badge variant="destructive">Allergies : {patient.allergies}</Badge>}
            {patient.tabac && <Badge variant="outline">Tabagisme</Badge>}
            {patient.groupe_sanguin && <Badge variant="secondary">Groupe {patient.groupe_sanguin}</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <PatientDialog patient={patient} />
          <VisitDialog patientId={patient.id} />
          <AppointmentDialog patientId={patient.id} />
        </div>

      </div>

      <Tabs defaultValue="historique">
        <TabsList>
          <TabsTrigger value="historique">Historique ({visits.length})</TabsTrigger>
          <TabsTrigger value="rdv">Rendez-vous ({appointments.length})</TabsTrigger>
          <TabsTrigger value="fiche">Fiche médicale</TabsTrigger>
        </TabsList>

        <TabsContent value="historique" className="mt-4 space-y-3">
          {visits.length === 0 && (
            <p className="surface-panel p-6 text-sm text-muted-foreground">Aucune consultation enregistrée.</p>
          )}
          {visits.map((v) => (
            <article key={v.id} className="surface-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{v.motif}</h2>
                <span className="text-xs text-muted-foreground">{formatDateTime(v.date_visite)}</span>
              </div>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <InfoRow label="Examen clinique" value={v.examen_clinique} />
                <InfoRow label="Diagnostic" value={v.diagnostic} />
                <InfoRow
                  label="Dents (FDI)"
                  value={v.dents ? v.dents.split(",").map((d) => toothLabel(d.trim())).join(" · ") : null}
                />
                <InfoRow label="Acte réalisé" value={v.actes} />
                <InfoRow label="Prescription" value={v.prescription} />
                <InfoRow label="Notes" value={v.notes} />
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{Number(v.honoraires).toFixed(2)} €</Badge>
                <Badge variant={v.statut_paiement === "Payé" ? "default" : "outline"}>{v.statut_paiement}</Badge>
              </div>
            </article>
          ))}
          {visits.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Total des honoraires du dossier : <strong className="text-foreground">{total.toFixed(2)} €</strong>
            </p>
          )}
        </TabsContent>

        <TabsContent value="rdv" className="mt-4">
          <div className="surface-panel divide-y divide-border">
            {appointments.length === 0 && <p className="p-6 text-sm text-muted-foreground">Aucun rendez-vous.</p>}
            {appointments.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-medium">{formatDateTime(a.date_rdv)}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.motif} · {a.duree_min} min
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{a.statut}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fiche" className="mt-4">
          <div className="surface-panel p-6">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-primary" aria-hidden />
              <h2 className="text-base font-semibold">Anamnèse et coordonnées</h2>
            </div>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <InfoRow label="Téléphone" value={patient.telephone} />
              <InfoRow label="Email" value={patient.email} />
              <InfoRow label="Adresse" value={patient.adresse} />
              <InfoRow label="Profession" value={patient.profession} />
              <InfoRow label="Assurance / mutuelle" value={patient.assurance} />
              <InfoRow label="Contact d'urgence" value={patient.contact_urgence} />
              <InfoRow label="Groupe sanguin" value={patient.groupe_sanguin} />
              <InfoRow label="Antécédents médicaux" value={patient.antecedents_medicaux} />
              <InfoRow label="Maladies chroniques" value={patient.maladies_chroniques} />
              <InfoRow label="Médicaments" value={patient.medicaments} />
              <InfoRow label="Allergies" value={patient.allergies} />
              <InfoRow label="Traitements en cours" value={patient.traitements_en_cours} />
              <InfoRow label="Notes" value={patient.notes} />
            </dl>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
