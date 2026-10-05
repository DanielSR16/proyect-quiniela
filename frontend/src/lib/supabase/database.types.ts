// Tipos del esquema público de Supabase (generados con el MCP: generate_typescript_types).
// Si cambias las tablas, vuelve a generarlos.

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      matches: {
        Row: {
          away_score: number | null;
          away_team: string;
          created_at: string;
          home_score: number | null;
          home_team: string;
          id: number;
          kickoff_at: string;
          round: number;
          status: string;
        };
        Insert: {
          away_score?: number | null;
          away_team: string;
          created_at?: string;
          home_score?: number | null;
          home_team: string;
          id?: never;
          kickoff_at: string;
          round: number;
          status?: string;
        };
        Update: {
          away_score?: number | null;
          away_team?: string;
          created_at?: string;
          home_score?: number | null;
          home_team?: string;
          id?: never;
          kickoff_at?: string;
          round?: number;
          status?: string;
        };
        Relationships: [];
      };
      predictions: {
        Row: {
          away_goals: number;
          created_at: string;
          home_goals: number;
          id: number;
          match_id: number;
          points: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          away_goals: number;
          created_at?: string;
          home_goals: number;
          id?: never;
          match_id: number;
          points?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          away_goals?: number;
          created_at?: string;
          home_goals?: number;
          id?: never;
          match_id?: number;
          points?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "predictions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          blocked: boolean;
          created_at: string;
          id: string;
          name: string;
          role: string;
        };
        Insert: {
          blocked?: boolean;
          created_at?: string;
          id: string;
          name: string;
          role?: string;
        };
        Update: {
          blocked?: boolean;
          created_at?: string;
          id?: string;
          name?: string;
          role?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
