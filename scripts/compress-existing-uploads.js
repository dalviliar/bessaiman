#!/usr/bin/env node
// One-time cleanup: recompress product/partner photos uploaded before the
// automatic resize/compression was added to the upload routes. Overwrites
// files in place (same filename), so DB rows and public URLs are untouched.
//
// Usage (from the project root, on the server): node scripts/compress-existing-uploads.js

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const TARGETS = [
  { dir: path.join(process.cwd(), 'public', 'uploads', 'products'), maxDim: 1920 },
  { dir: path.join(process.cwd(), 'uploads', 'products'), maxDim: 1920 },
  { dir: path.join(process.cwd(), 'public', 'uploads', 'partners'), maxDim: 800 },
  { dir: path.join(process.cwd(), 'uploads', 'partners'), maxDim: 800 },
]

const MIN_SIZE_TO_TOUCH = 300 * 1024 // skip files that are already small

async function compressFile(filePath, maxDim) {
  const ext = path.extname(filePath).slice(1).toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext)) return null

  const before = fs.statSync(filePath).size
  if (before < MIN_SIZE_TO_TOUCH) return null

  const input = fs.readFileSync(filePath)
  let pipeline = sharp(input)
    .rotate()
    .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
  if (ext === 'jpg' || ext === 'jpeg') pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true })
  else if (ext === 'png') pipeline = pipeline.png({ compressionLevel: 9 })
  else if (ext === 'webp') pipeline = pipeline.webp({ quality: 82 })
  else pipeline = pipeline.avif({ quality: 60 })

  const output = await pipeline.toBuffer()
  if (output.length >= before) return null // no gain - leave the original alone
  fs.writeFileSync(filePath, output)
  return { before, after: output.length }
}

async function main() {
  let totalBefore = 0
  let totalAfter = 0
  let count = 0

  for (const { dir, maxDim } of TARGETS) {
    if (!fs.existsSync(dir)) continue
    for (const name of fs.readdirSync(dir)) {
      const filePath = path.join(dir, name)
      if (!fs.statSync(filePath).isFile()) continue
      try {
        const result = await compressFile(filePath, maxDim)
        if (result) {
          count++
          totalBefore += result.before
          totalAfter += result.after
          console.log(
            `${path.relative(process.cwd(), filePath)}: ${(result.before / 1024).toFixed(0)}KB -> ${(result.after / 1024).toFixed(0)}KB`
          )
        }
      } catch (err) {
        console.error(`FAILED ${filePath}:`, err instanceof Error ? err.message : err)
      }
    }
  }

  console.log(
    `\nDone. ${count} file(s) recompressed. ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`
  )
}

main()
