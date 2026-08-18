import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, CalendarClock, ClipboardList, LineChart, Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DentaSuite — Logiciel de gestion pour cabinet dentaire" },
      {
        name: "description",
        content:
          "Gérez votre cabinet dentaire : dossiers patients, consultations, actes, agenda des rendez-vous et statistiques d'activité.",
      },
      { property: "og:title", content: "DentaSuite — Logiciel de gestion pour cabinet dentaire" },
      {
        property: "og:description",
        content: "Dossiers patients, consultations, actes, agenda et statistiques du cabinet.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: ClipboardList, title: "Dossier patient", text: "Anamnèse, antécédents médicaux, allergies et notation FDI." },
  { icon: Activity, title: "Consultations", text: "Motif, examen clinique, diagnostic, actes réalisés et prescription." },
  { icon: CalendarClock, title: "Agenda", text: "Rendez-vous, durée, statut (confirmé, terminé, no-show)." },
  { icon: Search, title: "Recherche rapide", text: "Par nom, prénom, téléphone ou numéro de dossier." },
  { icon: LineChart, title: "Statistiques", text: "File active, actes les plus fréquents, honoraires, taux d'absence." },
  { icon: ShieldCheck, title: "Données protégées", text: "Accès réservé à l'équipe du cabinet, authentification requise." },
];

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/tableau-de-bord", replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  if (checking) return <div className="min-h-screen bg-background" />;

  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-semibold text-foreground">
          Denta<span className="text-primary">Suite</span>
        </span>
        <Button asChild size="sm">
          <Link to="/auth">Connexion</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <div className="gradient-clinic rounded-4xl px-8 py-16 text-primary-foreground shadow-soft md:px-16">
          <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">Cabinet dentaire</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
            Toute la gestion de votre cabinet, du dossier patient à la statistique d'activité.
          </h1>
          <p className="mt-5 max-w-xl text-base opacity-90">
            Créez vos fiches patients, enregistrez chaque consultation avec son diagnostic et ses actes, planifiez les
            rendez-vous et suivez l'activité du cabinet.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Accéder au cabinet</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="surface-panel p-6">
              <f.icon className="h-6 w-6 text-primary" aria-hidden />
              <h2 className="mt-4 text-base font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
