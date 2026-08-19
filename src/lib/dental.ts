// Terminologie dentaire de référence (notation FDI, nomenclature des actes)

export const QUADRANTS = [
  { code: 1, label: "Q1 — Maxillaire droit", teeth: [18, 17, 16, 15, 14, 13, 12, 11] },
  { code: 2, label: "Q2 — Maxillaire gauche", teeth: [21, 22, 23, 24, 25, 26, 27, 28] },
  { code: 4, label: "Q4 — Mandibulaire droit", teeth: [48, 47, 46, 45, 44, 43, 42, 41] },
  { code: 3, label: "Q3 — Mandibulaire gauche", teeth: [31, 32, 33, 34, 35, 36, 37, 38] },
] as const;

export const TOOTH_NAMES: Record<number, string> = {
  1: "Incisive centrale",
  2: "Incisive latérale",
  3: "Canine",
  4: "1ère prémolaire",
  5: "2ème prémolaire",
  6: "1ère molaire",
  7: "2ème molaire",
  8: "3ème molaire (dent de sagesse)",
};

export type ToothType = "Incisive" | "Canine" | "Prémolaire" | "Molaire";

export function toothType(fdi: number | string): ToothType {
  const pos = Number(fdi) % 10;
  if (pos <= 2) return "Incisive";
  if (pos === 3) return "Canine";
  if (pos <= 5) return "Prémolaire";
  return "Molaire";
}

export function toothArcade(fdi: number | string) {
  const q = Math.floor(Number(fdi) / 10);
  return q === 1 || q === 2 ? "Maxillaire" : "Mandibulaire";
}

export function toothSide(fdi: number | string) {
  const q = Math.floor(Number(fdi) / 10);
  return q === 1 || q === 4 ? "Droit" : "Gauche";
}

export function toothLabel(fdi: number | string) {
  const n = Number(fdi);
  const pos = n % 10;
  return `${n} — ${TOOTH_NAMES[pos] ?? "Dent"}`;
}

export function toothSummary(fdi: number | string) {
  return `${toothType(fdi)} · ${toothArcade(fdi)} · ${toothSide(fdi)}`;
}

export const ETATS_DENT = [
  "Saine",
  "Carie",
  "Fracturée",
  "Infection",
  "Abcès",
  "Restaurée",
  "Couronne",
  "Implant",
  "Extraite",
  "Absente",
] as const;

export type ToothDetail = { fdi: number; etat: string };

export const TRAITEMENTS = [
  "Consultation",
  "Détartrage",
  "Obturation",
  "Extraction",
  "Dévitalisation",
  "Traitement endodontique",
  "Implant",
  "Couronne",
  "Bridge",
  "Blanchiment",
  "Orthodontie",
  "Polissage",
  "Nettoyage",
  "Chirurgie",
] as const;

export const MOTIFS = [
  "Douleur dentaire (odontalgie)",
  "Contrôle / bilan bucco-dentaire",
  "Détartrage (prophylaxie)",
  "Urgence — pulpite aiguë",
  "Gonflement / cellulite d'origine dentaire",
  "Saignement gingival",
  "Dent fracturée / traumatisme",
  "Prothèse — descellement",
  "Consultation orthodontique",
  "Blanchiment / esthétique",
];

export const DIAGNOSTICS = [
  "Carie de l'émail (stade initial)",
  "Carie dentinaire",
  "Pulpite réversible",
  "Pulpite irréversible",
  "Nécrose pulpaire",
  "Parodontite apicale aiguë",
  "Granulome / kyste apical",
  "Gingivite",
  "Parodontite chronique",
  "Péricoronarite",
  "Abcès parodontal",
  "Bruxisme / usure occlusale",
  "Édentement partiel",
  "Malocclusion",
  "Hypersensibilité dentinaire",
];

export const ACTES = [...TRAITEMENTS];

export const PRESCRIPTIONS = [
  "Amoxicilline 1 g — 2×/j pendant 7 jours",
  "Amoxicilline + acide clavulanique 1 g — 2×/j pendant 7 jours",
  "Spiramycine + métronidazole — 2×/j pendant 6 jours",
  "Paracétamol 1 g — 3×/j si douleur",
  "Ibuprofène 400 mg — 3×/j pendant 3 jours",
  "Bain de bouche chlorhexidine 0,12 % — 2×/j pendant 7 jours",
];

export const CONSEILS = [
  "Brossage 2×/j pendant 2 minutes, brosse souple",
  "Fil dentaire / brossettes interdentaires quotidiens",
  "Éviter les aliments durs 48 h après l'intervention",
  "Arrêt du tabac pour la cicatrisation gingivale",
  "Contrôle et détartrage tous les 6 mois",
];

export const STATUTS_RDV = ["En attente", "Confirmé", "Reporté", "Terminé", "Annulé"] as const;
export const STATUTS_PAIEMENT = ["Impayé", "Partiel", "Payé", "Prise en charge (assurance)"];
export const MODES_PAIEMENT = ["Espèces", "Carte bancaire", "Mobile Money", "Virement bancaire"] as const;
export const SEXES = ["Non précisé", "Femme", "Homme"];
export const GROUPES_SANGUINS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  dentiste: "Dentiste",
  assistant: "Secrétaire",
};

export function formatAriary(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} Ar`;
}

export function ageFromDate(date: string | null | undefined) {
  if (!date) return null;
  const birth = new Date(date);
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function monthKey(value: string) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function sameDay(a: Date | string, b: Date | string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}
