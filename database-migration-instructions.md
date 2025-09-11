# Database Migration Required

The application is missing the `access_level` column in the `predictions` table. This needs to be added manually in your Supabase dashboard.

## Steps to Fix:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `gpfbvyklksfslfdwgrky`
3. Navigate to **SQL Editor** in the left sidebar
4. Run the following SQL command:

```sql
ALTER TABLE predictions ADD COLUMN access_level INTEGER DEFAULT 0;
```

5. Click **Run** to execute the command

## What this fixes:

- Resolves the error: `column predictions.access_level does not exist`
- Allows the predictions feature to work properly
- Adds access level control for different subscription tiers

## Alternative:

If you prefer to recreate the entire database with the updated schema, you can:

1. Go to **Database** > **Tables** in Supabase dashboard
2. Drop the existing `predictions` table (if it exists)
3. Go to **SQL Editor** and run the complete schema from `supabase-schema.sql`

The `supabase-schema.sql` file has been updated to include the `access_level` column for future deployments.