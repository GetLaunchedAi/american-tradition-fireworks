// Collection page enhancement:
// - Sort products
// - Filter chips + price chips
// - Refresh from /products.json without rebuild
(function () {
  const plp = document.querySelector('[data-collection-page]');
  if (!plp) return;

  const grid = plp.querySelector('[data-product-grid]');
  const countEl = plp.querySelector('[data-plp-count]');
  const refreshButtons = Array.from(plp.querySelectorAll('[data-products-refresh]'));
  const chips = Array.from(plp.querySelectorAll('[data-filter-chip]'));
  const clearBtn = plp.querySelector('[data-filters-clear]');
  const collectionKey = (plp.getAttribute('data-collection-key') || '').trim();

  const toggleBtn = plp.querySelector('[data-filters-toggle]');
  const closeBtn = plp.querySelector('[data-filters-close]');
  const backdrop = document.querySelector('[data-filters-backdrop]');

  let all = [];

  function readNumber(value) {
    const n = parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function toArr(v) {
    if (Array.isArray(v)) return v.map(String);
    if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  }

  function valuesFor(p) {
    const tags = toArr(p.tags);
    const cols = toArr(p.collections || p.collection || p.categories || []);
    const badges = toArr(p.badges);
    if (p.badge) badges.push(String(p.badge));
    return {
      tags: tags.map((s) => s.toLowerCase()),
      collections: cols.map((s) => s.toLowerCase()),
      badges: badges.map((s) => s.toLowerCase()),
    };
  }

  function inCollection(p) {
    if (!collectionKey) return true;
    const needle = collectionKey.toLowerCase();
    const v = valuesFor(p);
    const category = String(p.category || '').toLowerCase();
    return v.collections.includes(needle) || v.tags.includes(needle) || category === needle;
  }

  function matchesFilter(p, filter) {
    if (!filter) return true;
    const needle = String(filter).toLowerCase();
    const v = valuesFor(p);
    const category = String(p.category || '').toLowerCase();
    const anyIncludes = (arr) => arr.some((x) => x.includes(needle));
    return anyIncludes(v.tags) || anyIncludes(v.collections) || anyIncludes(v.badges) || category.includes(needle);
  }

  function matchesPrice(p, priceKey) {
    if (!priceKey) return true;
    const price = readNumber(p.price);
    if (priceKey === '0-25') return price >= 0 && price <= 25;
    if (priceKey === '25-75') return price >= 25 && price <= 75;
    if (priceKey === '75+') return price >= 75;
    return true;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function productUrl(p) {
    const slug = String(p.slug || p.id || '').trim();
    if (!slug) return '/product/';
    return `/product/?slug=${encodeURIComponent(slug)}`;
  }

  function cardHtml(p, idx) {
    const img = p.image || '/images/placeholder.png';
    const title = p.title || 'Untitled';
    const subtitle = p.subtitle || '';
    const price = p.price || '0.00';
    const compare = p.compareAt ? String(p.compareAt) : '';
    const badgeText = (p.badge && String(p.badge).trim()) || (Array.isArray(p.badges) && p.badges.length ? p.badges[0] : '');
    const badge = badgeText ? `<span class="badge">${escapeHtml(badgeText)}</span>` : '';

    return `
      <article class="product-card" data-title="${escapeHtml(title)}" data-price="${escapeHtml(price)}" data-original-index="${idx}">
        <a class="product-card__link" href="${escapeHtml(productUrl(p))}">
          <div class="product-card__media">
            <img class="product-card__img" src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" />
            ${badge ? `<div class="product-card__badges">${badge}</div>` : ''}
          </div>
          <div class="product-card__body">
            <h3 class="product-card__title">${escapeHtml(title)}</h3>
            ${subtitle ? `<p class="product-card__meta">${escapeHtml(subtitle)}</p>` : ''}
            <div class="product-card__price">
              <span class="price-current">$${escapeHtml(price)}</span>
              ${compare ? `<span class="price-compare">$${escapeHtml(compare)}</span>` : ''}
            </div>
          </div>
        </a>
        <div class="product-card__actions">
          <a class="btn btn-outline btn-sm product-card__quick" href="${escapeHtml(productUrl(p))}">Add to cart</a>
        </div>
      </article>
    `;
  }

  function updateChipState(filter, priceKey) {
    chips.forEach((chip) => {
      const type = chip.getAttribute('data-filter-type');
      const value = chip.getAttribute('data-filter-value');
      const pressed = (type === 'filter' && value === (filter || '')) || (type === 'price' && value === (priceKey || ''));
      chip.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    });
  }

  function setCount(n) {
    if (!countEl) return;
    countEl.textContent = n ? `Showing ${n} item${n === 1 ? '' : 's'}` : 'No products found';
  }

  function sortMode() {
    const sel = plp.querySelector('[data-sort-select]');
    return sel ? (sel.value || 'featured') : 'featured';
  }

  function sortProducts(items, mode) {
    if (mode === 'price-asc') return items.slice().sort((a, b) => readNumber(a.price) - readNumber(b.price));
    if (mode === 'price-desc') return items.slice().sort((a, b) => readNumber(b.price) - readNumber(a.price));
    if (mode === 'title-asc') return items.slice().sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' }));
    if (mode === 'title-desc') return items.slice().sort((a, b) => String(b.title || '').localeCompare(String(a.title || ''), undefined, { sensitivity: 'base' }));
    return items;
  }

  function applyFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter') || '';
    const priceKey = params.get('price') || '';
    updateChipState(filter, priceKey);

    const scoped = all.filter(inCollection);
    const filtered = scoped.filter((p) => matchesFilter(p, filter) && matchesPrice(p, priceKey));
    const sorted = sortProducts(filtered, sortMode());

    if (grid) grid.innerHTML = sorted.map((p, idx) => cardHtml(p, idx)).join('');
    setCount(sorted.length);
  }

  async function fetchProducts() {
    const res = await fetch('/products.json', { cache: 'no-store' });
    const data = await res.json();
    all = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
  }

  async function refresh() {
    try {
      await fetchProducts();
      applyFromUrl();
    } catch (e) {
      // Keep static server-rendered list if refresh fails.
    }
  }

  function setDrawer(open) {
    if (open) {
      document.body.setAttribute('data-filters-open', 'true');
      if (backdrop) backdrop.hidden = false;
    } else {
      document.body.removeAttribute('data-filters-open');
      if (backdrop) backdrop.hidden = true;
    }
  }

  if (toggleBtn) toggleBtn.addEventListener('click', () => setDrawer(true));
  if (closeBtn) closeBtn.addEventListener('click', () => setDrawer(false));
  if (backdrop) backdrop.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setDrawer(false);
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const type = chip.getAttribute('data-filter-type');
      const value = chip.getAttribute('data-filter-value') || '';
      const params = new URLSearchParams(window.location.search);
      const key = type === 'price' ? 'price' : 'filter';
      const current = params.get(key) || '';
      if (current === value) params.delete(key);
      else params.set(key, value);
      const next = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', next);
      applyFromUrl();
      setDrawer(false);
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      window.history.replaceState({}, '', window.location.pathname);
      applyFromUrl();
      setDrawer(false);
    });
  }

  const sortSelects = Array.from(plp.querySelectorAll('[data-sort-select]'));
  sortSelects.forEach((sel) => {
    sel.addEventListener('change', () => {
      sortSelects.forEach((other) => {
        if (other !== sel) other.value = sel.value;
      });
      applyFromUrl();
    });
  });

  refreshButtons.forEach((btn) => btn.addEventListener('click', refresh));

  refresh();
})();
