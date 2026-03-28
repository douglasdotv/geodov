CREATE TABLE guesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id TEXT NOT NULL,
    game_type TEXT NOT NULL,
    map TEXT,
    map_name TEXT,
    movement_restrictions JSONB,
    guess_lat DOUBLE PRECISION NOT NULL,
    guess_lng DOUBLE PRECISION NOT NULL,
    guess_display_name TEXT,
    guess_city TEXT,
    guess_state TEXT,
    guess_country TEXT,
    actual_lat DOUBLE PRECISION NOT NULL,
    actual_lng DOUBLE PRECISION NOT NULL,
    actual_display_name TEXT,
    actual_city TEXT,
    actual_state TEXT,
    actual_country TEXT,
    heading DOUBLE PRECISION,
    pitch DOUBLE PRECISION,
    zoom DOUBLE PRECISION,
    distance DOUBLE PRECISION,
    score INTEGER,
    round_number INTEGER NOT NULL,
    round_start_time TIMESTAMPTZ NOT NULL,
    guess_time TIMESTAMPTZ NOT NULL,
    steps_count INTEGER,
    pano_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_unique_challenge_duels_guess
ON guesses (game_id, round_number)
WHERE game_type IN ('challenge', 'duels');

CREATE UNIQUE INDEX idx_unique_br_guess
ON guesses (game_id, round_number, created_at)
WHERE game_type = 'br';

CREATE INDEX idx_guesses_game_type_created_at
ON guesses (game_type, created_at);

CREATE INDEX idx_guesses_created_at
ON guesses (created_at);
