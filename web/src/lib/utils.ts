import { GuessQuality } from '@/types/guess';
import lookup from 'country-code-lookup';

export function getCountryCode(countryName: string | null) {
  if (!countryName) return null;
  try {
    const country = lookup.byCountry(countryName);
    return country?.iso2 ?? null;
  } catch {
    return null;
  }
}

export function getGuessQuality(distance: number | null): GuessQuality {
  const distanceKm = distance === null ? null : distance / 1000;
  if (distanceKm === null) return GuessQuality.Bad;
  if (distanceKm < 50) return GuessQuality.Good;
  if (distanceKm < 1000) return GuessQuality.Average;
  return GuessQuality.Bad;
}

export function getTimeToGuess(
  guessTime: string,
  roundStartTime: string,
): string {
  const guessMs = new Date(guessTime).getTime();
  const roundMs = new Date(roundStartTime).getTime();
  const diffInSeconds = (guessMs - roundMs) / 1000;
  return `${diffInSeconds.toFixed(0)}s`;
}

export function formatMovementRestrictions(
  restrictions: Record<string, unknown> | null,
): string {
  if (!restrictions) return 'Unknown';

  const { forbidMoving, forbidZooming, forbidRotating } = restrictions;

  if (forbidMoving && forbidZooming && forbidRotating) {
    return 'NMPZ';
  }

  if (forbidMoving) {
    return 'No Move';
  }

  return 'Moving';
}

export function formatDistance(d: number | null) {
  if (d === null) return 'Unknown';
  if (d < 1000) return `${d.toFixed(0)} m`;
  return `${(d / 1000).toFixed(0)} km`;
}

export function formatRelativeTime(timestamp: string) {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffInSeconds = (now - then) / 1000;

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) {
    return formatUnit(minutes, 'minute');
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return formatUnit(hours, 'hour');
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return formatUnit(days, 'day');
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return formatUnit(weeks, 'week');
  }

  if (days < 365) {
    const months = Math.floor(days / 30.44);
    return formatUnit(months, 'month');
  }

  const years = Math.floor(days / 365.25);
  return formatUnit(years, 'year');
}

export function formatFullDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatUnit(value: number, unit: string) {
  return value === 1 ? `1 ${unit} ago` : `${value} ${unit}s ago`;
}
