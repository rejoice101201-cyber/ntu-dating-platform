-- DropIndex
DROP INDEX "public"."users_email_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "originalEmail" TEXT;
