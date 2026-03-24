@extends('layouts.app')

@section('tag_title', 'About Us')
@section('description', "Learn about American Tradition LLC, Michigan's veteran-owned fireworks company serving customers since 1984.")
@section('preload_css', asset('css/about.css'))

@section('content')

<section id="int-hero" data-aos="fade-in">
    <h1>About American Tradition LLC</h1>
    <picture>
        <img src="{{ asset('images/about_banner.png') }}" alt="About American Tradition" loading="lazy" width="1920" height="400" />
    </picture>
</section>

<section id="sbs" class="section">
    <div class="cs-container">
        <div class="cs-left" data-aos="fade-right">
            <picture class="cs-picture cs-picture1">
                <img src="{{ asset('images/about_img_0.png') }}" alt="Fireworks display" loading="lazy" width="630" height="775" />
            </picture>
        </div>
        <div class="cs-right" data-aos="fade-left">
            <span class="cs-topper">Who We Are</span>
            <h2 class="cs-title">Michigan's Fireworks Experts Since 1984</h2>
            <p class="cs-text">
                Founded in 1984, American Tradition LLC is a veteran-owned, Michigan-based fireworks company with two locations.
                As a direct importer, we provide both retail and wholesale fireworks, giving customers access to high-quality products at unbeatable prices.
            </p>
            <p class="cs-text">
                We proudly carry top manufacturers like Winda, Panda, and Wizard Fireworks, along with other trusted brands,
                ensuring every show delivers safety, excitement, and lasting memories. Whether you're stocking up for resale
                or planning your biggest event yet, our team is here to help you celebrate in style.
            </p>
            <p class="cs-text">
                For over four decades, we've built our reputation on quality, reliability, and service.
                Our mission is simple: to keep traditions alive by providing fireworks that bring people together.
            </p>
        </div>
    </div>
</section>

<section id="faq" class="section section-tight">
    <div class="container">
        <span class="cs-topper">FAQ</span>
        <h2 class="cs-title">Frequently Asked Questions</h2>

        <div class="faq-group">
            <details>
                <summary>Do you offer wholesale pricing?</summary>
                <p>Yes! We offer wholesale pricing for retailers and large-quantity buyers. Contact us for more information about our wholesale program.</p>
            </details>
            <details>
                <summary>What brands do you carry?</summary>
                <p>We carry top brands including Winda, Panda, Wizard Fireworks, and Bright Star, among others.</p>
            </details>
            <details>
                <summary>Do you ship fireworks?</summary>
                <p>Fireworks shipping is subject to state and federal regulations. Please contact us to discuss your options.</p>
            </details>
            <details>
                <summary>Are you veteran owned?</summary>
                <p>Yes! American Tradition LLC is proudly veteran owned and operated since 1984.</p>
            </details>
        </div>
    </div>
</section>

<section id="cta" data-aos="zoom-in">
    <div class="container">
        <h2 class="title">Ready to Shop?</h2>
        <p>Browse our full selection of consumer and professional fireworks.</p>
        <a href="{{ route('shop') }}" class="button-solid">Shop Now</a>
    </div>
</section>

@endsection
