// ==UserScript==
// @name         GeoDov
// @namespace    https://github.com/douglasdotv/geodov
// @version      0.1
// @description  Track GeoGuessr guesses across different game modes
// @author       Douglas Vieira
// @match        https://www.geoguessr.com/*
// @connect      *.supabase.co
// @connect      nominatim.openstreetmap.org
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  const ENDPOINTS = {
    DUELS_GUESS: '/api/duels',
    BR_DISTANCE_GUESS: '/api/battle-royale',
    CHALLENGE: '/api/v3/games',
    NOMINATIM_REVERSE: 'https://nominatim.openstreetmap.org/reverse',
  };

  const CONFIG = {
    /* SUPABASE_URL, SUPABASE_KEY and GEOGUESSR_PLAYER_ID must be replaced with actual, valid values. */
    SUPABASE_URL: 'SUPABASE_URL',
    SUPABASE_KEY: 'SUPABASE_KEY',
    GEOGUESSR_PLAYER_ID: 'GEOGUESSR_PLAYER_ID',
    USER_AGENT: 'GeoDov-Userscript/0.1',
  };

  async function fetchLocation(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return {
        display_name: null,
        city: null,
        state: null,
        country: null,
      };
    }

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      'accept-language': 'en',
    });

    try {
      const response = await fetch(`${ENDPOINTS.NOMINATIM_REVERSE}?${params}`, {
        headers: { 'User-Agent': CONFIG.USER_AGENT },
      });

      if (!response.ok) {
        return {
          display_name: null,
          city: null,
          state: null,
          country: null,
        };
      }

      const data = await response.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || null;
      const state = address.state || address.region || address.province || null;
      const country = address.country || null;

      return {
        display_name: data.display_name || null,
        city,
        state,
        country,
      };
    } catch {
      return {
        display_name: null,
        city: null,
        state: null,
        country: null,
      };
    }
  }

  async function sendToSupabase(guess) {
    if (!guess) {
      return;
    }

    try {
      const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/guesses`, {
        method: 'POST',
        headers: {
          apikey: CONFIG.SUPABASE_KEY,
          Authorization: `Bearer ${CONFIG.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(guess),
      });

      if (response.status !== 201) {
        console.error(
          `[GeoDov] Failed to save to Supabase: ${response.status}`
        );
      }
    } catch (error) {
      console.error(`[GeoDov] Failed to save to Supabase: ${error.message}`);
    }
  }

  function findCurrentRoundData(rounds, currentRoundNumber) {
    return rounds.find(
      (round) =>
        round.roundNumber === currentRoundNumber ||
        rounds.indexOf(round) === currentRoundNumber - 1
    );
  }

  async function extractDuelsGuess(jsonData) {
    if (
      !jsonData?.teams ||
      !jsonData?.rounds ||
      !jsonData?.currentRoundNumber
    ) {
      return null;
    }

    const roundData = jsonData.rounds[jsonData.currentRoundNumber - 2];
    if (!roundData || !roundData.panorama) {
      return null;
    }

    for (const team of jsonData.teams) {
      for (const player of team.players) {
        if (player.playerId === CONFIG.GEOGUESSR_PLAYER_ID && player.guesses) {
          const currentGuess = player.guesses.find(
            (g) => g.roundNumber === jsonData.currentRoundNumber - 1
          );
          if (currentGuess) {
            const guessLocation = await fetchLocation(
              currentGuess.lat,
              currentGuess.lng
            );
            const actualLocation = await fetchLocation(
              roundData.panorama.lat,
              roundData.panorama.lng
            );

            return {
              game_id: jsonData.gameId,
              game_type: 'duels',
              map_name: jsonData.options?.map?.name,
              movement_restrictions: jsonData.movementOptions,
              guess_lat: currentGuess.lat,
              guess_lng: currentGuess.lng,
              guess_display_name: guessLocation.display_name,
              guess_city: guessLocation.city,
              guess_state: guessLocation.state,
              guess_country: guessLocation.country,
              actual_lat: roundData.panorama.lat,
              actual_lng: roundData.panorama.lng,
              actual_display_name: actualLocation.display_name,
              actual_city: actualLocation.city,
              actual_state: actualLocation.state,
              actual_country: actualLocation.country,
              heading: roundData.panorama.heading,
              pitch: roundData.panorama.pitch,
              zoom: roundData.panorama.zoom,
              distance: currentGuess.distance,
              round_number: currentGuess.roundNumber,
              round_start_time: roundData.startTime,
              guess_time: currentGuess.created,
              steps_count: currentGuess.stepsCount || 0,
              pano_id: roundData.panorama.panoId,
              score: currentGuess.score,
            };
          }
        }
      }
    }

    return null;
  }

  async function extractBRDistanceGuess(jsonData) {
    if (
      !jsonData?.players ||
      !jsonData?.rounds ||
      !jsonData?.currentRoundNumber
    ) {
      return null;
    }

    const currentRound = findCurrentRoundData(
      jsonData.rounds,
      jsonData.currentRoundNumber
    );
    if (!currentRound) {
      return null;
    }

    for (const player of jsonData.players) {
      if (
        player.playerId === CONFIG.GEOGUESSR_PLAYER_ID &&
        player.coordinateGuesses
      ) {
        const currentRoundGuesses = player.coordinateGuesses
          .filter((g) => g.roundNumber === jsonData.currentRoundNumber)
          .slice(-1)[0];

        if (!currentRoundGuesses) {
          return null;
        }

        const guessLocation = await fetchLocation(
          currentRoundGuesses.lat,
          currentRoundGuesses.lng
        );
        const actualLocation = await fetchLocation(
          currentRound.lat,
          currentRound.lng
        );

        return {
          game_id: jsonData.gameId,
          game_type: 'br',
          movement_restrictions: jsonData.movementOptions,
          guess_lat: currentRoundGuesses.lat,
          guess_lng: currentRoundGuesses.lng,
          guess_display_name: guessLocation.display_name,
          guess_city: guessLocation.city,
          guess_state: guessLocation.state,
          guess_country: guessLocation.country,
          actual_lat: currentRound.lat,
          actual_lng: currentRound.lng,
          actual_display_name: actualLocation.display_name,
          actual_city: actualLocation.city,
          actual_state: actualLocation.state,
          actual_country: actualLocation.country,
          heading: currentRound.heading,
          pitch: currentRound.pitch,
          zoom: currentRound.zoom,
          distance: currentRoundGuesses.distance,
          round_number: currentRoundGuesses.roundNumber,
          round_start_time: currentRound.startTime,
          guess_time: currentRoundGuesses.created,
          steps_count: currentRoundGuesses.stepsCount || 0,
          pano_id: currentRound.panoId,
          score: null,
        };
      }
    }

    return null;
  }

  async function extractChallengeGuess(jsonData) {
    if (!jsonData?.player?.guesses || !jsonData?.rounds || !jsonData?.round) {
      return null;
    }

    const currentRound = jsonData.round;
    const guess = jsonData.player.guesses[currentRound - 1];
    const round = jsonData.rounds[currentRound - 1];

    if (!guess || !round) {
      return null;
    }

    const guessLocation = await fetchLocation(guess.lat, guess.lng);
    const actualLocation = await fetchLocation(round.lat, round.lng);

    return {
      game_id: jsonData.token,
      game_type: 'challenge',
      map: jsonData.map,
      map_name: jsonData.mapName,
      movement_restrictions: {
        forbidMoving: jsonData.forbidMoving,
        forbidZooming: jsonData.forbidZooming,
        forbidRotating: jsonData.forbidRotating,
      },
      guess_lat: guess.lat,
      guess_lng: guess.lng,
      guess_display_name: guessLocation.display_name,
      guess_city: guessLocation.city,
      guess_state: guessLocation.state,
      guess_country: guessLocation.country,
      actual_lat: round.lat,
      actual_lng: round.lng,
      actual_display_name: actualLocation.display_name,
      actual_city: actualLocation.city,
      actual_state: actualLocation.state,
      actual_country: actualLocation.country,
      heading: round.heading,
      pitch: round.pitch,
      zoom: round.zoom,
      distance: guess.distanceInMeters,
      score: guess.roundScoreInPoints,
      round_number: currentRound,
      round_start_time: round.startTime,
      guess_time: guess.created || new Date().toISOString(),
      steps_count: guess.stepsCount || 0,
      pano_id: round.panoId,
    };
  }

  async function processApiResponse(url, jsonData) {
    let guess = null;

    if (url.includes(ENDPOINTS.DUELS_GUESS) && url.endsWith('/guess')) {
      guess = await extractDuelsGuess(jsonData);
    } else if (
      url.includes(ENDPOINTS.BR_DISTANCE_GUESS) &&
      url.endsWith('/guess')
    ) {
      guess = await extractBRDistanceGuess(jsonData);
    } else if (url.includes(ENDPOINTS.CHALLENGE)) {
      guess = await extractChallengeGuess(jsonData);
    }

    if (guess) {
      await sendToSupabase(guess);
    }
  }

  if (typeof unsafeWindow !== 'undefined' && unsafeWindow.fetch) {
    const originalFetch = unsafeWindow.fetch;
    unsafeWindow.fetch = async (...args) => {
      const response = await originalFetch.apply(this, args);
      const url = args[0];

      if (typeof url === 'string') {
        const clonedResponse = response.clone();
        try {
          const jsonData = await clonedResponse.json();
          await processApiResponse(url, jsonData);
        } catch (e) {
          console.error(`[GeoDov] Failed to process response: ${e.message}`);
        }
      }
      return response;
    };
  }
})();
