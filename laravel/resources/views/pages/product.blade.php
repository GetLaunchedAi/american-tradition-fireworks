@extends('layouts.app')

@section('tag_title', $product->title)
@section('description', $product->description ?: "Shop {$product->title} from American Tradition LLC. Michigan's trusted fireworks supplier since 1984.")
@section('og_title', $product->title . ' | American Tradition LLC')
@section('preload_css', asset('css/product.css'))

@section('content')

<section class="pdp" id="pdp">
    <div class="pdp__gallery">
        <div class="pdp__media">
            <img
                id="pdpImg"
                alt="{{ $product->title }}"
                loading="lazy"
                src="{{ $product->image_url }}"
            />
        </div>
        @if($product->youtube_url)
        <div id="pdpVideoContainer" class="pdp__video">
            {{-- YouTube embed --}}
            @php
                preg_match('/(?:youtu\.be\/|v=)([A-Za-z0-9_\-]{11})/', $product->youtube_url, $m);
                $ytId = $m[1] ?? null;
            @endphp
            @if($ytId)
                <iframe
                    src="https://www.youtube.com/embed/{{ $ytId }}"
                    title="{{ $product->title }} video"
                    frameborder="0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen
                    loading="lazy"
                ></iframe>
            @endif
        </div>
        @endif
    </div>

    <div class="pdp__meta">
        <nav class="crumbs">
            <a href="{{ route('shop') }}">Shop</a>
            @if($product->category)
                / <span>{{ $product->category }}</span>
            @endif
            / <span>{{ $product->title }}</span>
        </nav>

        <h1 id="pdpTitle">{{ $product->title }}</h1>

        <div class="pdp__meta-details">
            @if($product->sku)
                <span class="muted">SKU: {{ $product->sku }}</span>
            @endif
            @if($product->brand)
                <span class="muted">Brand: {{ $product->brand }}</span>
            @endif
            @if($product->case_pack)
                <span class="muted">Case Pack: {{ $product->case_pack }}</span>
            @endif
            @if($product->caliber)
                <span class="muted">Caliber: {{ $product->caliber }}mm</span>
            @endif
            @if($product->shots)
                <span class="muted">Shots: {{ $product->shots }}</span>
            @endif
        </div>

        @if($product->price)
        <p id="pdpPrice" class="pdp__price">
            @if($product->compare_at_price && $product->compare_at_price > $product->price)
                <span class="price price--sale">${{ number_format($product->price, 2) }}</span>
                <span class="price price--compare">${{ number_format($product->compare_at_price, 2) }}</span>
                <span class="badge badge--sale">Save {{ $product->discount_percent }}%</span>
            @else
                ${{ number_format($product->price, 2) }}
            @endif
        </p>
        @endif

        @if($product->description)
        <p id="pdpDesc" class="pdp__desc">{{ $product->description }}</p>
        @endif

        <button
            id="addToCartBtn"
            class="cart-add-item cta"
            data-item-id="{{ $product->id }}"
            data-item-name="{{ $product->title }}"
            data-item-url="{{ route('product.show', $product->slug) }}"
            data-item-image="{{ $product->image_url }}"
            data-item-description="{{ $product->description }}"
            data-item-price="{{ $product->price }}"
        >
            Add to cart
        </button>
    </div>
</section>

{{-- Related Products --}}
@if($related->count())
<section id="related-products" class="rp" aria-label="Related products">
    <div class="rp-head">
        <h2>Related Products</h2>
        <div class="rp-nav">
            <button class="rp-btn prev" aria-label="Scroll left" disabled>‹</button>
            <button class="rp-btn next" aria-label="Scroll right">›</button>
        </div>
    </div>
    <div class="rp-viewport">
        <div class="rp-track" id="rpTrack">
            @foreach($related as $rp)
            <article class="rel-card">
                <a class="rel-card__img" href="{{ route('product.show', $rp->slug) }}">
                    <img src="{{ $rp->image_url }}" alt="{{ $rp->title }}" loading="lazy">
                </a>
                <h3 class="rel-card__title">
                    <a href="{{ route('product.show', $rp->slug) }}">{{ $rp->title }}</a>
                </h3>
                @if($rp->price)
                <div class="rel-card__price">${{ number_format($rp->price, 2) }}</div>
                @endif
                <a class="rel-card__cta" href="{{ route('product.show', $rp->slug) }}">View Product</a>
            </article>
            @endforeach
        </div>
    </div>
</section>
@endif

@endsection

@push('scripts')
<script src="{{ asset('assets/js/product.js') }}" defer></script>
@endpush
