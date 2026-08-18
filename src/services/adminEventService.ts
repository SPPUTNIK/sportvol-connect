import { supabase } from "@/integrations/supabase/client";

export type EventInsert = {
  title: string;
  slug: string;
  sport: string;
  city: string;
  country: string;
  venue: string;
  cover_url: string | null;
  description: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  application_deadline: string | null;
  total_volunteers_needed: number;
  status: "draft" | "published" | "closed" | "completed" | "cancelled";
};

export type EventUpdate = Partial<EventInsert> & { id: string };

export type RoleInsert = {
  event_id: string;
  name: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  positions: number;
  min_age: number | null;
  mandatory_training: boolean;
};

export type RoleUpdate = Partial<RoleInsert> & { id: string };

export type ShiftInsert = {
  event_id: string;
  role_id: string;
  title: string;
  location: string | null;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  instructions: string | null;
};

export type ShiftUpdate = Partial<ShiftInsert> & { id: string };

async function ensureSport(name: string): Promise<string> {
  const { data: existing } = await supabase
    .from("sports")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("sports")
    .insert({ name })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

export const adminEventService = {
  async createEvent(input: EventInsert): Promise<{ id: string; error: string | null }> {
    try {
      const sportId = await ensureSport(input.sport);

      const { data, error } = await supabase
        .from("events")
        .insert({
          title: input.title,
          slug: input.slug,
          sport_id: sportId,
          sport: input.sport,
          city: input.city,
          country: input.country,
          venue: input.venue,
          cover_url: input.cover_url,
          description: input.description,
          start_date: input.start_date,
          end_date: input.end_date,
          start_time: input.start_time || null,
          end_time: input.end_time || null,
          application_deadline: input.application_deadline || null,
          total_volunteers_needed: input.total_volunteers_needed,
          status: input.status,
        })
        .select("id")
        .single();

      if (error) return { id: "", error: error.message };
      return { id: data.id, error: null };
    } catch (err) {
      return { id: "", error: err instanceof Error ? err.message : "Failed to create event" };
    }
  },

  async updateEvent(input: EventUpdate): Promise<{ error: string | null }> {
    try {
      const { id, ...fields } = input;
      const update: Record<string, unknown> = { ...fields };
      if (fields.sport) {
        update.sport_id = await ensureSport(fields.sport);
      }

      const { error } = await supabase.from("events").update(update).eq("id", id);
      return { error: error?.message ?? null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to update event" };
    }
  },

  async getEventById(id: string) {
    const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async getRolesForEvent(eventId: string) {
    const { data, error } = await supabase
      .from("event_roles")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async createRole(input: RoleInsert): Promise<{ id: string; error: string | null }> {
    const { data, error } = await supabase
      .from("event_roles")
      .insert({
        event_id: input.event_id,
        name: input.name,
        description: input.description,
        responsibilities: input.responsibilities,
        requirements: input.requirements,
        positions: input.positions,
        min_age: input.min_age,
        mandatory_training: input.mandatory_training,
      })
      .select("id")
      .single();

    if (error) return { id: "", error: error.message };
    return { id: data.id, error: null };
  },

  async updateRole(input: RoleUpdate): Promise<{ error: string | null }> {
    const { id, ...fields } = input;
    const { error } = await supabase.from("event_roles").update(fields).eq("id", id);
    return { error: error?.message ?? null };
  },

  async deleteRole(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("event_roles").delete().eq("id", id);
    return { error: error?.message ?? null };
  },

  async getShiftsForEvent(eventId: string) {
    const { data, error } = await supabase
      .from("event_shifts")
      .select("*, event_roles(name)")
      .eq("event_id", eventId)
      .order("date", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async createShift(input: ShiftInsert): Promise<{ id: string; error: string | null }> {
    const { data, error } = await supabase
      .from("event_shifts")
      .insert({
        event_id: input.event_id,
        role_id: input.role_id,
        title: input.title,
        location: input.location,
        date: input.date,
        start_time: input.start_time,
        end_time: input.end_time,
        capacity: input.capacity,
        instructions: input.instructions,
      })
      .select("id")
      .single();

    if (error) return { id: "", error: error.message };
    return { id: data.id, error: null };
  },

  async updateShift(input: ShiftUpdate): Promise<{ error: string | null }> {
    const { id, ...fields } = input;
    const { error } = await supabase.from("event_shifts").update(fields).eq("id", id);
    return { error: error?.message ?? null };
  },

  async deleteShift(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("event_shifts").delete().eq("id", id);
    return { error: error?.message ?? null };
  },
};
