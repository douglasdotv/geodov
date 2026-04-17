'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabaseClient';
import { getSession } from '@/lib/session';
import {
  CountryStats,
  OverviewStats,
  GameTypeStats,
  MovementStats,
  TopGuess,
} from '@/types/stats';
import { GuessLocation } from '@/types/guess';
import { isRawCountryStats } from '@/lib/validation';

export async function deleteGuess(formData: FormData) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error('Unauthorized.');
  }

  const guessIdValue = formData.get('guessId');
  const guessId = typeof guessIdValue === 'string' ? guessIdValue : null;

  if (!guessId) {
    throw new Error('Missing guess ID for deletion.');
  }

  const { error } = await supabase.from('guesses').delete().eq('id', guessId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/delete');
}

export async function getAdditionalGuesses(
  gameId: string,
  roundNumber: number,
) {
  const { data, error } = await supabase.rpc('get_additional_guesses', {
    game_id_param: gameId,
    round_number_param: roundNumber,
  });

  if (error) throw error;
  return data;
}

export async function getCountryStats(fromDate?: string): Promise<CountryStats[]> {
  const { data, error } = await supabase.rpc('get_country_stats', {
    from_date: fromDate ?? null,
  });

  if (error) throw error;
  if (!data || !isRawCountryStats(data)) {
    throw new Error('Invalid data format from country stats RPC');
  }

  return data.map((stat) => ({
    country: stat.country,
    totalGuesses: Number(stat.total_guesses),
    correctGuesses: Number(stat.correct_guesses),
    correctPercentage: Number(stat.correct_percentage),
    averageDistance: Number(stat.average_distance),
  }));
}

export async function getOverviewStats(fromDate?: string): Promise<OverviewStats> {
  const { data, error } = await supabase.rpc('get_overview_stats', {
    from_date: fromDate ?? null,
  });

  if (error) throw error;
  if (!data || !data[0]) throw new Error('No overview stats returned');

  const row = data[0];
  const parseTopGuesses = (raw: unknown): TopGuess[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      id: String((item as Record<string, unknown>).id),
      distance: Number((item as Record<string, unknown>).distance),
      location:
        ((item as Record<string, unknown>).location as string | null) ?? null,
    }));
  };
  return {
    totalRounds: Number(row.total_rounds),
    totalGames: Number(row.total_games),
    totalCountries: Number(row.total_countries),
    correctCountryPercentage: Number(row.correct_country_percentage),
    averageDistance: Number(row.average_distance),
    averageTimeToGuess: Number(row.average_time_to_guess),
    bestGuesses: parseTopGuesses(row.best_guesses),
    worstGuesses: parseTopGuesses(row.worst_guesses),
  };
}

export async function getGameTypeStats(fromDate?: string): Promise<GameTypeStats[]> {
  const { data, error } = await supabase.rpc('get_game_type_stats', {
    from_date: fromDate ?? null,
  });

  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    gameType: String(row.game_type),
    totalRounds: Number(row.total_rounds),
    correctCountryPercentage: Number(row.correct_country_percentage),
    averageDistance: Number(row.average_distance),
    averageTimeToGuess: Number(row.average_time_to_guess),
  }));
}

export async function getMovementStats(fromDate?: string): Promise<MovementStats[]> {
  const { data, error } = await supabase.rpc('get_movement_stats', {
    from_date: fromDate ?? null,
  });

  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    movementType: String(row.movement_type),
    totalRounds: Number(row.total_rounds),
    correctCountryPercentage: Number(row.correct_country_percentage),
    averageDistance: Number(row.average_distance),
    averageTimeToGuess: Number(row.average_time_to_guess),
  }));
}

export async function getGuessById(id: string) {
  const { data, error } = await supabase
    .from('guesses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getLocationsInBounds(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number,
  fromDate?: string,
): Promise<GuessLocation[]> {
  const { data, error } = await supabase.rpc('get_locations_in_bounds', {
    min_lat: minLat,
    min_lng: minLng,
    max_lat: maxLat,
    max_lng: maxLng,
    from_date: fromDate,
  });

  if (error) throw error;
  return data ?? [];
}
