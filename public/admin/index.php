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
  <title>Admin Access</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    :root{ --bg:#f8f9fa; --card:#fff; --line:#e2e8f0; --ink:#1a1a1a; --muted:#4e4b66; --brand:#c11c2a; --brand-hover:#d4342a; }
    html,body{height:100%}
    body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 "Roboto",Arial,sans-serif;display:grid;place-items:center}
    .wrap{width:min(600px,92vw)}
    .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:32px 24px;box-shadow:0 4px 6px rgba(0,0,0,.05)}
    h1{margin:0 0 8px;font-size:24px;color:#1a1a1a}
    p.sub{margin:0 0 20px;color:var(--muted);font-size:15px}
    form{display:flex;gap:10px;align-items:center}
    input[type="password"]{flex:1;height:46px;border:1px solid var(--line);border-radius:8px;padding:0 14px;font:16px/1.2 inherit;outline:none;background:#fff;transition:border-color 0.2s}
    input[type="password"]::placeholder{color:#9ca3af}
    input[type="password"]:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(193,28,42,.1)}
    button{height:46px;padding:0 20px;border:0;border-radius:8px;cursor:pointer;font-weight:700;color:#fff;background:var(--brand);font-size:15px;transition:background 0.2s}
    button:hover{background:var(--brand-hover)}
    .err{margin-top:12px;color:#991b1b;background:#fef2f2;border:1px solid #fca5a5;padding:10px 12px;border-radius:8px;display:none;font-size:14px}
    .hint{margin-top:16px;color:var(--muted);font-size:13px}
    .footer{margin-top:16px;padding-top:16px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:13px}
    .link{color:var(--brand);text-decoration:none;font-weight:500}
    .link:hover{text-decoration:underline}
  </style>
</head>
<body>
  <main class="wrap">
    <div class="card" role="dialog" aria-labelledby="ttl" aria-modal="true">
      <h1 id="ttl">Admin Access</h1>
      <p class="sub">Enter your admin password to continue to the product editor.</p>
      <form id="login-form" autocomplete="off">
        <input type="password" name="password" placeholder="Enter password..." aria-label="Admin password" autofocus
               inputmode="text" autocapitalize="none" autocomplete="off" spellcheck="false" required>
        <button type="submit">Enter</button>
      </form>
      <div class="err" id="login-error"></div>
      <div class="hint">Authentication uses server-side session cookies after login.</div>
      <div class="footer">
        <span>Session lasts until browser/session expiry or logout.</span>
        <a class="link" href="/admin/logout.php">Log out</a>
      </div>
    </div>
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
