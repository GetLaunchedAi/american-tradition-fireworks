/* =========================================
   Admin — Products editor
   - Uses PHP endpoints under /api/
   - Writes directly to /products.json in docroot
   - No frameworks
   ========================================= */

(function () {
  const root = document.querySelector('[data-admin-root]');
  if (!root) return;

  const loginView = root.querySelector('[data-admin-login]');
  const appView = root.querySelector('[data-admin-app]');
  const loginForm = root.querySelector('[data-login-form]');
  const loginErr = root.querySelector('[data-login-error]');

  const statusEl = root.querySelector('[data-admin-status]');
  const logoutBtn = root.querySelector('[data-admin-logout]');

  const listEl = root.querySelector('[data-admin-list]');
  const searchInput = root.querySelector('[data-admin-search]');
  const addBtn = root.querySelector('[data-admin-add]');
  const exportBtn = root.querySelector('[data-admin-export]');
  const importBtn = root.querySelector('[data-admin-import]');
  const importFile = root.querySelector('[data-admin-import-file]');
  const refreshBtn = root.querySelector('[data-admin-refresh]');

  const emptyHint = root.querySelector('[data-admin-empty]');
  const form = root.querySelector('[data-admin-form]');
  const formErr = root.querySelector('[data-admin-error]');
  const saveBtn = root.querySelector('[data-admin-save]');
  const delBtn = root.querySelector('[data-admin-delete]');

  const uploadBtn = root.querySelector('[data-admin-upload]');
  const uploadFile = root.querySelector('[data-admin-upload-file]');
  const uploadStatus = root.querySelector('[data-admin-upload-status]');
  const imagePreview = root.querySelector('[data-admin-image-preview]');

  let products = [];
  let activeId = null;

  const SUBCATEGORIES = {
    'Consumer Fireworks 1.4g': ['Rockets','Parachutes','Fountains/Smoke','Roman Candles','200 Gram Cakes','500 Gram Cakes','Professional Racks','Large Finales','Reloadables','Firecrackers','Kits'],
    'Professional Fireworks 1.4g': ['225 Cakes','Cakes','New Effects Cakes','Compound Cakes','Fan Cake Slices','Single Shot Shells']
  };
  let groupFilter = '';

  function groupBucket(g) {
    const s = String(g || '').normalize('NFKC').replace(/[–—]/g, '-').toLowerCase();
    if (s.includes('professional') || s.includes('display') || s.includes('1.3g')) return 'pro';
    return 'consumer';
  }

  function deriveStock(onHand, onOrder) {
    const h = Number(onHand) || 0;
    const o = Number(onOrder) || 0;
    if (h <= 0 && o <= 0) return { stockState: 'out-of-stock', stockLabel: 'Out of stock' };
    if (h <= 0 && o > 0) return { stockState: 'low-stock', stockLabel: 'On order' };
    if (h > 0 && h <= 5) return { stockState: 'low-stock', stockLabel: 'Low stock' };
    return { stockState: 'in-stock', stockLabel: 'In stock' };
  }

  function prefixSku(sku, title) {
    const s = String(sku || '').trim();
    const t = String(title || '').trim();
    if (!s) return t;
    const stripped = t.replace(/^[A-Za-z0-9-]+\s+/, '');
    if (!stripped) return s;
    if (t.toUpperCase() === s.toUpperCase()) return t;
    return `${s} ${stripped}`;
  }

  function fillSubcategoryOptions(group) {
    const sel = form && form.querySelector('[data-f="subcategory"]');
    if (!sel) return;
    const list = SUBCATEGORIES[group] || [];
    const current = sel.value;
    sel.innerHTML = '<option value="">—</option>' + list.map(s => `<option value="${escapeAttr(s)}">${escapeHtml(s)}</option>`).join('');
    if (list.includes(current)) sel.value = current;
  }

  function syncReqDocForGroup(group) {
    const el = form.querySelector('[data-f="requiresDocumentation"]');
    if (!el) return;
    if (groupBucket(group) === 'pro') {
      el.checked = true;
      el.disabled = true;
    } else {
      el.disabled = false;
    }
  }

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }
  function setText(el, txt) { if (el) el.textContent = txt; }

  function pid(p) {
    if (!p) return '';
    return p.sku || p.id || '';
  }

  async function api(url, opts) {
    const res = await fetch(url, Object.assign({
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    }, opts || {}));

    let data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function normalizeCsv(v) {
    if (Array.isArray(v)) return v.filter(Boolean).map(String);
    if (!v) return [];
    return String(v).split(',').map(s => s.trim()).filter(Boolean);
  }

  function toNum(v) { const n = Number(v); return isFinite(n) ? n : 0; }

  function val(id) {
    const el = form.querySelector(`[data-f="${id}"]`);
    return el ? el.value : '';
  }

  function setVal(id, value) {
    const el = form.querySelector(`[data-f="${id}"]`);
    if (el) {
      el.value = value == null ? '' : String(value);
      if (id === 'image') updateImagePreview(el.value);
    }
  }

  function updateImagePreview(url) {
    if (!imagePreview) return;
    if (url) {
      imagePreview.src = url;
      imagePreview.style.display = 'block';
    } else {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
    }
  }

  function currentProduct() {
    return products.find(p => String(pid(p)) === String(activeId)) || null;
  }

  function renderList() {
    if (!listEl) return;
    const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const rows = products
      .filter(p => {
        if (groupFilter && groupBucket(p.group) !== groupFilter) return false;
        if (!q) return true;
        const hay = `${p.title || ''} ${p.slug || ''} ${p.sku || ''} ${p.category || ''} ${p.brand || ''} ${(p.collections || []).join(' ')} ${(p.tags || []).join(' ')} ${p.group || ''} ${p.subcategory || ''} ${p.description || ''}`.toLowerCase();
        return hay.includes(q);
      })
      .map(p => {
        const isActive = String(pid(p)) === String(activeId);
        const dispPrice = (p.priceEa != null && p.priceEa !== '') ? p.priceEa : (p.price != null && p.price !== '' ? p.price : 0);
        const dispPriceStr = isNaN(Number(dispPrice)) ? '0.00' : Number(dispPrice).toFixed(2);
        return `
          <div class="admin-item ${isActive ? 'is-active' : ''}" data-pick-id="${escapeAttr(pid(p))}">
            <div class="admin-item__title">${escapeHtml(p.title || 'Untitled')}</div>
            <div class="admin-item__meta">
              <span class="stock-dot stock-dot--${escapeAttr(p.stockState || 'unknown')}" title="${escapeAttr(p.stockLabel || 'No stock data')}"></span>
              <span class="meta-group meta-group--${groupBucket(p.group)}">${escapeHtml(groupBucket(p.group) === 'pro' ? 'Pro' : 'Consumer')}</span>
              ${escapeHtml(p.sku || '')} · ${escapeHtml(p.category || '')} · $${escapeHtml(dispPriceStr)} · /${escapeHtml(p.slug || '')}
            </div>
          </div>
        `;
      }).join('');

    listEl.innerHTML = rows || `<p class="muted">No products found.</p>`;

    const counts = { all: products.length, consumer: 0, pro: 0 };
    products.forEach(p => { counts[groupBucket(p.group)]++; });
    root.querySelectorAll('[data-count]').forEach(el => {
      const k = el.getAttribute('data-count');
      if (counts[k] != null) el.textContent = counts[k];
    });
  }

  function openEditor(id) {
    activeId = id;
    const p = currentProduct();
    if (!p) {
      hide(form);
      show(emptyHint);
      renderList();
      return;
    }

    hide(emptyHint);
    show(form);
    hide(formErr);

    setVal('id', p.id || '');
    setVal('sku', p.sku || '');
    setVal('slug', p.slug || '');
    setVal('title', p.title || '');
    setVal('subtitle', p.subtitle || '');
    setVal('category', p.category || '');
    setVal('brand', p.brand || '');
    setVal('casePack', p.casePack || '');
    setVal('youtubeUrl', p.youtubeUrl || '');
    setVal('price', p.price || '');
    setVal('compareAt', p.compareAt || '');
    setVal('badge', p.badge || '');
    setVal('badges', (p.badges || []).join(', '));
    setVal('collections', (p.collections || []).join(', '));
    setVal('tags', (p.tags || []).join(', '));
    setVal('image', p.image || '/images/placeholder.png');
    setVal('group', p.group || '');
    fillSubcategoryOptions(p.group || '');
    setVal('subcategory', p.subcategory || '');
    setVal('description', p.description || '');
    setVal('packCase', p.packCase != null ? p.packCase : '');
    setVal('videoUrl', p.videoUrl || '');
    setVal('priceEa', p.priceEa != null ? p.priceEa : '');
    setVal('casePrice', p.casePrice != null ? p.casePrice : '');
    setVal('onHand', p.onHand != null ? p.onHand : '');
    setVal('onOrder', p.onOrder != null ? p.onOrder : '');
    setVal('stockState', p.stockState || '');
    setVal('stockLabel', p.stockLabel || '');
    const reqDocEl = form.querySelector('[data-f="requiresDocumentation"]');
    if (reqDocEl) reqDocEl.checked = !!p.requiresDocumentation;
    syncReqDocForGroup(p.group || '');

    renderList();
  }

  async function loadProducts() {
    setText(statusEl, 'Loading…');
    const res = await api('/api/products-get.php', { method: 'GET' });
    products = Array.isArray(res.products) ? res.products : [];
    setText(statusEl, `Loaded ${products.length}`);
    renderList();
    if (activeId) openEditor(activeId);
  }

  async function saveAll(nextProducts) {
    setText(statusEl, 'Saving…');
    const res = await api('/api/save-products.php', {
      method: 'POST',
      body: JSON.stringify({ products: nextProducts })
    });
    products = Array.isArray(res.products) ? res.products : nextProducts;
    setText(statusEl, 'Saved');
    window.setTimeout(() => setText(statusEl, `Loaded ${products.length}`), 800);
    renderList();
    if (activeId) openEditor(activeId);
  }

  function newProduct() {
    return {
      id: `p_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
      sku: '',
      slug: '',
      title: 'New product',
      subtitle: '',
      group: 'Consumer Fireworks 1.4g',
      subcategory: '',
      category: '',
      description: '',
      brand: '',
      casePack: '',
      packCase: 0,
      youtubeUrl: '',
      videoUrl: '',
      price: '0.00',
      priceEa: null,
      casePrice: 0,
      compareAt: '',
      badge: '',
      badges: [],
      collections: [],
      categories: ['Consumer Fireworks 1.4g'],
      tags: [],
      image: '/images/placeholder.png',
      onHand: 0,
      onOrder: 0,
      stockState: 'out-of-stock',
      stockLabel: 'Out of stock',
      requiresDocumentation: false
    };
  }

  function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // --- auth ---
  async function checkAuth() {
    try {
      const res = await api('/api/me.php', { method: 'GET' });
      return !!(res && res.authed);
    } catch (e) {
      return false;
    }
  }

  async function showApp() {
    hide(loginView);
    show(appView);
    await loadProducts();
  }

  function showLogin() {
    show(loginView);
    hide(appView);
  }

  // --- events ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hide(loginErr);

      const pass = loginForm.querySelector('input[name="password"]');
      const password = pass ? pass.value : '';

      try {
        await api('/api/login.php', {
          method: 'POST',
          body: JSON.stringify({ password })
        });
        if (pass) pass.value = '';
        await showApp();
      } catch (err) {
        if (loginErr) {
          loginErr.style.display = 'block';
          loginErr.textContent = err.message || 'Login failed';
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await api('/api/logout.php', { method: 'POST', body: '{}' }); } catch (e) {}
      products = [];
      activeId = null;
      showLogin();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => renderList());
  }

  const filterEl = root.querySelector('[data-admin-filter]');
  if (filterEl) {
    filterEl.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-group-filter]') : null;
      if (!btn) return;
      groupFilter = btn.getAttribute('data-group-filter') || '';
      filterEl.querySelectorAll('[data-group-filter]').forEach(b => {
        b.classList.toggle('is-active', b === btn);
      });
      renderList();
    });
  }

  if (listEl) {
    listEl.addEventListener('click', (e) => {
      const row = e.target && e.target.closest ? e.target.closest('[data-pick-id]') : null;
      if (!row) return;
      openEditor(row.getAttribute('data-pick-id'));
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      const p = newProduct();
      const next = [p, ...products];
      activeId = pid(p);
      products = next;
      renderList();
      openEditor(pid(p));
      setText(statusEl, 'New product added (not saved yet)');
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      try { await loadProducts(); } catch (e) { setText(statusEl, 'Failed to refresh'); }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      downloadJson('products.json', products);
    });
  }

  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', async () => {
      const file = importFile.files && importFile.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const arr = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.products) ? parsed.products : null);
        if (!arr) throw new Error('Invalid JSON format (expected an array)');
        await saveAll(arr);
        setText(statusEl, 'Imported');
      } catch (err) {
        setText(statusEl, err.message || 'Import failed');
      } finally {
        importFile.value = '';
      }
    });
  }

  if (form) {
    const imageInput = form.querySelector('[data-f="image"]');
    if (imageInput) {
      imageInput.addEventListener('input', (e) => updateImagePreview(e.target.value));
    }

    const groupSel = form.querySelector('[data-f="group"]');
    if (groupSel) {
      groupSel.addEventListener('change', (e) => {
        fillSubcategoryOptions(e.target.value);
        syncReqDocForGroup(e.target.value);
        const subSel = form.querySelector('[data-f="subcategory"]');
        if (subSel) subSel.value = '';
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hide(formErr);

      const p = currentProduct();
      if (!p) return;

      p.id = val('id').trim() || p.id;
      p.sku = val('sku').trim();
      p.slug = val('slug').trim();
      p.title = val('title').trim();
      p.subtitle = val('subtitle').trim();
      p.category = val('category').trim();
      p.brand = val('brand').trim();
      p.casePack = val('casePack').trim();
      p.youtubeUrl = val('youtubeUrl').trim();
      p.compareAt = val('compareAt').trim();
      p.badge = val('badge').trim();
      p.badges = normalizeCsv(val('badges'));
      p.image = val('image').trim();

      p.group = val('group').trim();
      p.subcategory = val('subcategory').trim();
      p.description = String(val('description') || '').trim();
      p.packCase = val('packCase') === '' ? 0 : toNum(val('packCase'));
      p.videoUrl = val('videoUrl').trim();

      const priceNum = val('price').trim();
      p.price = priceNum === '' ? '0.00' : Number(toNum(priceNum)).toFixed(2);
      const priceEaInput = val('priceEa').trim();
      if (priceEaInput === '' && priceNum === '') {
        delete p.priceEa;
      } else {
        p.priceEa = priceEaInput === '' ? toNum(priceNum) : toNum(priceEaInput);
      }
      p.casePrice = val('casePrice').trim() === '' ? 0 : toNum(val('casePrice'));

      p.onHand = val('onHand') === '' ? 0 : toNum(val('onHand'));
      p.onOrder = val('onOrder') === '' ? 0 : toNum(val('onOrder'));

      const stateInput = val('stockState').trim();
      const labelInput = val('stockLabel').trim();
      if (!stateInput || !labelInput) {
        const auto = deriveStock(p.onHand, p.onOrder);
        p.stockState = stateInput || auto.stockState;
        p.stockLabel = labelInput || auto.stockLabel;
      } else {
        p.stockState = stateInput;
        p.stockLabel = labelInput;
      }

      const reqDoc = form.querySelector('[data-f="requiresDocumentation"]');
      p.requiresDocumentation = reqDoc ? !!reqDoc.checked : false;
      if (groupBucket(p.group) === 'pro') p.requiresDocumentation = true;

      p.title = prefixSku(p.sku, p.title);

      const userCollections = normalizeCsv(val('collections'));
      const userTags = normalizeCsv(val('tags'));
      const baseTokens = [p.group, p.category].filter(Boolean);
      const uniq = arr => Array.from(new Set(arr.filter(Boolean)));
      p.collections = uniq([...baseTokens, ...userCollections]);
      p.categories = uniq([...baseTokens]);
      p.tags = uniq([...baseTokens, p.brand, ...userTags]);

      try {
        await saveAll(products);
      } catch (err) {
        if (formErr) {
          formErr.style.display = 'block';
          const details = err.data && err.data.details ? `\n${err.data.details.join('\n')}` : '';
          formErr.textContent = (err.message || 'Save failed') + details;
        }
      }
    });
  }

  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      const p = currentProduct();
      if (!p) return;
      const ok = window.confirm(`Delete "${p.title || 'this product'}"?`);
      if (!ok) return;

      const next = products.filter(x => String(pid(x)) !== String(activeId));
      activeId = null;
      try {
        await saveAll(next);
        hide(form);
        show(emptyHint);
      } catch (err) {
        if (formErr) {
          formErr.style.display = 'block';
          formErr.textContent = err.message || 'Delete failed';
        }
      }
    });
  }

  if (uploadBtn && uploadFile) {
    uploadBtn.addEventListener('click', () => uploadFile.click());
    uploadFile.addEventListener('change', async () => {
      const f = uploadFile.files && uploadFile.files[0];
      if (!f) return;
      setText(uploadStatus, 'Uploading…');

      try {
        const fd = new FormData();
        fd.append('file', f);
        const res = await fetch('/api/upload-image.php', {
          method: 'POST',
          credentials: 'include',
          body: fd
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data && data.error ? data.error : 'Upload failed');
        const url = data && data.url ? data.url : '';
        if (url) setVal('image', url);
        setText(uploadStatus, url ? 'Uploaded' : 'Uploaded (no URL)');
      } catch (err) {
        setText(uploadStatus, err.message || 'Upload failed');
      } finally {
        uploadFile.value = '';
        window.setTimeout(() => setText(uploadStatus, ''), 1400);
      }
    });
  }

  // --- init ---
  (async function init() {
    const authed = await checkAuth();
    if (authed) await showApp();
    else showLogin();
  })();

  // --- tiny escapers (avoid depending on other modules) ---
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/`/g, '&#096;');
  }
})();
