<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login | American Tradition LLC</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg: #0f172a; --surface: #1e293b; --border: #334155; --primary: #f97316; --text: #f1f5f9; --muted: #94a3b8; --danger: #ef4444; --radius: 10px; }
        body { background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-box {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 40px 36px;
            width: 100%;
            max-width: 400px;
        }
        .login-box h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .login-box p { color: var(--muted); font-size: 14px; margin-bottom: 28px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        label { font-size: 13px; color: var(--muted); font-weight: 500; }
        .input {
            background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
            color: var(--text); padding: 10px 14px; font-size: 14px; width: 100%;
            transition: border-color .15s;
        }
        .input:focus { outline: none; border-color: var(--primary); }
        .btn-primary {
            background: var(--primary); color: #fff; border: none;
            padding: 11px 20px; border-radius: 8px; font-size: 15px; font-weight: 600;
            cursor: pointer; width: 100%; transition: opacity .15s;
        }
        .btn-primary:hover { opacity: .9; }
        .alert--error { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); color: var(--danger); padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 18px; }
        .remember { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); margin-bottom: 20px; }
        .remember input { width: auto; accent-color: var(--primary); }
        .back-link { display: block; text-align: center; margin-top: 16px; color: var(--muted); font-size: 13px; text-decoration: none; }
        .back-link:hover { color: var(--text); }
        .logo { text-align: center; margin-bottom: 28px; font-size: 22px; font-weight: 800; color: var(--primary); letter-spacing: -.5px; }
    </style>
</head>
<body>
<div class="login-box">
    <div class="logo">🎆 ATF Admin</div>
    <h1>Sign In</h1>
    <p>Access the product management dashboard.</p>

    @if($errors->any())
        <div class="alert--error">{{ $errors->first() }}</div>
    @endif

    <form method="POST" action="{{ route('login.post') }}">
        @csrf
        <div class="form-group">
            <label for="email">Email Address</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}"
                   placeholder="admin@example.com" required autofocus class="input" />
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" name="password" placeholder="••••••••" required class="input" />
        </div>
        <div class="remember">
            <input id="remember" type="checkbox" name="remember" value="1">
            <label for="remember">Remember me</label>
        </div>
        <button type="submit" class="btn-primary">Sign In</button>
    </form>
    <a href="{{ route('home') }}" class="back-link">← Back to site</a>
</div>
</body>
</html>
