export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

type NoArgs = Record<PropertyKey, never>;

export type GuessRow = {
  id: string;
  timestamp: string;
  game_id: string;
  game_type: string;
  map: string | null;
  map_name: string | null;
  movement_restrictions: Record<string, unknown> | null;
  guess_lat: number;
  guess_lng: number;
  guess_display_name: string | null;
  guess_city: string | null;
  guess_state: string | null;
  guess_country: string | null;
  actual_lat: number;
  actual_lng: number;
  actual_display_name: string | null;
  actual_city: string | null;
  actual_state: string | null;
  actual_country: string | null;
  heading: number | null;
  pitch: number | null;
  zoom: number | null;
  distance: number | null;
  score: number | null;
  round_number: number;
  round_start_time: string;
  guess_time: string;
  steps_count: number | null;
  pano_id: string | null;
  created_at: string | null;
};

type GuessWithAdditionalGuessesFlag = GuessRow & {
  has_additional_guesses: boolean;
};

export interface Database {
  public: {
    Tables: {
      guesses: {
        Row: GuessRow;
        Insert: Partial<GuessRow>;
        Update: Partial<GuessRow>;
        Relationships: [];
      };
    };
    Views: never;
    Functions: {
      get_total_rounds_count: {
        Args: {
          country_filter?: string | null;
          movement_type?: string | null;
          game_type_filter?: string | null;
        };
        Returns: number;
      };
      get_unique_countries: {
        Args: NoArgs;
        Returns: string[];
      };
      get_sorted_guesses_paginated: {
        Args: {
          page_start: number;
          page_end: number;
          sort_order?: string;
          country_filter?: string | null;
          movement_type?: string | null;
          game_type_filter?: string | null;
        };
        Returns: GuessWithAdditionalGuessesFlag[];
      };
      get_additional_guesses: {
        Args: {
          game_id_param: string;
          round_number_param: number;
        };
        Returns: GuessRow[];
      };
      get_country_stats: {
        Args: {
          from_date?: string | null;
        };
        Returns: {
          country: string;
          total_guesses: number;
          correct_guesses: number;
          correct_percentage: number;
          average_distance: number;
        }[];
      };
      get_overview_stats: {
        Args: {
          from_date?: string | null;
        };
        Returns: {
          total_rounds: number;
          total_games: number;
          total_countries: number;
          correct_country_percentage: number;
          average_distance: number;
          average_time_to_guess: number;
          best_guesses: Json;
          worst_guesses: Json;
        }[];
      };
      get_game_type_stats: {
        Args: {
          from_date?: string | null;
        };
        Returns: {
          game_type: string;
          total_rounds: number;
          correct_country_percentage: number;
          average_distance: number;
          average_time_to_guess: number;
        }[];
      };
      get_movement_stats: {
        Args: {
          from_date?: string | null;
        };
        Returns: {
          movement_type: string;
          total_rounds: number;
          correct_country_percentage: number;
          average_distance: number;
          average_time_to_guess: number;
        }[];
      };
      get_locations_in_bounds: {
        Args: {
          min_lat: number;
          min_lng: number;
          max_lat: number;
          max_lng: number;
          from_date?: string | null;
        };
        Returns: {
          id: string;
          lat: number;
          lng: number;
          location: string | null;
          country: string | null;
          game_type: string;
          distance: number;
          created_at: string;
        }[];
      };
    };
    Enums: never;
    CompositeTypes: never;
  };
}
