/**
 * Quick utility to flip product status / featured flag without going through
 * the admin panel. Useful while admin UI (Phase 8) isn't built yet.
 *
 * Usage:
 *   node scripts/promote-products.mjs --activate-all
 *   node scripts/promote-products.mjs --feature 8
 *   node scripts/promote-products.mjs --reset       # back to draft, no featured
 */

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

const args = process.argv.slice(2);

if (args.includes('--reset')) {
  const { error } = await supabase
    .from('products')
    .update({ status: 'draft', featured: false })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
  console.log('All products reset to draft, featured=false');
}

if (args.includes('--activate-all')) {
  const { count, error } = await supabase
    .from('products')
    .update({ status: 'active' })
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  console.log(`Activated ${count ?? 'all'} products`);
}

const featureIdx = args.indexOf('--feature');
if (featureIdx !== -1) {
  const n = parseInt(args[featureIdx + 1] ?? '8', 10);
  // Clear all featured first
  await supabase
    .from('products')
    .update({ featured: false })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  // Get N active products spread across categories
  const { data } = await supabase
    .from('products')
    .select('id, name, category')
    .eq('status', 'active')
    .order('category')
    .limit(200);
  if (!data || data.length === 0) {
    console.log('No active products to feature');
    process.exit(0);
  }
  // Pick one from each category until we have N
  const byCategory = new Map();
  for (const p of data) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category).push(p);
  }
  const picked = [];
  while (picked.length < n) {
    let added = 0;
    for (const cat of byCategory.values()) {
      if (cat.length > 0 && picked.length < n) {
        picked.push(cat.shift());
        added++;
      }
    }
    if (added === 0) break;
  }
  const ids = picked.map((p) => p.id);
  const { error } = await supabase.from('products').update({ featured: true }).in('id', ids);
  if (error) throw error;
  console.log(`Featured ${picked.length} products:`);
  for (const p of picked) console.log(`  ${p.category.padEnd(24)} ${p.name}`);
}

// Final state
const { data: stats } = await supabase
  .from('products')
  .select('status, featured');
const active = stats?.filter((p) => p.status === 'active').length ?? 0;
const draft = stats?.filter((p) => p.status === 'draft').length ?? 0;
const featured = stats?.filter((p) => p.featured).length ?? 0;
console.log(`\nState: active=${active}, draft=${draft}, featured=${featured}`);
process.exit(0);
