@props(['product'])

<article class="product-card">
    <a class="product-card__img-link" href="{{ route('product.show', $product->slug) }}">
        <img
            src="{{ $product->image_url }}"
            alt="{{ $product->title }}"
            loading="lazy"
            width="400"
            height="400"
        />

        @if($product->is_new)
            <span class="badge badge--new">New</span>
        @endif

        @if($product->is_on_sale && $product->discount_percent)
            <span class="badge badge--sale">-{{ $product->discount_percent }}%</span>
        @endif

        @if($product->badge)
            <span class="badge badge--custom">{{ $product->badge }}</span>
        @endif
    </a>

    <div class="product-card__info">
        <h3 class="product-card__title">
            <a href="{{ route('product.show', $product->slug) }}">{{ $product->title }}</a>
        </h3>

        @if($product->subtitle)
            <p class="product-card__subtitle">{{ $product->subtitle }}</p>
        @endif

        @if($product->category)
            <p class="product-card__category muted">{{ $product->category }}</p>
        @endif

        @if($product->caliber)
            <p class="product-card__meta muted">{{ $product->caliber }}mm · {{ $product->shots }} shots</p>
        @endif

        <div class="product-card__price">
            @if($product->price)
                @if($product->compare_at_price && $product->compare_at_price > $product->price)
                    <span class="price price--sale">${{ number_format($product->price, 2) }}</span>
                    <span class="price price--compare">${{ number_format($product->compare_at_price, 2) }}</span>
                @else
                    <span class="price">${{ number_format($product->price, 2) }}</span>
                @endif
            @endif
        </div>

        <a class="product-card__cta btn btn-primary" href="{{ route('product.show', $product->slug) }}">
            View Product
        </a>
    </div>
</article>
