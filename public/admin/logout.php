<?php
header('Cache-Control: no-store');
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Logging out...</title>
</head>
<body>
  <script>
    (async function () {
      try {
        await fetch('/api/logout.php', {
          method: 'POST',
          credentials: 'same-origin'
        });
      } catch (e) {
        // Ignore logout network failures and continue redirect.
      }
      window.location.replace('/admin/');
    })();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=/admin/" />
    <p>Logged out. Continue to <a href="/admin/">Admin Login</a>.</p>
  </noscript>
</body>
</html>
