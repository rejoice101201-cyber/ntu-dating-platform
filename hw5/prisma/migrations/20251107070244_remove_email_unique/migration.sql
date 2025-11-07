-- Remove unique constraint from email column to allow multiple users with same email from different OAuth providers
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";