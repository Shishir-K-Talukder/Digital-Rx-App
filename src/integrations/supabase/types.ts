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
      adult_dose_rules: {
        Row: {
          created_at: string
          created_by: string | null
          dose: string
          frequency: string
          generic: string
          id: string
          kind: string
          max_daily: string
          mg_per_kg: number | null
          name: string
          notes: string
          route: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dose?: string
          frequency?: string
          generic?: string
          id?: string
          kind?: string
          max_daily?: string
          mg_per_kg?: number | null
          name?: string
          notes?: string
          route?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dose?: string
          frequency?: string
          generic?: string
          id?: string
          kind?: string
          max_daily?: string
          mg_per_kg?: number | null
          name?: string
          notes?: string
          route?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          id: string
          notes: string
          patient_age: string
          patient_id: string | null
          patient_mobile: string
          patient_name: string
          patient_sex: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          id?: string
          notes?: string
          patient_age?: string
          patient_id?: string | null
          patient_mobile?: string
          patient_name?: string
          patient_sex?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          id?: string
          notes?: string
          patient_age?: string
          patient_id?: string | null
          patient_mobile?: string
          patient_name?: string
          patient_sex?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string
          subject?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      doctor_settings: {
        Row: {
          created_at: string
          id: string
          medicine_options: Json
          print_settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medicine_options?: Json
          print_settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medicine_options?: Json
          print_settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          company: string
          created_at: string
          generic: string
          id: string
          name: string
          strength: string
        }
        Insert: {
          company?: string
          created_at?: string
          generic?: string
          id?: string
          name?: string
          strength?: string
        }
        Update: {
          company?: string
          created_at?: string
          generic?: string
          id?: string
          name?: string
          strength?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string
          age: string
          created_at: string
          id: string
          mobile: string
          name: string
          sex: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string
          age?: string
          created_at?: string
          id?: string
          mobile?: string
          name?: string
          sex?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          age?: string
          created_at?: string
          id?: string
          mobile?: string
          name?: string
          sex?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pediatric_dose_rules: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          daily_dose: string
          drop_ratio: number | null
          frequency: string
          generic: string
          id: string
          name: string
          notes: string
          strength: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          daily_dose?: string
          drop_ratio?: number | null
          frequency?: string
          generic?: string
          id?: string
          name?: string
          notes?: string
          strength?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          daily_dose?: string
          drop_ratio?: number | null
          frequency?: string
          generic?: string
          id?: string
          name?: string
          notes?: string
          strength?: string
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          advice: Json
          clinical_data: Json
          created_at: string
          id: string
          medicines: Json
          patient_data: Json
          patient_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          advice?: Json
          clinical_data?: Json
          created_at?: string
          id?: string
          medicines?: Json
          patient_data?: Json
          patient_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          advice?: Json
          clinical_data?: Json
          created_at?: string
          id?: string
          medicines?: Json
          patient_data?: Json
          patient_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bmdc_no: string
          can_print: boolean
          chamber_address: string
          created_at: string
          degrees: string
          id: string
          is_active: boolean
          name: string
          panel_expires_at: string | null
          phone: string
          profile_photo_url: string
          specialization: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bmdc_no?: string
          can_print?: boolean
          chamber_address?: string
          created_at?: string
          degrees?: string
          id?: string
          is_active?: boolean
          name?: string
          panel_expires_at?: string | null
          phone?: string
          profile_photo_url?: string
          specialization?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bmdc_no?: string
          can_print?: boolean
          chamber_address?: string
          created_at?: string
          degrees?: string
          id?: string
          is_active?: boolean
          name?: string
          panel_expires_at?: string | null
          phone?: string
          profile_photo_url?: string
          specialization?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_email: string
          contact_phone: string
          facebook_url: string
          id: string
          instagram_url: string
          linkedin_url: string
          tiktok_url: string
          twitter_url: string
          updated_at: string
          whatsapp_url: string
          youtube_url: string
        }
        Insert: {
          contact_email?: string
          contact_phone?: string
          facebook_url?: string
          id?: string
          instagram_url?: string
          linkedin_url?: string
          tiktok_url?: string
          twitter_url?: string
          updated_at?: string
          whatsapp_url?: string
          youtube_url?: string
        }
        Update: {
          contact_email?: string
          contact_phone?: string
          facebook_url?: string
          id?: string
          instagram_url?: string
          linkedin_url?: string
          tiktok_url?: string
          twitter_url?: string
          updated_at?: string
          whatsapp_url?: string
          youtube_url?: string
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          from_email: string
          from_name: string
          host: string
          id: string
          notification_email: string
          password: string
          port: number
          provider: string
          updated_at: string
          use_tls: boolean
          username: string
        }
        Insert: {
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          notification_email?: string
          password?: string
          port?: number
          provider?: string
          updated_at?: string
          use_tls?: boolean
          username?: string
        }
        Update: {
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          notification_email?: string
          password?: string
          port?: number
          provider?: string
          updated_at?: string
          use_tls?: boolean
          username?: string
        }
        Relationships: []
      }
      sync_state: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      treatment_templates: {
        Row: {
          created_at: string
          id: string
          medicines: Json
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medicines?: Json
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medicines?: Json
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_active: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
