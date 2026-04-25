// Fixes specific SKUs whose initial crop got the wrong page region.
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, mkdirSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

mkdirSync('/tmp/knitd-pdf/products', { recursive: true });

// Hand-tuned fixes for SKUs whose original crops were wrong.
// HD page is 1655x2340.
const FIXES = [
  // Page 4 — STG102 Corp Toes for ALL: text on left, 9-sock grid on right
  { sku: 'STG102', page: 4,  crop: { left: 720,  top: 830,  width: 900,  height: 720 } },

  // Page 7 — Christmas Snowball is a small product centered top
  { sku: 'STS0027D', page: 7, crop: { left: 230,  top: 30,   width: 360,  height: 420 } },
  // Page 7 — Cool Colors box: text on left, big photo on right
  { sku: 'STG057',   page: 7, crop: { left: 460,  top: 800,  width: 1000, height: 720 } },
  // Page 7 — Motif Maniac box: photo on left, verify
  { sku: 'STG056',   page: 7, crop: { left: 160,  top: 1500, width: 1050, height: 720 } },

  // Page 13 — small products at top
  { sku: 'STS0209',  page: 13, crop: { left: 130,  top: 30,   width: 380, height: 420 } },
  { sku: 'STS0190',  page: 13, crop: { left: 850,  top: 30,   width: 380, height: 420 } },
  // Page 13 — Live to Eat: text on left, photo on right
  { sku: 'STG052',   page: 13, crop: { left: 540,  top: 750,  width: 950, height: 800 } },
  // Page 13 — Happy Vibes: photo on left
  { sku: 'STG104',   page: 13, crop: { left: 140,  top: 1450, width: 1000, height: 750 } },

  // Page 19 (NOT 18) — Foot Alignment products in 2x2 grid
  { sku: 'STC025A', page: 19, crop: { left: 240,  top: 80,   width: 480, height: 540 } },
  { sku: 'STC025B', page: 19, crop: { left: 1000, top: 80,   width: 480, height: 540 } },
  { sku: 'STC025C', page: 19, crop: { left: 240,  top: 1240, width: 480, height: 540 } },
  { sku: 'STC025D', page: 19, crop: { left: 1000, top: 1240, width: 480, height: 540 } },
];

console.log(`Re-cropping ${FIXES.length} products with corrected coords...`);

for (const f of FIXES) {
  const padded = String(f.page).padStart(2, '0');
  const src = `/tmp/knitd-pdf/hd/p-${padded}.png`;
  const out = `/tmp/knitd-pdf/products/${f.sku}.png`;
  const cropped = await sharp(src).extract(f.crop).toBuffer();
  const meta = await sharp(cropped).metadata();
  const size = Math.max(meta.width, meta.height);
  await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: cropped, gravity: 'center' }])
    .png()
    .toFile(out);

  // Upload + update DB
  const buf = readFileSync(out);
  const remotePath = `products/${f.sku}.png`;
  const { error: upErr } = await supabase.storage
    .from('product-images')
    .upload(remotePath, buf, { contentType: 'image/png', upsert: true });
  if (upErr) {
    console.log(`  ✗ ${f.sku} upload: ${upErr.message}`);
    continue;
  }
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(remotePath);
  const { data: variant } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('sku', f.sku)
    .single();
  if (!variant) continue;
  await supabase
    .from('product_images')
    .update({ url: `${urlData.publicUrl}?v=${Date.now()}`, alt_text: f.sku })
    .eq('product_id', variant.product_id)
    .eq('is_primary', true);
  console.log(`  ✓ ${f.sku}`);
}
console.log('done');
process.exit(0);
