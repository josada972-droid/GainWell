/**
 * Hand-written minimal database type mirroring supabase/migrations. Once a
 * real project exists, regenerate with `supabase gen types` and replace this
 * file (docs/supabase.md).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          preferred_language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      nutrition_profiles: {
        Row: {
          user_id: string;
          age_years: number | null;
          sex: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          activity_level: string | null;
          eating_habits: string | null;
          appetite_level: string | null;
          meals_per_day: number | null;
          dietary_preference: string;
          dietary_notes: string | null;
          goal: string | null;
          target_weight_kg: number | null;
          professional_kcal: number | null;
          onboarding_status: string;
          onboarding_step: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          age_years?: number | null;
          sex?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: string | null;
          eating_habits?: string | null;
          appetite_level?: string | null;
          meals_per_day?: number | null;
          dietary_preference?: string;
          dietary_notes?: string | null;
          goal?: string | null;
          target_weight_kg?: number | null;
          professional_kcal?: number | null;
          onboarding_status?: string;
          onboarding_step?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          age_years?: number | null;
          sex?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: string | null;
          eating_habits?: string | null;
          appetite_level?: string | null;
          meals_per_day?: number | null;
          dietary_preference?: string;
          dietary_notes?: string | null;
          goal?: string | null;
          target_weight_kg?: number | null;
          professional_kcal?: number | null;
          onboarding_status?: string;
          onboarding_step?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nutrition_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type NutritionProfile =
  Database["public"]["Tables"]["nutrition_profiles"]["Row"];
