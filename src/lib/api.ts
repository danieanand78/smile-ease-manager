import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Visit = Database["public"]["Tables"]["visits"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentWithPatient = Appointment & { patients: Pick<Patient, "nom" | "prenom" | "dossier_no"> | null };

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export async function listPatients(search = "") {
  let query = supabase.from("patients").select("*").order("created_at", { ascending: false });
  const term = search.trim();
  if (term) {
    query = query.or(
      `nom.ilike.%${term}%,prenom.ilike.%${term}%,telephone.ilike.%${term}%,dossier_no.ilike.%${term}%,email.ilike.%${term}%`,
    );
  }
  return unwrap(await query);
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase.from("patients").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}


export async function createPatient(values: Database["public"]["Tables"]["patients"]["Insert"]) {
  const { data: auth } = await supabase.auth.getUser();
  return unwrap(
    await supabase
      .from("patients")
      .insert({ ...values, created_by: auth.user?.id ?? null })
      .select()
      .single(),
  );
}

export async function listVisits(patientId?: string) {
  let query = supabase.from("visits").select("*").order("date_visite", { ascending: false });
  if (patientId) query = query.eq("patient_id", patientId);
  return unwrap(await query);
}

export async function createVisit(values: Database["public"]["Tables"]["visits"]["Insert"]) {
  const { data: auth } = await supabase.auth.getUser();
  return unwrap(
    await supabase
      .from("visits")
      .insert({ ...values, created_by: auth.user?.id ?? null })
      .select()
      .single(),
  );
}

export async function listAppointments(patientId?: string) {
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
