-- Run this in Supabase SQL Editor to add the description column to existing tasks table
-- (Only needed if you already ran the original schema.sql)

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description text;

-- Also update default coins for NEW signups going forward
-- (existing characters are unaffected — update manually if needed)
-- The trigger already sets coins=100 after you re-run schema.sql
