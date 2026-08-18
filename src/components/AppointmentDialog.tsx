import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";

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
import { createAppointment, listPatients } from "@/lib/api";
import { MOTIFS, STATUTS_RDV } from "@/lib/dental";

export function AppointmentDialog({ patientId }: { patientId?: string }) {
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(patientId ?? "");
  const [motif, setMotif] = useState(MOTIFS[1]!);
  const [statut, setStatut] = useState(STATUTS_RDV[0]!);
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", ""],
    queryFn: () => listPatients(""),
    enabled: open && !patientId,
  });

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Rendez-vous planifié");
      setOpen(false);
    },
    onError: (error: Error) => toast.error("Planification impossible", { description: error.message }),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = patientId ?? selectedPatient;
    if (!target) {
      toast.error("Sélectionnez un patient");
      return;
    }
    const form = new FormData(e.currentTarget);
    mutation.mutate({
      patient_id: target,
      date_rdv: new Date(form.get("date_rdv") as string).toISOString(),
      duree_min: Number(form.get("duree_min") || 30),
      motif,
      statut,
      notes: (form.get("notes") as string) || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={patientId ? "outline" : "default"}>
          <CalendarPlus className="h-4 w-4" aria-hidden />
          Nouveau rendez-vous
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Planifier un rendez-vous</DialogTitle>
          <DialogDescription>Réservation d'un créneau au fauteuil.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {!patientId && (
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
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
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date_rdv">Date et heure *</Label>
              <Input id="date_rdv" name="date_rdv" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duree_min">Durée (minutes)</Label>
              <Input id="duree_min" name="duree_min" type="number" min="10" step="5" defaultValue="30" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Motif</Label>
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
            <Label>Statut</Label>
            <Select value={statut} onValueChange={setStatut}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUTS_RDV.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Prémédication antibiotique, patient anxieux…" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              Planifier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
