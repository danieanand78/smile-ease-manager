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

export function toothLabel(fdi: number | string) {
  const n = Number(fdi);
  const pos = n % 10;
  return `${n} — ${TOOTH_NAMES[pos] ?? "Dent"}`;
}

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

export const ACTES = [
  "Détartrage / surfaçage radiculaire",
  "Obturation composite (restauration)",
  "Obturation amalgame",
  "Coiffage pulpaire",
  "Pulpotomie",
  "Traitement endodontique (dévitalisation)",
  "Reprise de traitement endodontique",
  "Extraction simple",
  "Extraction chirurgicale (avulsion)",
  "Germectomie / dent de sagesse incluse",
  "Inlay-onlay",
  "Couronne céramo-métallique",
  "Couronne céramo-céramique (zircone)",
  "Bridge",
  "Prothèse amovible partielle",
  "Prothèse amovible complète",
  "Implant dentaire",
  "Scellement de sillons",
  "Radiographie rétro-alvéolaire",
  "Radiographie panoramique (OPT)",
  "Anesthésie locale / loco-régionale",
  "Blanchiment (éclaircissement)",
  "Gouttière occlusale",
];

export const PRESCRIPTIONS = [
  "Amoxicilline 1 g — 2×/j pendant 7 jours",
  "Amoxicilline + acide clavulanique 1 g — 2×/j pendant 7 jours",
  "Spiramycine + métronidazole — 2×/j pendant 6 jours",
  "Paracétamol 1 g — 3×/j si douleur",
  "Ibuprofène 400 mg — 3×/j pendant 3 jours",
  "Bain de bouche chlorhexidine 0,12 % — 2×/j pendant 7 jours",
];

export const STATUTS_RDV = ["Planifié", "Confirmé", "En salle", "Terminé", "Annulé", "Absent (no-show)"];
export const STATUTS_PAIEMENT = ["Impayé", "Partiel", "Payé", "Prise en charge (mutuelle)"];
export const SEXES = ["Non précisé", "Femme", "Homme"];
export const GROUPES_SANGUINS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
