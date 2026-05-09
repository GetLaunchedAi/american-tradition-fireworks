<?php
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Permissions-Policy: interest-cohort=()');
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Admin Access &middot; American Tradition LLC</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="preconnect" href="https://api.fontshare.com">
  <link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://api.fontshare.com/v2/css?f[]=tanker@400&f[]=sentient@300,400,500,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root{
      --font-display:'Tanker','Big Shoulders Display',Georgia,serif;
      --font-body:'Sentient',Georgia,system-ui,serif;
      --font-mono:'JetBrains Mono',ui-monospace,monospace;
      --ink:oklch(18% 0.02 25);
      --ink-soft:oklch(28% 0.02 25);
      --paper:oklch(96% 0.012 75);
      --paper-deep:oklch(92% 0.018 70);
      --crimson:oklch(50% 0.18 27);
      --crimson-deep:oklch(40% 0.16 27);
      --gold-leaf:oklch(78% 0.13 85);
      --rule:oklch(35% 0.02 25 / 0.18);
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0;
      background:var(--paper);
      color:var(--ink);
      font-family:var(--font-body);
      font-size:1rem;
      line-height:1.55;
      display:grid;
      place-items:center;
      padding:2rem 1rem;
      background-image:
        radial-gradient(circle at 15% 20%, oklch(50% 0.18 27 / 0.04) 0%, transparent 45%),
        radial-gradient(circle at 85% 80%, oklch(78% 0.13 85 / 0.06) 0%, transparent 50%);
    }
    .wrap{width:min(560px,100%)}
    .card{
      background:var(--paper-deep);
      border:1px solid var(--ink);
      border-radius:1px;
      padding:clamp(2rem,4vw,3rem);
      position:relative;
    }
    .card::before{
      content:"";
      position:absolute;
      inset:0.4rem;
      border:1px solid var(--rule);
      border-radius:1px;
      pointer-events:none;
    }
    .topper{
      display:block;
      font-family:var(--font-mono);
      font-size:0.72rem;
      font-weight:500;
      letter-spacing:0.22em;
      text-transform:uppercase;
      color:var(--crimson);
      margin:0 0 1.25rem;
    }
    h1{
      margin:0 0 0.75rem;
      font-family:var(--font-display);
      font-weight:400;
      font-size:clamp(2.25rem,1.7rem + 2vw,3rem);
      line-height:1;
      letter-spacing:-0.01em;
      color:var(--ink);
    }
    .sub{
      margin:0 0 1.75rem;
      color:var(--ink-soft);
      font-size:1rem;
      max-width:42ch;
    }
    .divider{
      height:0;
      border:0;
      border-top:1px solid var(--ink);
      margin:0 0 1.5rem;
    }
    .field-label{
      display:block;
      font-family:var(--font-mono);
      font-size:0.7rem;
      font-weight:500;
      letter-spacing:0.2em;
      text-transform:uppercase;
      color:var(--ink-soft);
      margin:0 0 0.5rem;
    }
    form{display:flex;gap:0.75rem;align-items:stretch;flex-wrap:wrap}
    input[type="password"]{
      flex:1 1 240px;
      height:3rem;
      border:0;
      border-bottom:1.5px solid var(--ink);
      border-radius:0;
      padding:0 0.25rem;
      background:transparent;
      font-family:var(--font-body);
      font-size:1.05rem;
      color:var(--ink);
      outline:none;
      transition:border-color 0.2s;
    }
    input[type="password"]::placeholder{color:var(--ink-soft);opacity:0.6}
    input[type="password"]:focus{border-bottom-color:var(--crimson)}
    button{
      flex:0 0 auto;
      height:3rem;
      padding:0 1.6rem;
      border:1.5px solid var(--crimson);
      border-radius:0;
      cursor:pointer;
      font-family:var(--font-mono);
      font-size:0.78rem;
      font-weight:500;
      letter-spacing:0.18em;
      text-transform:uppercase;
      color:var(--paper);
      background:var(--crimson);
      transition:background 0.2s,border-color 0.2s;
    }
    button:hover{background:var(--crimson-deep);border-color:var(--crimson-deep)}
    .err{
      margin-top:1rem;
      color:var(--crimson-deep);
      background:transparent;
      border:1px solid var(--crimson);
      border-left:3px solid var(--crimson);
      padding:0.65rem 0.9rem;
      border-radius:1px;
      display:none;
      font-size:0.9rem;
      font-family:var(--font-mono);
      letter-spacing:0.04em;
    }
    .hint{
      margin-top:1.25rem;
      color:var(--ink-soft);
      font-size:0.82rem;
      font-family:var(--font-mono);
      letter-spacing:0.04em;
    }
    .footer{
      margin-top:1.5rem;
      padding-top:1rem;
      border-top:1px solid var(--rule);
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:1rem;
      color:var(--ink-soft);
      font-size:0.78rem;
      font-family:var(--font-mono);
      letter-spacing:0.08em;
      text-transform:uppercase;
    }
    .link{
      color:var(--crimson);
      text-decoration:none;
      font-weight:500;
      border-bottom:1px solid var(--crimson);
      padding-bottom:0.15em;
    }
    .link:hover{color:var(--crimson-deep);border-bottom-color:var(--crimson-deep)}
    .stamp{
      position:absolute;
      top:1.2rem;
      right:1.2rem;
      font-family:var(--font-mono);
      font-size:0.62rem;
      font-weight:500;
      letter-spacing:0.22em;
      text-transform:uppercase;
      color:var(--gold-leaf);
      border:1px solid var(--gold-leaf);
      padding:0.2rem 0.55rem;
      border-radius:1px;
      pointer-events:none;
    }
    @media (max-width:30rem){
      form{flex-direction:column}
      input[type="password"],button{width:100%}
      .footer{flex-direction:column;align-items:flex-start}
      .stamp{position:static;align-self:flex-start;margin-bottom:1rem;display:inline-block}
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="card" role="dialog" aria-labelledby="ttl" aria-modal="true">
      <span class="stamp" aria-hidden="true">Restricted</span>
      <span class="topper">Dept &middot; 99 &middot; Internal</span>
      <h1 id="ttl">Admin access.</h1>
      <p class="sub">Enter the admin password to continue to the product editor.</p>
      <hr class="divider" />
      <label class="field-label" for="admin-pass">Password</label>
      <form id="login-form" autocomplete="off">
        <input id="admin-pass" type="password" name="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" aria-label="Admin password" autofocus
               inputmode="text" autocapitalize="none" autocomplete="off" spellcheck="false" required>
        <button type="submit">Enter &rarr;</button>
      </form>
      <div class="err" id="login-error"></div>
      <p class="hint">Server-side session cookies after login.</p>
      <div class="footer">
        <span>Session lasts until expiry or logout.</span>
        <a class="link" href="/admin/logout.php">Log out</a>
      </div>
    </section>
  </main>
  <script>
    (function () {
      const form = document.getElementById('login-form');
      const input = form.querySelector('input[name="password"]');
      const errorEl = document.getElementById('login-error');

      function showError(message) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
      }

      fetch('/api/me.php', { credentials: 'same-origin' })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.authed) window.location.href = '/admin/products.html';
        })
        .catch(() => {});

      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        errorEl.style.display = 'none';

        const password = input.value || '';
        if (!password.trim()) {
          showError('Password is required.');
          return;
        }

        try {
          const res = await fetch('/api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ password }),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.ok) {
            showError(data.error || 'Login failed. Please try again.');
            return;
          }

          window.location.href = '/admin/products.html';
        } catch (err) {
          showError('Network error. Please try again.');
        }
      });
    })();
  </script>
</body>
</html>
