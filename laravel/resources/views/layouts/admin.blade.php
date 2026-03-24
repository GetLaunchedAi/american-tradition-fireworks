<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin') | ATF Admin</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
            --bg: #0f172a;
            --surface: #1e293b;
            --border: #334155;
            --primary: #f97316;
            --primary-hover: #ea6c0a;
            --text: #f1f5f9;
            --muted: #94a3b8;
            --danger: #ef4444;
            --success: #22c55e;
            --radius: 8px;
            --sidebar-w: 240px;
        }
        body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: flex; }

        /* Sidebar */
        .sidebar {
            width: var(--sidebar-w);
            background: var(--surface);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            padding: 24px 0;
            position: fixed;
            top: 0; left: 0; bottom: 0;
            z-index: 10;
        }
        .sidebar__logo {
            padding: 0 20px 24px;
            border-bottom: 1px solid var(--border);
            margin-bottom: 16px;
        }
        .sidebar__logo img { max-width: 160px; height: auto; }
        .sidebar__logo span { font-size: 18px; font-weight: 700; color: var(--primary); }
        .sidebar__nav { list-style: none; padding: 0 12px; flex: 1; }
        .sidebar__nav li a {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-radius: var(--radius);
            color: var(--muted); text-decoration: none;
            font-size: 14px; transition: all .15s;
        }
        .sidebar__nav li a:hover,
        .sidebar__nav li a.active { background: rgba(249,115,22,.12); color: var(--primary); }
        .sidebar__footer { padding: 16px 20px; border-top: 1px solid var(--border); }
        .sidebar__footer form button {
            background: none; border: none; color: var(--muted); cursor: pointer;
            font-size: 14px; padding: 8px 12px; border-radius: var(--radius);
            width: 100%; text-align: left; transition: .15s;
        }
        .sidebar__footer form button:hover { background: rgba(239,68,68,.12); color: var(--danger); }

        /* Main */
        .main-wrap { margin-left: var(--sidebar-w); flex: 1; padding: 32px; max-width: calc(100vw - var(--sidebar-w)); }
        .page-header { margin-bottom: 28px; }
        .page-header h1 { font-size: 22px; font-weight: 700; }
        .page-header .subtitle { color: var(--muted); font-size: 14px; margin-top: 4px; }

        /* Cards */
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
        .stat-card__label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
        .stat-card__value { font-size: 28px; font-weight: 700; margin-top: 6px; color: var(--primary); }

        /* Alerts */
        .alert { padding: 12px 16px; border-radius: var(--radius); margin-bottom: 20px; font-size: 14px; }
        .alert--success { background: rgba(34,197,94,.12); border: 1px solid rgba(34,197,94,.3); color: var(--success); }
        .alert--error { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); color: var(--danger); }

        /* Table */
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { background: var(--bg); padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
        td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,.02); }
        .product-img { width: 44px; height: 44px; object-fit: cover; border-radius: 6px; background: var(--bg); }

        /* Badges */
        .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
        .badge--active { background: rgba(34,197,94,.15); color: var(--success); }
        .badge--inactive { background: rgba(239,68,68,.15); color: var(--danger); }
        .badge--pro { background: rgba(249,115,22,.15); color: var(--primary); }
        .badge--consumer { background: rgba(148,163,184,.15); color: var(--muted); }

        /* Buttons */
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; border: none; transition: .15s; }
        .btn-primary { background: var(--primary); color: #fff; }
        .btn-primary:hover { background: var(--primary-hover); }
        .btn-outline { background: none; border: 1px solid var(--border); color: var(--text); }
        .btn-outline:hover { border-color: var(--primary); color: var(--primary); }
        .btn-danger { background: none; border: 1px solid rgba(239,68,68,.4); color: var(--danger); }
        .btn-danger:hover { background: rgba(239,68,68,.12); }
        .btn-sm { padding: 5px 10px; font-size: 12px; }

        /* Forms */
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 13px; color: var(--muted); font-weight: 500; }
        .input, select, textarea {
            background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius);
            color: var(--text); padding: 10px 12px; font-size: 14px; width: 100%;
            transition: border-color .15s;
        }
        .input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); }
        textarea { resize: vertical; min-height: 100px; }
        .form-error { color: var(--danger); font-size: 12px; }
        .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 14px; }
        .checkbox-row input { width: auto; }

        /* Pagination */
        .pagination { display: flex; gap: 4px; align-items: center; margin-top: 20px; }
        .pagination a, .pagination span { padding: 6px 12px; border-radius: var(--radius); font-size: 13px; background: var(--surface); border: 1px solid var(--border); color: var(--text); text-decoration: none; }
        .pagination .active span { background: var(--primary); border-color: var(--primary); color: #fff; }

        /* Search bar */
        .toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .toolbar .input { max-width: 300px; }
        .toolbar select { max-width: 180px; }

        @media (max-width: 768px) {
            .sidebar { display: none; }
            .main-wrap { margin-left: 0; padding: 20px; max-width: 100vw; }
        }
    </style>
</head>
<body>

<aside class="sidebar">
    <div class="sidebar__logo">
        <span>ATF Admin</span>
    </div>
    <ul class="sidebar__nav">
        <li>
            <a href="{{ route('admin.dashboard') }}" class="{{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                📊 Dashboard
            </a>
        </li>
        <li>
            <a href="{{ route('admin.products.index') }}" class="{{ request()->routeIs('admin.products.*') ? 'active' : '' }}">
                🎆 Products
            </a>
        </li>
        <li>
            <a href="{{ route('admin.products.create') }}">
                ➕ Add Product
            </a>
        </li>
        <li>
            <a href="{{ route('admin.products.export') }}" target="_blank">
                ⬇️ Export JSON
            </a>
        </li>
        <li>
            <a href="{{ route('home') }}" target="_blank">
                🌐 View Site
            </a>
        </li>
    </ul>
    <div class="sidebar__footer">
        <p style="font-size:12px; color:var(--muted); margin-bottom:8px;">{{ auth()->user()->email ?? '' }}</p>
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit">🚪 Logout</button>
        </form>
    </div>
</aside>

<div class="main-wrap">
    @if(session('success'))
        <div class="alert alert--success">{{ session('success') }}</div>
    @endif
    @if(session('error'))
        <div class="alert alert--error">{{ session('error') }}</div>
    @endif

    @yield('content')
</div>

@stack('scripts')
</body>
</html>
