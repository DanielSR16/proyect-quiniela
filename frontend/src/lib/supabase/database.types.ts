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
          away_team_id: number;
          created_at: string;
          home_score: number | null;
          home_team_id: number;
          id: number;
          kickoff_at: string;
          round: number;
          status: string;
          tournament_id: number;
        };
        Insert: {
          away_score?: number | null;
          away_team_id: number;
          created_at?: string;
          home_score?: number | null;
          home_team_id: number;
          id?: never;
          kickoff_at: string;
          round: number;
          status?: string;
          tournament_id: number;
        };
        Update: {
          away_score?: number | null;
          away_team_id?: number;
          created_at?: string;
          home_score?: number | null;
          home_team_id?: number;
          id?: never;
          kickoff_at?: string;
          round?: number;
          status?: string;
          tournament_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey";
            columns: ["away_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_tournament_id_round_fkey";
            columns: ["tournament_id", "round"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["tournament_id", "number"];
          },
          {
            foreignKeyName: "matches_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_home_team_id_fkey";
            columns: ["home_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
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
          nickname: string;
          role: string;
        };
        Insert: {
          blocked?: boolean;
          created_at?: string;
          id: string;
          name: string;
          nickname: string;
          role?: string;
        };
        Update: {
          blocked?: boolean;
          created_at?: string;
          id?: string;
          name?: string;
          nickname?: string;
          role?: string;
        };
        Relationships: [];
      };
      rounds: {
        Row: {
          finished: boolean;
          number: number;
          tournament_id: number;
        };
        Insert: {
          finished?: boolean;
          number: number;
          tournament_id: number;
        };
        Update: {
          finished?: boolean;
          number?: number;
          tournament_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "rounds_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          id: number;
          logo_url: string | null;
          name: string;
          short_name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          logo_url?: string | null;
          name: string;
          short_name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          logo_url?: string | null;
          name?: string;
          short_name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      tournaments: {
        Row: {
          created_at: string;
          id: number;
          is_active: boolean;
          kind: string;
          name: string;
          year: number;
        };
        Insert: {
          created_at?: string;
          id?: never;
          is_active?: boolean;
          kind: string;
          name: string;
          year: number;
        };
        Update: {
          created_at?: string;
          id?: never;
          is_active?: boolean;
          kind?: string;
          name?: string;
          year?: number;
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
