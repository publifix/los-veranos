// One-off asset pipeline: generates responsive WebP/JPG images plus
// favicons/OG image from the source photography in assets/source/.
// Re-run with `node scripts/optimize-images.mjs` whenever source photos change.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve("assets/source");
const OUT = path.resolve("public/images");

const PHOTOS = [
  { file: "cabanas-aframe-terraza-rio.jpg", widths: [1920, 1200, 640] },
  { file: "interior-cabana-aframe.jpg", widths: [1200, 640] },
  { file: "cabana-noche-luces-calidas.jpg", widths: [1920, 1200, 640] },
  { file: "rio-cabanas-vegetacion.jpg", widths: [1920, 1200, 640] },
];

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function buildPhoto({ file, widths }) {
  const name = path.basename(file, path.extname(file));
  const input = path.join(SRC, file);
  for (const width of widths) {
    const webpOut = path.join(OUT, `${name}-${width}.webp`);
    const jpgOut = path.join(OUT, `${name}-${width}.jpg`);
    await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 68 }).toFile(webpOut);
    await sharp(input).resize({ width, withoutEnlargement: true }).jpeg({ quality: 76, mozjpeg: true }).toFile(jpgOut);
    console.log("built", webpOut, jpgOut);
  }
}

async function buildDetailCrop() {
  // Editorial detail crop (both A-frame rooflines against sky/canopy) used
  // in the gallery mosaic instead of the raw wide shot, which centers on a
  // taped-up holiday decoration inappropriate for an evergreen brand site.
  const input = path.join(SRC, "cabanas-aframe-terraza-rio.jpg");
  const meta = await sharp(input).metadata();
  const left = Math.round(meta.width * 0.3);
  const width = Math.min(meta.width - left, Math.round(meta.width * 0.45));
  const height = Math.min(meta.height, Math.round(meta.height * 0.55));
  const cropped = sharp(input).extract({ left, top: 0, width, height });
  const name = "cabanas-aframe-techos-detalle";
  for (const w of [900, 640]) {
    await cropped.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 70 }).toFile(path.join(OUT, `${name}-${w}.webp`));
    await cropped.clone().resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(OUT, `${name}-${w}.jpg`));
  }
  console.log("built", name);
}

async function buildLogoAndFavicons() {
  const input = path.join(SRC, "logo-cabanas-los-veranos.jpg");
  // Circular badge crop: the source photo is the emblem centered on a
  // slate-blue square, so a plain resize keeps it usable everywhere the
  // brand mark appears (header, favicons, manifest, apple touch icon).
  await sharp(input).resize(512, 512).png().toFile(path.join(OUT, "logo-512.png"));
  await sharp(input).resize(256, 256).webp({ quality: 90 }).toFile(path.join(OUT, "logo-256.webp"));
  await sharp(input).resize(256, 256).jpeg({ quality: 88 }).toFile(path.join(OUT, "logo-256.jpg"));

  const publicRoot = path.resolve("public");
  await sharp(input).resize(32, 32).png().toFile(path.join(publicRoot, "favicon-32.png"));
  await sharp(input).resize(16, 16).png().toFile(path.join(publicRoot, "favicon-16.png"));
  await sharp(input).resize(180, 180).png().toFile(path.join(publicRoot, "apple-touch-icon.png"));
  await sharp(input).resize(192, 192).png().toFile(path.join(publicRoot, "icon-192.png"));
  await sharp(input).resize(512, 512).png().toFile(path.join(publicRoot, "icon-512.png"));
  console.log("built favicons + logo assets");
}

async function buildOgImage() {
  // 1200x630 OG/Twitter card cropped from the hero photograph.
  const input = path.join(SRC, "cabanas-aframe-terraza-rio.jpg");
  await sharp(input)
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.resolve("public/og-image.jpg"));
  console.log("built og-image.jpg");
}

async function main() {
  await ensureDir(OUT);
  for (const photo of PHOTOS) {
    await buildPhoto(photo);
  }
  await buildDetailCrop();
  await buildLogoAndFavicons();
  await buildOgImage();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
