import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

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
import { createVisit } from "@/lib/api";
import {
  CONSEILS,
  DIAGNOSTICS,
  ETATS_DENT,
  MOTIFS,
  PRESCRIPTIONS,
  QUADRANTS,
  STATUTS_PAIEMENT,
  TRAITEMENTS,
  toothLabel,
} from "@/lib/dental";

type ToothDetail = { fdi: number; etat: string };

export function VisitDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [motif, setMotif] = useState(MOTIFS[0]!);
  const [diagnostic, setDiagnostic] = useState(DIAGNOSTICS[0]!);
  const [traitements, setTraitements] = useState<string[]>([]);
  const [prescription, setPrescription] = useState("");
  const [conseil, setConseil] = useState("");
  const [statut, setStatut] = useState(STATUTS_PAIEMENT[0]!);
  const [dents, setDents] = useState<ToothDetail[]>([]);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Consultation enregistrée dans l'historique");
      setOpen(false);
      setDents([]);
      setTraitements([]);
    },
    onError: (error: Error) => toast.error("Enregistrement impossible", { description: error.message }),
  });

  function toggleTooth(t: number) {
    setDents((prev) =>
      prev.some((d) => d.fdi === t) ? prev.filter((d) => d.fdi !== t) : [...prev, { fdi: t, etat: "Carie" }],
    );
  }

  function setToothState(fdi: number, etat: string) {
    setDents((prev) => prev.map((d) => (d.fdi === fdi ? { ...d, etat } : d)));
  }

  function toggleTraitement(t: string) {
    setTraitements((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const date = form.get("date_visite") as string;
    const prochain = form.get("prochain_rdv") as string;
    mutation.mutate({
      patient_id: patientId,
      date_visite: date ? new Date(date).toISOString() : new Date().toISOString(),
      duree_min: Number(form.get("duree_min") || 30),
      motif,
      examen_clinique: (form.get("examen_clinique") as string) || null,
      diagnostic,
      dents: dents.map((d) => d.fdi).sort((a, b) => a - b).join(", ") || null,
      dents_details: dents.sort((a, b) => a.fdi - b.fdi),
      actes: traitements.join(", ") || null,
      traitements,
      prescription: prescription || null,
      conseils: conseil || null,
      observations: (form.get("observations") as string) || null,
      honoraires: Number(form.get("honoraires") || 0),
      statut_paiement: statut,
      prochain_rdv: prochain ? new Date(prochain).toISOString() : null,
      notes: (form.get("notes") as string) || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" aria-hidden />
          Ajouter une consultation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle consultation</DialogTitle>
          <DialogDescription>
            Examen clinique, diagnostic, état des dents (FDI), traitements réalisés et prescription.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="date_visite">Date de la consultation</Label>
              <Input
                id="date_visite"
                name="date_visite"
                type="datetime-local"
                defaultValue={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duree_min">Durée (min)</Label>
              <Input id="duree_min" name="duree_min" type="number" min="5" step="5" defaultValue="30" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Motif de consultation</Label>
            <Select value={motif} onValueChange={setMotif}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOTIFS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dents concernées — notation FDI</Label>
            <div className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-2">
              {QUADRANTS.map((q) => (
                <div key={q.code}>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">{q.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {q.teeth.map((t) => {
                      const active = dents.some((d) => d.fdi === t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTooth(t)}
                          aria-pressed={active}
                          className={`h-8 w-8 rounded-md border text-xs font-medium transition-colors ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {dents.length > 0 && (
              <div className="space-y-2 rounded-xl border border-border p-3">
                {dents
                  .slice()
                  .sort((a, b) => a.fdi - b.fdi)
                  .map((d) => (
                    <div key={d.fdi} className="flex items-center gap-3">
                      <span className="flex-1 text-sm">{toothLabel(d.fdi)}</span>
                      <Select value={d.etat} onValueChange={(v) => setToothState(d.fdi, v)}>
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ETATS_DENT.map((e) => (
                            <SelectItem key={e} value={e}>
                              {e}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="examen_clinique">Examen clinique</Label>
            <Textarea
              id="examen_clinique"
              name="examen_clinique"
              placeholder="Test au froid positif prolongé, percussion axiale douloureuse, sondage parodontal 5 mm…"
            />
          </div>

          <div className="space-y-2">
            <Label>Diagnostic</Label>
            <Select value={diagnostic} onValueChange={setDiagnostic}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIAGNOSTICS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Traitements réalisés</Label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-border p-3">
              {TRAITEMENTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTraitement(t)}
                  aria-pressed={traitements.includes(t)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    traitements.includes(t)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Prescription</Label>
              <Select value={prescription} onValueChange={setPrescription}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  {PRESCRIPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Conseils post-opératoires</Label>
              <Select value={conseil} onValueChange={setConseil}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  {CONSEILS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="honoraires">Coût de la consultation (Ar)</Label>
              <Input id="honoraires" name="honoraires" type="number" min="0" step="500" defaultValue="0" />
            </div>
            <div className="space-y-2">
              <Label>Statut de paiement</Label>
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
            <div className="space-y-2">
              <Label htmlFor="prochain_rdv">Prochain rendez-vous</Label>
              <Input id="prochain_rdv" name="prochain_rdv" type="datetime-local" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observations</Label>
            <Textarea id="observations" name="observations" placeholder="Patient anxieux, anesthésie difficile…" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Suite du plan de traitement</Label>
            <Textarea id="notes" name="notes" placeholder="Séance 2 : obturation canalaire à J+7" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              Enregistrer la consultation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
