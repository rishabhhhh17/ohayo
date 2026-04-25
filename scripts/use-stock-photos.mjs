/**
 * Replaces all 72 product images with curated Unsplash stock photos.
 * Each photo verified to return 200 from the Unsplash CDN before assignment.
 * Photos chosen by visual match to catalog products (sock type, color, style).
 *
 * IMPORTANT: These are placeholders. Knitd's branded designs (NETFLIX/PEACHY/
 * COFFEE embroidery, gift box specifics) require Knitd's own product photography
 * before paid traffic launches. Replace via admin uploader (Phase 8).
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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Curated photo bundles
const P = {
  blackCrew:     '1484071096222-7936a931e094', // 3 pairs of black socks
  navyCrew:      '1615486364462-ef6363adbc18', // blue and black socks
  greyCrew:      '1613151848917-80e67f421fff', // gray sock white bg
  whiteAthletic: '1631180543602-727e1197619d', // white Nike sock
  whiteSheet:    '1589895869111-cab6bf8354c8', // white socks on bed
  knitCozy:      '1647549897410-3583914a7961', // knitted socks
  woodStack:     '1641399050826-9616c90427bb', // stack on wood
  patternColor: '1759782178780-6b6c54dd42a7',  // colorful patterned socks display
  patternWall:  '1768145439317-5d342971c3df',  // wall display colorful
  blueWhiteYel: '1585499583264-491df5142e83',  // blue white yellow socks
  pinkYellow:   '1564379976409-79bd0786fff1',  // pink and yellow socks
  whiteRedBlue: '1582966772680-860e372bb558',  // white red blue socks
  whiteGreenPk: '1582578598832-4b8d6cdbe9d8',  // white green pink sock
  greenSocks:   '1640026199235-c24aa417b552',  // green socks white
  blackGrey:    '1597843797221-e34b4a320b97',  // black and gray sock
  purpleCasual: '1733410027829-c6622454c8b3',  // purple sock with sneaker
  kneeHigh:     '1561689644-cea27cce046c',     // teal multicolor knee-high
  threePatterned: '1730448111621-c0524e75b0e8',// 3 pairs patterned
  threeWhite:   '1730447619863-5349b3f6db70',  // group of 3 on white
  pairWhite:    '1730448619492-d330f4a46162',  // pair on white
  giftBox4:     '1634283715079-d91bbed0ece0',  // black box with 4 pairs
  giftBox3:     '1641399032315-39f5f79f436b',  // 3 pairs in box
};

const url = (id) =>
  `https://images.unsplash.com/photo-${id}?w=1200&h=1200&fit=crop&crop=entropy&auto=format&q=80`;

// SKU → photo bundle key. Matched by visual style of each catalog product.
const ASSIGN = {
  // Corporate Bamboo p3 — all black crew with embroidery
  STS0347: 'blackCrew', STS0348: 'navyCrew', STS0354: 'blackCrew', STS0350: 'navyCrew',
  STS0349: 'blackCrew', STS0351: 'blackCrew', STS0352: 'navyCrew', STS0353: 'blackCrew',
  // Corporate Bamboo p4 — gift sets
  STG101: 'giftBox3', STG102: 'giftBox4', STG100: 'giftBox3',
  // Corporate Cotton p6 — patterned argyle/geometric/pacman/diamonds
  STC0028: 'navyCrew', STC002A: 'navyCrew', STC002C: 'greyCrew',
  STS0021F: 'patternColor', STS0087: 'patternWall',
  STS0020D: 'patternColor', STS0305: 'whiteRedBlue', STS0306: 'patternWall',
  // Corporate Cotton p7 — Christmas + 2 boxes
  STS0027D: 'pinkYellow', STG057: 'giftBox4', STG056: 'threePatterned',
  // Casual Bamboo p9 — colorful fruit/holiday novelty
  STS0333: 'pinkYellow', STS0334: 'pinkYellow', STS0335: 'patternColor',
  STS0337: 'pinkYellow', STS0338: 'greenSocks', STS0345: 'greenSocks',
  STS0358: 'patternWall', STS0359: 'patternWall',
  // Casual Bamboo p10 — boo + vintage + mystery
  STS0360: 'knitCozy', STV0126: 'pairWhite', STV0127: 'navyCrew',
  STV0129: 'pairWhite', STV0130: 'whiteGreenPk', STV0128: 'greenSocks',
  STV0131: 'blueWhiteYel', STG095: 'giftBox3',
  // Casual Cotton p12 — Hustle/Pizza/Netflix/Avocado/etc
  STS0095: 'blackGrey', STS0111: 'patternColor', STS0107: 'whiteRedBlue',
  STS0196: 'blackCrew', STS0116: 'greenSocks', STS0142A: 'greenSocks',
  STS0194: 'patternWall', STS0339: 'pinkYellow',
  // Casual Cotton p13 — Lobster/Lazy + boxes
  STS0209: 'blackCrew', STS0190: 'whiteGreenPk', STG052: 'threePatterned', STG104: 'giftBox4',
  // Compression Therapy
  STC012A: 'blackCrew', STC012B: 'navyCrew', STC012C: 'greyCrew', STC012D: 'whiteSheet',
  STC013A: 'kneeHigh', STC013B: 'kneeHigh',
  // Diabetic Care
  STC014A: 'blackCrew', STC014B: 'navyCrew',
  STS0355: 'blackCrew', STS0356: 'navyCrew', STS0357: 'knitCozy',
  STG103: 'giftBox3',
  // Foot Alignment — athletic ankle
  STC025A: 'blackGrey', STC025B: 'greyCrew', STC025C: 'blackGrey', STC025D: 'greyCrew',
  // Athletic Care — white athletic
  STS0340: 'whiteAthletic', STS0341: 'whiteAthletic',
  STS0342: 'whiteRedBlue', STS0346: 'whiteSheet',
  STS0343: 'blackGrey', STS0344: 'whiteGreenPk',
};

console.log(`Updating ${Object.keys(ASSIGN).length} product images to Unsplash CDN URLs...`);

let ok = 0, fail = 0;
for (const [sku, photoKey] of Object.entries(ASSIGN)) {
  const photoId = P[photoKey];
  if (!photoId) {
    console.log(`  ✗ ${sku} — unknown bundle "${photoKey}"`);
    fail++;
    continue;
  }
  const photoUrl = url(photoId);
  // Find product via SKU → variant → product_id
  const { data: variant } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('sku', sku)
    .single();
  if (!variant) {
    console.log(`  ✗ ${sku} variant not found`);
    fail++;
    continue;
  }
  const { error } = await supabase
    .from('product_images')
    .update({ url: photoUrl, alt_text: sku })
    .eq('product_id', variant.product_id)
    .eq('is_primary', true);
  if (error) {
    console.log(`  ✗ ${sku} — ${error.message}`);
    fail++;
  } else {
    ok++;
  }
}
console.log(`\n${ok} updated, ${fail} failed`);

// Verify
const { count: total } = await supabase
  .from('product_images')
  .select('*', { count: 'exact', head: true });
console.log(`Total product_images rows: ${total}`);
process.exit(fail > 0 ? 1 : 0);
