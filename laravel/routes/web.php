<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use Illuminate\Support\Facades\Route;

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/about', fn () => view('pages.about'))->name('about');

Route::get('/shop', [ShopController::class, 'index'])->name('shop');

Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');

Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'submit'])->name('contact.submit');

// Legacy public catalog JSON (mirrors old /products.json passthrough)
Route::get('/products.json', [ProductController::class, 'catalog'])->name('products.catalog');

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

Route::get('/admin/login', function () {
    return auth()->check() ? redirect()->route('admin.dashboard') : view('admin.login');
})->name('login');

Route::post('/admin/login', function (\Illuminate\Http\Request $request) {
    $credentials = $request->validate([
        'email'    => ['required', 'email'],
        'password' => ['required'],
    ]);

    if (\Illuminate\Support\Facades\Auth::attempt($credentials, $request->boolean('remember'))) {
        $request->session()->regenerate();
        return redirect()->intended(route('admin.dashboard'));
    }

    return back()->withErrors(['email' => 'Invalid credentials.'])->onlyInput('email');
})->name('login.post');

Route::post('/admin/logout', function (\Illuminate\Http\Request $request) {
    \Illuminate\Support\Facades\Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect()->route('login');
})->name('logout');

// ---------------------------------------------------------------------------
// Admin (auth-protected)
// ---------------------------------------------------------------------------

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth'])
    ->group(function () {

        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::prefix('products')->name('products.')->group(function () {
            Route::get('/', [AdminProductController::class, 'index'])->name('index');
            Route::get('/create', [AdminProductController::class, 'create'])->name('create');
            Route::post('/', [AdminProductController::class, 'store'])->name('store');
            Route::get('/{product}/edit', [AdminProductController::class, 'edit'])->name('edit');
            Route::put('/{product}', [AdminProductController::class, 'update'])->name('update');
            Route::delete('/{product}', [AdminProductController::class, 'destroy'])->name('destroy');
            Route::get('/export', [AdminProductController::class, 'export'])->name('export');
        });
    });
