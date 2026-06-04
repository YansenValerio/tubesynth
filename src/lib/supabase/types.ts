/**
 * Hand-authored Supabase schema types mirroring supabase/migrations.
 * Once the project is linked you can regenerate with:
 *   npx supabase gen types typescript --linked > src/lib/supabase/types.ts
 */
import type { SummaryContent, TranscriptSegment } from "@/lib/types";

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          youtube_id: string;
          title: string;
          channel_name: string | null;
          channel_id: string | null;
          duration_seconds: number;
          thumbnail_url: string | null;
          language: string | null;
          created_at: string;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          youtube_id: string;
          title: string;
          channel_name?: string | null;
          channel_id?: string | null;
          duration_seconds: number;
          thumbnail_url?: string | null;
          language?: string | null;
          created_at?: string;
          fetched_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["videos"]["Insert"]>;
        Relationships: [];
      };
      transcripts: {
        Row: {
          id: string;
          video_id: string;
          language: string | null;
          is_auto_generated: boolean;
          raw_data: TranscriptSegment[];
          word_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          language?: string | null;
          is_auto_generated?: boolean;
          raw_data: TranscriptSegment[];
          word_count?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transcripts"]["Insert"]>;
        Relationships: [];
      };
      summaries: {
        Row: {
          id: string;
          video_id: string;
          user_id: string | null;
          language: string;
          strategy: string | null;
          status: string;
          progress: number;
          current_step: string | null;
          content: SummaryContent | null;
          model_used: string | null;
          tokens_input: number | null;
          tokens_output: number | null;
          processing_time_ms: number | null;
          error_message: string | null;
          is_public: boolean;
          is_favorite: boolean;
          folder_id: string | null;
          share_slug: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id?: string | null;
          language?: string;
          strategy?: string | null;
          status?: string;
          progress?: number;
          current_step?: string | null;
          content?: SummaryContent | null;
          model_used?: string | null;
          tokens_input?: number | null;
          tokens_output?: number | null;
          processing_time_ms?: number | null;
          error_message?: string | null;
          is_public?: boolean;
          is_favorite?: boolean;
          folder_id?: string | null;
          share_slug?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["summaries"]["Insert"]>;
        Relationships: [];
      };
      qa_sessions: {
        Row: {
          id: string;
          summary_id: string;
          user_id: string | null;
          messages: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          summary_id: string;
          user_id?: string | null;
          messages: unknown;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["qa_sessions"]["Insert"]>;
        Relationships: [];
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["folders"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
