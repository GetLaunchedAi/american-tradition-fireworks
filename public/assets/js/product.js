/* ============================================
 *                  Product PDP
 * ============================================
 */

(function () {
  const DATA_URL = '/products.json';
  const PLACEHOLDER = '/images/placeholder.png';
  const DISCLAIMER_KEY = 'restricted-fireworks-disclaimer-v1';

  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c)
  ));
  const money = (v) => (Number(v) || 0).toFixed(2);

  const params = new URLSearchParams(location.search);
  const slugFromQS = params.get('slug');
  const slugFromPath = location.pathname.replace(/\/+$/, '').split('/').pop();
  const slug = slugFromQS || (slugFromPath && slugFromPath !== 'product' ? slugFromPath : '');

  function productSlug(p) {
    return String(p && (p.slug || p.id || p.sku || '')).trim();
  }

  function stockClass(state) {
    return state ? ` product-card__stock--${state}` : '';
  }

  function parseYoutubeId(url) {
    const text = String(url || '');
    const patterns = [
      /youtu\.be\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1];
    }
    return '';
  }

  function setHidden(el, hidden) {
    if (!el) return;
    el.hidden = hidden;
    el.style.display = hidden ? 'none' : '';
  }

  function setActiveMedia(type) {
    const stage = $('#pdpMediaStage');
    const panels = document.querySelectorAll('[data-media-panel]');
    const tabs = document.querySelectorAll('[data-media-tab]');

    if (stage) {
      stage.setAttribute('data-active-media', type);
    }

    panels.forEach((panel) => {
      const active = panel.getAttribute('data-media-panel') === type && !panel.hidden;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    tabs.forEach((tab) => {
      const active = tab.getAttribute('data-media-tab') === type && !tab.hidden;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function initMediaTabs() {
    const tabs = document.querySelectorAll('[data-media-tab]');
    tabs.forEach((tab) => {
      if (tab.dataset.bound === 'true') return;
      tab.addEventListener('click', () => {
        const type = tab.getAttribute('data-media-tab');
        if (type) setActiveMedia(type);
      });
      tab.dataset.bound = 'true';
    });
  }

  function fail(msg) {
    const root = $('#pdp');
    if (!root) return;
    root.innerHTML = `<p style="max-width:800px;margin:40px auto;text-align:center">${esc(msg)}</p>`;
  }

  function renderPriceSection(p) {
    const priceEl = $('#pdpPrice');
    const caseEl = $('#pdpCasePrice');
    const packEl = $('#pdpPack');
    const stockEl = $('#pdpStock');

    const priceEa = p.priceEa ?? p.price ?? null;
    const casePrice = p.casePrice ?? null;
    const packCase = p.packCase ?? p.casePack ?? '';
    const stockLabel = p.stockLabel || '';
    const state = p.stockState || '';

    if (priceEl) {
      priceEl.textContent = priceEa === null || typeof priceEa === 'undefined'
        ? 'Call for pricing'
        : `$${money(priceEa)}`;
    }

    if (caseEl) {
      caseEl.textContent = casePrice === null || typeof casePrice === 'undefined'
        ? ''
        : `Case $${money(casePrice)}`;
      setHidden(caseEl, casePrice === null || typeof casePrice === 'undefined');
    }

    if (packEl) {
      packEl.textContent = packCase ? `Pack/Case: ${packCase}` : '';
      setHidden(packEl, !packCase);
    }

    if (stockEl) {
      stockEl.className = `pdp__stock${stockClass(state)}`;
      stockEl.textContent = stockLabel;
      setHidden(stockEl, !stockLabel);
    }
  }

  function renderVideo(p) {
    const mediaNav = $('#pdpMediaNav');
    const videoContainer = $('#pdpVideoContainer');
    const videoTab = $('#pdpMediaTabVideo');
    const id = parseYoutubeId(p.youtubeUrl || p.videoUrl);

    initMediaTabs();

    if (!videoContainer || !videoTab) return;

    if (id) {
      const params = new URLSearchParams({
        autoplay: '0',
        controls: '0',
        disablekb: '1',
        fs: '0',
        iv_load_policy: '3',
        loop: '1',
        playlist: id,
        playsinline: '1',
        rel: '0',
      });
      videoContainer.innerHTML = `
        <div class="pdp__video">
          <iframe
            src="https://www.youtube.com/embed/${esc(id)}?${params.toString()}"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      `;
      setHidden(videoContainer, false);
      setHidden(videoTab, false);
      setHidden(mediaNav, false);
    } else {
      videoContainer.innerHTML = '';
      setHidden(videoContainer, true);
      setHidden(videoTab, true);
      setHidden(mediaNav, true);
    }

    setActiveMedia('image');
  }

  function renderNotice(p) {
    const noticeEl = $('#pdpNotice');
    const noticeTextEl = $('#pdpNoticeText');
    if (!noticeEl) return;

    const notice = p.restrictionNotice || '';
    if (!notice) {
      if (noticeTextEl) noticeTextEl.textContent = '';
      setHidden(noticeEl, true);
      return;
    }

    if (noticeTextEl) {
      noticeTextEl.textContent = `${notice} Review the full policy before ordering, shipping, or arranging pickup.`;
    }
    setHidden(noticeEl, false);
  }

  function getDisclaimerSeen() {
    try {
      return window.localStorage.getItem(DISCLAIMER_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setDisclaimerSeen() {
    try {
      window.localStorage.setItem(DISCLAIMER_KEY, 'true');
    } catch (e) {
      // Ignore storage failures and continue closing the dialog.
    }
  }

  function closeDisclaimer() {
    const modal = $('#pdpDisclaimer');
    if (!modal) return;
    setHidden(modal, true);
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('pdp-disclaimer-open');
  }

  function openDisclaimer() {
    const modal = $('#pdpDisclaimer');
    const acceptBtn = $('#pdpDisclaimerAccept');
    if (!modal) return;

    setHidden(modal, false);
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('pdp-disclaimer-open');

    if (acceptBtn) {
      window.setTimeout(() => acceptBtn.focus(), 0);
    }
  }

  function renderDisclaimer(p) {
    const modal = $('#pdpDisclaimer');
    const acceptBtn = $('#pdpDisclaimerAccept');
    if (!modal || !acceptBtn) return;

    if (!acceptBtn.dataset.bound) {
      acceptBtn.addEventListener('click', () => {
        setDisclaimerSeen();
        closeDisclaimer();
      });
      acceptBtn.dataset.bound = 'true';
    }

    if (!p.requiresDocumentation) {
      closeDisclaimer();
      return;
    }

    if (!getDisclaimerSeen()) {
      openDisclaimer();
    } else {
      closeDisclaimer();
    }
  }

  function renderOptions(p) {
    const optsEl = $('#pdpOptions');
    const priceEl = $('#pdpPrice');
    if (!optsEl || !priceEl) return;

    const rawOpts = Array.isArray(p.options) ? p.options : [];
    const opts = rawOpts
      .map((o) => ({
        name: o && o.name ? o.name : 'Option',
        values: Array.isArray(o && o.values) ? o.values : [],
      }))
      .filter((o) => o.values.length > 0);

    optsEl.innerHTML = '';

    if (!opts.length) {
      optsEl.style.display = 'none';
      return;
    }

    opts.forEach((opt, idx) => {
      const id = `opt${idx}`;
      const rows = opt.values.map((v) => {
        const label = v && (v.label || v.value || v.id) ? (v.label || v.value || v.id) : '';
        const delta = Number(v && v.price_delta ? v.price_delta : 0);
        const safeLabel = esc(label);
        return `
          <option value="${safeLabel}" data-delta="${delta}" data-label="${safeLabel}">
            ${safeLabel}${delta ? ` (+$${money(delta)})` : ''}
          </option>
        `;
      }).join('');

      optsEl.insertAdjacentHTML('beforeend', `
        <label for="${id}">
          <span class="pdp__opt-name">${esc(opt.name)}</span>
          <select id="${id}" data-opt-index="${idx}">
            ${rows}
          </select>
        </label>
      `);
    });

    function recalc() {
      const selects = optsEl.querySelectorAll('select');
      let total = Number(p.priceEa ?? p.price ?? 0);
      selects.forEach((sel) => {
        const delta = Number(sel.selectedOptions[0] && sel.selectedOptions[0].dataset.delta ? sel.selectedOptions[0].dataset.delta : 0);
        total += delta;
      });
      priceEl.textContent = `$${money(total)}`;
    }

    optsEl.addEventListener('change', recalc);
    optsEl.style.display = '';
    recalc();
  }

  function renderRelatedCard(p) {
    const img = p.image || PLACEHOLDER;
    const title = p.title || p.slug || 'Product';
    const group = p.group || p.brand || '';
    const category = p.category || '';
    const priceEa = p.priceEa ?? p.price ?? null;
    const casePrice = p.casePrice ?? null;
    const stockLabel = p.stockLabel || '';
    const stockState = p.stockState || '';

    return `
      <article class="rel-card">
        <a class="rel-card__img" href="/product/?slug=${esc(productSlug(p))}">
          <img src="${esc(img)}" alt="${esc(title)}" loading="lazy">
        </a>
        <div class="rel-card__body">
          ${group ? `<p class="rel-card__eyebrow">${esc(group)}</p>` : ''}
          <h3 class="rel-card__title"><a href="/product/?slug=${esc(productSlug(p))}">${esc(title)}</a></h3>
          ${category ? `<p class="rel-card__meta">${esc(category)}</p>` : ''}
          <div class="rel-card__price">
            ${priceEa === null ? '<span class="rel-card__price-ea">Call for pricing</span>' : `<span class="rel-card__price-ea">Each $${esc(money(priceEa))}</span>`}
            ${casePrice === null ? '' : `<span class="rel-card__price-case">Case $${esc(money(casePrice))}</span>`}
          </div>
          ${stockLabel ? `<span class="rel-card__stock rel-card__stock--${esc(stockState)}">${esc(stockLabel)}</span>` : ''}
        </div>
        <a class="rel-card__cta" href="/product/?slug=${esc(productSlug(p))}">View product</a>
      </article>
    `;
  }

  function wireCartButton(p) {
    const btn = $('#addToCartBtn');
    if (!btn) return;

    function syncButtonAttrs() {
      const priceEa = Number(p.priceEa ?? p.price ?? 0);
      btn.setAttribute('data-item-id', p.id || p.slug || p.sku || '');
      btn.setAttribute('data-item-name', p.title || p.slug || '');
      btn.setAttribute('data-item-url', `/product/?slug=${encodeURIComponent(p.slug || p.id || '')}`);
      btn.setAttribute('data-item-image', p.image || '');
      btn.setAttribute('data-item-description', p.description || '');
      btn.setAttribute('data-item-price', Number.isFinite(priceEa) ? String(priceEa) : '');
    }

    const optsEl = $('#pdpOptions');
    if (optsEl) {
      optsEl.addEventListener('change', syncButtonAttrs);
    }
    syncButtonAttrs();
  }

  function render(p) {
    const pdpEl = $('#pdp');
    const titleEl = $('#pdpTitle');
    const crumbEl = $('#pdpCrumb');
    const groupEl = $('#pdpGroup');
    const descEl = $('#pdpDesc');
    const imgEl = $('#pdpImg');
    const imgThumbEl = $('#pdpImgThumb');

    if (!pdpEl || !titleEl || !imgEl) return;

    const title = p.title || p.name || p.slug || 'Product';
    titleEl.textContent = title;
    if (crumbEl) crumbEl.textContent = title;
    if (groupEl) groupEl.textContent = p.group || p.brand || '';
    if (descEl) descEl.textContent = p.description || p.subtitle || '';

    imgEl.src = p.image || PLACEHOLDER;
    imgEl.alt = p.imageAlt || title;
    if (imgThumbEl) {
      imgThumbEl.src = p.image || PLACEHOLDER;
    }

    renderPriceSection(p);
    renderNotice(p);
    renderDisclaimer(p);
    renderVideo(p);
    renderOptions(p);
    wireCartButton(p);
  }

  async function load() {
    if (!slug) return fail('No product specified.');

    let data;
    try {
      const res = await fetch(`${DATA_URL}${DATA_URL.includes('?') ? '&' : '?'}cb=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch (e) {
      return fail('Failed to load products.');
    }

    const list = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
    const p = list.find((x) => x && (x.slug === slug || x.id === slug || x.sku === slug));
    if (!p) return fail('Product not found.');

    render(p);
  }

  function relatedPick(list, me, limit = 20) {
    const myId = me.slug || me.id || me.sku;
    const cat = me.category || (Array.isArray(me.categories) ? me.categories[0] : null);
    const group = me.group || null;
    const tags = new Set((me.tags || []).map(String));
    const pool = list.filter((x) => x && (x.slug || x.id || x.sku) !== myId);

    const score = (x) => {
      let s = 0;
      if (group && (x.group === group || (Array.isArray(x.collections) && x.collections.includes(group)))) s += 3;
      if (cat && (x.category === cat || (Array.isArray(x.categories) && x.categories.includes(cat)))) s += 2;
      if (tags.size && Array.isArray(x.tags)) s += x.tags.filter((t) => tags.has(String(t))).length;
      return s;
    };

    pool.sort((a, b) => score(b) - score(a));
    const top = pool.filter((x) => score(x) > 0).slice(0, limit);
    if (top.length < limit) {
      const rest = pool.filter((x) => !top.includes(x));
      for (let i = rest.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      top.push(...rest.slice(0, limit - top.length));
    }
    return top.slice(0, limit);
  }

  function initRelated() {
    const root = $('#related-products');
    const track = $('#rpTrack');
    if (!root || !track) return;

    const scroller = root.querySelector('.rp-viewport');
    const btnPrev = root.querySelector('.rp-btn.prev');
    const btnNext = root.querySelector('.rp-btn.next');
    const DATA = root.getAttribute('data-src') || DATA_URL;

    if (!scroller || !btnPrev || !btnNext) return;

    const currSlug = slug;
    const card = (p) => renderRelatedCard(p);

    function updateButtons() {
      const max = scroller.scrollWidth - scroller.clientWidth - 1;
      btnPrev.disabled = scroller.scrollLeft <= 0;
      btnNext.disabled = scroller.scrollLeft >= max;
    }

    btnPrev.addEventListener('click', () => scroller.scrollBy({ left: -scroller.clientWidth, behavior: 'smooth' }));
    btnNext.addEventListener('click', () => scroller.scrollBy({ left: scroller.clientWidth, behavior: 'smooth' }));
    scroller.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);

    (async function init() {
      try {
        const res = await fetch(`${DATA}${DATA.includes('?') ? '&' : '?'}cb=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
        const me = list.find((x) => x && (x.slug === currSlug || x.id === currSlug || x.sku === currSlug));
        if (!me) {
          root.style.display = 'none';
          return;
        }

        const rel = relatedPick(list, me, 20);
        if (!rel.length) {
          root.style.display = 'none';
          return;
        }

        track.innerHTML = rel.map(card).join('');
        requestAnimationFrame(updateButtons);
      } catch (e) {
        console.error('Related products failed:', e);
        root.style.display = 'none';
      }
    })();
  }

  async function init() {
    try {
      await load();
    } catch (e) {
      if (!$('#pdpTitle')) {
        fail('Failed to load products.');
      }
    }
    initRelated();
  }

  init();
})();
