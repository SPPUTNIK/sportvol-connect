export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accreditations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          profile_id: string
          qr_code_data: string | null
          role_id: string
          status: string
          updated_at: string
          volunteer_identifier: string
          zone: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          profile_id: string
          qr_code_data?: string | null
          role_id: string
          status?: string
          updated_at?: string
          volunteer_identifier: string
          zone?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          profile_id?: string
          qr_code_data?: string | null
          role_id?: string
          status?: string
          updated_at?: string
          volunteer_identifier?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accreditations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accreditations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accreditations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "accreditations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "event_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      achievement_definitions: {
        Row: {
          active: boolean
          category: string
          code: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          points: number
          requirement_type: string
          requirement_value: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          code: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          points?: number
          requirement_type: string
          requirement_value?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          points?: number
          requirement_type?: string
          requirement_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          admin_notes: string | null
          applied_at: string
          availability: string | null
          event_id: string
          experience: string | null
          id: string
          motivation: string | null
          profile_id: string
          role_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          applied_at?: string
          availability?: string | null
          event_id: string
          experience?: string | null
          id?: string
          motivation?: string | null
          profile_id: string
          role_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          applied_at?: string
          availability?: string | null
          event_id?: string
          experience?: string | null
          id?: string
          motivation?: string | null
          profile_id?: string
          role_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "applications_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "event_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          event_id: string
          id: string
          notes: string | null
          profile_id: string
          role_id: string
          shift_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date: string
          event_id: string
          id?: string
          notes?: string | null
          profile_id: string
          role_id: string
          shift_id: string
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          event_id?: string
          id?: string
          notes?: string | null
          profile_id?: string
          role_id?: string
          shift_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "attendance_records_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "event_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "event_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_id: string
          created_at: string
          date: string
          event_id: string
          file_path: string | null
          hours: number
          id: string
          issued_at: string
          profile_id: string
          role_id: string
          updated_at: string
        }
        Insert: {
          certificate_id: string
          created_at?: string
          date: string
          event_id: string
          file_path?: string | null
          hours?: number
          id?: string
          issued_at?: string
          profile_id: string
          role_id: string
          updated_at?: string
        }
        Update: {
          certificate_id?: string
          created_at?: string
          date?: string
          event_id?: string
          file_path?: string | null
          hours?: number
          id?: string
          issued_at?: string
          profile_id?: string
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "certificates_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "event_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_feedback: {
        Row: {
          comment: string | null
          committee_id: string
          communication: number
          created_at: string
          event_id: string
          id: string
          leader_profile_id: string
          member_profile_id: string
          overall_rating: number
          punctuality: number
          responsibility: number
          teamwork: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          committee_id: string
          communication?: number
          created_at?: string
          event_id: string
          id?: string
          leader_profile_id: string
          member_profile_id: string
          overall_rating?: number
          punctuality?: number
          responsibility?: number
          teamwork?: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          committee_id?: string
          communication?: number
          created_at?: string
          event_id?: string
          id?: string
          leader_profile_id?: string
          member_profile_id?: string
          overall_rating?: number
          punctuality?: number
          responsibility?: number
          teamwork?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "committee_feedback_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_feedback_leader_profile_id_fkey"
            columns: ["leader_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_feedback_leader_profile_id_fkey"
            columns: ["leader_profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "committee_feedback_member_profile_id_fkey"
            columns: ["member_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_feedback_member_profile_id_fkey"
            columns: ["member_profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      committee_members: {
        Row: {
          committee_id: string
          created_at: string
          event_role_id: string | null
          id: string
          joined_at: string
          profile_id: string
          status: Database["public"]["Enums"]["committee_member_status"]
          updated_at: string
        }
        Insert: {
          committee_id: string
          created_at?: string
          event_role_id?: string | null
          id?: string
          joined_at?: string
          profile_id: string
          status?: Database["public"]["Enums"]["committee_member_status"]
          updated_at?: string
        }
        Update: {
          committee_id?: string
          created_at?: string
          event_role_id?: string | null
          id?: string
          joined_at?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["committee_member_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_members_event_role_id_fkey"
            columns: ["event_role_id"]
            isOneToOne: false
            referencedRelation: "event_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      committees: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          leader_profile_id: string | null
          name: string
          status: Database["public"]["Enums"]["committee_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          leader_profile_id?: string | null
          name: string
          status?: Database["public"]["Enums"]["committee_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          leader_profile_id?: string | null
          name?: string
          status?: Database["public"]["Enums"]["committee_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "committees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committees_leader_profile_id_fkey"
            columns: ["leader_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committees_leader_profile_id_fkey"
            columns: ["leader_profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      event_roles: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          filled_positions: number
          id: string
          mandatory_training: boolean
          min_age: number | null
          name: string
          positions: number
          requirements: string | null
          responsibilities: string | null
          skills: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          filled_positions?: number
          id?: string
          mandatory_training?: boolean
          min_age?: number | null
          name: string
          positions?: number
          requirements?: string | null
          responsibilities?: string | null
          skills?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          filled_positions?: number
          id?: string
          mandatory_training?: boolean
          min_age?: number | null
          name?: string
          positions?: number
          requirements?: string | null
          responsibilities?: string | null
          skills?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_roles_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_shifts: {
        Row: {
          capacity: number
          created_at: string
          date: string
          end_time: string
          event_id: string
          id: string
          instructions: string | null
          location: string | null
          role_id: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          date: string
          end_time: string
          event_id: string
          id?: string
          instructions?: string | null
          location?: string | null
          role_id: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          date?: string
          end_time?: string
          event_id?: string
          id?: string
          instructions?: string | null
          location?: string | null
          role_id?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_shifts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_shifts_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "event_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          application_deadline: string | null
          city: string
          country: string
          cover_url: string | null
          created_at: string
          description: string | null
          end_date: string
          end_time: string | null
          event_type: string | null
          featured: boolean
          id: string
          required_languages: string[]
          requirements: string | null
          slug: string
          sport: string
          sport_id: string
          start_date: string
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          total_volunteers_needed: number
          updated_at: string
          venue: string
        }
        Insert: {
          application_deadline?: string | null
          city: string
          country: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          end_time?: string | null
          event_type?: string | null
          featured?: boolean
          id?: string
          required_languages?: string[]
          requirements?: string | null
          slug: string
          sport: string
          sport_id: string
          start_date: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          total_volunteers_needed?: number
          updated_at?: string
          venue: string
        }
        Update: {
          application_deadline?: string | null
          city?: string
          country?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          end_time?: string | null
          event_type?: string | null
          featured?: boolean
          id?: string
          required_languages?: string[]
          requirements?: string | null
          slug?: string
          sport?: string
          sport_id?: string
          start_date?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          total_volunteers_needed?: number
          updated_at?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          application_id: string | null
          body: string
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          event_id: string | null
          id: string
          profile_id: string
          read: boolean
          read_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          body: string
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          event_id?: string | null
          id?: string
          profile_id: string
          read?: boolean
          read_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          body?: string
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          event_id?: string | null
          id?: string
          profile_id?: string
          read?: boolean
          read_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profile_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          profile_id: string
          progress: number
          unlocked: boolean
          unlocked_at: string | null
          updated_at: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          profile_id: string
          progress?: number
          unlocked?: boolean
          unlocked_at?: string | null
          updated_at?: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          progress?: number
          unlocked?: boolean
          unlocked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profile_languages: {
        Row: {
          language_id: string
          profile_id: string
        }
        Insert: {
          language_id: string
          profile_id: string
        }
        Update: {
          language_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_languages_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_languages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_languages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profile_skills: {
        Row: {
          profile_id: string
          skill_id: string
        }
        Insert: {
          profile_id: string
          skill_id: string
        }
        Update: {
          profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          attendance_rate: number
          avatar_url: string | null
          bio: string | null
          cin_or_passport: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          experience: string | null
          first_name: string | null
          id: string
          interests: string[]
          languages: string[]
          last_name: string | null
          nationality: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills: string[]
          status: string
          updated_at: string
          volunteer_hours: number
        }
        Insert: {
          attendance_rate?: number
          avatar_url?: string | null
          bio?: string | null
          cin_or_passport?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          experience?: string | null
          first_name?: string | null
          id: string
          interests?: string[]
          languages?: string[]
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[]
          status?: string
          updated_at?: string
          volunteer_hours?: number
        }
        Update: {
          attendance_rate?: number
          avatar_url?: string | null
          bio?: string | null
          cin_or_passport?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          experience?: string | null
          first_name?: string | null
          id?: string
          interests?: string[]
          languages?: string[]
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[]
          status?: string
          updated_at?: string
          volunteer_hours?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string | null
          report_type: string
          reporter_id: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string | null
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string | null
          report_type: string
          reporter_id: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string | null
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string | null
          report_type?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string | null
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      shift_assignments: {
        Row: {
          assigned_at: string
          id: string
          profile_id: string
          shift_id: string
          status: Database["public"]["Enums"]["shift_assignment_status"]
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          profile_id: string
          shift_id: string
          status?: Database["public"]["Enums"]["shift_assignment_status"]
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          id?: string
          profile_id?: string
          shift_id?: string
          status?: Database["public"]["Enums"]["shift_assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "shift_assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "event_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      sports: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      training_modules: {
        Row: {
          created_at: string
          description: string | null
          event_id: string | null
          id: string
          required: boolean
          resources: Json
          role_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          required?: boolean
          resources?: Json
          role_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          required?: boolean
          resources?: Json
          role_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_modules_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "event_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          profile_id: string
          training_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          profile_id: string
          training_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "training_progress_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_hours: {
        Row: {
          approval_notes: string | null
          approved_by: string | null
          attendance_id: string | null
          created_at: string
          event_id: string | null
          hours: number
          id: string
          profile_id: string
          shift_id: string | null
          updated_at: string
          year: number
        }
        Insert: {
          approval_notes?: string | null
          approved_by?: string | null
          attendance_id?: string | null
          created_at?: string
          event_id?: string | null
          hours?: number
          id?: string
          profile_id: string
          shift_id?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          approval_notes?: string | null
          approved_by?: string | null
          attendance_id?: string | null
          created_at?: string
          event_id?: string | null
          hours?: number
          id?: string
          profile_id?: string
          shift_id?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_hours_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_hours_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "volunteer_hours_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_hours_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_hours_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_hours_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "volunteer_profile_completion"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "volunteer_hours_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "event_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      volunteer_profile_completion: {
        Row: {
          completed_fields: number | null
          completion_percentage: number | null
          profile_id: string | null
          total_fields: number | null
        }
        Insert: {
          completed_fields?: never
          completion_percentage?: never
          profile_id?: string | null
          total_fields?: never
        }
        Update: {
          completed_fields?: never
          completion_percentage?: never
          profile_id?: string | null
          total_fields?: never
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_committee_leader: {
        Args: { committee_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "withdrawn"
        | "waitlisted"
      attendance_status:
        | "scheduled"
        | "checked-in"
        | "checked-out"
        | "absent"
        | "late"
      committee_member_status: "assigned" | "removed" | "completed"
      committee_status: "active" | "inactive" | "archived"
      event_status: "draft" | "published" | "closed" | "completed" | "cancelled"
      notification_category:
        | "application"
        | "training"
        | "accreditation"
        | "certificate"
        | "event"
        | "other"
      report_status: "open" | "reviewing" | "resolved" | "dismissed"
      shift_assignment_status: "assigned" | "removed" | "completed"
      training_resource_type: "video" | "pdf" | "text" | "link"
      user_role: "volunteer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: [
        "pending",
        "accepted",
        "rejected",
        "withdrawn",
        "waitlisted",
      ],
      attendance_status: [
        "scheduled",
        "checked-in",
        "checked-out",
        "absent",
        "late",
      ],
      committee_member_status: ["assigned", "removed", "completed"],
      committee_status: ["active", "inactive", "archived"],
      event_status: ["draft", "published", "closed", "completed", "cancelled"],
      notification_category: [
        "application",
        "training",
        "accreditation",
        "certificate",
        "event",
        "other",
      ],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      shift_assignment_status: ["assigned", "removed", "completed"],
      training_resource_type: ["video", "pdf", "text", "link"],
      user_role: ["volunteer", "admin"],
    },
  },
} as const
