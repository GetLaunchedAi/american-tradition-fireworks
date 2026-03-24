@extends('layouts.admin')
@section('title', 'Products')

@section('content')
<div class="page-header">
    <h1>Products</h1>
    <p class="subtitle">{{ $products->total() }} products total</p>
</div>

<div class="toolbar">
    <form method="GET" action="{{ route('admin.products.index') }}" style="display:contents">
        <input type="search" name="q" value="{{ request('q') }}" placeholder="Search by title or SKU…" class="input">
        <select name="brand" onchange="this.form.submit()" class="input">
            <option value="">All Brands</option>
            @foreach($brands as $brand)
                <option value="{{ $brand }}" {{ request('brand') == $brand ? 'selected' : '' }}>{{ $brand }}</option>
            @endforeach
        </select>
        <button type="submit" class="btn btn-outline">Search</button>
        <a href="{{ route('admin.products.index') }}" class="btn btn-outline">Clear</a>
    </form>
    <a href="{{ route('admin.products.create') }}" class="btn btn-primary" style="margin-left:auto;">➕ Add Product</a>
</div>

<div class="card">
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>SKU</th>
                    <th>Title</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($products as $product)
                <tr>
                    <td>
                        <img src="{{ $product->image_url }}" alt="{{ $product->title }}" class="product-img"
                             onerror="this.src='/images/placeholder.png'">
                    </td>
                    <td style="font-family:monospace; font-size:12px; color:var(--muted);">{{ $product->sku }}</td>
                    <td>
                        <a href="{{ route('admin.products.edit', $product) }}" style="color:var(--text); text-decoration:none; font-weight:500;">
                            {{ Str::limit($product->title, 50) }}
                        </a>
                    </td>
                    <td style="color:var(--muted); font-size:13px;">{{ $product->brand }}</td>
                    <td style="color:var(--muted); font-size:12px;">{{ Str::limit($product->category, 30) }}</td>
                    <td>
                        <span class="badge {{ $product->product_type === 'pro' ? 'badge--pro' : 'badge--consumer' }}">
                            {{ $product->product_type === 'pro' ? 'Pro' : 'Consumer' }}
                        </span>
                    </td>
                    <td>{{ $product->price ? '$'.number_format($product->price, 2) : '—' }}</td>
                    <td>
                        <span class="badge {{ $product->is_active ? 'badge--active' : 'badge--inactive' }}">
                            {{ $product->is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </td>
                    <td>
                        <div style="display:flex; gap:6px; align-items:center;">
                            <a href="{{ route('admin.products.edit', $product) }}" class="btn btn-outline btn-sm">Edit</a>
                            <a href="{{ route('product.show', $product->slug) }}" target="_blank" class="btn btn-outline btn-sm">View</a>
                            <form method="POST" action="{{ route('admin.products.destroy', $product) }}"
                                  onsubmit="return confirm('Delete \'{{ addslashes($product->title) }}\'? This cannot be undone.')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr><td colspan="9" style="text-align:center; color:var(--muted); padding:32px;">No products found.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="pagination">
        {{ $products->links() }}
    </div>
</div>
@endsection
