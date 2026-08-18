import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { createPatient } from "@/lib/api";
import { GROUPES_SANGUINS, SEXES } from "@/lib/dental";

export function PatientDialog() {
  const [open, setOpen] = useState(false);
  const [sexe, setSexe] = useState("Non précisé");
  const [groupe, setGroupe] = useState("");
  const [tabac, setTabac] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPatient,
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success(`Dossier créé pour ${patient.prenom} ${patient.nom}`);
      setOpen(false);
    },
    onError: (error: Error) => toast.error("Création impossible", { description: error.message }),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => (form.get(k) as string)?.trim() || null;
    mutation.mutate({
      nom: (get("nom") ?? "").toUpperCase(),
      prenom: get("prenom") ?? "",
      dossier_no: get("dossier_no") ?? `D-${Date.now().toString().slice(-6)}`,
      date_naissance: get("date_naissance"),
      sexe,
      telephone: get("telephone"),
      email: get("email"),
      adresse: get("adresse"),
      groupe_sanguin: groupe || null,
      antecedents_medicaux: get("antecedents_medicaux"),
      allergies: get("allergies"),
      traitements_en_cours: get("traitements_en_cours"),
      tabac,
      notes: get("notes"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" aria-hidden />
          Nouveau patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Création d'un dossier patient</DialogTitle>
          <DialogDescription>État civil et anamnèse médicale (interrogatoire pré-thérapeutique).</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" name="nom" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" name="prenom" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dossier_no">N° de dossier</Label>
              <Input id="dossier_no" name="dossier_no" placeholder="Auto si vide" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_naissance">Date de naissance</Label>
              <Input id="date_naissance" name="date_naissance" type="date" />
            </div>
            <div className="space-y-2">
              <Label>Sexe</Label>
              <Select value={sexe} onValueChange={setSexe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEXES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Groupe sanguin</Label>
              <Select value={groupe} onValueChange={setGroupe}>
                <SelectTrigger>
                  <SelectValue placeholder="Non renseigné" />
                </SelectTrigger>
                <SelectContent>
                  {GROUPES_SANGUINS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" name="telephone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input id="adresse" name="adresse" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="antecedents_medicaux">Antécédents médicaux</Label>
              <Textarea
                id="antecedents_medicaux"
                name="antecedents_medicaux"
                placeholder="Diabète, cardiopathie, HTA, grossesse, anticoagulants…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea id="allergies" name="allergies" placeholder="Pénicilline, latex, anesthésiques locaux…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="traitements_en_cours">Traitements en cours</Label>
              <Textarea id="traitements_en_cours" name="traitements_en_cours" placeholder="Biphosphonates, AVK…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Hygiène bucco-dentaire, anxiété au fauteuil…" />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <Switch id="tabac" checked={tabac} onCheckedChange={setTabac} />
            <Label htmlFor="tabac" className="font-normal">
              Tabagisme (facteur de risque parodontal)
            </Label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              Enregistrer le dossier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
