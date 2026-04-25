/**
 * Re-crops tight individual product photos from the PDF catalog and replaces
 * the per-page placeholder images in Supabase. Run after seed-products.mjs.
 *
 * Source: /tmp/knitd-pdf/hd/p-NN.png (200 DPI renders, 1655x2340)
 * Output: /tmp/knitd-pdf/products/<sku>.png + uploaded to Supabase Storage
 */

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

// Page dimensions at 200 DPI
const PAGE_W = 1655;
const PAGE_H = 2340;

// Generic 2-col grid crop: photo region is left ~43% of each cell with margins
function gridCrop(cols, rows, col, row) {
  const tileW = PAGE_W / cols;
  const tileH = PAGE_H / rows;
  return {
    left: Math.floor(col * tileW + 60),
    top: Math.floor(row * tileH + 40),
    width: Math.floor(tileW * 0.43),
    height: Math.floor(tileH - 80),
  };
}

// Each product: which page + how to crop. Products listed in catalog (visual) order per page.
const PRODUCTS = [
  // Page 3: Corporate Bamboo, 2x4 grid
  { sku: 'STS0347', page: 3, crop: gridCrop(2, 4, 0, 0) },
  { sku: 'STS0348', page: 3, crop: gridCrop(2, 4, 1, 0) },
  { sku: 'STS0354', page: 3, crop: gridCrop(2, 4, 0, 1) },
  { sku: 'STS0350', page: 3, crop: gridCrop(2, 4, 1, 1) },
  { sku: 'STS0349', page: 3, crop: gridCrop(2, 4, 0, 2) },
  { sku: 'STS0351', page: 3, crop: gridCrop(2, 4, 1, 2) },
  { sku: 'STS0352', page: 3, crop: gridCrop(2, 4, 0, 3) },
  { sku: 'STS0353', page: 3, crop: gridCrop(2, 4, 1, 3) },

  // Page 4: 3 gift sets (vertical mixed). Hand-tuned.
  { sku: 'STG101', page: 4, crop: { left: 200, top: 150,  width: 750, height: 600 } },
  { sku: 'STG102', page: 4, crop: { left: 200, top: 850,  width: 1000, height: 700 } },
  { sku: 'STG100', page: 4, crop: { left: 200, top: 1700, width: 750, height: 600 } },

  // Page 6: Corporate Cotton, 2x4 grid
  { sku: 'STC0028',  page: 6, crop: gridCrop(2, 4, 0, 0) },
  { sku: 'STC002A',  page: 6, crop: gridCrop(2, 4, 1, 0) },
  { sku: 'STC002C',  page: 6, crop: gridCrop(2, 4, 0, 1) },
  { sku: 'STS0021F', page: 6, crop: gridCrop(2, 4, 1, 1) },
  { sku: 'STS0087',  page: 6, crop: gridCrop(2, 4, 0, 2) },
  { sku: 'STS0020D', page: 6, crop: gridCrop(2, 4, 1, 2) },
  { sku: 'STS0305',  page: 6, crop: gridCrop(2, 4, 0, 3) },
  { sku: 'STS0306',  page: 6, crop: gridCrop(2, 4, 1, 3) },

  // Page 7: 1 small + 2 large boxes. Hand-tuned.
  { sku: 'STS0027D', page: 7, crop: { left: 200, top: 200,  width: 700, height: 550 } },
  { sku: 'STG057',   page: 7, crop: { left: 180, top: 850,  width: 1100, height: 600 } },
  { sku: 'STG056',   page: 7, crop: { left: 180, top: 1600, width: 1100, height: 600 } },

  // Page 9: Casual Bamboo, 2x4 grid
  { sku: 'STS0333', page: 9, crop: gridCrop(2, 4, 0, 0) },
  { sku: 'STS0334', page: 9, crop: gridCrop(2, 4, 1, 0) },
  { sku: 'STS0335', page: 9, crop: gridCrop(2, 4, 0, 1) },
  { sku: 'STS0337', page: 9, crop: gridCrop(2, 4, 1, 1) },
  { sku: 'STS0338', page: 9, crop: gridCrop(2, 4, 0, 2) },
  { sku: 'STS0345', page: 9, crop: gridCrop(2, 4, 1, 2) },
  { sku: 'STS0358', page: 9, crop: gridCrop(2, 4, 0, 3) },
  { sku: 'STS0359', page: 9, crop: gridCrop(2, 4, 1, 3) },

  // Page 10: 2x4 grid
  { sku: 'STS0360', page: 10, crop: gridCrop(2, 4, 0, 0) },
  { sku: 'STV0126', page: 10, crop: gridCrop(2, 4, 1, 0) },
  { sku: 'STV0127', page: 10, crop: gridCrop(2, 4, 0, 1) },
  { sku: 'STV0129', page: 10, crop: gridCrop(2, 4, 1, 1) },
  { sku: 'STV0130', page: 10, crop: gridCrop(2, 4, 0, 2) },
  { sku: 'STV0128', page: 10, crop: gridCrop(2, 4, 1, 2) },
  { sku: 'STV0131', page: 10, crop: gridCrop(2, 4, 0, 3) },
  { sku: 'STG095',  page: 10, crop: gridCrop(2, 4, 1, 3) },

  // Page 12: Casual Cotton, 2x4 grid
  { sku: 'STS0095',  page: 12, crop: gridCrop(2, 4, 0, 0) },
  { sku: 'STS0111',  page: 12, crop: gridCrop(2, 4, 1, 0) },
  { sku: 'STS0107',  page: 12, crop: gridCrop(2, 4, 0, 1) },
  { sku: 'STS0196',  page: 12, crop: gridCrop(2, 4, 1, 1) },
  { sku: 'STS0116',  page: 12, crop: gridCrop(2, 4, 0, 2) },
  { sku: 'STS0142A', page: 12, crop: gridCrop(2, 4, 1, 2) },
  { sku: 'STS0194',  page: 12, crop: gridCrop(2, 4, 0, 3) },
  { sku: 'STS0339',  page: 12, crop: gridCrop(2, 4, 1, 3) },

  // Page 13: 2 small at top + 2 large boxes at bottom
  { sku: 'STS0209', page: 13, crop: { left: 200,  top: 100,  width: 480, height: 500 } },
  { sku: 'STS0190', page: 13, crop: { left: 870,  top: 100,  width: 480, height: 500 } },
  { sku: 'STG052',  page: 13, crop: { left: 180,  top: 800,  width: 1100, height: 600 } },
  { sku: 'STG104',  page: 13, crop: { left: 180,  top: 1500, width: 1100, height: 600 } },

  // Page 15: Compression Therapy, 2x3 grid
  { sku: 'STC012A', page: 15, crop: gridCrop(2, 3, 0, 0) },
  { sku: 'STC012B', page: 15, crop: gridCrop(2, 3, 1, 0) },
  { sku: 'STC012C', page: 15, crop: gridCrop(2, 3, 0, 1) },
  { sku: 'STC012D', page: 15, crop: gridCrop(2, 3, 1, 1) },
  { sku: 'STC013A', page: 15, crop: gridCrop(2, 3, 0, 2) },
  { sku: 'STC013B', page: 15, crop: gridCrop(2, 3, 1, 2) },

  // Page 17: 2x3 grid (Diabetic Care + Comfort)
  { sku: 'STC014A', page: 17, crop: gridCrop(2, 3, 0, 0) },
  { sku: 'STC014B', page: 17, crop: gridCrop(2, 3, 1, 0) },
  { sku: 'STS0355', page: 17, crop: gridCrop(2, 3, 0, 1) },
  { sku: 'STS0356', page: 17, crop: gridCrop(2, 3, 1, 1) },
  { sku: 'STS0357', page: 17, crop: gridCrop(2, 3, 0, 2) },
  { sku: 'STG103',  page: 17, crop: gridCrop(2, 3, 1, 2) },

  // Page 18: Foot Alignment, 2x2 grid
  { sku: 'STC025A', page: 18, crop: gridCrop(2, 2, 0, 0) },
  { sku: 'STC025B', page: 18, crop: gridCrop(2, 2, 1, 0) },
  { sku: 'STC025C', page: 18, crop: gridCrop(2, 2, 0, 1) },
  { sku: 'STC025D', page: 18, crop: gridCrop(2, 2, 1, 1) },

  // Page 21: Athletic Care, 2x3 grid
  { sku: 'STS0340', page: 21, crop: gridCrop(2, 3, 0, 0) },
  { sku: 'STS0341', page: 21, crop: gridCrop(2, 3, 1, 0) },
  { sku: 'STS0342', page: 21, crop: gridCrop(2, 3, 0, 1) },
  { sku: 'STS0346', page: 21, crop: gridCrop(2, 3, 1, 1) },
  { sku: 'STS0343', page: 21, crop: gridCrop(2, 3, 0, 2) },
  { sku: 'STS0344', page: 21, crop: gridCrop(2, 3, 1, 2) },
];

console.log(`Cropping ${PRODUCTS.length} product photos...`);

// Step 1: crop locally
for (const p of PRODUCTS) {
  const padded = String(p.page).padStart(2, '0');
  const src = `/tmp/knitd-pdf/hd/p-${padded}.png`;
  const out = `/tmp/knitd-pdf/products/${p.sku}.png`;
  // Pad to square white background for consistent card display
  const cropped = await sharp(src).extract(p.crop).toBuffer();
  const meta = await sharp(cropped).metadata();
  const size = Math.max(meta.width, meta.height);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      {
        input: cropped,
        gravity: 'center',
      },
    ])
    .png()
    .toFile(out);
}
console.log(`  done — wrote ${PRODUCTS.length} files to /tmp/knitd-pdf/products/`);

// Step 2: upload each to Supabase Storage and update product_images.url
console.log('\nUploading + updating DB...');
let ok = 0, fail = 0;
for (const p of PRODUCTS) {
  const buf = readFileSync(`/tmp/knitd-pdf/products/${p.sku}.png`);
  const remotePath = `products/${p.sku}.png`;
  const { error: upErr } = await supabase.storage
    .from('product-images')
    .upload(remotePath, buf, { contentType: 'image/png', upsert: true });
  if (upErr) {
    console.log(`  ✗ ${p.sku} upload: ${upErr.message}`);
    fail++;
    continue;
  }
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(remotePath);
  // Find product by variant SKU → product_id, then update its primary image
  const { data: variant } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('sku', p.sku)
    .single();
  if (!variant) {
    console.log(`  ✗ ${p.sku} variant not found`);
    fail++;
    continue;
  }
  const { error: updErr } = await supabase
    .from('product_images')
    .update({ url: urlData.publicUrl, alt_text: p.sku })
    .eq('product_id', variant.product_id)
    .eq('is_primary', true);
  if (updErr) {
    console.log(`  ✗ ${p.sku} update: ${updErr.message}`);
    fail++;
    continue;
  }
  ok++;
}
console.log(`\n${ok} ok, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
