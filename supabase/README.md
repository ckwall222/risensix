# Supabase migrations

Each `.sql` file in `migrations/` represents a schema change. To apply a new migration, paste it into your Supabase project's SQL Editor and run.

## Applying a migration

1. Open https://supabase.com/dashboard
2. Pick the `risensix` project
3. Left sidebar → **SQL Editor** → **+ New query**
4. Paste the entire contents of the migration file
5. Click **Run**
6. Verify "Success. No rows returned" or similar
