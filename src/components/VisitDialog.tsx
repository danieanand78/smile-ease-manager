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
import { ACTES, DIAGNOSTICS, MOTIFS, PRESCRIPTIONS, QUADRANTS, STATUTS_PAIEMENT } from "@/lib/dental";

export function VisitDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [motif, setMotif] = useState(MOTIFS[0]!);
  const [diagnostic, setDiagnostic] = useState(DIAGNOSTICS[0]!);
  const [acte, setActe] = useState(ACTES[0]!);
  const [prescription, setPrescription] = useState("");
  const [statut, setStatut] = useState(STATUTS_PAIEMENT[0]!);
  const [dents, setDents] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Consultation enregistrée dans l'historique");
      setOpen(false);
      setDents([]);
    },
    onError: (error: Error) => toast.error("Enregistrement impossible", { description: error.message }),
  });

  function toggleTooth(t: number) {
    setDents((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const date = form.get("date_visite") as string;
    mutation.mutate({
      patient_id: patientId,
      date_visite: date ? new Date(date).toISOString() : new Date().toISOString(),
      motif,
      examen_clinique: (form.get("examen_clinique") as string) || null,
      diagnostic,
      dents: dents.sort((a, b) => a - b).join(", ") || null,
      actes: acte,
      prescription: prescription || null,
      honoraires: Number(form.get("honoraires") || 0),
      statut_paiement: statut,
      notes: (form.get("notes") as string) || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" aria-hidden />
          Ajouter une visite
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle consultation</DialogTitle>
          <DialogDescription>Examen clinique, diagnostic, actes réalisés et prescription.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date_visite">Date de la visite</Label>
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
          </div>

          <div className="space-y-2">
            <Label>Dents concernées — notation FDI</Label>
            <div className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-2">
              {QUADRANTS.map((q) => (
                <div key={q.code}>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">{q.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {q.teeth.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTooth(t)}
                        aria-pressed={dents.includes(t)}
                        className={`h-8 w-8 rounded-md border text-xs font-medium transition-colors ${
                          dents.includes(t)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="examen_clinique">Examen clinique</Label>
            <Textarea
              id="examen_clinique"
              name="examen_clinique"
              placeholder="Test au froid positif prolongé, percussion axiale douloureuse, sondage parodontal 5 mm…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
              <Label>Acte réalisé</Label>
              <Select value={acte} onValueChange={setActe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="honoraires">Honoraires (€)</Label>
              <Input id="honoraires" name="honoraires" type="number" min="0" step="0.01" defaultValue="0" />
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
              <Label htmlFor="notes">Notes / suite du plan de traitement</Label>
              <Textarea id="notes" name="notes" placeholder="Séance 2 : obturation canalaire à J+7" />
            </div>
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
