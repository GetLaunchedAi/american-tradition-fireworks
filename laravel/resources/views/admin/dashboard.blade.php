@extends('layouts.admin')
@section('title', 'Dashboard')

@section('content')
<div class="page-header">
    <h1>Dashboard</h1>
    <p class="subtitle">American Tradition LLC — Product Management</p>
</div>

<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-card__label">Total Products</div>
        <div class="stat-card__value">{{ number_format($stats['total']) }}</div>
    </div>
    <div class="stat-card">
        <div class="stat-card__label">Active</div>
        <div class="stat-card__value">{{ number_format($stats['active']) }}</div>
    </div>
    <div class="stat-card">
        <div class="stat-card__label">Featured</div>
        <div class="stat-card__value">{{ number_format($stats['featured']) }}</div>
    </div>
    <div class="stat-card">
        <div class="stat-card__label">Consumer</div>
        <div class="stat-card__value">{{ number_format($stats['consumer']) }}</div>
    </div>
    <div class="stat-card">
        <div class="stat-card__label">Pro Series</div>
        <div class="stat-card__value">{{ number_format($stats['pro']) }}</div>
    </div>
</div>

<div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div class="card">
        <h2 style="font-size:16px; margin-bottom:16px;">Products by Brand</h2>
        <table>
            <thead>
                <tr><th>Brand</th><th>Count</th></tr>
            </thead>
            <tbody>
                @foreach($brands as $row)
                <tr>
                    <td>{{ $row->brand }}</td>
                    <td>{{ number_format($row->count) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h2 style="font-size:16px;">Recently Added</h2>
            <a href="{{ route('admin.products.index') }}" class="btn btn-outline btn-sm">View All</a>
        </div>
        <table>
            <thead><tr><th>SKU</th><th>Title</th><th>Brand</th></tr></thead>
            <tbody>
                @foreach($recentProducts as $p)
                <tr>
                    <td style="font-family:monospace; font-size:12px;">{{ $p->sku }}</td>
                    <td>
                        <a href="{{ route('admin.products.edit', $p) }}" style="color:var(--text); text-decoration:none;">
                            {{ Str::limit($p->title, 40) }}
                        </a>
                    </td>
                    <td style="color:var(--muted); font-size:13px;">{{ $p->brand }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>

<div style="margin-top: 20px; display: flex; gap: 12px;">
    <a href="{{ route('admin.products.create') }}" class="btn btn-primary">➕ Add Product</a>
    <a href="{{ route('admin.products.export') }}" target="_blank" class="btn btn-outline">⬇️ Export products.json</a>
</div>
@endsection
