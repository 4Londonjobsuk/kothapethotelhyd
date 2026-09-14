-- Migration 012: Enquiries Status Constraint Update
-- Project: Lotus Grand Hotel
-- Description: Safely updates the enquiries status check constraint to support
--              'confirmed' alongside 'new', 'contacted', and 'closed'.
-- Safety: Non-destructive, idempotent, preserves all existing records.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop any existing check constraint on the status column of enquiries table
    FOR r IN (
        SELECT conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
          AND rel.relname = 'enquiries'
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) LIKE '%status%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.enquiries DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Add updated check constraint supporting 'new', 'contacted', 'confirmed', and 'closed'
ALTER TABLE public.enquiries
  ADD CONSTRAINT enquiries_status_check
  CHECK (status IN ('new', 'contacted', 'confirmed', 'closed'));

-- Document allowed statuses
COMMENT ON COLUMN public.enquiries.status IS 'Enquiry processing status: new, contacted, confirmed, closed';
