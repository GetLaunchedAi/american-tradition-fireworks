<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ContactController extends Controller
{
    public function index(): View
    {
        return view('pages.contact');
    }

    public function submit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['required', 'email'],
            'phone'   => ['nullable', 'string', 'max:30'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        // TODO: wire up mail driver (e.g. SMTP, Mailgun) and send email
        // Mail::to(config('mail.to_address'))->send(new ContactMail($validated));

        return redirect()->route('contact')->with('success', 'Your message has been sent. We\'ll be in touch soon!');
    }
}
