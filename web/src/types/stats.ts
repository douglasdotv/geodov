export interface CountryStats {
  country: string;
  totalGuesses: number;
  correctGuesses: number;
  correctPercentage: number;
  averageDistance: number;
}

export interface RawCountryStats {
  country: string;
  total_guesses: number;
  correct_guesses: number;
  correct_percentage: number;
  average_distance: number;
}

export interface OverviewStats {
  totalRounds: number;
  totalGames: number;
  totalCountries: number;
  correctCountryPercentage: number;
  averageDistance: number;
  averageTimeToGuess: number;
  bestGuess: {
    id: string;
    distance: number;
    location: string | null;
  };
  worstGuess: {
    id: string;
    distance: number;
    location: string | null;
  };
}

export interface GameTypeStats {
  gameType: string;
  totalRounds: number;
  correctCountryPercentage: number;
  averageDistance: number;
  averageTimeToGuess: number;
}

export interface MovementStats {
  movementType: string;
  totalRounds: number;
  correctCountryPercentage: number;
  averageDistance: number;
  averageTimeToGuess: number;
}
