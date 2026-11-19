import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Lock, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getGateStatus, unlockSite } from "@/lib/gate.functions";

export const Route = createFileRoute("/acces")({
  beforeLoad: async () => {
    const { unlocked } = await getGateStatus();
    if (unlocked) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Accès protégé — DentaSuite" },
      { name: "description", content: "Saisissez le mot de passe du cabinet pour accéder à l'application." },
      { property: "og:title", content: "Accès protégé — DentaSuite" },
      { property: "og:description", content: "Application réservée aux membres du cabinet dentaire." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const { ok } = await unlock({ data: { password } });
      if (ok) {
        await router.invalidate();
        await router.navigate({ to: "/", replace: true });
      } else setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="gradient-clinic flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground">
            <Stethoscope className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Accès au cabinet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saisissez le mot de passe communiqué aux membres du cabinet.
          </p>
        </div>
        <form onSubmit={onSubmit} className="surface-panel space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="gate-password">Mot de passe</Label>
            <Input
              id="gate-password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">Mot de passe incorrect.</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <Lock className="h-4 w-4" aria-hidden />
            Entrer
          </Button>
        </form>
      </div>
    </main>
  );
}
