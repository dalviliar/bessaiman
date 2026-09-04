// One-off generator for app/opengraph-image.png — run with `node scripts/gen-og-image.js`.
// Next.js's dynamic ImageResponse (next/og) crashes at build time on this
// Windows machine (a Windows-specific path bug inside the bundled
// @vercel/og/resvg native module), so we bake a static PNG once instead and
// let Next.js's plain "opengraph-image.png in app/" convention serve it —
// no runtime generation involved, so the bug never gets a chance to run.
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const logo = fs.readFileSync(path.join(__dirname, '..', 'public', 'logo-full-white.png'))
const logoB64 = logo.toString('base64')

const W = 1200, H = 630
const logoW = 640, logoH = Math.round(640 * 396 / 1600)
const logoX = (W - logoW) / 2
const logoY = 210

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0B1220"/>
      <stop offset="0.55" stop-color="#0F172A"/>
      <stop offset="1" stop-color="#1E293B"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <image x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" href="data:image/png;base64,${logoB64}"/>
  <text x="${W / 2}" y="${logoY + logoH + 70}" text-anchor="middle"
    font-family="Arial, sans-serif" font-weight="700" font-size="28" letter-spacing="3"
    fill="#93C5FD">ЛАБОРАТОРНОЕ ОБОРУДОВАНИЕ · КАЗАХСТАН</text>
</svg>
`

sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(__dirname, '..', 'app', 'opengraph-image.png'))
  .then(() => console.log('written app/opengraph-image.png'))
  .catch(err => { console.error(err); process.exit(1) })
