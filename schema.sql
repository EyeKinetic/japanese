-- schema.sql
-- FORCE REFRESH: This will ensure the schema is exactly as required for the new Auth system.
-- Run this in the Supabase SQL Editor to fix "uuid = text" mismatch errors.

DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    level TEXT DEFAULT 'N5',
    streak INTEGER DEFAULT 0,
    vocab_learned INTEGER DEFAULT 0,
    kanji_learned INTEGER DEFAULT 0,
    grammar_learned INTEGER DEFAULT 0,
    quizzes_taken INTEGER DEFAULT 0,
    quiz_accuracy NUMERIC DEFAULT 100,
    xp INTEGER DEFAULT 0,
    current_lesson INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- 3. Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 4. Anyone can view usernames and XP for the leaderboard
CREATE POLICY "Leaderboard visibility" ON public.profiles
    FOR SELECT
    USING (true);

-- Trigger to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();

