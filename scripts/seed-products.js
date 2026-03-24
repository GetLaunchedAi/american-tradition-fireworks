#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const ROOT = path.resolve(__dirname, "..");
const CONSUMER_XLSX = path.join(ROOT, "Consumer Fireworks.xlsx");
const PRO_XLSX = path.join(ROOT, "Pro Series Fireworks.xlsx");
const WINDA_IMAGES_DIR = path.join(
  ROOT,
  "Winda Images-20260324T205336Z-1-001",
  "Winda Images"
);
const BRIGHT_STAR_IMAGES_DIR = path.join(
  ROOT,
  "Bright Star Images-20260324T205340Z-1-001",
  "Bright Star Images"
);
const DEST_IMAGE_DIR = path.join(ROOT, "src", "images", "products");
const PRODUCTS_JSON_PATH = path.join(ROOT, "src", "_data", "products.json");

const PLACEHOLDER_IMAGE = "/images/placeholder.png";
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokens(value) {
  return new Set(normalizeForMatch(value).split(" ").filter(Boolean));
}

function scoreNameMatch(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1000;
  if (a.includes(b) || b.includes(a)) return 800;

  const aTokens = tokens(a);
  const bTokens = tokens(b);
  if (!aTokens.size || !bTokens.size) return 0;

  let overlap = 0;
  for (const t of aTokens) {
    if (bTokens.has(t)) overlap += 1;
  }

  const union = new Set([...aTokens, ...bTokens]).size;
  const jaccard = union ? overlap / union : 0;
  return Math.round(jaccard * 100);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function listImageFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((name) => IMAGE_EXTS.has(path.extname(name).toLowerCase()))
    .map((name) => ({
      fileName: name,
      absPath: path.join(dirPath, name),
      stem: path.parse(name).name,
      ext: path.extname(name),
    }));
}

function copyImageUnique(sourcePath, destBaseSlug, ext, usedSlugs) {
  let candidate = destBaseSlug || "product";
  let suffix = 2;
  while (usedSlugs.has(candidate)) {
    candidate = `${destBaseSlug}-${suffix}`;
    suffix += 1;
  }
  usedSlugs.add(candidate);
  const outName = `${candidate}${ext.toLowerCase()}`;
  const outPath = path.join(DEST_IMAGE_DIR, outName);
  fs.copyFileSync(sourcePath, outPath);
  return `/images/products/${outName}`;
}

function parseConsumerProducts() {
  const workbook = xlsx.readFile(CONSUMER_XLSX);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  const parsed = [];
  for (const row of rows) {
    const skuRaw = String(row[0] || "").trim();
    const title = String(row[1] || "").trim();
    const category = String(row[4] || "").trim();
    const casePack = String(row[2] || "").trim();
    const youtubeUrl = String(row[5] || "").trim();

    // Keep only real Winda SKUs, skip section headers like "2026 NEW ITEMS".
    if (!/^P\d+[A-Z]?$/i.test(skuRaw)) continue;
    if (!title) continue;

    parsed.push({
      sku: skuRaw.toUpperCase(),
      title,
      slug: slugify(title),
      category,
      casePack,
      youtubeUrl,
      brand: "Winda",
    });
  }
  return parsed;
}

function parseProSeriesProducts() {
  const workbook = xlsx.readFile(PRO_XLSX);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  const parsed = [];
  for (let i = 8; i < rows.length; i += 1) {
    const row = rows[i];
    const skuRaw = String(row[4] || "").trim();
    if (!skuRaw) continue;

    const title = String(row[6] || "").trim();
    if (!title) continue;

    const caliber = String(row[1] || "").trim();
    const shots = String(row[2] || "").trim();
    const rawPrice = row[11];
    const price =
      typeof rawPrice === "number"
        ? rawPrice
        : Number.parseFloat(String(rawPrice || "").replace(/[^0-9.-]/g, "")) ||
          null;
    const youtubeUrl = String(row[16] || "").trim();

    parsed.push({
      sku: skuRaw.toUpperCase(),
      title,
      slug: slugify(title),
      caliber,
      shots,
      price,
      youtubeUrl,
      brand: "Bright Star",
    });
  }
  return parsed;
}

function buildWindaImageMap(imageFiles) {
  const map = new Map();
  for (const img of imageFiles) {
    const skuMatch = img.stem.match(/\b(P\d+[A-Z]?)\b/i);
    if (!skuMatch) continue;
    map.set(skuMatch[1].toUpperCase(), img);
  }
  return map;
}

function pickBestBrightStarImage(title, imageFiles, usedImageNames) {
  const normalizedTitle = normalizeForMatch(title);
  let best = null;
  let bestScore = 0;

  for (const img of imageFiles) {
    if (usedImageNames.has(img.fileName)) continue;
    const normalizedStem = normalizeForMatch(img.stem);
    const score = scoreNameMatch(normalizedTitle, normalizedStem);
    if (score > bestScore) {
      bestScore = score;
      best = img;
    }
  }

  // 40 is a practical floor to avoid bad random matches.
  if (best && bestScore >= 40) return best;
  return null;
}

function main() {
  ensureDir(DEST_IMAGE_DIR);

  const windaProducts = parseConsumerProducts();
  const brightStarProducts = parseProSeriesProducts();
  const allProducts = [...windaProducts, ...brightStarProducts];

  const windaImages = listImageFiles(WINDA_IMAGES_DIR);
  const brightStarImages = listImageFiles(BRIGHT_STAR_IMAGES_DIR);
  const windaBySku = buildWindaImageMap(windaImages);
  const usedImageNames = new Set();
  const usedSlugs = new Set();

  let matchedCount = 0;
  let placeholderCount = 0;

  const seeded = allProducts.map((product) => {
    let matchedImage = null;

    if (product.brand === "Winda") {
      matchedImage = windaBySku.get(product.sku) || null;
    } else {
      matchedImage = pickBestBrightStarImage(
        product.title,
        brightStarImages,
        usedImageNames
      );
    }

    let imagePath = PLACEHOLDER_IMAGE;
    if (matchedImage) {
      usedImageNames.add(matchedImage.fileName);
      imagePath = copyImageUnique(
        matchedImage.absPath,
        product.slug || slugify(`${product.brand}-${product.sku}`),
        matchedImage.ext,
        usedSlugs
      );
      matchedCount += 1;
    } else {
      placeholderCount += 1;
    }

    return {
      ...product,
      image: imagePath,
    };
  });

  const out = { products: seeded };
  fs.writeFileSync(PRODUCTS_JSON_PATH, `${JSON.stringify(out, null, 2)}\n`, "utf8");

  console.log(
    [
      `Seeded products: ${seeded.length}`,
      `Matched images: ${matchedCount}`,
      `Placeholder images: ${placeholderCount}`,
      `Output JSON: ${PRODUCTS_JSON_PATH}`,
      `Output images dir: ${DEST_IMAGE_DIR}`,
    ].join("\n")
  );
}

main();
