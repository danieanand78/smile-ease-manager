import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — DentaSuite" },
      { name: "description", content: "Connectez-vous à l'espace de gestion de votre cabinet dentaire." },
      { property: "og:title", content: "Connexion — DentaSuite" },
      { property: "og:description", content: "Espace réservé à l'équipe du cabinet dentaire." },
    ],
  }),
  component: AuthPage,
});

const ROLES = [
  { value: "admin", label: "Administrateur", fonction: "Administrateur" },
  { value: "dentiste", label: "Dentiste", fonction: "Dentiste" },
  { value: "assistant", label: "Secrétaire", fonction: "Secrétaire" },
] as const;

/** Identifiant local converti en adresse technique interne (aucun email réel requis). */
const LOCAL_DOMAIN = "cabinet.local";

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]/g, "");
}

function toLocalEmail(username: string) {
  return `${normalizeUsername(username)}@${LOCAL_DOMAIN}`;
}

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string>("dentiste");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/tableau-de-bord", replace: true });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const login = normalizeUsername(username);
    if (!login) {
      toast.error("Identifiant invalide", { description: "Utilisez des lettres, chiffres, point, tiret ou underscore." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: toLocalEmail(login), password });
    setLoading(false);
    if (error) {
      toast.error("Connexion impossible", { description: "Identifiant ou mot de passe incorrect." });
      return;
    }
    toast.success("Bienvenue au cabinet");
    navigate({ to: "/tableau-de-bord", replace: true });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const login = normalizeUsername(username);
    if (login.length < 3) {
      toast.error("Identifiant invalide", { description: "3 caractères minimum (lettres, chiffres, . _ -)." });
      return;
    }
    const selected = ROLES.find((r) => r.value === role) ?? ROLES[1];
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: toLocalEmail(login),
      password,
      options: {
        data: { full_name: fullName, username: login, role: selected.value, fonction: selected.fonction },
      },
    });
    setLoading(false);
    if (error) {
      const taken = /already|exist/i.test(error.message);
      toast.error("Inscription impossible", {
        description: taken ? "Cet identifiant est déjà utilisé." : error.message,
      });
      return;
    }
    if (!data.session) {
      toast.success("Compte créé", { description: "Vous pouvez maintenant vous connecter." });
      return;
    }
    toast.success("Compte créé");
    navigate({ to: "/tableau-de-bord", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="gradient-clinic flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground">
            <Stethoscope className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Espace cabinet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connexion locale réservée au personnel : administrateur, dentiste, secrétaire.
          </p>
        </div>

        <div className="surface-panel p-6">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    required
                    autoComplete="username"
                    placeholder="dr.haddad"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Se connecter
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Dr Amina Haddad"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username2">Nom d'utilisateur</Label>
                  <Input
                    id="username2"
                    required
                    autoComplete="username"
                    placeholder="dr.haddad"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Fonction au cabinet</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Choisir une fonction" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Mot de passe</Label>
                  <Input
                    id="password2"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-5 text-xs text-muted-foreground">
            Authentification locale uniquement : aucun compte externe, aucune réinitialisation par email.
          </p>
        </div>
      </div>
    </main>
  );
}
