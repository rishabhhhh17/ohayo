/**
 * Seeds the Knitd product catalog into Supabase from the PDF catalog.
 *
 * Source data: `/Users/rishabhkapadia17/Downloads/Knitd.pdf` — 72 products
 * across 8 categories. Names + SKUs + prices were extracted by visually
 * inspecting page renders (`/tmp/knitd-pdf/page-NN.png`).
 *
 * Image strategy (v1): each product on a given page shares that page's full
 * render as a placeholder image. All products are seeded `status='draft'` so
 * they don't render on the storefront. Admin replaces images and flips status
 * to 'active' in the Phase 8 admin panel.
 *
 * Idempotent. Re-run any time. Pass `--dry-run` to skip uploads/inserts and
 * just print what would happen.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';

const DRY_RUN = process.argv.includes('--dry-run');

// -----------------------------------------------------------------------------
// Env loading
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// Catalog data — extracted by visual inspection of /tmp/knitd-pdf/page-NN.png
// Prices in INR, will be converted to paise (×100) on insert.
// -----------------------------------------------------------------------------
const PRODUCTS = [
  // ─── Corporate Bamboo (page 3) ───────────────────────────────────────────
  { name: 'Sock Market', sku: 'STS0347', price: 399, page: 3, category: 'Corporate Bamboo' },
  { name: 'Coffee Please', sku: 'STS0348', price: 399, page: 3, category: 'Corporate Bamboo' },
  { name: 'Locked In', sku: 'STS0354', price: 399, page: 3, category: 'Corporate Bamboo' },
  { name: 'I Need Space', sku: 'STS0350', price: 399, page: 3, category: 'Corporate Bamboo' },
  { name: 'Here for the Wifi', sku: 'STS0349', price: 399, page: 3, category: 'Corporate Bamboo' },
  { name: 'Lost / Have Control', sku: 'STS0351', price: 399, page: 3, category: 'Corporate Bamboo' },
  { name: 'Run to Home', sku: 'STS0352', price: 399, page: 3, category: 'Corporate Bamboo' },
  { name: 'No Patience', sku: 'STS0353', price: 399, page: 3, category: 'Corporate Bamboo' },

  // ─── Corporate Bamboo gift sets (page 4) ─────────────────────────────────
  { name: 'Corp Toes FUN', sku: 'STG101', price: 1299, page: 4, category: 'Corporate Bamboo' },
  { name: 'Corp Toes for ALL', sku: 'STG102', price: 2999, page: 4, category: 'Corporate Bamboo' },
  { name: 'Corp Toes SRS', sku: 'STG100', price: 1299, page: 4, category: 'Corporate Bamboo' },

  // ─── Corporate Cotton (page 6) ───────────────────────────────────────────
  { name: 'Classic Argyle', sku: 'STC0028', price: 299, page: 6, category: 'Corporate Cotton' },
  { name: 'Classic Argyle', sku: 'STC002A', price: 299, page: 6, category: 'Corporate Cotton' },
  { name: 'Classic Argyle', sku: 'STC002C', price: 299, page: 6, category: 'Corporate Cotton' },
  { name: 'The Geometrics', sku: 'STS0021F', price: 299, page: 6, category: 'Corporate Cotton' },
  { name: 'Pacman', sku: 'STS0087', price: 299, page: 6, category: 'Corporate Cotton' },
  { name: 'Diamonds Are Forever', sku: 'STS0020D', price: 299, page: 6, category: 'Corporate Cotton' },
  { name: 'One of Every Stripe', sku: 'STS0305', price: 299, page: 6, category: 'Corporate Cotton' },
  { name: 'Cascading Colors', sku: 'STS0306', price: 299, page: 6, category: 'Corporate Cotton' },

  // ─── Corporate Cotton (page 7) ───────────────────────────────────────────
  { name: 'Christmas Snowball', sku: 'STS0027D', price: 299, page: 7, category: 'Corporate Cotton' },
  { name: 'Cool Colors Box of 4', sku: 'STG057', price: 999, page: 7, category: 'Corporate Cotton' },
  { name: 'Motif Maniac Box of 4', sku: 'STG056', price: 999, page: 7, category: 'Corporate Cotton' },

  // ─── Casual Bamboo (page 9) ──────────────────────────────────────────────
  { name: 'Clementine', sku: 'STS0333', price: 399, page: 9, category: 'Casual Bamboo' },
  { name: 'Peachy', sku: 'STS0334', price: 399, page: 9, category: 'Casual Bamboo' },
  { name: 'BerryXX', sku: 'STS0335', price: 399, page: 9, category: 'Casual Bamboo' },
  { name: 'Mon Cherrie', sku: 'STS0337', price: 399, page: 9, category: 'Casual Bamboo' },
  { name: 'Avo', sku: 'STS0338', price: 399, page: 9, category: 'Casual Bamboo' },
  { name: 'Kiwi', sku: 'STS0345', price: 399, page: 9, category: 'Casual Bamboo' },
  { name: 'Haunted Manor', sku: 'STS0358', price: 399, page: 9, category: 'Casual Bamboo' },
  { name: 'Jack-O-Sox', sku: 'STS0359', price: 399, page: 9, category: 'Casual Bamboo' },

  // ─── Casual Bamboo / Vintage (page 10) ───────────────────────────────────
  { name: 'Boo-Toes', sku: 'STS0360', price: 399, page: 10, category: 'Casual Bamboo' },
  { name: 'Crustie', sku: 'STV0126', price: 299, page: 10, category: 'Casual Bamboo' },
  { name: 'Seafarer', sku: 'STV0127', price: 299, page: 10, category: 'Casual Bamboo' },
  { name: 'Firaze', sku: 'STV0129', price: 299, page: 10, category: 'Casual Bamboo' },
  { name: 'Twinklish', sku: 'STV0130', price: 299, page: 10, category: 'Casual Bamboo' },
  { name: 'Sunkissed', sku: 'STV0128', price: 299, page: 10, category: 'Casual Bamboo' },
  { name: 'Yachty', sku: 'STV0131', price: 299, page: 10, category: 'Casual Bamboo' },
  { name: 'Mystery Box Lakuba Pack of 2', sku: 'STG095', price: 699, page: 10, category: 'Casual Bamboo' },

  // ─── Casual Cotton (page 12) ─────────────────────────────────────────────
  { name: 'Hustle', sku: 'STS0095', price: 299, page: 12, category: 'Casual Cotton' },
  { name: 'Pizza is Bae', sku: 'STS0111', price: 299, page: 12, category: 'Casual Cotton' },
  { name: 'Netflix and Chill', sku: 'STS0107', price: 299, page: 12, category: 'Casual Cotton' },
  { name: 'Netflix and Chill', sku: 'STS0196', price: 299, page: 12, category: 'Casual Cotton' },
  { name: 'Hold My Avocado', sku: 'STS0116', price: 299, page: 12, category: 'Casual Cotton' },
  { name: 'Kiwi', sku: 'STS0142A', price: 299, page: 12, category: 'Casual Cotton' },
  { name: 'You Make My Life Colorful', sku: 'STS0194', price: 299, page: 12, category: 'Casual Cotton' },
  { name: 'Corporate Citrus', sku: 'STS0339', price: 399, page: 12, category: 'Casual Cotton' },

  // ─── Casual Cotton (page 13) ─────────────────────────────────────────────
  { name: "You're My Lobster", sku: 'STS0209', price: 299, page: 13, category: 'Casual Cotton' },
  { name: 'Lazy AF', sku: 'STS0190', price: 299, page: 13, category: 'Casual Cotton' },
  { name: 'Live to Eat Box of 4', sku: 'STG052', price: 999, page: 13, category: 'Casual Cotton' },
  { name: 'Happy Vibes Box of 4', sku: 'STG104', price: 999, page: 13, category: 'Casual Cotton' },

  // ─── Compression Therapy (page 15) ───────────────────────────────────────
  { name: 'Compression Black', sku: 'STC012A', price: 399, page: 15, category: 'Compression Therapy' },
  { name: 'Compression Navy', sku: 'STC012B', price: 399, page: 15, category: 'Compression Therapy' },
  { name: 'Compression Grey', sku: 'STC012C', price: 399, page: 15, category: 'Compression Therapy' },
  { name: 'Compression White', sku: 'STC012D', price: 399, page: 15, category: 'Compression Therapy' },
  { name: 'Over the Calf Grey', sku: 'STC013A', price: 499, page: 15, category: 'Compression Therapy' },
  { name: 'Over the Calf Blue', sku: 'STC013B', price: 499, page: 15, category: 'Compression Therapy' },

  // ─── Diabetic Care (page 17) ─────────────────────────────────────────────
  { name: 'Solids for Diabetes', sku: 'STC014A', price: 399, page: 17, category: 'Diabetic Care' },
  { name: 'Solids for Diabetes', sku: 'STC014B', price: 399, page: 17, category: 'Diabetic Care' },
  { name: 'Comfort Socks Black', sku: 'STS0355', price: 399, page: 17, category: 'Diabetic Care' },
  { name: 'Comfort Socks Navy', sku: 'STS0356', price: 399, page: 17, category: 'Diabetic Care' },
  { name: 'Comfort Socks Stone', sku: 'STS0357', price: 399, page: 17, category: 'Diabetic Care' },
  { name: 'Comfort Box Pack of 3', sku: 'STG103', price: 1299, page: 17, category: 'Diabetic Care' },

  // ─── Foot Alignment (page 18) ────────────────────────────────────────────
  { name: 'Foot Alignment Black', sku: 'STC025A', price: 499, page: 18, category: 'Foot Alignment' },
  { name: 'Foot Alignment Grey', sku: 'STC025B', price: 499, page: 18, category: 'Foot Alignment' },
  { name: 'Foot Alignment Black', sku: 'STC025C', price: 499, page: 18, category: 'Foot Alignment' },
  { name: 'Foot Alignment Grey', sku: 'STC025D', price: 499, page: 18, category: 'Foot Alignment' },

  // ─── Athletic Care (page 21) ─────────────────────────────────────────────
  { name: 'Peachy', sku: 'STS0340', price: 399, page: 21, category: 'Athletic Care' },
  { name: 'Gym Brat', sku: 'STS0341', price: 399, page: 21, category: 'Athletic Care' },
  { name: 'Please Leave Me Alone', sku: 'STS0342', price: 399, page: 21, category: 'Athletic Care' },
  { name: 'Please Leave Me Alone', sku: 'STS0346', price: 399, page: 21, category: 'Athletic Care' },
  { name: 'Less Crying More Trying', sku: 'STS0343', price: 399, page: 21, category: 'Athletic Care' },
  { name: 'Create Explore Expand Conquer', sku: 'STS0344', price: 399, page: 21, category: 'Athletic Care' },
];

// -----------------------------------------------------------------------------
// Slug generation with disambiguation
// -----------------------------------------------------------------------------
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const slugCounts = new Map();
for (const p of PRODUCTS) {
  const base = slugify(p.name);
  slugCounts.set(base, (slugCounts.get(base) || 0) + 1);
}
const seen = new Map();
for (const p of PRODUCTS) {
  const base = slugify(p.name);
  if (slugCounts.get(base) > 1) {
    p.slug = `${base}-${p.sku.toLowerCase()}`;
  } else {
    p.slug = base;
  }
  if (seen.has(p.slug)) {
    throw new Error(`Duplicate slug after disambiguation: ${p.slug}`);
  }
  seen.set(p.slug, true);
}

// -----------------------------------------------------------------------------
// Dry-run summary
// -----------------------------------------------------------------------------
function printSummary() {
  const byCategory = new Map();
  for (const p of PRODUCTS) {
    byCategory.set(p.category, (byCategory.get(p.category) || 0) + 1);
  }
  console.log(`\nTotal products: ${PRODUCTS.length}\n`);
  console.log('By category:');
  for (const [cat, n] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(24)} ${n}`);
  }
  console.log('\nSample 10 rows:');
  for (const p of PRODUCTS.slice(0, 10)) {
    console.log(`  ${p.slug.padEnd(34)} ${p.sku.padEnd(10)} ₹${p.price.toString().padStart(5)} ${p.category}`);
  }
}

// -----------------------------------------------------------------------------
// Upload page renders to Supabase Storage
// -----------------------------------------------------------------------------
async function uploadPageImages() {
  const pageNumbers = [...new Set(PRODUCTS.map((p) => p.page))].sort((a, b) => a - b);
  const urlByPage = new Map();

  for (const pageNum of pageNumbers) {
    const padded = String(pageNum).padStart(2, '0');
    const localPath = `/tmp/knitd-pdf/page-${padded}.png`;
    if (!existsSync(localPath)) {
      throw new Error(`Missing page render: ${localPath}`);
    }
    const buf = readFileSync(localPath);
    const remotePath = `pages/page-${padded}.png`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(remotePath, buf, { contentType: 'image/png', upsert: true });
    if (error) throw new Error(`upload page-${padded}: ${error.message}`);
    const { data } = supabase.storage.from('product-images').getPublicUrl(remotePath);
    urlByPage.set(pageNum, data.publicUrl);
    console.log(`  uploaded pages/page-${padded}.png`);
  }

  return urlByPage;
}

// -----------------------------------------------------------------------------
// Insert products + variants + images
// -----------------------------------------------------------------------------
async function seedProducts(urlByPage) {
  let inserted = 0;
  let skipped = 0;
  for (const p of PRODUCTS) {
    const productRow = {
      slug: p.slug,
      name: p.name,
      description: '',
      base_price: p.price * 100,
      compare_at_price: null,
      status: 'draft',
      category: p.category,
      gender: 'unisex',
      featured: false,
      sort_order: 0,
    };

    // 1. Upsert product (conflict on slug)
    const { data: prod, error: prodErr } = await supabase
      .from('products')
      .upsert(productRow, { onConflict: 'slug' })
      .select('id')
      .single();
    if (prodErr) {
      console.log(`  ✗ ${p.slug} — ${prodErr.message}`);
      skipped++;
      continue;
    }

    // 2. Upsert default variant (conflict on sku)
    const { error: varErr } = await supabase
      .from('product_variants')
      .upsert(
        {
          product_id: prod.id,
          size: 'M',
          color_name: 'Default',
          color_hex: '#1A1A1A',
          sku: p.sku,
          stock_quantity: 0,
        },
        { onConflict: 'sku' },
      );
    if (varErr) {
      console.log(`  ✗ ${p.slug} variant — ${varErr.message}`);
    }

    // 3. Replace primary image (delete then insert to satisfy partial unique idx)
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', prod.id)
      .eq('is_primary', true);
    const { error: imgErr } = await supabase.from('product_images').insert({
      product_id: prod.id,
      url: urlByPage.get(p.page),
      alt_text: p.name,
      sort_order: 0,
      is_primary: true,
    });
    if (imgErr) {
      console.log(`  ✗ ${p.slug} image — ${imgErr.message}`);
    }

    inserted++;
  }
  return { inserted, skipped };
}

// -----------------------------------------------------------------------------
// Verify counts
// -----------------------------------------------------------------------------
async function verify() {
  const tables = ['products', 'product_variants', 'product_images'];
  console.log('\nDB row counts:');
  for (const t of tables) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(`  ${t.padEnd(20)} ${count}`);
  }
  console.log('\nProducts by category:');
  const { data } = await supabase.from('products').select('category');
  if (data) {
    const counts = {};
    for (const r of data) counts[r.category] = (counts[r.category] || 0) + 1;
    for (const [cat, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${cat.padEnd(24)} ${n}`);
    }
  }
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
console.log(`Knitd seed — ${PRODUCTS.length} products${DRY_RUN ? ' [DRY RUN]' : ''}`);
printSummary();

if (DRY_RUN) {
  console.log('\n(dry-run — no DB writes)');
  process.exit(0);
}

console.log('\nUploading page images…');
const urlByPage = await uploadPageImages();

console.log('\nSeeding products…');
const { inserted, skipped } = await seedProducts(urlByPage);
console.log(`\n${inserted} inserted, ${skipped} skipped`);

await verify();
process.exit(0);
