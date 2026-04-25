// Quick calibration: crop tile (0,0) and (1,3) from page 3 HD render
import sharp from 'sharp';

const W = 1655, H = 2340;
const pageW = W, pageH = H;
const cols = 2, rows = 4;
const tileW = Math.floor(pageW / cols);
const tileH = Math.floor(pageH / rows);

// Photo region within tile: left ~50% with margins
const photoMarginX = 60;
const photoMarginY = 40;
const photoW = Math.floor(tileW * 0.5);
const photoH = Math.floor(tileH - 80);

for (const [col, row, label] of [[0, 0, 'cal-r0c0'], [1, 0, 'cal-r0c1'], [0, 3, 'cal-r3c0'], [1, 3, 'cal-r3c1']]) {
  const left = col * tileW + photoMarginX;
  const top = row * tileH + photoMarginY;
  await sharp('/tmp/knitd-pdf/hd/p-03.png')
    .extract({ left, top, width: photoW, height: photoH })
    .toFile(`/tmp/knitd-pdf/${label}.png`);
  console.log(`${label}: extract { left:${left} top:${top} w:${photoW} h:${photoH} }`);
}
