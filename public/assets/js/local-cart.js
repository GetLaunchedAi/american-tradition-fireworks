/* Local cart until Stripe checkout is wired. */
(function () {
  const STORAGE_KEY = 'atf_local_cart_v1';
  const checkoutBtn = document.querySelector('.cart-checkout');
  if (!checkoutBtn) return;

  let items = loadCart();
  const ui = mountCartUi();
  bindEvents();
  render();
  document.body.classList.add('local-cart-enabled');

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function normalizePrice(value) {
    const n = Number.parseFloat(String(value || '0').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function money(value) {
    return `$${normalizePrice(value).toFixed(2)}`;
  }

  function totals() {
    const count = items.reduce((n, item) => n + (item.qty || 0), 0);
    const subtotal = items.reduce((sum, item) => sum + normalizePrice(item.price) * (item.qty || 0), 0);
    return { count, subtotal };
  }

  function updateHeader() {
    const t = totals();
    document.querySelectorAll('.cart-items-count').forEach((el) => {
      el.textContent = t.count > 0 ? String(t.count) : '';
    });
    document.querySelectorAll('.cart-total-price').forEach((el) => {
      el.textContent = t.count > 0 ? money(t.subtotal) : '';
    });
  }

  function render() {
    const list = ui.list;
    if (!items.length) {
      list.innerHTML = '<p class="local-cart__empty">Your cart is empty.</p>';
    } else {
      list.innerHTML = items
        .map((item) => {
          return `
            <article class="local-cart__item" data-id="${escapeHtml(item.id)}">
              <img class="local-cart__thumb" src="${escapeHtml(item.image || '/images/placeholder.png')}" alt="">
              <div class="local-cart__meta">
                <h4>${escapeHtml(item.name)}</h4>
                <p>${money(item.price)}</p>
                <div class="local-cart__qty">
                  <button type="button" data-action="dec">-</button>
                  <span>${item.qty}</span>
                  <button type="button" data-action="inc">+</button>
                  <button type="button" data-action="remove" class="local-cart__remove">Remove</button>
                </div>
              </div>
            </article>
          `;
        })
        .join('');
    }

    const t = totals();
    ui.subtotal.textContent = money(t.subtotal);
    ui.count.textContent = String(t.count);
    updateHeader();
  }

  function openDrawer() {
    ui.drawer.classList.add('is-open');
    ui.overlay.hidden = false;
  }

  function closeDrawer() {
    ui.drawer.classList.remove('is-open');
    ui.overlay.hidden = true;
  }

  function addItemFromButton(btn) {
    const id = (btn.getAttribute('data-item-id') || '').trim();
    const name = (btn.getAttribute('data-item-name') || 'Product').trim();
    const price = normalizePrice(btn.getAttribute('data-item-price'));
    const image = (btn.getAttribute('data-item-image') || '/images/placeholder.png').trim();
    const url = (btn.getAttribute('data-item-url') || '').trim();

    if (!id) return;

    const existing = items.find((x) => x.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ id, name, price, image, url, qty: 1 });
    }

    persist();
    render();
    openDrawer();
  }

  function bindEvents() {
    checkoutBtn.addEventListener('click', function (event) {
      event.preventDefault();
      openDrawer();
    });

    document.addEventListener('click', function (event) {
      const addBtn = event.target.closest('.cart-add-item');
      if (addBtn) {
        event.preventDefault();
        addItemFromButton(addBtn);
        return;
      }

      if (event.target === ui.overlay || event.target.closest('[data-local-cart-close]')) {
        closeDrawer();
        return;
      }

      const qtyBtn = event.target.closest('[data-action]');
      const itemEl = event.target.closest('.local-cart__item');
      if (!qtyBtn || !itemEl) return;

      const id = itemEl.getAttribute('data-id');
      const item = items.find((x) => x.id === id);
      if (!item) return;

      const action = qtyBtn.getAttribute('data-action');
      if (action === 'inc') item.qty += 1;
      if (action === 'dec') item.qty = Math.max(1, item.qty - 1);
      if (action === 'remove') items = items.filter((x) => x.id !== id);

      persist();
      render();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeDrawer();
    });
  }

  function mountCartUi() {
    const overlay = document.createElement('div');
    overlay.className = 'local-cart__overlay';
    overlay.hidden = true;

    const drawer = document.createElement('aside');
    drawer.className = 'local-cart__drawer';
    drawer.setAttribute('aria-label', 'Shopping cart');
    drawer.innerHTML = `
      <header class="local-cart__head">
        <h3>Cart (<span data-local-cart-count>0</span>)</h3>
        <button type="button" data-local-cart-close aria-label="Close cart">✕</button>
      </header>
      <div class="local-cart__list" data-local-cart-list></div>
      <footer class="local-cart__foot">
        <div class="local-cart__subtotal">Subtotal: <strong data-local-cart-subtotal>$0.00</strong></div>
        <p class="local-cart__note">Cart items are saved locally until Stripe checkout is connected.</p>
      </footer>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    return {
      overlay,
      drawer,
      list: drawer.querySelector('[data-local-cart-list]'),
      subtotal: drawer.querySelector('[data-local-cart-subtotal]'),
      count: drawer.querySelector('[data-local-cart-count]'),
    };
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
