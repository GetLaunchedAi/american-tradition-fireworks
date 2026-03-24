<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="canonical" href="{{ config('app.url') . request()->getRequestUri() }}">
    <meta name="description" content="@yield('description', 'American Tradition LLC has been Michigan\'s trusted fireworks supplier since 1984. Veteran owned and operated.')">

    {{-- Open Graph --}}
    <meta property="og:title" content="@yield('og_title', config('app.name'))" />
    <meta property="og:description" content="@yield('description', 'Michigan\'s Trusted Fireworks Supplier Since 1984.')" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{{ config('app.url') . request()->getRequestUri() }}" />
    <meta property="og:image" content="{{ asset('images/social.jpg') }}" />

    {{-- Favicons --}}
    <link rel="icon" href="{{ asset('assets/favicons/light/favicon.ico') }}" media="(prefers-color-scheme: light)">
    <link rel="icon" href="{{ asset('assets/favicons/dark/favicon.ico') }}" media="(prefers-color-scheme: dark)">

    {{-- Fonts & CSS --}}
    <link rel="preload" as="font" type="font/woff2" href="{{ asset('assets/fonts/roboto-v29-latin-regular.woff2') }}" crossorigin>
    <link rel="preload" as="font" type="font/woff2" href="{{ asset('assets/fonts/roboto-v29-latin-700.woff2') }}" crossorigin>

    <link rel="stylesheet" href="{{ asset('css/root.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dark.css') }}">
    <link rel="stylesheet" href="{{ asset('css/critical.css') }}">

    @hasSection('preload_css')
        <link rel="stylesheet" href="@yield('preload_css')">
    @endif

    {{-- AOS Animation --}}
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">

    <title>
        @if(request()->is('/'))
            American Tradition LLC | @yield('tag_title', 'Home') | Michigan Fireworks
        @else
            @yield('tag_title', 'American Tradition Fireworks') | American Tradition LLC
        @endif
    </title>
</head>

<body class="{{ request()->is('product/*') ? 'nav-solid' : '' }}">
    <a class="skip" aria-label="skip to main content" href="#main">Click To Skip To Main Content</a>

    @include('partials.header')

    <main id="main">
        @yield('content')
    </main>

    @include('partials.footer')

    <script defer src="{{ asset('assets/js/nav.js') }}"></script>
    <script defer src="{{ asset('assets/js/dark.js') }}"></script>
    <script defer src="{{ asset('assets/js/local-cart.js') }}"></script>

    <script defer>
        document.addEventListener('scroll', () => {
            document.body.classList.toggle('scroll', document.documentElement.scrollTop >= 100);
        });
    </script>

    {{-- AOS --}}
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>AOS.init({ duration: 800, once: true, offset: 100 });</script>

    @stack('scripts')
</body>
</html>
