@extends('layouts.app')

@section('tag_title', 'Home - American Tradition Fireworks')
@section('description', "American Tradition LLC has been Michigan's trusted fireworks supplier since 1984. Veteran owned and operated, we provide retail and wholesale Consumer, Pro Series, and Display fireworks.")
@section('preload_css', asset('css/local.css'))

@section('content')

{{-- ============================================ --}}
{{--                    Hero                      --}}
{{-- ============================================ --}}
<section id="hero">
    <video autoplay muted loop playsinline class="cs-picture">
        <source src="{{ asset('images/hero_vid.mp4') }}" type="video/mp4" />
        Your browser does not support the video tag.
    </video>
    <div class="cs-overlay"></div>
    <div class="cs-container" data-aos="fade-up">
        <div class="cs-flex-group">
            <span class="cs-topper">Since 1984 • Veteran Owned</span>
            <h1 class="cs-title">Michigan's Trusted Fireworks Supplier</h1>
            <p class="cs-text">
                At American Tradition LLC, we've been lighting up celebrations for over
                40 years. As a direct importer, we offer retail and wholesale fireworks—
                including Consumer, Pro Series, and Display options—backed by quality
                brands like Winda, Panda, and Wizard Fireworks.
            </p>
            <a href="{{ route('shop') }}" class="cs-button-solid">Shop Fireworks</a>
            <a href="{{ route('about') }}" class="cs-button-transparent">
                <img class="cs-img" loading="lazy" decoding="async"
                     src="https://csimg.nyc3.digitaloceanspaces.com/Hero/play.svg"
                     alt="play icon" width="17" height="17" />
                Learn More
            </a>
        </div>
    </div>
</section>

{{-- ============================================ --}}
{{--                  Services                    --}}
{{-- ============================================ --}}
<section id="services" class="services" data-aos="fade-up">
    <div class="card" data-aos="fade-up" data-aos-delay="100">
        <picture>
            <img aria-hidden="true" decoding="async" src="{{ asset('assets/svgs/service_1.svg') }}" alt="consumer fireworks" width="48" height="48" />
        </picture>
        <h2>Consumer Fireworks</h2>
        <p>Perfect for family celebrations and backyard fun, our consumer fireworks are safe, exciting, and available in a wide variety of effects and assortments.</p>
    </div>
    <div class="card" data-aos="fade-up" data-aos-delay="200">
        <picture>
            <img aria-hidden="true" decoding="async" src="{{ asset('assets/svgs/service_2.svg') }}" alt="pro series fireworks" width="48" height="48" />
        </picture>
        <h2>Pro Series Fireworks</h2>
        <p>Take your show to the next level with professional-grade products designed for larger events and expert displays.</p>
    </div>
    <div class="card" data-aos="fade-up" data-aos-delay="300">
        <picture>
            <img aria-hidden="true" decoding="async" src="{{ asset('assets/svgs/service_3.svg') }}" alt="display fireworks" width="48" height="48" />
        </picture>
        <h2>Display Fireworks</h2>
        <p>From community festivals to grand finales, our large-scale display fireworks deliver breathtaking impact and unforgettable experiences.</p>
    </div>
</section>

{{-- ============================================ --}}
{{--                 Side By Side                 --}}
{{-- ============================================ --}}
<section id="sbs">
    <div class="cs-container">
        <div class="cs-left" data-aos="fade-right">
            <picture class="cs-picture cs-picture1">
                <img src="{{ asset('images/about_img_0.png') }}" alt="fireworks display" loading="lazy" width="630" height="775" />
            </picture>
        </div>
        <div class="cs-right" data-aos="fade-left">
            <span class="cs-topper">About Us</span>
            <h2 class="cs-title">About American Tradition LLC</h2>
            <p class="cs-text">
                Founded in 1984, American Tradition LLC is a veteran-owned, Michigan-based fireworks company with two locations.
                As a direct importer, we provide both retail and wholesale fireworks, giving customers access to high-quality products at unbeatable prices.
            </p>
            <p class="cs-text">
                We proudly carry top manufacturers like Winda, Panda, and Wizard Fireworks, along with other trusted brands,
                ensuring every show delivers safety, excitement, and lasting memories.
            </p>
            <div class="cs-flex-group">
                <p class="cs-flex-p">For over four decades, we've built our reputation on quality, reliability, and service.</p>
                <span class="cs-name">American Tradition LLC</span>
                <span class="cs-job">Veteran Owned &amp; Operated</span>
                <img class="cs-quote-icon" loading="lazy" decoding="async"
                     src="https://csimg.nyc3.digitaloceanspaces.com/SideBySide/quote-white.svg" alt="quote icon" width="136" height="77" />
            </div>
            <a href="{{ route('about') }}" class="button-solid">More About Us</a>
        </div>
    </div>
</section>

{{-- ============================================ --}}
{{--            Extra Content To Rank             --}}
{{-- ============================================ --}}
<section id="sbs-r">
    <div class="cs-container">
        <div class="cs-left" data-aos="fade-left">
            <picture class="cs-picture cs-picture1">
                <img src="{{ asset('images/featured_img_0.png') }}" alt="fireworks products" loading="lazy" width="630" height="775" />
            </picture>
        </div>
        <div class="cs-right" data-aos="fade-right">
            <span class="cs-topper">Our Products</span>
            <h2 class="cs-title">Wholesale &amp; Retail Fireworks</h2>
            <p class="cs-text">
                American Tradition LLC offers a wide range of fireworks, from consumer favorites to professional display products.
                Every item is carefully sourced to ensure top quality and maximum excitement.
            </p>
            <p class="cs-text">
                Whether you're celebrating a holiday, planning a wedding, hosting a festival, or stocking your own store,
                American Tradition is your trusted partner for fireworks that deliver.
            </p>
            <a href="{{ route('shop') }}" class="button-solid">Browse Fireworks →</a>
        </div>
    </div>
</section>

{{-- ============================================ --}}
{{--                   Reviews                    --}}
{{-- ============================================ --}}
<section id="reviews">
    <div class="cs-container" data-aos="fade-up">
        <span class="cs-topper">Our Reviews</span>
        <h2 class="cs-title">What Our Customers Say</h2>
        <p class="cs-text">For more than 40 years, we've earned the trust of families, businesses, and communities across Michigan.</p>
        <ul class="cs-card-group">
            <li class="cs-item" data-aos="fade-up" data-aos-delay="100">
                <p class="cs-item-p">American Tradition LLC has the best selection I've ever seen. The quality is unmatched and their team made the buying process easy and enjoyable.</p>
                <span class="cs-reviewer">Sarah L. <span class="cs-desc">Customer</span></span>
                <img class="cs-item-stars" aria-hidden="true" loading="lazy" decoding="async"
                     src="https://csimg.nyc3.digitaloceanspaces.com/Reviews/stars-yellow.svg" alt="5 stars" width="96" height="16" />
            </li>
            <li class="cs-item" data-aos="fade-up" data-aos-delay="200">
                <p class="cs-item-p">I've been buying wholesale from American Tradition for years. They're reliable, affordable, and always stocked with the best fireworks in the business.</p>
                <span class="cs-reviewer">James P. <span class="cs-desc">Wholesale Client</span></span>
                <img class="cs-item-stars" aria-hidden="true" loading="lazy" decoding="async"
                     src="https://csimg.nyc3.digitaloceanspaces.com/Reviews/stars-yellow.svg" alt="5 stars" width="96" height="16" />
            </li>
        </ul>
    </div>
</section>

{{-- ============================================ --}}
{{--             Final Call to Action             --}}
{{-- ============================================ --}}
<section id="cta" data-aos="zoom-in">
    <div class="container">
        <h2 class="title">Light Up Your Next Celebration <br> With American Tradition</h2>
        <p>Ready to shop retail or buy wholesale? Contact us today and let's get your order started.</p>
        <a href="{{ route('contact') }}" class="button-solid">Contact Us</a>
    </div>
    <picture>
        <img src="{{ asset('images/final_home_img.png') }}" alt="fireworks display" loading="lazy" width="1920" height="1080" />
    </picture>
</section>

@endsection
