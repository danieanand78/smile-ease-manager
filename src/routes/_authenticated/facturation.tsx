import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Printer, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvoice, getSettings, listInvoices, listPatients, listVisits } from "@/lib/api";
import type { InvoiceWithPatient } from "@/lib/api";
import { MODES_PAIEMENT, STATUTS_PAIEMENT, formatAriary, formatDateTime } from "@/lib/dental";

export const Route = createFileRoute("/_authenticated/facturation")({
  head: () => ({
    meta: [
      { title: "Paiement et facturation — DentaSuite" },
      { name: "description", content: "Facturation du cabinet dentaire : encaissements, remises et reçus imprimables." },
      { property: "og:title", content: "Paiement et facturation — DentaSuite" },
      { property: "og:description", content: "Gestion des paiements et des factures du cabinet." },
    ],
  }),
  component: BillingPage,
});

function BillingPage() {
  const { data: invoices = [] } = useQuery({ queryKey: ["invoices", "all"], queryFn: () => listInvoices() });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [printed, setPrinted] = useState<InvoiceWithPatient | null>(null);

  const total = invoices.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const impayes = invoices.filter((i) => i.statut !== "Payé");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Paiement et facturation</h1>
          <p className="mt-1 text-sm text-muted-foreground">Encaissements, remises et factures imprimables.</p>
        </div>
        <InvoiceDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-panel p-5">
          <p className="text-sm text-muted-foreground">Total encaissé</p>
          <p className="mt-2 text-2xl font-semibold">{formatAriary(total)}</p>
        </div>
        <div className="surface-panel p-5">
          <p className="text-sm text-muted-foreground">Factures émises</p>
          <p className="mt-2 text-2xl font-semibold">{invoices.length}</p>
        </div>
        <div className="surface-panel p-5">
          <p className="text-sm text-muted-foreground">Factures non soldées</p>
          <p className="mt-2 text-2xl font-semibold">{impayes.length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {invoices.length === 0 && (
          <p className="surface-panel p-6 text-sm text-muted-foreground">Aucune facture pour le moment.</p>
        )}
        {invoices.map((inv) => (
          <article key={inv.id} className="surface-panel flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" aria-hidden />
                <span className="font-medium">{inv.numero}</span>
                <Badge variant={inv.statut === "Payé" ? "default" : "secondary"}>{inv.statut}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {inv.patients?.nom} {inv.patients?.prenom} · {formatDateTime(inv.date_facture)} · {inv.mode_paiement}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-lg font-semibold">{formatAriary(inv.total)}</p>
              <Button variant="outline" size="sm" onClick={() => setPrinted(inv)}>
                <Printer className="h-4 w-4" aria-hidden />
                Facture
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={!!printed} onOpenChange={(o) => !o && setPrinted(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Facture {printed?.numero}</DialogTitle>
            <DialogDescription>Reçu de paiement du cabinet.</DialogDescription>
          </DialogHeader>
          {printed && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-display text-lg font-semibold">{settings?.nom ?? "Cabinet dentaire"}</p>
                <p className="text-muted-foreground">{settings?.adresse}</p>
                <p className="text-muted-foreground">
                  {settings?.telephone} {settings?.email ? `· ${settings.email}` : ""}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p>
                  Patient : <strong>{printed.patients?.nom} {printed.patients?.prenom}</strong>
                </p>
                <p className="text-muted-foreground">Dossier n° {printed.patients?.dossier_no}</p>
                <p className="text-muted-foreground">Date : {formatDateTime(printed.date_facture)}</p>
              </div>
              <dl className="space-y-1">
                <Line label="Montant des actes" value={formatAriary(printed.montant)} />
                <Line label="Remise" value={`- ${formatAriary(printed.remise)}`} />
                <Line label="TVA" value={formatAriary(printed.tva)} />
                <Line label="Total à payer" value={formatAriary(printed.total)} strong />
                <Line label="Mode de paiement" value={printed.mode_paiement} />
                <Line label="Statut" value={printed.statut} />
              </dl>
              {printed.notes && <p className="text-muted-foreground">{printed.notes}</p>}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden />
              Imprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-semibold" : ""}>{value}</dd>
    </div>
  );
}

function InvoiceDialog() {
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [visitId, setVisitId] = useState("");
  const [mode, setMode] = useState<string>(MODES_PAIEMENT[0]);
  const [statut, setStatut] = useState<string>("Payé");
  const [montant, setMontant] = useState(0);
  const [remise, setRemise] = useState(0);
  const [tva, setTva] = useState(0);
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({ queryKey: ["patients", ""], queryFn: () => listPatients(""), enabled: open });
  const { data: visits = [] } = useQuery({
    queryKey: ["visits", patientId],
    queryFn: () => listVisits(patientId),
    enabled: open && !!patientId,
  });

  const total = Math.max(0, montant - remise + tva);

  const mutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Facture enregistrée");
      setOpen(false);
    },
    onError: (e: Error) => toast.error("Facturation impossible", { description: e.message }),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!patientId) {
      toast.error("Sélectionnez un patient");
      return;
    }
    const form = new FormData(e.currentTarget);
    mutation.mutate({
      patient_id: patientId,
      visit_id: visitId || null,
      montant,
      remise,
      tva,
      total,
      mode_paiement: mode,
      statut,
      notes: (form.get("notes") as string) || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Receipt className="h-4 w-4" aria-hidden />
          Nouvelle facture
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle facture</DialogTitle>
          <DialogDescription>Encaissement lié à une consultation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nom} {p.prenom} — {p.dossier_no}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {patientId && (
            <div className="space-y-2">
              <Label>Consultation liée</Label>
              <Select
                value={visitId}
                onValueChange={(v) => {
                  setVisitId(v);
                  const found = visits.find((x) => x.id === v);
                  if (found) setMontant(Number(found.honoraires ?? 0));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optionnel" />
                </SelectTrigger>
                <SelectContent>
                  {visits.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.consultation_no} — {v.motif}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="montant">Montant (Ar)</Label>
              <Input
                id="montant"
                type="number"
                min="0"
                step="500"
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remise">Remise (Ar)</Label>
              <Input
                id="remise"
                type="number"
                min="0"
                step="500"
                value={remise}
                onChange={(e) => setRemise(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tva">TVA (Ar)</Label>
              <Input
                id="tva"
                type="number"
                min="0"
                step="500"
                value={tva}
                onChange={(e) => setTva(Number(e.target.value))}
              />
            </div>
          </div>

          <p className="text-sm">
            Total à payer : <strong>{formatAriary(total)}</strong>
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES_PAIEMENT.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statut} onValueChange={setStatut}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS_PAIEMENT.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Acompte versé, reste à payer…" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              Enregistrer la facture
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
