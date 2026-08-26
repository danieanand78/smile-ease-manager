import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, UserPlus } from "lucide-react";

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
import { createPatient, updatePatient, type Patient } from "@/lib/api";
import { GROUPES_SANGUINS, SEXES } from "@/lib/dental";

export function PatientDialog({ patient }: { patient?: Patient }) {
  const isEdit = Boolean(patient);
  const [open, setOpen] = useState(false);
  const [sexe, setSexe] = useState(patient?.sexe ?? "Non précisé");
  const [groupe, setGroupe] = useState(patient?.groupe_sanguin ?? "");
  const [tabac, setTabac] = useState(patient?.tabac ?? false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: Parameters<typeof createPatient>[0]) =>
      isEdit ? updatePatient(patient!.id, values) : createPatient(values),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success(
        `${isEdit ? "Dossier mis à jour" : "Dossier créé"} : ${saved?.prenom ?? ""} ${saved?.nom ?? ""}`.trim(),
      );
      setOpen(false);
    },
    onError: (error: Error) =>
      toast.error(isEdit ? "Modification impossible" : "Création impossible", { description: error.message }),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => (form.get(k) as string)?.trim() || null;
    const ageValue = get("age");
    mutation.mutate({
      nom: (get("nom") ?? "").toUpperCase(),
      prenom: get("prenom") ?? "",
      dossier_no: get("dossier_no") ?? `D-${Date.now().toString().slice(-6)}`,
      date_naissance: get("date_naissance"),
      age: ageValue ? Number(ageValue) : null,
      sexe,
      telephone: get("telephone"),
      email: get("email"),
      adresse: get("adresse"),
      profession: get("profession"),
      assurance: get("assurance"),
      contact_urgence: get("contact_urgence"),
      groupe_sanguin: groupe || null,
      antecedents_medicaux: get("antecedents_medicaux"),
      maladies_chroniques: get("maladies_chroniques"),
      medicaments: get("medicaments"),
      allergies: get("allergies"),
      traitements_en_cours: get("traitements_en_cours"),
      tabac,
      notes: get("notes"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" aria-hidden />
            Modifier le dossier
          </Button>
        ) : (
          <Button>
            <UserPlus className="h-4 w-4" aria-hidden />
            Nouveau patient
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modification du dossier patient" : "Création d'un dossier patient"}</DialogTitle>
          <DialogDescription>État civil et anamnèse médicale (interrogatoire pré-thérapeutique).</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" name="nom" required defaultValue={patient?.nom ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" name="prenom" required defaultValue={patient?.prenom ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dossier_no">N° de dossier</Label>
              <Input
                id="dossier_no"
                name="dossier_no"
                placeholder="Auto si vide"
                defaultValue={patient?.dossier_no ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_naissance">Date de naissance</Label>
              <Input
                id="date_naissance"
                name="date_naissance"
                type="date"
                defaultValue={patient?.date_naissance ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Âge</Label>
              <Input id="age" name="age" type="number" min={0} max={120} defaultValue={patient?.age ?? ""} />
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
              <Input id="telephone" name="telephone" defaultValue={patient?.telephone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={patient?.email ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input id="profession" name="profession" defaultValue={patient?.profession ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assurance">Assurance / mutuelle</Label>
              <Input id="assurance" name="assurance" defaultValue={patient?.assurance ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_urgence">Contact d'urgence</Label>
              <Input
                id="contact_urgence"
                name="contact_urgence"
                placeholder="Nom et téléphone"
                defaultValue={patient?.contact_urgence ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input id="adresse" name="adresse" defaultValue={patient?.adresse ?? ""} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="antecedents_medicaux">Antécédents médicaux</Label>
              <Textarea
                id="antecedents_medicaux"
                name="antecedents_medicaux"
                placeholder="Chirurgies, radiothérapie cervico-faciale, grossesse…"
                defaultValue={patient?.antecedents_medicaux ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maladies_chroniques">Maladies chroniques</Label>
              <Textarea
                id="maladies_chroniques"
                name="maladies_chroniques"
                placeholder="Diabète, HTA, cardiopathie, asthme…"
                defaultValue={patient?.maladies_chroniques ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicaments">Médicaments</Label>
              <Textarea
                id="medicaments"
                name="medicaments"
                placeholder="Anticoagulants, biphosphonates, corticoïdes…"
                defaultValue={patient?.medicaments ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                name="allergies"
                placeholder="Pénicilline, latex, anesthésiques locaux…"
                defaultValue={patient?.allergies ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="traitements_en_cours">Traitements en cours</Label>
              <Textarea
                id="traitements_en_cours"
                name="traitements_en_cours"
                placeholder="Traitement orthodontique, AVK…"
                defaultValue={patient?.traitements_en_cours ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Hygiène bucco-dentaire, anxiété au fauteuil…"
                defaultValue={patient?.notes ?? ""}
              />
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
              {isEdit ? "Enregistrer les modifications" : "Enregistrer le dossier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
