// Collection page enhancement:
// - Sort products
// - Search by keyword
// - Filter by badges, price, and category
// - Refresh from /products.json without rebuild
(function () {
  const plp = document.querySelector('[data-collection-page]');
  if (!plp) return;

  const grid = plp.querySelector('[data-product-grid]');
  const countEl = plp.querySelector('[data-plp-count]');
  const activeFiltersEl = plp.querySelector('[data-active-filters]');
  const categoryChipsEl = plp.querySelector('[data-category-chips]');
  const embeddedProductsEl = plp.querySelector('[data-products-json]');
  const searchInputs = Array.from(plp.querySelectorAll('[data-search-input]'));
  const refreshButtons = Array.from(plp.querySelectorAll('[data-products-refresh]'));
  const clearBtn = plp.querySelector('[data-filters-clear]');
  const collectionKey = (plp.getAttribute('data-collection-key') || '').trim();

  const toggleBtn = plp.querySelector('[data-filters-toggle]');
  const closeBtn = plp.querySelector('[data-filters-close]');
  const backdrop = document.querySelector('[data-filters-backdrop]');
  const sortSelects = Array.from(plp.querySelectorAll('[data-sort-select]'));
  const CATEGORY_ALIASES = new Map([
    ['350g cake', '350g Cake'],
    ['350g cake, assorted case', '350g Cake, Assorted Case'],
    ['500g cake', '500g Cake'],
    ['500g cake, assorted case', '500g Cake, Assorted Case'],
    ['air spinner', 'Air Spinners'],
    ['air spinners', 'Air Spinners'],
    ['artillery shell', 'Artillery Shells'],
    ['artillery shells', 'Artillery Shells'],
    ['assorted case', 'Assorted Case'],
    ['roman candle', 'Roman Candles'],
    ['roman candles', 'Roman Candles'],
  ]);

  let all = [];
  let searchTimer = 0;

  function readEmbeddedProducts() {
    if (!embeddedProductsEl) return [];

    try {
      const parsed = JSON.parse(embeddedProductsEl.textContent || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function readNumber(value) {
    const n = parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function money(value) {
    const n = readNumber(value);
    return Number.isFinite(n) ? n.toFixed(2) : '';
  }

  function cleanText(value) {
    return String(value || '')
      .normalize('NFKC')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeText(value) {
    return cleanText(value).toLowerCase();
  }

  function normalizeSearchText(value) {
    return normalizeText(value)
      .replace(/['"]/g, '')
      .replace(/[&+./-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function toArr(value) {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') {
      return cleanText(value).split(',').map((entry) => entry.trim()).filter(Boolean);
    }
    return [];
  }

  function formatCategory(value) {
    const cleaned = cleanText(value);
    if (!cleaned) return '';
    return CATEGORY_ALIASES.get(normalizeText(cleaned)) || cleaned;
  }

  function categoryKey(value) {
    return normalizeText(formatCategory(value));
  }

  function valuesFor(product) {
    const tags = toArr(product.tags);
    const collections = toArr(product.collections || product.collection || product.categories || []);
    const badges = toArr(product.badges);
    if (product.badge) badges.push(String(product.badge));

    return {
      tags: tags.map(normalizeText),
      collections: collections.map(normalizeText),
      badges: badges.map(normalizeText),
    };
  }

  function inCollection(product) {
    if (!collectionKey) return true;
    const needle = normalizeText(collectionKey);
    const values = valuesFor(product);
    const category = normalizeText(product.category);
    return values.collections.includes(needle) || values.tags.includes(needle) || category === needle;
  }

  function matchesFilter(product, filter) {
    if (!filter) return true;
    const needle = normalizeText(filter);
    const values = valuesFor(product);
    const category = normalizeText(product.category);
    const includesNeedle = (entries) => entries.some((entry) => entry.includes(needle));
    return includesNeedle(values.tags) || includesNeedle(values.collections) || includesNeedle(values.badges) || category.includes(needle);
  }

  function matchesPrice(product, priceKey) {
    if (!priceKey) return true;
    const price = readNumber(product.priceEa ?? product.price);
    if (priceKey === '0-25') return price >= 0 && price <= 25;
    if (priceKey === '25-75') return price >= 25 && price <= 75;
    if (priceKey === '75+') return price >= 75;
    return true;
  }

  function matchesCategory(product, category) {
    if (!category) return true;
    return categoryKey(product.category) === categoryKey(category);
  }

  function matchesQuery(product, query) {
    if (!query) return true;

    const values = valuesFor(product);
    const haystack = normalizeSearchText([
      product.title,
      product.subtitle,
      product.slug,
      product.sku,
      product.brand,
      product.group,
      product.category,
      product.casePack,
      product.packCase,
      product.priceEa,
      product.casePrice,
      product.badge,
      product.stockLabel,
      product.restrictionNotice,
      values.tags.join(' '),
      values.collections.join(' '),
      values.badges.join(' '),
    ].join(' '));

    return haystack.includes(normalizeSearchText(query));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function productUrl(product) {
    const slug = String(product.slug || product.id || '').trim();
    if (!slug) return '/product/';
    return `/product/?slug=${encodeURIComponent(slug)}`;
  }

  function badgeMarkup(product) {
    const labels = toArr(product.badges);
    if (!labels.length && product.badge) labels.push(String(product.badge));
    if (!labels.length) return '';

    return `
      <div class="product-card__badges">
        ${labels.map((label) => {
          const lower = label.toLowerCase();
          let cls = 'badge--neutral';
          if (lower.includes('sale')) cls = 'badge--sale';
          if (lower.includes('new')) cls = 'badge--new';
          if (lower.includes('best')) cls = 'badge--best';
          return `<span class="badge ${cls}">${escapeHtml(label)}</span>`;
        }).join('')}
      </div>
    `;
  }

  function cardHtml(product, idx) {
    const img = product.image || '/images/placeholder.png';
    const title = product.title || 'Untitled';
    const subtitle = product.subtitle || '';
    const group = formatCategory(product.group) || product.brand || '';
    const category = formatCategory(product.category) || '';
    const priceEa = product.priceEa ?? product.price;
    const casePrice = product.casePrice ?? '';
    const packCase = product.packCase ?? product.casePack ?? '';
    const stockLabel = product.stockLabel || '';
    const stockState = product.stockState || '';

    return `
      <article class="product-card" data-title="${escapeHtml(title)}" data-price="${escapeHtml(priceEa || 0)}" data-stock-state="${escapeHtml(stockState)}" data-original-index="${idx}">
        <a class="product-card__link" href="${escapeHtml(productUrl(product))}">
          <div class="product-card__media">
            <img class="product-card__img" src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" />
            ${badgeMarkup(product)}
            ${product.youtubeUrl ? '<span class="product-card__video-chip">Video</span>' : ''}
          </div>
          <div class="product-card__body">
            ${group ? `<p class="product-card__eyebrow">${escapeHtml(group)}</p>` : ''}
            <h3 class="product-card__title">${escapeHtml(title)}</h3>
            ${category ? `<p class="product-card__meta">${escapeHtml(category)}</p>` : ''}
            ${subtitle ? `<p class="product-card__meta">${escapeHtml(subtitle)}</p>` : ''}
            <div class="product-card__facts">
              ${packCase ? `<span>Pack/Case: ${escapeHtml(packCase)}</span>` : ''}
              ${stockLabel ? `<span class="product-card__stock product-card__stock--${escapeHtml(stockState)}">${escapeHtml(stockLabel)}</span>` : ''}
            </div>
            <div class="product-card__price">
              <div class="product-card__price-row">
                ${priceEa !== '' && priceEa !== null && typeof priceEa !== 'undefined'
                  ? `<span class="price-current">Each $${escapeHtml(money(priceEa))}</span>`
                  : '<span class="price-current price-current--unset">Call for pricing</span>'}
                ${casePrice ? `<span class="price-case">Case $${escapeHtml(money(casePrice))}</span>` : ''}
              </div>
            </div>
          </div>
        </a>
        <div class="product-card__actions">
          <a class="btn btn-outline btn-sm product-card__quick" href="${escapeHtml(productUrl(product))}">View product</a>
          ${product.youtubeUrl ? `<a class="btn btn-ghost btn-sm product-card__video-link" href="${escapeHtml(productUrl(product))}#pdpVideoContainer">Video</a>` : ''}
        </div>
      </article>
    `;
  }

  function emptyStateHtml() {
    return `
      <div class="plp__empty">
        <h3>No products match those filters</h3>
        <p>Try a different keyword, switch categories, or clear the current filters.</p>
        <button class="btn btn-outline" type="button" data-clear-all>Clear all filters</button>
      </div>
    `;
  }

  function sortMode() {
    const select = sortSelects[0];
    return select ? (select.value || 'featured') : 'featured';
  }

  function sortProducts(items, mode) {
    if (mode === 'price-asc') return items.slice().sort((a, b) => readNumber(a.priceEa ?? a.price) - readNumber(b.priceEa ?? b.price));
    if (mode === 'price-desc') return items.slice().sort((a, b) => readNumber(b.priceEa ?? b.price) - readNumber(a.priceEa ?? a.price));
    if (mode === 'title-asc') {
      return items.slice().sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' }));
    }
    if (mode === 'title-desc') {
      return items.slice().sort((a, b) => String(b.title || '').localeCompare(String(a.title || ''), undefined, { sensitivity: 'base' }));
    }
    return items;
  }

  function readState() {
    const params = new URLSearchParams(window.location.search);
    return {
      filter: params.get('filter') || '',
      price: params.get('price') || '',
      category: params.get('category') || '',
      query: params.get('q') || '',
    };
  }

  function writeState(nextState, replacePath) {
    const params = new URLSearchParams(window.location.search);
    ['filter', 'price', 'category', 'q'].forEach((key) => {
      const value = (nextState[key] || '').trim();
      if (value) params.set(key, value);
      else params.delete(key);
    });

    const nextUrl = replacePath
      ? replacePath
      : `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;

    window.history.replaceState({}, '', nextUrl);
  }

  function syncSearchInputs(query) {
    searchInputs.forEach((input) => {
      if (input.value !== query) input.value = query;
    });
  }

  function updateChipState(state) {
    Array.from(plp.querySelectorAll('[data-filter-chip]')).forEach((chip) => {
      const type = chip.getAttribute('data-filter-type');
      const value = chip.getAttribute('data-filter-value') || '';
      const pressed =
        (type === 'filter' && value === state.filter) ||
        (type === 'price' && value === state.price) ||
        (type === 'category' && categoryKey(value) === categoryKey(state.category));

      chip.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    });
  }

  function scopedProducts() {
    return all.filter(inCollection);
  }

  function uniqueCategories(items) {
    const counts = new Map();

    items.forEach((item) => {
      const label = formatCategory(item.category);
      const key = categoryKey(item.category);
      if (!label || !key) return;

      if (!counts.has(key)) {
        counts.set(key, { label, count: 0 });
      }

      counts.get(key).count += 1;
    });

    return Array.from(counts.values())
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  }

  function renderCategoryChips(state) {
    if (!categoryChipsEl) return;

    const categories = uniqueCategories(scopedProducts());
    if (!categories.length) {
      categoryChipsEl.innerHTML = '<span class="chip-row__empty">Categories will appear once products load.</span>';
      return;
    }

    categoryChipsEl.innerHTML = categories.map(({ label, count }) => `
      <button class="chip chip--category" type="button" data-filter-chip data-filter-type="category" data-filter-value="${escapeHtml(label)}" aria-pressed="${categoryKey(label) === categoryKey(state.category) ? 'true' : 'false'}">
        <span>${escapeHtml(label)}</span>
        <span class="chip__count">${count}</span>
      </button>
    `).join('');
  }

  function renderActiveFilters(state) {
    if (!activeFiltersEl) return;

    const tokens = [];
    if (state.query) tokens.push({ key: 'q', label: `Search: ${state.query}` });
    if (state.category) tokens.push({ key: 'category', label: formatCategory(state.category) });
    if (state.filter) tokens.push({ key: 'filter', label: state.filter });
    if (state.price) tokens.push({ key: 'price', label: state.price });

    activeFiltersEl.hidden = tokens.length === 0;
    if (!tokens.length) {
      activeFiltersEl.innerHTML = '';
      return;
    }

    activeFiltersEl.innerHTML = `
      <span class="plp__active-label">Active filters</span>
      ${tokens.map((token) => `
        <button class="active-filter" type="button" data-active-clear="${token.key}">
          ${escapeHtml(token.label)}
          <span aria-hidden="true">x</span>
        </button>
      `).join('')}
      <button class="active-filter active-filter--clear" type="button" data-clear-all>Clear all</button>
    `;
  }

  function setCount(visible, total) {
    if (!countEl) return;

    if (!total) {
      countEl.textContent = 'No products found';
      return;
    }

    if (!visible) {
      countEl.textContent = `No matches in ${total} product${total === 1 ? '' : 's'}`;
      return;
    }

    countEl.textContent = visible === total
      ? `Showing ${visible} product${visible === 1 ? '' : 's'}`
      : `Showing ${visible} of ${total} products`;
  }

  function applyState() {
    const state = readState();
    syncSearchInputs(state.query);
    renderCategoryChips(state);
    updateChipState(state);
    renderActiveFilters(state);

    const scoped = scopedProducts();
    const filtered = scoped.filter((product) => (
      matchesFilter(product, state.filter) &&
      matchesPrice(product, state.price) &&
      matchesCategory(product, state.category) &&
      matchesQuery(product, state.query)
    ));
    const sorted = sortProducts(filtered, sortMode());

    if (grid) {
      grid.innerHTML = sorted.length
        ? sorted.map((product, idx) => cardHtml(product, idx)).join('')
        : emptyStateHtml();
    }

    setCount(sorted.length, scoped.length);
  }

  async function fetchProducts() {
    const response = await fetch('/products.json', { cache: 'no-store' });
    const data = await response.json();
    const next = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
    all = next.filter(inCollection);
  }

  async function refresh() {
    try {
      await fetchProducts();
      applyState();
    } catch (error) {
      if (!all.length) {
        all = readEmbeddedProducts();
        applyState();
      }
    }
  }

  function setDrawer(open) {
    if (open) {
      document.body.setAttribute('data-filters-open', 'true');
      if (backdrop) backdrop.hidden = false;
      return;
    }

    document.body.removeAttribute('data-filters-open');
    if (backdrop) backdrop.hidden = true;
  }

  function clearAll() {
    writeState({ filter: '', price: '', category: '', q: '' }, window.location.pathname);
    applyState();
    setDrawer(false);
  }

  if (toggleBtn) toggleBtn.addEventListener('click', () => setDrawer(true));
  if (closeBtn) closeBtn.addEventListener('click', () => setDrawer(false));
  if (backdrop) backdrop.addEventListener('click', () => setDrawer(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setDrawer(false);
  });

  plp.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter-chip]');
    if (chip) {
      const type = chip.getAttribute('data-filter-type');
      const value = chip.getAttribute('data-filter-value') || '';
      const state = readState();
      const key = type === 'price' ? 'price' : type === 'category' ? 'category' : 'filter';
      const nextState = Object.assign({}, state, {
        [key]: state[key] === value ? '' : value,
      });

      writeState(nextState);
      applyState();
      setDrawer(false);
      return;
    }

    const activeClear = event.target.closest('[data-active-clear]');
    if (activeClear) {
      const key = activeClear.getAttribute('data-active-clear');
      const state = readState();
      state[key] = '';
      writeState(state);
      applyState();
      return;
    }

    if (event.target.closest('[data-clear-all]')) {
      clearAll();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', clearAll);
  }

  searchInputs.forEach((input) => {
    input.addEventListener('input', () => {
      const query = input.value.trim();
      syncSearchInputs(query);

      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        const state = readState();
        state.query = query;
        writeState(state);
        applyState();
      }, 120);
    });
  });

  sortSelects.forEach((select) => {
    select.addEventListener('change', () => {
      sortSelects.forEach((other) => {
        if (other !== select) other.value = select.value;
      });
      applyState();
    });
  });

  refreshButtons.forEach((button) => button.addEventListener('click', refresh));
  window.addEventListener('popstate', applyState);

  all = readEmbeddedProducts();
  applyState();
  refresh();
})();
