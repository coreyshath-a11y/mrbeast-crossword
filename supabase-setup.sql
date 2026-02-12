-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- This creates the tables needed for the collaborative crossword puzzle

-- Cells table for letter entries
CREATE TABLE IF NOT EXISTS cells (
  id BIGSERIAL PRIMARY KEY,
  row INTEGER NOT NULL,
  col INTEGER NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL DEFAULT 'anonymous',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(row, col)
);

-- Clues table for editable hints
CREATE TABLE IF NOT EXISTS clues (
  id BIGSERIAL PRIMARY KEY,
  number INTEGER NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('across', 'down')),
  clue_text TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL DEFAULT 'anonymous',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(number, direction)
);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE cells;
ALTER PUBLICATION supabase_realtime ADD TABLE clues;

-- Enable Row Level Security
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;

-- Allow all operations (this is a public collaborative puzzle)
CREATE POLICY "Allow all reads on cells" ON cells FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on cells" ON cells FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on cells" ON cells FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all reads on clues" ON clues FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on clues" ON clues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on clues" ON clues FOR UPDATE USING (true) WITH CHECK (true);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_cells_row_col ON cells(row, col);
CREATE INDEX IF NOT EXISTS idx_clues_num_dir ON clues(number, direction);

-- Pre-populate the clues from the puzzle PDF
-- These are the clues that have text from the original puzzle
INSERT INTO clues (number, direction, clue_text, updated_by) VALUES
  (8, 'across', 'Players on T-Swift''s "Mean"', 'puzzle'),
  (24, 'across', 'One collapsed in 1980 in Washington', 'puzzle'),
  (30, 'across', 'Words heard in Shibuya', 'puzzle'),
  (35, 'across', 'Support that''s also shaped like an H', 'puzzle'),
  (42, 'across', 'Mia in the "Fifty Shades" series', 'puzzle'),
  (48, 'across', 'Cosmetics shop purchase', 'puzzle'),
  (58, 'across', '"___ Ninja" YouTube series', 'puzzle'),
  (64, 'across', 'Start of a Supremes song or end of a Christmas song', 'puzzle'),
  (72, 'across', 'Tatum franchise', 'puzzle'),
  (80, 'across', 'Teammate of Vini and Jude', 'puzzle'),
  (85, 'across', 'Guitarist Harrison', 'puzzle'),
  (92, 'across', 'Leave quickly', 'puzzle'),
  (100, 'across', 'Smartphone powerer', 'puzzle'),
  (106, 'across', 'The Cavaliers', 'puzzle'),
  (113, 'across', 'Anthony''s result vs. Jake', 'puzzle'),
  (120, 'across', 'One of two women named in Spinderella''s trio', 'puzzle'),
  (127, 'across', 'Sounds in the night', 'puzzle'),
  (136, 'across', 'Alpine municipality', 'puzzle'),
  (145, 'across', 'Jungler Moon Hyeon-jun', 'puzzle'),
  (149, 'across', 'Theatricality', 'puzzle'),
  (158, 'across', 'Not one''s best effort', 'puzzle'),
  (165, 'across', 'Amount for Team Trees, Team Seas, or Team Water', 'puzzle'),
  (167, 'across', 'What this puzzle commemorates in eleven words in the theme entries', 'puzzle'),
  (173, 'across', 'One that hangs out at the swimming hole', 'puzzle'),
  (1, 'down', 'Dry comment', 'puzzle'),
  (5, 'down', 'T.I. flick', 'puzzle'),
  (9, 'down', 'Bring Me the Horizon release', 'puzzle'),
  (14, 'down', 'Perry and kin', 'puzzle'),
  (18, 'down', 'Driver who won awards for his Ferrari', 'puzzle'),
  (23, 'down', 'Some sports league contracts, for short', 'puzzle'),
  (37, 'down', 'Takes a hot bath', 'puzzle'),
  (44, 'down', 'Was a little too close', 'puzzle'),
  (52, 'down', 'Japanese streamer, perhaps', 'puzzle'),
  (60, 'down', '___-12 (conference with two members in 2025)', 'puzzle'),
  (69, 'down', 'One who preferred $10,000 sushi to $10 sushi', 'puzzle'),
  (75, 'down', 'Host of the Christmas "Holiday Halftime Party"', 'puzzle'),
  (80, 'down', 'Words before doubling a piece', 'puzzle'),
  (87, 'down', 'One end of the pencil scale', 'puzzle'),
  (96, 'down', 'John B is one', 'puzzle'),
  (108, 'down', 'Motor oil brand', 'puzzle'),
  (116, 'down', 'School where they also say 95-Down', 'puzzle'),
  (124, 'down', 'File productions', 'puzzle'),
  (130, 'down', 'Some cords', 'puzzle'),
  (137, 'down', 'Cotton weave', 'puzzle'),
  (142, 'down', 'Largest European lake', 'puzzle'),
  (152, 'down', 'Prepare mushrooms', 'puzzle'),
  (162, 'down', 'Easy as falling off ___', 'puzzle'),
  (169, 'down', 'NW-based retailer', 'puzzle')
ON CONFLICT (number, direction) DO NOTHING;
