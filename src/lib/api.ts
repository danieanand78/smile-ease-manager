import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Visit = Database["public"]["Tables"]["visits"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type ClinicSettings = Database["public"]["Tables"]["clinic_settings"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
export type AppRole = Database["public"]["Enums"]["app_role"];

type PatientRef = Pick<Patient, "nom" | "prenom" | "dossier_no">;
export type AppointmentWithPatient = Appointment & { patients: PatientRef | null };
export type VisitWithPatient = Visit & { patients: PatientRef | null };
export type InvoiceWithPatient = Invoice & { patients: PatientRef | null };

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

/* ------------------------------ Patients ------------------------------ */

export async function listPatients(search = ""): Promise<Patient[]> {
  let query = supabase.from("patients").select("*").order("created_at", { ascending: false });
  const term = search.trim();
  if (term) {
    query = query.or(
      `nom.ilike.%${term}%,prenom.ilike.%${term}%,telephone.ilike.%${term}%,dossier_no.ilike.%${term}%,email.ilike.%${term}%`,
    );
  }
  return unwrap(await query) as Patient[];
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase.from("patients").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createPatient(
  values: Database["public"]["Tables"]["patients"]["Insert"],
): Promise<Patient> {
  const { data: auth } = await supabase.auth.getUser();
  return unwrap(
    await supabase
      .from("patients")
      .insert({ ...values, created_by: auth.user?.id ?? null })
      .select()
      .single(),
  ) as Patient;
}

export async function updatePatient(
  id: string,
  values: Database["public"]["Tables"]["patients"]["Update"],
): Promise<Patient> {
  return unwrap(await supabase.from("patients").update(values).eq("id", id).select().single()) as Patient;
}

/* --------------------------- Consultations ---------------------------- */

export async function listVisits(patientId?: string): Promise<VisitWithPatient[]> {
  let query = supabase
    .from("visits")
    .select("*, patients(nom, prenom, dossier_no)")
    .order("date_visite", { ascending: false });
  if (patientId) query = query.eq("patient_id", patientId);
  return unwrap(await query) as unknown as VisitWithPatient[];
}

export async function createVisit(
  values: Database["public"]["Tables"]["visits"]["Insert"],
): Promise<Visit> {
  const { data: auth } = await supabase.auth.getUser();
  return unwrap(
    await supabase
      .from("visits")
      .insert({ ...values, created_by: auth.user?.id ?? null, dentiste_id: values.dentiste_id ?? auth.user?.id ?? null })
      .select()
      .single(),
  ) as Visit;
}

export async function updateVisit(
  id: string,
  values: Database["public"]["Tables"]["visits"]["Update"],
): Promise<Visit> {
  return unwrap(await supabase.from("visits").update(values).eq("id", id).select().single()) as Visit;
}

/* ---------------------------- Rendez-vous ----------------------------- */

export async function listAppointments(patientId?: string): Promise<AppointmentWithPatient[]> {
  let query = supabase
    .from("appointments")
    .select("*, patients(nom, prenom, dossier_no)")
    .order("date_rdv", { ascending: true });
  if (patientId) query = query.eq("patient_id", patientId);
  return unwrap(await query) as unknown as AppointmentWithPatient[];
}

export async function createAppointment(values: Database["public"]["Tables"]["appointments"]["Insert"]) {
  const { data: auth } = await supabase.auth.getUser();
  return unwrap(
    await supabase
      .from("appointments")
      .insert({ ...values, created_by: auth.user?.id ?? null })
      .select()
      .single(),
  );
}

export async function updateAppointmentStatus(id: string, statut: string) {
  return unwrap(await supabase.from("appointments").update({ statut }).eq("id", id).select().single());
}

/* ------------------------ Paiement / facturation ---------------------- */

export async function listInvoices(patientId?: string): Promise<InvoiceWithPatient[]> {
  let query = supabase
    .from("invoices")
    .select("*, patients(nom, prenom, dossier_no)")
    .order("date_facture", { ascending: false });
  if (patientId) query = query.eq("patient_id", patientId);
  return unwrap(await query) as unknown as InvoiceWithPatient[];
}

export async function createInvoice(
  values: Database["public"]["Tables"]["invoices"]["Insert"],
): Promise<Invoice> {
  const { data: auth } = await supabase.auth.getUser();
  return unwrap(
    await supabase
      .from("invoices")
      .insert({ ...values, created_by: auth.user?.id ?? null })
      .select()
      .single(),
  ) as Invoice;
}

export async function updateInvoice(
  id: string,
  values: Database["public"]["Tables"]["invoices"]["Update"],
): Promise<Invoice> {
  return unwrap(await supabase.from("invoices").update(values).eq("id", id).select().single()) as Invoice;
}

/* ------------------------------ Paramètres ---------------------------- */

export async function getSettings(): Promise<ClinicSettings | null> {
  const { data, error } = await supabase.from("clinic_settings").select("*").limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateSettings(
  id: string,
  values: Database["public"]["Tables"]["clinic_settings"]["Update"],
): Promise<ClinicSettings> {
  return unwrap(
    await supabase.from("clinic_settings").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id).select().single(),
  ) as ClinicSettings;
}

/* ------------------------ Utilisateurs et rôles ----------------------- */

export async function listProfiles(): Promise<Profile[]> {
  return unwrap(await supabase.from("profiles").select("*").order("created_at")) as Profile[];
}

export async function listRoles(): Promise<UserRole[]> {
  return unwrap(await supabase.from("user_roles").select("*")) as UserRole[];
}

export async function getMyRole(): Promise<AppRole | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.role as AppRole) ?? null;
}

export async function setUserRole(userId: string, role: AppRole) {
  const { data: existing } = await supabase.from("user_roles").select("id").eq("user_id", userId).maybeSingle();
  if (existing) {
    return unwrap(await supabase.from("user_roles").update({ role }).eq("id", existing.id).select().single());
  }
  return unwrap(await supabase.from("user_roles").insert({ user_id: userId, role }).select().single());
}

/* -------------------------- Sauvegarde locale ------------------------- */

export async function exportBackup() {
  const [patients, visits, appointments, invoices] = await Promise.all([
    listPatients(),
    listVisits(),
    listAppointments(),
    listInvoices(),
  ]);
  return { exported_at: new Date().toISOString(), patients, visits, appointments, invoices };
}
