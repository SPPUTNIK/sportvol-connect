import { supabase } from "@/lib/supabase";
import type { Database } from "@/integrations/supabase/types.generated";
import type {
  Committee as DomainCommittee,
  CommitteeMember as DomainCommitteeMember,
  CommitteeFeedback as DomainCommitteeFeedback,
} from "@/types/domain";

type CommitteesRow = Database["public"]["Tables"]["committees"]["Row"];
type CommitteesInsert = Database["public"]["Tables"]["committees"]["Insert"];
type CommitteesUpdate = Database["public"]["Tables"]["committees"]["Update"];

type CommitteeMembersInsert = Database["public"]["Tables"]["committee_members"]["Insert"];
type CommitteeMembersRow = Database["public"]["Tables"]["committee_members"]["Row"];
type CommitteeMembersUpdate = Database["public"]["Tables"]["committee_members"]["Update"];

type CommitteeMemberWithCommittee = Partial<CommitteeMembersRow> & { committees?: CommitteesRow | CommitteesRow[] | null };

type CommitteeFeedbackInsert = Database["public"]["Tables"]["committee_feedback"]["Insert"];
type CommitteeFeedbackRow = Database["public"]["Tables"]["committee_feedback"]["Row"];

export const committeeService = {
  // Map DB row -> domain Committee
  mapCommittee(row: CommitteesRow): DomainCommittee {
    return {
      id: row.id,
      eventId: row.event_id,
      name: row.name,
      description: row.description,
      leaderProfileId: row.leader_profile_id,
      status: row.status as DomainCommittee["status"],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  mapMember(row: CommitteeMembersRow): DomainCommitteeMember {
    return {
      id: row.id,
      committeeId: row.committee_id,
      profileId: row.profile_id,
      eventRoleId: row.event_role_id ?? null,
      status: row.status as DomainCommitteeMember["status"],
      joinedAt: row.joined_at,
    };
  },

  mapFeedback(row: CommitteeFeedbackRow): DomainCommitteeFeedback {
    return {
      id: row.id,
      committeeId: row.committee_id,
      eventId: row.event_id,
      memberProfileId: row.member_profile_id,
      leaderProfileId: row.leader_profile_id,
      punctuality: row.punctuality,
      teamwork: row.teamwork,
      communication: row.communication,
      responsibility: row.responsibility,
      overallRating: row.overall_rating,
      comment: row.comment,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async listAvailableEvents() {
    const { data, error } = await supabase
        .from("events")
        .select("id, title, start_date, end_date, status")
        .order("start_date", {
        ascending: true,
        });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
    },

  async listCommittees(): Promise<DomainCommittee[]> {
    const { data, error } = await supabase
      .from("committees")
      .select(`*, leader:profiles(id, first_name, last_name, avatar_url)`)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((r: CommitteesRow) => this.mapCommittee(r));
  },

  async getCommitteeById(id: string): Promise<DomainCommittee | null> {
    const { data, error } = await supabase
      .from("committees")
      .select(`*, leader:profiles(id, first_name, last_name, avatar_url)`)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return data ? this.mapCommittee(data as CommitteesRow) : null;
  },

  async listCommitteesByEvent(eventId: string): Promise<DomainCommittee[]> {
    const { data, error } = await supabase
      .from("committees")
      .select(`*, leader:profiles(id, first_name, last_name, avatar_url)`)
      .eq("event_id", eventId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((r: CommitteesRow) => this.mapCommittee(r));
  },

  async listMyCommittees(): Promise<DomainCommittee[]> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw new Error(authError.message);
    if (!user) throw new Error("You must be signed in.");

    const { data, error } = await supabase
      .from("committee_members")
      .select(`committee_id, committees (*, leader:profiles(id, first_name, last_name, avatar_url))`)
      .eq("profile_id", user.id)
      .eq("status", 'assigned');

    if (error) throw new Error(error.message);

    const result: DomainCommittee[] = [];
    for (const raw of data ?? []) {
      const row = raw as CommitteeMemberWithCommittee;
      const committee = Array.isArray(row.committees) ? row.committees[0] : row.committees;
      if (committee) result.push(this.mapCommittee(committee));
    }

    return result;
  },

  async listLedCommittees(): Promise<DomainCommittee[]> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw new Error(authError.message);
    if (!user) throw new Error("You must be signed in.");

    const { data, error } = await supabase
      .from("committees")
      .select(`*, leader:profiles(id, first_name, last_name, avatar_url)`)
      .eq("leader_profile_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((r: CommitteesRow) => this.mapCommittee(r));
  },

  async createCommittee(payload: Partial<DomainCommittee>): Promise<DomainCommittee> {
    const insert: CommitteesInsert = {
      event_id: payload.eventId as string,
      name: payload.name as string,
      description: payload.description ?? null,
      leader_profile_id: payload.leaderProfileId ?? null,
      status: payload.status ?? "active",
    } as CommitteesInsert;

    const { data, error } = await supabase
      .from("committees")
      .insert([insert])
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return this.mapCommittee(data as CommitteesRow);
  },

  async updateCommittee(id: string, changes: Partial<DomainCommittee>): Promise<DomainCommittee | null> {
    const update: Partial<CommitteesUpdate> = {
      name: changes.name,
      description: changes.description ?? undefined,
      leader_profile_id: changes.leaderProfileId ?? undefined,
      status: changes.status as CommitteesUpdate["status"] | undefined,
    };

    const { data, error } = await supabase
      .from("committees")
      .update(update)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);

    return data ? this.mapCommittee(data as CommitteesRow) : null;
  },

  async deleteCommittee(id: string): Promise<void> {
    const { error } = await supabase.from("committees").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // Members
  async listMembers(committeeId: string): Promise<DomainCommitteeMember[]> {
    const { data, error } = await supabase
      .from("committee_members")
      .select(`*, profile:profiles(id, first_name, last_name, avatar_url)`)
      .eq("committee_id", committeeId)
      .order("joined_at", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((r: CommitteeMembersRow) => this.mapMember(r));
  },

  /**
   * Return members with joined profile information and event role id/name when available.
   */
  async listMembersDetailed(committeeId: string): Promise<Array<{ member: DomainCommitteeMember; profile: { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null }; eventRoleId: string | null }>> {
    const { data, error } = await supabase
      .from("committee_members")
      .select(`*, profile:profiles(id, first_name, last_name, avatar_url)`)
      .eq("committee_id", committeeId)
      .order("joined_at", { ascending: true });

    if (error) throw new Error(error.message);
    type CommitteeMemberWithProfile = CommitteeMembersRow & { profile?: { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null }; event_role_id?: string | null };

    const out = (data ?? []).map((row) => {
      const r = row as CommitteeMemberWithProfile;
      const member = this.mapMember(r as CommitteeMembersRow);
      const profile = r.profile ? { id: r.profile.id, first_name: r.profile.first_name ?? null, last_name: r.profile.last_name ?? null, avatar_url: r.profile.avatar_url ?? null } : { id: member.profileId, first_name: null, last_name: null, avatar_url: null };
      return { member, profile, eventRoleId: (r.event_role_id ?? null) };
    });

    return out;
  },

  async updateMember(memberId: string, updates: Partial<{ eventRoleId: string | null; status: DomainCommitteeMember["status"] }>): Promise<DomainCommitteeMember | null> {
    const payload: Partial<CommitteeMembersUpdate> = {};
    if (updates.eventRoleId !== undefined) payload.event_role_id = updates.eventRoleId ?? null;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from("committee_members")
      .update(payload)
      .eq("id", memberId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.mapMember(data as CommitteeMembersRow) : null;
  },

  async addMember(committeeId: string, profileId: string, eventRoleId?: string): Promise<DomainCommitteeMember> {
    const payload: CommitteeMembersInsert = {
      committee_id: committeeId,
      profile_id: profileId,
      event_role_id: eventRoleId ?? null,
    };

    const { data, error } = await supabase
      .from("committee_members")
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);

    return this.mapMember(data as CommitteeMembersRow);
  },

  async removeMember(committeeId: string, profileId: string): Promise<DomainCommitteeMember | null> {
    const { data, error } = await supabase
      .from("committee_members")
      .update({ status: "removed" })
      .eq("committee_id", committeeId)
      .eq("profile_id", profileId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);

    return data ? this.mapMember(data as CommitteeMembersRow) : null;
  },

  async removeMemberById(memberId: string): Promise<DomainCommitteeMember | null> {
    const { data, error } = await supabase
      .from("committee_members")
      .update({ status: "removed" })
      .eq("id", memberId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.mapMember(data as CommitteeMembersRow) : null;
  },

  // Feedback
  async addFeedback(
    committeeId: string,
    eventId: string,
    memberProfileId: string,
    leaderProfileId: string,
    ratings: { punctuality: number; teamwork: number; communication: number; responsibility: number; overall_rating: number },
    comment?: string,
  ): Promise<DomainCommitteeFeedback> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw new Error(authError.message);
    if (!user) throw new Error("You must be signed in.");

    // Ensure the acting user is the leaderProfileId when not admin
    if (user.id !== leaderProfileId) {
      throw new Error("Authenticated user must match leaderProfileId to submit feedback");
    }

    const payload: CommitteeFeedbackInsert = {
      committee_id: committeeId,
      event_id: eventId,
      member_profile_id: memberProfileId,
      leader_profile_id: leaderProfileId,
      punctuality: ratings.punctuality,
      teamwork: ratings.teamwork,
      communication: ratings.communication,
      responsibility: ratings.responsibility,
      overall_rating: ratings.overall_rating,
      comment: comment ?? null,
    };

    const { data, error } = await supabase
      .from("committee_feedback")
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);

    return this.mapFeedback(data as CommitteeFeedbackRow);
  },

  async listFeedback(committeeId: string): Promise<DomainCommitteeFeedback[]> {
    const { data, error } = await supabase
      .from("committee_feedback")
      .select(`*, leader:profiles(id, first_name, last_name, avatar_url)`)
      .eq("committee_id", committeeId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((r: CommitteeFeedbackRow) => this.mapFeedback(r));
  },
};

export default committeeService;
