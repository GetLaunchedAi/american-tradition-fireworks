#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_WORKBOOK = path.join(
  "C:\\",
  "Users",
  "GamingPC",
  "Downloads",
  "Web Site products.xlsx"
);
const WORKBOOK_PATH = process.env.PRODUCTS_WORKBOOK || DEFAULT_WORKBOOK;
const CONSUMER_SUPPLEMENTAL_PATH = path.join(ROOT, "Consumer Fireworks.xlsx");
const LEGACY_JSON_PATH = path.join(ROOT, "src", "_data", "products.json");
const SOURCE_IMAGE_DIR = path.join(ROOT, "src", "images", "products");
const SUPPLIER_IMAGES_DIR = path.join(ROOT, "src", "images", "suppliers");
const PRODUCTION_PICTURES_DIR = path.join(ROOT, "Production Pictures");
const PLACEHOLDER_IMAGE = "/images/placeholder.png";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const IMAGE_STEM_BLACKLIST = new Set(["placeholder"]);

const CATEGORY_MAP = {
  consumer: {
    ROCKETS: "Rockets",
    PARACHUTES: "Parachutes",
    FOUNTAINS: "Fountains/Smoke",
    "ROMAN CANDLES": "Roman Candles",
    "200 GRAM CAKES": "200 Gram Cakes",
    "500 GRAM CAKES": "500 Gram Cakes",
    "PROFESIONAL RACKS": "Professional Racks",
    "LARGE FINALIES": "Large Finales",
    RELOADABLES: "Reloadables",
    FIRECRACKERS: "Firecrackers",
  },
  pro: {
    "225 CAKES": "225 Cakes",
    CAKES: "Cakes",
    "NEW EFFECTS CAKES": "New Effects Cakes",
    "COMPOUND CAKES": "Compound Cakes",
    SLICES: "Fan Cake Slices",
  },
};

const GENERIC_FALLBACKS = {
  "compound cakes": "party-pyro-pack-256-s-p5585a-nishiki-finale-p5585b-gold-willow-finale-p5585c-brocade-finale-p5585d-flower-crown-finale",
  "new effects cakes": "confetti-cake-30-s",
  cakes: "confetti-cake-30-s",
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function cleanText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function canonicalSku(raw) {
  const compact = cleanText(raw).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!compact) return "";
  if (/^\d{3,5}[A-Z]{0,2}$/.test(compact)) return `P${compact}`;
  if (/^[A-Z]{1,3}\d{3,5}[A-Z]{0,2}$/.test(compact)) return compact;
  return "";
}

function toNumber(value) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function packCountFromCasePackText(value) {
  const text = cleanText(value);
  if (!text) return null;
  const first = text.split("/")[0];
  return toNumber(first);
}

function roundMoney(value) {
  if (value === null || typeof value === "undefined" || Number.isNaN(value)) return null;
  return Math.round(Number(value) * 100) / 100;
}

function formatStockState(onHand, onOrder) {
  const hand = Number(onHand || 0);
  const order = Number(onOrder || 0);
  if (hand > 0) return { stockState: "in-stock", stockLabel: "In stock" };
  if (order > 0) return { stockState: "waiting-for-stock", stockLabel: "Waiting for stock" };
  return { stockState: "out-of-stock", stockLabel: "Out of stock" };
}

function isValidVideoUrl(value) {
  const text = cleanText(value);
  return /youtu\.be\/|youtube\.com\//i.test(text) ? text : "";
}

function legacyMaps(legacyProducts) {
  const bySku = new Map();
  const bySlug = new Map();
  const byTitle = new Map();

  for (const product of legacyProducts) {
    if (!product || typeof product !== "object") continue;
    const sku = canonicalSku(product.sku);
    const slug = slugify(product.slug || product.title || "");
    const title = normalizeText(product.title);

    if (sku) bySku.set(sku, product);
    if (slug) bySlug.set(slug, product);
    if (title) byTitle.set(title, product);
  }

  return { bySku, bySlug, byTitle };
}

function lookupLegacy(legacyIndex, sku, title) {
  const skuKey = canonicalSku(sku);
  if (skuKey && legacyIndex.bySku.has(skuKey)) return legacyIndex.bySku.get(skuKey);

  const titleKey = normalizeText(title);
  if (titleKey && legacyIndex.byTitle.has(titleKey)) return legacyIndex.byTitle.get(titleKey);

  const slugKey = slugify(title);
  if (slugKey && legacyIndex.bySlug.has(slugKey)) return legacyIndex.bySlug.get(slugKey);

  return null;
}

function buildConsumerSupplementalIndex() {
  if (!fs.existsSync(CONSUMER_SUPPLEMENTAL_PATH)) return new Map();

  const workbook = xlsx.readFile(CONSUMER_SUPPLEMENTAL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const index = new Map();

  for (let r = 2; r < rows.length; r += 1) {
    const row = rows[r] || [];
    const sku = canonicalSku(row[0]);
    if (!sku) continue;

    index.set(sku, {
      sku,
      title: cleanText(row[1]),
      casePack: cleanText(row[2]),
      onOrder: toNumber(row[3]),
      category: cleanText(row[4]),
      youtubeUrl: isValidVideoUrl(row[5]),
    });
  }

  return index;
}

function walkFiles(dirPath) {
  const files = [];
  if (!fs.existsSync(dirPath)) return files;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function buildImageIndex() {
  ensureDir(SOURCE_IMAGE_DIR);

  const index = new Map();
  for (const filePath of [
    ...walkFiles(SOURCE_IMAGE_DIR),
    ...walkFiles(PRODUCTION_PICTURES_DIR),
    ...walkFiles(SUPPLIER_IMAGES_DIR),
  ]) {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue;

    let resolvedPath = filePath;
    if (!resolvedPath.startsWith(SOURCE_IMAGE_DIR)) {
      const targetPath = path.join(SOURCE_IMAGE_DIR, fileName);
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(resolvedPath, targetPath);
      }
      resolvedPath = targetPath;
    }

    const entry = {
      fileName,
      absPath: resolvedPath,
      webPath: `/images/products/${fileName}`,
    };

    const stem = path.parse(fileName).name;
    const stemKey = slugify(stem);
    if (stemKey && !IMAGE_STEM_BLACKLIST.has(stemKey) && !index.has(stemKey)) {
      index.set(stemKey, entry);
    }

    const skuMatches = stem.match(/[A-Z]{0,3}\d{3,5}[A-Z]{0,2}/gi) || [];
    for (const match of skuMatches) {
      const canonical = canonicalSku(match);
      const variants = [canonical];
      if (/^P\d{3,5}[A-Z]$/.test(canonical)) {
        variants.push(canonical.slice(0, -1));
      }

      for (const variant of variants) {
        const skuKey = slugify(variant);
        if (skuKey && !index.has(skuKey)) {
          index.set(skuKey, entry);
        }
      }
    }
  }
  return index;
}

function moveProductionPhotos(imageIndex) {
  if (!fs.existsSync(PRODUCTION_PICTURES_DIR)) return { moved: 0, availableSkus: new Set() };

  let moved = 0;
  const availableSkus = new Set();
  for (const entry of fs.readdirSync(PRODUCTION_PICTURES_DIR, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue;

    const stem = slugify(path.parse(entry.name).name);
    if (stem) availableSkus.add(stem.toUpperCase());

    const source = path.join(PRODUCTION_PICTURES_DIR, entry.name);
    const target = path.join(SOURCE_IMAGE_DIR, entry.name);
    if (fs.existsSync(target)) {
      fs.copyFileSync(source, target);
      fs.unlinkSync(source);
    } else {
      fs.renameSync(source, target);
    }
    moved += 1;

    const key = slugify(path.parse(entry.name).name);
    if (key && !imageIndex.has(key)) {
      imageIndex.set(key, {
        fileName: entry.name,
        absPath: target,
        webPath: `/images/products/${entry.name}`,
      });
    }
  }

  if (!fs.readdirSync(PRODUCTION_PICTURES_DIR).length) {
    fs.rmdirSync(PRODUCTION_PICTURES_DIR);
  }

  return { moved, availableSkus };
}

function parseWorkbook() {
  if (!fs.existsSync(WORKBOOK_PATH)) {
    throw new Error(`Workbook not found: ${WORKBOOK_PATH}`);
  }

  const workbook = xlsx.readFile(WORKBOOK_PATH);
  const legacy = readJson(LEGACY_JSON_PATH) || { products: [] };
  const legacyIndex = legacyMaps(Array.isArray(legacy.products) ? legacy.products : []);
  const consumerSupplemental = buildConsumerSupplementalIndex();
  const imageIndex = buildImageIndex();
  const { moved } = moveProductionPhotos(imageIndex);

  const products = [];
  const usedSlugs = new Set();
  const seenSkus = new Set();
  const seenTitleGroups = new Map();
  const duplicateSkus = [];
  const duplicateTitleGroups = [];

  function uniqueSlug(base, sku) {
    const initial = slugify(base) || slugify(sku) || "product";
    let candidate = initial;
    let counter = 2;
    while (usedSlugs.has(candidate)) {
      candidate = `${initial}-${counter}`;
      counter += 1;
    }
    usedSlugs.add(candidate);
    return candidate;
  }

  function titleGroupKey(title, group) {
    const normalizedTitle = normalizeText(title);
    const normalizedGroup = normalizeText(group);
    if (!normalizedTitle || !normalizedGroup) return "";
    return `${normalizedTitle}|${normalizedGroup}`;
  }

  function isDuplicateSku(sku, sheetName, rowNumber, title) {
    const skuKey = canonicalSku(sku);
    if (!skuKey) return false;
    if (!seenSkus.has(skuKey)) return false;

    duplicateSkus.push({
      sheetName,
      rowNumber,
      sku: skuKey,
      title: cleanText(title),
    });
    return true;
  }

  function addProduct(product, sheetName, rowNumber) {
    const skuKey = canonicalSku(product.sku);
    if (skuKey) {
      seenSkus.add(skuKey);
    }

    const duplicateKey = titleGroupKey(product.title, product.group);
    if (duplicateKey) {
      const existing = seenTitleGroups.get(duplicateKey);
      if (existing) {
        duplicateTitleGroups.push({
          sheetName,
          rowNumber,
          sku: cleanText(product.sku),
          title: cleanText(product.title),
          group: cleanText(product.group),
          existing,
        });
      } else {
        seenTitleGroups.set(duplicateKey, {
          sheetName,
          rowNumber,
          sku: cleanText(product.sku),
          title: cleanText(product.title),
        });
      }
    }

    products.push(product);
  }

  function resolveImage(product, legacyRecord) {
    const candidates = [];

    if (legacyRecord && legacyRecord.image) {
      candidates.push(legacyRecord.image);
    }

    if (product.sku) {
      candidates.push(product.sku);
      candidates.push(product.sku.toLowerCase());
    }

    if (product.slug) {
      candidates.push(product.slug);
    }

    if (product.title) {
      candidates.push(slugify(product.title));
    }

    if (legacyRecord && legacyRecord.slug) {
      candidates.push(slugify(legacyRecord.slug));
    }

    for (const candidate of candidates) {
      const stem = slugify(String(candidate).split("/").pop().replace(/\.[^.]+$/, ""));
      if (!stem || IMAGE_STEM_BLACKLIST.has(stem)) continue;
      const match = imageIndex.get(stem);
      if (match) return match.webPath;
    }

    const fallbackKey = normalizeText(product.category);
    if (fallbackKey && GENERIC_FALLBACKS[fallbackKey]) {
      const fallbackStem = GENERIC_FALLBACKS[fallbackKey];
      const fallback = imageIndex.get(slugify(fallbackStem));
      if (fallback) return fallback.webPath;
    }

    return PLACEHOLDER_IMAGE;
  }

  function titleFromRow(rowTitle, legacyRecord) {
    const legacyTitle = cleanText(legacyRecord && legacyRecord.title);
    if (legacyTitle) return legacyTitle;
    return cleanText(rowTitle);
  }

  function baseProduct({
    sku,
    title,
    section,
    group,
    brand,
    packCase,
    casePackText,
    onHand,
    onOrder,
    priceEa,
    casePrice,
    youtubeUrl,
    legacyRecord,
    description,
    badge,
  }) {
    const titleValue = titleFromRow(title, legacyRecord);
    const slug = legacyRecord && legacyRecord.slug ? slugify(legacyRecord.slug) : uniqueSlug(titleValue, sku);
    const stock = formatStockState(onHand, onOrder);
    const cleanedGroup = cleanText(group);
    const cleanedCategory = cleanText(section);
    const legacyImage = legacyRecord && legacyRecord.image && !legacyRecord.image.endsWith("placeholder.png")
      ? legacyRecord.image
      : "";

    const next = {
      id: sku,
      sku,
      title: titleValue,
      slug,
      brand: cleanText(brand),
      description: cleanText(description || (legacyRecord && legacyRecord.description) || ""),
      group: cleanedGroup,
      category: cleanedCategory,
      subcategory: cleanedCategory,
      collections: [cleanedGroup, cleanedCategory].filter(Boolean),
      categories: [cleanedGroup, cleanedCategory].filter(Boolean),
      tags: [cleanedGroup, cleanedCategory, cleanText(brand), stock.stockState].filter(Boolean),
      packCase: packCase === null || typeof packCase === "undefined" ? null : packCase,
      casePack: casePackText
        || (legacyRecord && legacyRecord.casePack ? cleanText(legacyRecord.casePack) : "")
        || (packCase === null || typeof packCase === "undefined" ? "" : `${packCase}/1`),
      onHand: onHand === null || typeof onHand === "undefined" ? null : onHand,
      onOrder: onOrder === null || typeof onOrder === "undefined" ? null : onOrder,
      priceEa: priceEa === null || typeof priceEa === "undefined" ? null : roundMoney(priceEa),
      casePrice: casePrice === null || typeof casePrice === "undefined" ? null : roundMoney(casePrice),
      price: priceEa === null || typeof priceEa === "undefined" ? null : roundMoney(priceEa),
      youtubeUrl: isValidVideoUrl(youtubeUrl || (legacyRecord && legacyRecord.youtubeUrl)),
      videoUrl: isValidVideoUrl(youtubeUrl || (legacyRecord && legacyRecord.youtubeUrl)),
      image: legacyImage || PLACEHOLDER_IMAGE,
      stockState: stock.stockState,
      stockLabel: stock.stockLabel,
      badge: badge || cleanText(legacyRecord && legacyRecord.badge),
      badges: [...new Set([
        ...(Array.isArray(legacyRecord && legacyRecord.badges) ? legacyRecord.badges.map(cleanText).filter(Boolean) : []),
        badge ? cleanText(badge) : "",
      ].filter(Boolean))],
      requiresDocumentation: group.startsWith("Professional") || group.startsWith("Display"),
      restrictionNotice: group.startsWith("Display")
        ? "Display fireworks require a federal explosive license and proper storage."
        : group.startsWith("Professional")
          ? "Professional fireworks require a PGI/certified training course or a federal explosive license to purchase."
          : "",
    };

    next.image = resolveImage(next, legacyRecord);
    if (!next.badges.length) delete next.badges;
    if (!next.badge) delete next.badge;
    if (!next.restrictionNotice) delete next.restrictionNotice;

    return next;
  }

  function parseConsumerSheet() {
    const sheet = workbook.Sheets["Consumer 1.4"];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    let section = "";

    for (let r = 6; r < rows.length; r += 1) {
      const row = rows[r] || [];
      const a = cleanText(row[0]);
      const b = cleanText(row[1]);
      const c = row[2];
      const d = row[3];
      const e = row[4];
      const f = cleanText(row[5]);
      const badge = normalizeText(f) === "new" ? "New" : "";

      if (a && !b && !canonicalSku(a)) {
        section = CATEGORY_MAP.consumer[normalizeText(a).toUpperCase()] || cleanText(a);
        continue;
      }

      const sku = canonicalSku(a);
      if (!sku || !b) continue;
      if (isDuplicateSku(sku, "Consumer 1.4", r + 1, b)) continue;
      const legacyRecord = lookupLegacy(legacyIndex, sku, b);
      const supplemental = consumerSupplemental.get(sku) || null;
      const packCase = toNumber(c);
      const onHand = toNumber(d);
      const priceEa = toNumber(e) ?? toNumber(legacyRecord && (legacyRecord.priceEa ?? legacyRecord.price));
      const casePrice = priceEa !== null && packCase !== null ? roundMoney(priceEa * packCase) : toNumber(legacyRecord && legacyRecord.casePrice);

      addProduct(
        baseProduct({
          sku,
          title: b,
          section: section || "Consumer",
          group: "Consumer Fireworks 1.4g",
          brand: "Winda",
          packCase: packCase ?? packCountFromCasePackText(supplemental && supplemental.casePack),
          casePackText: supplemental && supplemental.casePack ? cleanText(supplemental.casePack) : "",
          onHand,
          onOrder: toNumber(supplemental && supplemental.onOrder) ?? toNumber(legacyRecord && legacyRecord.onOrder),
          priceEa,
          casePrice,
          youtubeUrl: supplemental && supplemental.youtubeUrl,
          legacyRecord,
          description: supplemental && supplemental.category ? supplemental.category : "",
          badge,
        }),
        "Consumer 1.4",
        r + 1
      );
    }
  }

  function parseProSheet() {
    const sheet = workbook.Sheets["Pro Series 1.4"];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    let section = "";

    for (let r = 2; r < rows.length; r += 1) {
      const row = rows[r] || [];
      const a = cleanText(row[0]);
      const b = cleanText(row[1]);
      const c = row[2];
      const d = row[3];
      const e = row[4];
      const g = cleanText(row[6]);
      const h = row[7];
      const j = row[9];
      const k = row[10];
      const z = row[25];
      const aa = row[26];

      if (a && !b && !cleanText(c) && !cleanText(d) && !cleanText(e)) {
        section = CATEGORY_MAP.pro[normalizeText(a).toUpperCase()] || cleanText(a);
        continue;
      }

      const sku = canonicalSku(a);
      if (!sku || !b) continue;
      if (isDuplicateSku(sku, "Pro Series 1.4", r + 1, b)) continue;

      const legacyRecord = lookupLegacy(legacyIndex, sku, b);
      const packCase = toNumber(h);
      const onHand = toNumber(k);
      const onOrder = toNumber(j);
      const priceEa = toNumber(aa) ?? toNumber(legacyRecord && (legacyRecord.priceEa ?? legacyRecord.price));
      const casePrice = toNumber(z) ?? (priceEa !== null && packCase !== null ? roundMoney(priceEa * packCase) : null);

      addProduct(
        baseProduct({
          sku,
          title: b,
          section: section || "Cakes",
          group: "Professional Fireworks 1.4g",
          brand: "Bright Star",
          packCase,
          casePackText: packCase === null || typeof packCase === "undefined" ? "" : `${packCase}/1`,
          onHand,
          onOrder,
          priceEa,
          casePrice,
          youtubeUrl: legacyRecord && legacyRecord.youtubeUrl,
          legacyRecord,
          description: g,
        }),
        "Pro Series 1.4",
        r + 1
      );
    }
  }

  parseConsumerSheet();
  parseProSheet();

  const out = {
    generatedAt: new Date().toISOString(),
    sourceWorkbook: path.basename(WORKBOOK_PATH),
    products,
  };

  fs.writeFileSync(LEGACY_JSON_PATH, `${JSON.stringify(out, null, 2)}\n`, "utf8");

  console.log([
    `Workbook: ${WORKBOOK_PATH}`,
    `Products: ${products.length}`,
    `Production photos moved: ${moved}`,
    `Duplicate SKUs skipped: ${duplicateSkus.length}`,
    `Duplicate title/group warnings: ${duplicateTitleGroups.length}`,
    `Output: ${LEGACY_JSON_PATH}`,
  ].join("\n"));
}

parseWorkbook();
