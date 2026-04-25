import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
if (error) {
  console.error('listUsers error:', error.message);
  process.exit(1);
}

const unconfirmed = data.users.filter((u) => !u.email_confirmed_at);
console.log(`Total users: ${data.users.length}`);
console.log(`Unconfirmed: ${unconfirmed.length}`);

for (const u of unconfirmed) {
  const { error: updateErr } = await supabase.auth.admin.updateUserById(u.id, {
    email_confirm: true,
  });
  if (updateErr) {
    console.log(`✗ ${u.email}  (${u.id})  — ${updateErr.message}`);
  } else {
    console.log(`✓ ${u.email}  (${u.id})  — confirmed`);
  }
}

// Show all users with confirmation state
console.log('\nAll users:');
const { data: refreshed } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
for (const u of refreshed.users) {
  const flag = u.email_confirmed_at ? '✓' : '✗';
  console.log(`  ${flag} ${u.email}  ${u.id}`);
}
