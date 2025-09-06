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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          is_read: boolean | null
          mentor_id: string
          metadata: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean | null
          mentor_id: string
          metadata?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean | null
          mentor_id?: string
          metadata?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      earnings: {
        Row: {
          amount: number
          created_at: string
          earning_date: string
          id: string
          mentor_id: string
          net_amount: number
          payout_status: string | null
          platform_fee: number | null
          session_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          earning_date?: string
          id?: string
          mentor_id: string
          net_amount: number
          payout_status?: string | null
          platform_fee?: number | null
          session_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          earning_date?: string
          id?: string
          mentor_id?: string
          net_amount?: number
          payout_status?: string | null
          platform_fee?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mentee_profiles: {
        Row: {
          citizenship_country: string | null
          created_at: string
          current_location: string | null
          english_exam: string | null
          english_score: number | null
          graduation_year: number | null
          help_needed: string[] | null
          highest_degree: string | null
          id: string
          inbde_status: string | null
          languages_spoken: string[] | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          preferred_session_times: string[] | null
          profile_photo_url: string | null
          referral_source: string | null
          target_programs: string[] | null
          target_schools: string[] | null
          university_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          citizenship_country?: string | null
          created_at?: string
          current_location?: string | null
          english_exam?: string | null
          english_score?: number | null
          graduation_year?: number | null
          help_needed?: string[] | null
          highest_degree?: string | null
          id?: string
          inbde_status?: string | null
          languages_spoken?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferred_session_times?: string[] | null
          profile_photo_url?: string | null
          referral_source?: string | null
          target_programs?: string[] | null
          target_schools?: string[] | null
          university_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          citizenship_country?: string | null
          created_at?: string
          current_location?: string | null
          english_exam?: string | null
          english_score?: number | null
          graduation_year?: number | null
          help_needed?: string[] | null
          highest_degree?: string | null
          id?: string
          inbde_status?: string | null
          languages_spoken?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferred_session_times?: string[] | null
          profile_photo_url?: string | null
          referral_source?: string | null
          target_programs?: string[] | null
          target_schools?: string[] | null
          university_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_availability: {
        Row: {
          created_at: string
          date: string
          duration_minutes: number | null
          id: string
          is_available: boolean | null
          is_recurring: boolean | null
          mentor_id: string
          recurring_pattern: string | null
          time_slots: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          duration_minutes?: number | null
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          mentor_id: string
          recurring_pattern?: string | null
          time_slots?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_minutes?: number | null
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          mentor_id?: string
          recurring_pattern?: string | null
          time_slots?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_profiles: {
        Row: {
          admission_letter_url: string | null
          availability_preference: string | null
          average_rating: number | null
          bachelor_graduation_year: number | null
          bachelor_university: string | null
          country_of_origin: string | null
          created_at: string
          current_status: string | null
          degree_certificate_url: string | null
          dental_school: string | null
          dental_school_graduation_year: number | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          languages_spoken: string[] | null
          linkedin_url: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          professional_bio: string | null
          professional_headline: string | null
          profile_photo_url: string | null
          services: Json | null
          specializations: string[] | null
          student_id_url: string | null
          total_sessions: number | null
          updated_at: string
          user_id: string
          verification_documents: Json | null
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          admission_letter_url?: string | null
          availability_preference?: string | null
          average_rating?: number | null
          bachelor_graduation_year?: number | null
          bachelor_university?: string | null
          country_of_origin?: string | null
          created_at?: string
          current_status?: string | null
          degree_certificate_url?: string | null
          dental_school?: string | null
          dental_school_graduation_year?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages_spoken?: string[] | null
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          professional_bio?: string | null
          professional_headline?: string | null
          profile_photo_url?: string | null
          services?: Json | null
          specializations?: string[] | null
          student_id_url?: string | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
          verification_documents?: Json | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          admission_letter_url?: string | null
          availability_preference?: string | null
          average_rating?: number | null
          bachelor_graduation_year?: number | null
          bachelor_university?: string | null
          country_of_origin?: string | null
          created_at?: string
          current_status?: string | null
          degree_certificate_url?: string | null
          dental_school?: string | null
          dental_school_graduation_year?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages_spoken?: string[] | null
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          professional_bio?: string | null
          professional_headline?: string | null
          profile_photo_url?: string | null
          services?: Json | null
          specializations?: string[] | null
          student_id_url?: string | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
          verification_documents?: Json | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      mentor_services: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          mentor_id: string | null
          price: number
          service_description: string | null
          service_title: string
          service_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          mentor_id?: string | null
          price: number
          service_description?: string | null
          service_title: string
          service_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          mentor_id?: string | null
          price?: number
          service_description?: string | null
          service_title?: string
          service_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_services_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          message_type: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          message_type?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          mentor_id: string
          payout_details: Json | null
          payout_method: string
          processed_at: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          mentor_id: string
          payout_details?: Json | null
          payout_method?: string
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          mentor_id?: string
          payout_details?: Json | null
          payout_method?: string
          processed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          phone: string | null
          referral_source: string | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          referral_source?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          referral_source?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      reschedule_requests: {
        Row: {
          created_at: string
          id: string
          new_requested_date: string
          original_date: string
          reason: string | null
          requested_by: string
          response_message: string | null
          session_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_requested_date: string
          original_date: string
          reason?: string | null
          requested_by: string
          response_message?: string | null
          session_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          new_requested_date?: string
          original_date?: string
          reason?: string | null
          requested_by?: string
          response_message?: string | null
          session_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reschedule_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_cancellations: {
        Row: {
          cancellation_reason: string
          cancelled_at: string
          cancelled_by: string
          created_at: string
          id: string
          refund_amount: number | null
          refund_status: string | null
          session_id: string
        }
        Insert: {
          cancellation_reason: string
          cancelled_at?: string
          cancelled_by: string
          created_at?: string
          id?: string
          refund_amount?: number | null
          refund_status?: string | null
          session_id: string
        }
        Update: {
          cancellation_reason?: string
          cancelled_at?: string
          cancelled_by?: string
          created_at?: string
          id?: string
          refund_amount?: number | null
          refund_status?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_cancellations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          mentee_id: string
          mentor_responded_at: string | null
          mentor_response: string | null
          rating: number
          session_id: string
          updated_at: string
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          mentee_id: string
          mentor_responded_at?: string | null
          mentor_response?: string | null
          rating: number
          session_id: string
          updated_at?: string
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          mentee_id?: string
          mentor_responded_at?: string | null
          mentor_response?: string | null
          rating?: number
          session_id?: string
          updated_at?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "session_feedback_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_notes: {
        Row: {
          created_at: string
          id: string
          mentor_id: string
          note_type: string | null
          notes: string
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id: string
          note_type?: string | null
          notes: string
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string
          note_type?: string | null
          notes?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_requests: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          mentee_id: string
          mentor_id: string
          mentor_response: string | null
          message: string | null
          requested_date: string
          session_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          mentee_id: string
          mentor_id: string
          mentor_response?: string | null
          message?: string | null
          requested_date: string
          session_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          mentee_id?: string
          mentor_id?: string
          mentor_response?: string | null
          message?: string | null
          requested_date?: string
          session_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_requests_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_requests_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          meeting_link: string | null
          mentee_id: string
          mentor_id: string
          notes: string | null
          payment_status: string | null
          price_paid: number | null
          session_date: string
          session_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          mentee_id: string
          mentor_id: string
          notes?: string | null
          payment_status?: string | null
          price_paid?: number | null
          session_date: string
          session_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          mentee_id?: string
          mentor_id?: string
          notes?: string | null
          payment_status?: string | null
          price_paid?: number | null
          session_date?: string
          session_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          mentor_id: string
          reference_id: string | null
          session_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          mentor_id: string
          reference_id?: string | null
          session_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          mentor_id?: string
          reference_id?: string | null
          session_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
