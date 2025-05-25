'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabaseClient';
import { CountryStats } from '@/types/stats';
import { GuessLocation } from '@/types/guess';
import { isRawCountryStats } from '@/lib/validation';

export async function deleteGuess(formData: FormData) {
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

export async function getCountryStats(): Promise<CountryStats[]> {
  const { data, error } = await supabase.rpc('get_country_stats');

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
