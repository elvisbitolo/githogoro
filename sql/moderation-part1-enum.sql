-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/vctuzwuuxwgelrhyomhi/sql/new)
-- Part 1 must run FIRST and by itself: adding an enum value cannot run inside a transaction.

ALTER TYPE "ProfileRole" ADD VALUE IF NOT EXISTS 'moderator';
