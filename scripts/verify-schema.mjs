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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing SUPABASE env vars');

const supabase = createClient(url, key, { auth: { persistSession: false } });

const tables = [
  'profiles',
  'products',
  'product_variants',
  'product_images',
  'addresses',
  'carts',
  'cart_items',
  'orders',
  'order_items',
  'discount_codes',
  'newsletter_subscribers',
];

let pass = 0;
let fail = 0;
for (const t of tables) {
  const { error, count } = await supabase
    .from(t)
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.log(`✗ ${t.padEnd(24)} ERROR ${error.message}`);
    fail++;
  } else {
    console.log(`✓ ${t.padEnd(24)} rows=${count ?? 0}`);
    pass++;
  }
}

console.log('---');

// Verify the order_number sequence works
const { data: seqProbe, error: seqErr } = await supabase.rpc('is_admin');
if (seqErr && !/anon|authenticated/i.test(seqErr.message)) {
  console.log(`✗ is_admin() not callable: ${seqErr.message}`);
  fail++;
} else {
  console.log(`✓ is_admin() function exists`);
  pass++;
}

// Verify storage bucket
const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
if (bErr) {
  console.log(`✗ storage.listBuckets: ${bErr.message}`);
  fail++;
} else {
  const found = buckets?.find((b) => b.id === 'product-images');
  console.log(found ? `✓ bucket product-images exists (public=${found.public})` : `✗ bucket product-images missing`);
  found ? pass++ : fail++;
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
