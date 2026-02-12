import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return _supabase;
}

// Database types
export interface CellEntry {
  id?: number;
  row: number;
  col: number;
  value: string;
  updated_by: string;
  updated_at?: string;
}

export interface ClueEntry {
  id?: number;
  number: number;
  direction: 'across' | 'down';
  clue_text: string;
  updated_by: string;
  updated_at?: string;
}
