@extends('layouts.app')

@section('tag_title', 'Shop Fireworks')
@section('description', 'Browse our full selection of consumer and pro series fireworks. Filter by category, brand, and price.')
@section('preload_css', asset('css/shop.css'))

@section('content')

<section id="int-hero" data-aos="fade-in">
    <h1 id="home-h">Shop Fireworks</h1>
    <picture>
        <img src="{{ asset('images/shop_banner_img.png') }}" alt="Shop Fireworks" loading="lazy" width="1920" height="400" />
    </picture>
</section>

<div class="plp__filters-backdrop" data-filters-backdrop hidden></div>

<section class="section section-tight">
    <div class="container">
        <div class="plp" data-collection-page>

            {{-- Mobile bar --}}
            <div class="plp__mobilebar">
                <button class="btn btn-ghost btn-sm" type="button" data-filters-toggle>Filters</button>
                <div class="plp__sort" style="display:flex; gap:10px; align-items:center;">
                    <label class="sr-only" for="sort-select">Sort</label>
                    <select id="sort-select" class="select" data-sort-select onchange="applySort(this.value)">
                        <option value="featured" {{ request('sort','featured') == 'featured' ? 'selected' : '' }}>Sort: Featured</option>
                        <option value="price-asc" {{ request('sort') == 'price-asc' ? 'selected' : '' }}>Price: Low → High</option>
                        <option value="price-desc" {{ request('sort') == 'price-desc' ? 'selected' : '' }}>Price: High → Low</option>
                        <option value="title-asc" {{ request('sort') == 'title-asc' ? 'selected' : '' }}>Name: A → Z</option>
                        <option value="title-desc" {{ request('sort') == 'title-desc' ? 'selected' : '' }}>Name: Z → A</option>
                    </select>
                </div>
            </div>

            {{-- Sidebar Filters --}}
            <aside class="plp__sidebar" aria-label="Filters">
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                        <h2 class="card__title">Filters</h2>
                        <button class="btn btn-ghost btn-sm" type="button" data-filters-close>Close</button>
                    </div>
                    <p class="muted card__text">Tap a filter to narrow results.</p>

                    <form method="GET" action="{{ route('shop') }}" id="filterForm">
                        <input type="hidden" name="sort" value="{{ request('sort', 'featured') }}">

                        {{-- Search --}}
                        <div class="filter-group">
                            <p class="filter-label">Search</p>
                            <input type="search" name="q" value="{{ request('q') }}" placeholder="Search products…" class="input">
                        </div>

                        {{-- Popular flags --}}
                        <div class="filter-group">
                            <p class="filter-label">Popular</p>
                            <div class="chip-row">
                                <button type="submit" name="filter" value="new"
                                    class="chip {{ request('filter') == 'new' ? 'chip--active' : '' }}"
                                    aria-pressed="{{ request('filter') == 'new' ? 'true' : 'false' }}">New</button>
                                <button type="submit" name="filter" value="best"
                                    class="chip {{ request('filter') == 'best' ? 'chip--active' : '' }}"
                                    aria-pressed="{{ request('filter') == 'best' ? 'true' : 'false' }}">Best Sellers</button>
                                <button type="submit" name="filter" value="sale"
                                    class="chip {{ request('filter') == 'sale' ? 'chip--active' : '' }}"
                                    aria-pressed="{{ request('filter') == 'sale' ? 'true' : 'false' }}">On Sale</button>
                            </div>
                        </div>

                        {{-- Price --}}
                        <div class="filter-group">
                            <p class="filter-label">Price</p>
                            <div class="chip-row">
                                @foreach(['0-25' => '$0–$25', '25-75' => '$25–$75', '75+' => '$75+'] as $val => $label)
                                    <button type="submit" name="price" value="{{ $val }}"
                                        class="chip {{ request('price') == $val ? 'chip--active' : '' }}"
                                        aria-pressed="{{ request('price') == $val ? 'true' : 'false' }}">{{ $label }}</button>
                                @endforeach
                            </div>
                        </div>

                        {{-- Brand --}}
                        @if($brands->count())
                        <div class="filter-group">
                            <p class="filter-label">Brand</p>
                            <div class="chip-row">
                                @foreach($brands as $brand)
                                    <button type="submit" name="brand" value="{{ $brand }}"
                                        class="chip {{ request('brand') == $brand ? 'chip--active' : '' }}"
                                        aria-pressed="{{ request('brand') == $brand ? 'true' : 'false' }}">{{ $brand }}</button>
                                @endforeach
                            </div>
                        </div>
                        @endif

                        {{-- Category --}}
                        @if($categories->count())
                        <div class="filter-group">
                            <p class="filter-label">Category</p>
                            <select name="category" class="select" onchange="document.getElementById('filterForm').submit()">
                                <option value="">All Categories</option>
                                @foreach($categories as $cat)
                                    <option value="{{ $cat }}" {{ request('category') == $cat ? 'selected' : '' }}>{{ $cat }}</option>
                                @endforeach
                            </select>
                        </div>
                        @endif

                        <div style="display:flex; gap:8px; margin-top:12px;">
                            <button type="submit" class="btn btn-primary btn-sm">Apply</button>
                            <a href="{{ route('shop') }}" class="btn btn-outline btn-sm">Clear</a>
                        </div>
                    </form>
                </div>
            </aside>

            {{-- Product Grid --}}
            <div class="plp__main">
                <div class="plp__toolbar">
                    <p class="muted plp__count">
                        Showing {{ $products->count() }} item{{ $products->count() !== 1 ? 's' : '' }}
                    </p>
                    <div class="plp__sort plp__sort--desktop">
                        <label class="muted" for="sort-select-desktop">Sort</label>
                        <select id="sort-select-desktop" class="select" onchange="applySort(this.value)">
                            <option value="featured" {{ request('sort','featured') == 'featured' ? 'selected' : '' }}>Featured</option>
                            <option value="price-asc" {{ request('sort') == 'price-asc' ? 'selected' : '' }}>Price: Low → High</option>
                            <option value="price-desc" {{ request('sort') == 'price-desc' ? 'selected' : '' }}>Price: High → Low</option>
                            <option value="title-asc" {{ request('sort') == 'title-asc' ? 'selected' : '' }}>Name: A → Z</option>
                            <option value="title-desc" {{ request('sort') == 'title-desc' ? 'selected' : '' }}>Name: Z → A</option>
                        </select>
                    </div>
                </div>

                <div class="product-grid">
                    @forelse($products as $product)
                        <x-product-card :product="$product" />
                    @empty
                        <p class="muted" style="grid-column:1/-1; text-align:center; padding:40px 0;">
                            No products found. <a href="{{ route('shop') }}">Clear filters</a>
                        </p>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</section>

@endsection

@push('scripts')
<script src="{{ asset('assets/js/main.js') }}" defer></script>
<script>
function applySort(value) {
    const url = new URL(window.location.href);
    url.searchParams.set('sort', value);
    window.location.href = url.toString();
}
</script>
@endpush
