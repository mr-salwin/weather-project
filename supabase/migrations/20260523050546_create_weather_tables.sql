/*
  # Create Weather App Tables

  1. New Tables
    - `saved_locations`
      - `id` (uuid, primary key)
      - `name` (text, city/location name)
      - `country` (text, country code)
      - `latitude` (numeric, latitude coordinate)
      - `longitude` (numeric, longitude coordinate)
      - `is_default` (boolean, default location flag)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
  
  2. Security
    - Enable RLS on `saved_locations` table
    - Add policies for authenticated users to manage their own locations
    - Add policy for anonymous reads (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS saved_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text DEFAULT '',
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own locations
CREATE POLICY "Users can view own locations"
  ON saved_locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own locations
CREATE POLICY "Users can insert own locations"
  ON saved_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own locations
CREATE POLICY "Users can update own locations"
  ON saved_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own locations
CREATE POLICY "Users can delete own locations"
  ON saved_locations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_saved_locations_user_id ON saved_locations(user_id);