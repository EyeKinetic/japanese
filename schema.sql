-- schema.sql
-- Run this in the Supabase SQL Editor to set up your progression database.

-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- 'shreyas' or 'dushyant'
    name TEXT NOT NULL,
    level TEXT DEFAULT 'N5',
    streak INTEGER DEFAULT 0,
    vocab_learned INTEGER DEFAULT 0,
    kanji_learned INTEGER DEFAULT 0,
    grammar_learned INTEGER DEFAULT 0,
    quizzes_taken INTEGER DEFAULT 0,
    quiz_accuracy NUMERIC DEFAULT 0,
    xp INTEGER DEFAULT 0,
    current_lesson INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. No default profiles inserted.
-- The app will dynamically create profiles when users enter their given name.

-- 3. Enabling Row Level Security (RLS)
-- For a learning project, we can allow public access for simplicity, 
-- or you can secure it later with Auth.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to read and update (for dev purposes)
CREATE POLICY "Public Read/Write" ON public.profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);
