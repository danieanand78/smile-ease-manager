import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exportBackup,
  getMyRole,
  getSettings,
  listProfiles,
  listRoles,
  setUserRole,
  updateSettings,
  type AppRole,
} from "@/lib/api";

export const Route = createFileRoute("/_authenticated/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres — DentaSuite" },
      {
        name: "description",
        content: "Informations du cabinet, gestion des utilisateurs et sauvegarde des données.",
      },
      { property: "og:title", content: "Paramètres — DentaSuite" },
      { property: "og:description", content: "Configuration du cabinet dentaire et des accès du personnel." },
    ],
  }),
  component: SettingsPage,
});

const ROLES: AppRole[] = ["admin", "dentiste", "assistant"];
const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrateur",
  dentiste: "Dentiste",
  assistant: "Secrétaire / Assistant(e)",
};

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: role } = useQuery({ queryKey: ["my-role"], queryFn: getMyRole });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data: profiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: listRoles });

  const isAdmin = role === "admin";

  const [form, setForm] = useState({
    nom: "",
    adresse: "",
    telephone: "",
    email: "",
    devise: "Ar",
    tva_taux: "0",
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      nom: settings.nom ?? "",
      adresse: settings.adresse ?? "",
      telephone: settings.telephone ?? "",
      email: settings.email ?? "",
      devise: settings.devise ?? "Ar",
      tva_taux: String(settings.tva_taux ?? 0),
    });
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      if (!settings) throw new Error("Paramètres du cabinet introuvables.");
      return updateSettings(settings.id, {
        nom: form.nom,
        adresse: form.adresse,
        telephone: form.telephone,
        email: form.email,
        devise: form.devise,
        tva_taux: Number(form.tva_taux) || 0,
      });
    },
    onSuccess: () => {
      toast.success("Informations du cabinet enregistrées.");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeRole = useMutation({
    mutationFn: ({ userId, next }: { userId: string; next: AppRole }) => setUserRole(userId, next),
    onSuccess: () => {
      toast.success("Rôle mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleBackup() {
    try {
      const data = await exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sauvegarde-cabinet-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Sauvegarde téléchargée.");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informations du cabinet, gestion du personnel et sauvegarde des données.
        </p>
      </div>

      <section className="surface-panel p-6">
        <h2 className="text-lg font-semibold">Informations du cabinet</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du cabinet</Label>
            <Input id="nom" value={form.nom} disabled={!isAdmin} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" value={form.telephone} disabled={!isAdmin} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input id="adresse" value={form.adresse} disabled={!isAdmin} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} disabled={!isAdmin} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="devise">Devise</Label>
            <Input id="devise" value={form.devise} disabled={!isAdmin} onChange={(e) => setForm({ ...form, devise: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tva">Taux de TVA (%)</Label>
            <Input id="tva" type="number" step="0.01" value={form.tva_taux} disabled={!isAdmin} onChange={(e) => setForm({ ...form, tva_taux: e.target.value })} />
          </div>
        </div>
        {isAdmin ? (
          <Button className="mt-5" onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>
            Enregistrer
          </Button>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            Seul un administrateur peut modifier ces informations.
          </p>
        )}
      </section>

      <section className="surface-panel p-6">
        <h2 className="text-lg font-semibold">Utilisateurs et rôles</h2>
        <ul className="mt-4 divide-y divide-border">
          {profiles.map((p) => {
            const current = (roles.find((r) => r.user_id === p.id)?.role ?? "dentiste") as AppRole;
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{p.full_name || p.username || "Utilisateur"}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.username ? `@${p.username} · ` : ""}
                    {p.fonction}
                  </p>
                </div>
                {isAdmin ? (
                  <Select value={current} onValueChange={(next) => changeRole.mutate({ userId: p.id, next: next as AppRole })}>
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm text-muted-foreground">{ROLE_LABEL[current]}</span>
                )}
              </li>
            );
          })}
          {profiles.length === 0 && <p className="py-3 text-sm text-muted-foreground">Aucun utilisateur.</p>}
        </ul>
      </section>

      <section className="surface-panel p-6">
        <h2 className="text-lg font-semibold">Sauvegarde et restauration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Exporte ou restaure les patients, consultations, rendez-vous et factures au format JSON.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handleBackup}>
            Exporter une sauvegarde
          </Button>
          <input
            id="restore-file"
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleRestore}
          />
          <Button variant="outline" disabled={restoring} onClick={() => document.getElementById("restore-file")?.click()}>
            {restoring ? "Restauration…" : "Restaurer une sauvegarde"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          La restauration réinsère les enregistrements du fichier et met à jour ceux déjà présents.
        </p>
      </section>

    </div>
  );
}
