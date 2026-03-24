<footer id="footer">
    <div class="container">
        <div class="left-section">
            <a class="logo" href="{{ route('home') }}">
                <img loading="lazy" decoding="async" src="{{ asset('assets/images/logo_dark.png') }}" alt="American Tradition LLC logo" width="396" height="117" />
            </a>
        </div>
        <div class="right-section">
            <div class="lists">
                <ul>
                    <li><h2>Information</h2></li>
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><a href="{{ route('shop') }}">Shop</a></li>
                    <li><a href="{{ route('about') }}">About</a></li>
                    <li><a href="{{ route('contact') }}">Contact</a></li>
                </ul>
                <ul>
                    <li><h2>Contact</h2></li>
                    <li><a href="tel:2667314311">Tel: (266) 731-4311</a></li>
                    <li><a href="mailto:americantradition@yahoo.com">Click to Email</a></li>
                </ul>
            </div>
        </div>
    </div>
    <div class="credit">
        <span>Designed and Hand Coded by</span>
        <a href="https://www.kalamazoowebsitedesign.com" target="_blank" rel="noopener">Kalamazoo Website Design</a>
        <span class="copyright"> Copyright {{ date('Y') }} - Present</span>
    </div>
</footer>
