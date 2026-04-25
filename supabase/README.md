# Supabase — Applying Migrations

## Migration files

| File | Purpose |
|------|---------|
| `migrations/0001_init.sql` | Schema: tables, enums, indexes, functions, triggers |
| `migrations/0002_rls.sql` | Row Level Security policies |
| `migrations/0003_storage.sql` | `product-images` storage bucket + storage RLS |
| `seed.sql` | Placeholder — populated in Phase 3 |

---

## Option A — Via Supabase CLI (recommended for future pushes)

```bash
# One-time: link your local repo to your Supabase project
supabase link --project-ref <your-project-ref>

# Push all pending migrations
supabase db push
```

> **Note:** For the initial provisioning, prefer Option B below (direct psql) so
> you have full visibility into each migration step. Reserve `supabase db push`
> for subsequent schema changes once the project is confirmed healthy.

---

## Option B — Direct via psql (recommended for initial setup)

Get your connection string from:
**Supabase Dashboard → Project Settings → Database → Connection string → URI**

```bash
export DB_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"

psql "$DB_URL" -f supabase/migrations/0001_init.sql
psql "$DB_URL" -f supabase/migrations/0002_rls.sql
psql "$DB_URL" -f supabase/migrations/0003_storage.sql
```

All three files are idempotent — safe to re-run if anything fails mid-way.

---

## Generating TypeScript types

After the migrations are applied, replace the stub types file:

```bash
supabase gen types typescript --project-id <your-project-id> > types/database.ts
```

---

## Promoting a user to admin

```sql
UPDATE public.profiles
SET    role = 'admin'
WHERE  id   = '<user-uuid>';
```

You can find a user's UUID in **Dashboard → Authentication → Users**.

---

## Notes on guest carts

Guest cart rows (`user_id IS NULL`) bypass RLS and must be created/read via
**server actions using the `service_role` key**. The Supabase anon key + RLS
is used only for authenticated-user cart operations. This is documented inline
in `0002_rls.sql`.
