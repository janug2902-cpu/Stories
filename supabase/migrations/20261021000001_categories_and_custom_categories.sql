-- ==============================================================================
-- Migration: Support Bhabhi, Aunty, Padosan, and Dynamic Custom Categories
-- Allows stories table category column to accept any custom writer category
-- ==============================================================================

-- 1. Alter stories.category column to text with default 'romance'
do $$ begin
  alter table public.stories alter column category type text;
exception
  when others then null;
end $$;

-- 2. Add new values to story_category enum if still used
do $$ begin
  alter type story_category add value if not exists 'bhabhi';
  alter type story_category add value if not exists 'aunty';
  alter type story_category add value if not exists 'padosan';
  alter type story_category add value if not exists 'teacher_student';
  alter type story_category add value if not exists 'maid';
  alter type story_category add value if not exists 'travel';
  alter type story_category add value if not exists 'outdoor';
  alter type story_category add value if not exists 'office';
exception
  when others then null;
end $$;
