import lookup, { countries } from 'country-code-lookup';

const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
  myanmar: 'MM',
  burma: 'MM',
  'myanmar burma': 'MM',
  kosovo: 'XK',
  'republic of kosovo': 'XK',
  palestine: 'PS',
  'state of palestine': 'PS',
  'palestinian territories': 'PS',
  'palestinian territory': 'PS',
  'czech republic': 'CZ',
  czechia: 'CZ',
  'ivory coast': 'CI',
  'cote divoire': 'CI',
  'cote d ivoire': 'CI',
  'united states of america': 'US',
  usa: 'US',
  'united kingdom of great britain and northern ireland': 'GB',
  'great britain': 'GB',
  uk: 'GB',
  'republic of korea': 'KR',
  'south korea': 'KR',
  'korea south': 'KR',
  'democratic peoples republic of korea': 'KP',
  'north korea': 'KP',
  'korea north': 'KP',
  'russian federation': 'RU',
  'taiwan province of china': 'TW',
  'republic of china': 'TW',
  taiwan: 'TW',
  'viet nam': 'VN',
  vietnam: 'VN',
  'lao peoples democratic republic': 'LA',
  'lao pdr': 'LA',
  laos: 'LA',
  'syrian arab republic': 'SY',
  syria: 'SY',
  'iran islamic republic of': 'IR',
  iran: 'IR',
  'bolivia plurinational state of': 'BO',
  bolivia: 'BO',
  'venezuela bolivarian republic of': 'VE',
  venezuela: 'VE',
  'united republic of tanzania': 'TZ',
  tanzania: 'TZ',
  'republic of the congo': 'CG',
  'congo brazzaville': 'CG',
  congo: 'CG',
  'democratic republic of the congo': 'CD',
  'congo kinshasa': 'CD',
  'dr congo': 'CD',
  drc: 'CD',
  swaziland: 'SZ',
  eswatini: 'SZ',
  'kingdom of eswatini': 'SZ',
  'republic of north macedonia': 'MK',
  'north macedonia': 'MK',
  macedonia: 'MK',
  'the former yugoslav republic of macedonia': 'MK',
  'fyr macedonia': 'MK',
  'federated states of micronesia': 'FM',
  'micronesia federated states of': 'FM',
  micronesia: 'FM',
  'republic of moldova': 'MD',
  moldova: 'MD',
  'brunei darussalam': 'BN',
  brunei: 'BN',
  'cape verde': 'CV',
  'cabo verde': 'CV',
  'east timor': 'TL',
  'timor leste': 'TL',
  'holy see': 'VA',
  'vatican city': 'VA',
  'vatican city state': 'VA',
  vatican: 'VA',
  macau: 'MO',
  macao: 'MO',
  'macao sar': 'MO',
  'hong kong': 'HK',
  'hong kong sar': 'HK',
  curacao: 'CW',
  'sint maarten': 'SX',
  'saint martin': 'MF',
  'saint barthelemy': 'BL',
  'st barth': 'BL',
  'st barthelemy': 'BL',
  'st kitts and nevis': 'KN',
  'saint kitts and nevis': 'KN',
  'st lucia': 'LC',
  'saint lucia': 'LC',
  'st vincent and the grenadines': 'VC',
  'saint vincent and the grenadines': 'VC',
  'sao tome and principe': 'ST',
  reunion: 'RE',
};

const normalizeCountryName = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/['’`´]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();

export function getCountryCode(countryName: string | null): string | null {
  if (!countryName) return null;

  const target = normalizeCountryName(countryName);
  if (COUNTRY_NAME_OVERRIDES[target]) {
    return COUNTRY_NAME_OVERRIDES[target];
  }

  try {
    const exact = lookup.byCountry(countryName);
    if (exact) return exact.iso2;

    return (
      countries.find((c) => normalizeCountryName(c.country) === target)?.iso2 ??
      null
    );
  } catch {
    return null;
  }
}
