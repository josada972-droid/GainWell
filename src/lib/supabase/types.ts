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
      custom_foods: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brand: string | null;
          kcal_per_100g: number | null;
          protein_per_100g: number | null;
          carbs_per_100g: number | null;
          fat_per_100g: number | null;
          fiber_per_100g: number | null;
          nutrition_basis: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          brand?: string | null;
          kcal_per_100g?: number | null;
          protein_per_100g?: number | null;
          carbs_per_100g?: number | null;
          fat_per_100g?: number | null;
          fiber_per_100g?: number | null;
          nutrition_basis?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          brand?: string | null;
          kcal_per_100g?: number | null;
          protein_per_100g?: number | null;
          carbs_per_100g?: number | null;
          fat_per_100g?: number | null;
          fiber_per_100g?: number | null;
          nutrition_basis?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "custom_foods_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          meal_date: string;
          meal_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_date: string;
          meal_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_date?: string;
          meal_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      meal_entries: {
        Row: EntrySnapshot & {
          id: string;
          meal_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          meal_id: string;
          user_id: string;
          food_source: string;
          off_product_code?: string | null;
          custom_food_id?: string | null;
          food_name_snapshot: string;
          brand_snapshot?: string | null;
          source_kcal?: number | null;
          source_protein_g?: number | null;
          source_carbs_g?: number | null;
          source_fat_g?: number | null;
          source_fiber_g?: number | null;
          source_basis: string;
          source_serving_quantity?: number | null;
          source_serving_unit?: string | null;
          source_attribution?: string | null;
          quantity: number;
          quantity_unit: string;
          calc_kcal?: number | null;
          calc_protein_g?: number | null;
          calc_carbs_g?: number | null;
          calc_fat_g?: number | null;
          calc_fiber_g?: number | null;
          calc_grams?: number | null;
          calc_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          meal_id?: string;
          user_id?: string;
          quantity?: number;
          quantity_unit?: string;
          calc_kcal?: number | null;
          calc_protein_g?: number | null;
          calc_carbs_g?: number | null;
          calc_fat_g?: number | null;
          calc_fiber_g?: number | null;
          calc_grams?: number | null;
          calc_complete?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "meal_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_entries_meal_id_user_id_fkey";
            columns: ["meal_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "meals";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      saved_meals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_meals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_meal_entries: {
        Row: EntrySnapshot & {
          id: string;
          saved_meal_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          saved_meal_id: string;
          user_id: string;
          food_source: string;
          off_product_code?: string | null;
          custom_food_id?: string | null;
          food_name_snapshot: string;
          brand_snapshot?: string | null;
          source_kcal?: number | null;
          source_protein_g?: number | null;
          source_carbs_g?: number | null;
          source_fat_g?: number | null;
          source_fiber_g?: number | null;
          source_basis: string;
          source_serving_quantity?: number | null;
          source_serving_unit?: string | null;
          source_attribution?: string | null;
          quantity: number;
          quantity_unit: string;
          calc_kcal?: number | null;
          calc_protein_g?: number | null;
          calc_carbs_g?: number | null;
          calc_fat_g?: number | null;
          calc_fiber_g?: number | null;
          calc_grams?: number | null;
          calc_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          saved_meal_id?: string;
          user_id?: string;
          quantity?: number;
          quantity_unit?: string;
          calc_kcal?: number | null;
          calc_protein_g?: number | null;
          calc_carbs_g?: number | null;
          calc_fat_g?: number | null;
          calc_fiber_g?: number | null;
          calc_grams?: number | null;
          calc_complete?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "saved_meal_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_meal_entries_saved_meal_id_user_id_fkey";
            columns: ["saved_meal_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "saved_meals";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      off_rate_limit: {
        Row: {
          bucket: string;
          window_start: string;
          used: number;
        };
        Insert: {
          bucket: string;
          window_start: string;
          used?: number;
        };
        Update: {
          bucket?: string;
          window_start?: string;
          used?: number;
        };
        Relationships: [];
      };
      off_products_cache: {
        Row: {
          id: string;
          barcode: string;
          product_name: string | null;
          brand: string | null;
          kcal_per_100g: number | null;
          protein_per_100g: number | null;
          carbs_per_100g: number | null;
          fat_per_100g: number | null;
          fiber_per_100g: number | null;
          nutrition_basis: string;
          serving_quantity: number | null;
          serving_unit: string | null;
          off_url: string;
          source_updated_at: string | null;
          cached_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          barcode: string;
          product_name?: string | null;
          brand?: string | null;
          kcal_per_100g?: number | null;
          protein_per_100g?: number | null;
          carbs_per_100g?: number | null;
          fat_per_100g?: number | null;
          fiber_per_100g?: number | null;
          nutrition_basis: string;
          serving_quantity?: number | null;
          serving_unit?: string | null;
          off_url: string;
          source_updated_at?: string | null;
          cached_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          barcode?: string;
          product_name?: string | null;
          brand?: string | null;
          kcal_per_100g?: number | null;
          protein_per_100g?: number | null;
          carbs_per_100g?: number | null;
          fat_per_100g?: number | null;
          fiber_per_100g?: number | null;
          nutrition_basis?: string;
          serving_quantity?: number | null;
          serving_unit?: string | null;
          off_url?: string;
          source_updated_at?: string | null;
          cached_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      off_search_cache: {
        Row: {
          id: string;
          query_hash: string;
          query: string;
          results: Json;
          cached_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          query_hash: string;
          query: string;
          results: Json;
          cached_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          query_hash?: string;
          query?: string;
          results?: Json;
          cached_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      delete_meal_entry: {
        Args: { p_entry_id: string };
        Returns: number;
      };
      delete_saved_meal_entry: {
        Args: { p_entry_id: string };
        Returns: number;
      };
      delete_saved_meal: {
        Args: { p_saved_meal_id: string };
        Returns: number;
      };
      off_rate_limit_take: {
        // Bucket only: the limit and window are fixed inside the function
        // (supabase/migrations/0004), and service_role is the only role with
        // execute permission.
        Args: { p_bucket: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type NutritionProfile =
  Database["public"]["Tables"]["nutrition_profiles"]["Row"];

/** The shared source/calculation snapshot columns meal and saved entries carry. */
export type EntrySnapshot = {
  food_source: "open_food_facts" | "custom";
  off_product_code: string | null;
  custom_food_id: string | null;
  food_name_snapshot: string;
  brand_snapshot: string | null;
  source_kcal: number | null;
  source_protein_g: number | null;
  source_carbs_g: number | null;
  source_fat_g: number | null;
  source_fiber_g: number | null;
  source_basis: string;
  source_serving_quantity: number | null;
  source_serving_unit: string | null;
  source_attribution: string | null;
  quantity: number;
  quantity_unit: string;
  calc_kcal: number | null;
  calc_protein_g: number | null;
  calc_carbs_g: number | null;
  calc_fat_g: number | null;
  calc_fiber_g: number | null;
  calc_grams: number | null;
  calc_complete: boolean;
};
