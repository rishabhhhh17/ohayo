// Round-2 crop fixes for products with very small photos (page 13 top + page 19).
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

const FIXES = [
  // Page 13 top-row tiny photos
  { sku: 'STS0209', page: 13, crop: { left: 140,  top: 60,   width: 240, height: 280 } },
  { sku: 'STS0190', page: 13, crop: { left: 970,  top: 60,   width: 240, height: 280 } },
  // Page 19 Foot Alignment 2x2: photos are small at top of each cell
  { sku: 'STC025A', page: 19, crop: { left: 110,  top: 70,   width: 290, height: 350 } },
  { sku: 'STC025B', page: 19, crop: { left: 937,  top: 70,   width: 290, height: 350 } },
  { sku: 'STC025C', page: 19, crop: { left: 110,  top: 1240, width: 290, height: 350 } },
  { sku: 'STC025D', page: 19, crop: { left: 937,  top: 1240, width: 290, height: 350 } },
];

for (const f of FIXES) {
  const padded = String(f.page).padStart(2, '0');
  const cropped = await sharp(`/tmp/knitd-pdf/hd/p-${padded}.png`).extract(f.crop).toBuffer();
  const meta = await sharp(cropped).metadata();
  const size = Math.max(meta.width, meta.height);
  const out = `/tmp/knitd-pdf/products/${f.sku}.png`;
  await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: cropped, gravity: 'center' }])
    .png()
    .toFile(out);
  const buf = readFileSync(out);
  await supabase.storage
    .from('product-images')
    .upload(`products/${f.sku}.png`, buf, { contentType: 'image/png', upsert: true });
  const { data: url } = supabase.storage.from('product-images').getPublicUrl(`products/${f.sku}.png`);
  const { data: variant } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('sku', f.sku)
    .single();
  await supabase
    .from('product_images')
    .update({ url: `${url.publicUrl}?v=${Date.now()}` })
    .eq('product_id', variant.product_id)
    .eq('is_primary', true);
  console.log(`  ✓ ${f.sku}`);
}
process.exit(0);
