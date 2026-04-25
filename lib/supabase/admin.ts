import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fail loudly at import time if the project is provisioned but the key is missing.
// We don't throw when BOTH are absent so the module can be imported during
// CI builds that don't have credentials yet.
if (supabaseUrl && !serviceRoleKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is required when NEXT_PUBLIC_SUPABASE_URL is set. ' +
      'Add it to .env.local and restart the server.',
  )
}

// The admin client bypasses Row Level Security — use only in server-side
// contexts that legitimately need elevated access (e.g. webhooks, cron jobs).
export const adminClient: SupabaseClient<Database> = createSupabaseClient<Database>(
  supabaseUrl ?? 'http://localhost:54321',
  serviceRoleKey ?? 'placeholder-key-replace-before-use',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)
