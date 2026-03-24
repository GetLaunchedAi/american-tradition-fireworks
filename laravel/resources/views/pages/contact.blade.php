@extends('layouts.app')

@section('tag_title', 'Contact Us')
@section('description', "Get in touch with American Tradition LLC. Michigan's trusted fireworks supplier since 1984.")
@section('preload_css', asset('css/contact.css'))

@section('content')

<section id="int-hero" data-aos="fade-in">
    <h1>Contact Us</h1>
    <picture>
        <img src="{{ asset('images/contact_banner.png') }}" alt="Contact American Tradition" loading="lazy" width="1920" height="400" />
    </picture>
</section>

<section id="contact" class="section">
    <div class="container">

        @if(session('success'))
        <div class="alert alert--success" role="alert">
            {{ session('success') }}
        </div>
        @endif

        <div class="contact-wrapper">
            <div class="contact-form-col">
                <span class="cs-topper">Get In Touch</span>
                <h2 class="cs-title">Send Us a Message</h2>

                <form method="POST" action="{{ route('contact.submit') }}" class="contact-form">
                    @csrf
                    <div class="form-group">
                        <label for="name">Name *</label>
                        <input id="name" type="text" name="name" value="{{ old('name') }}"
                               placeholder="Your Name" required class="input {{ $errors->has('name') ? 'input--error' : '' }}" />
                        @error('name')<span class="form-error">{{ $message }}</span>@enderror
                    </div>
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input id="email" type="email" name="email" value="{{ old('email') }}"
                               placeholder="your@email.com" required class="input {{ $errors->has('email') ? 'input--error' : '' }}" />
                        @error('email')<span class="form-error">{{ $message }}</span>@enderror
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone</label>
                        <input id="phone" type="tel" name="phone" value="{{ old('phone') }}"
                               placeholder="(555) 000-0000" class="input" />
                    </div>
                    <div class="form-group">
                        <label for="message">Message *</label>
                        <textarea id="message" name="message" rows="6"
                                  placeholder="How can we help you?" required
                                  class="input {{ $errors->has('message') ? 'input--error' : '' }}">{{ old('message') }}</textarea>
                        @error('message')<span class="form-error">{{ $message }}</span>@enderror
                    </div>
                    <button type="submit" class="button-solid">Send Message</button>
                </form>
            </div>

            <div class="contact-info-col">
                <h2 class="cs-title">Contact Information</h2>
                <ul class="contact-list">
                    <li>
                        <strong>Phone</strong>
                        <a href="tel:2667314311">(266) 731-4311</a>
                    </li>
                    <li>
                        <strong>Email</strong>
                        <a href="mailto:americantradition@yahoo.com">americantradition@yahoo.com</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</section>

@endsection
