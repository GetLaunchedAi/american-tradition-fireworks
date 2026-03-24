<?php

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are prefixed with /api automatically.
|
*/

/**
 * Full product catalog.
 * GET /api/products
 */
Route::get('/products', function (Request $request) {
    $query = Product::active();

    if ($q = $request->get('q')) {
        $query->search($q);
    }
    if ($brand = $request->get('brand')) {
        $query->byBrand($brand);
    }
    if ($category = $request->get('category')) {
        $query->byCategory($category);
    }

    $products = $query->orderBy('sort_order')->orderBy('title')->get()->map(fn ($p) => $p->toApiArray());

    return response()->json(['products' => $products]);
});

/**
 * Single product by slug.
 * GET /api/products/{slug}
 */
Route::get('/products/{slug}', function (string $slug) {
    $product = Product::active()->where('slug', $slug)->firstOrFail();
    return response()->json($product->toApiArray());
});

/**
 * All distinct categories.
 * GET /api/categories
 */
Route::get('/categories', function () {
    $categories = Product::active()
        ->whereNotNull('category')
        ->where('category', '!=', '')
        ->distinct()
        ->orderBy('category')
        ->pluck('category');

    return response()->json($categories);
});

/**
 * All distinct brands.
 * GET /api/brands
 */
Route::get('/brands', function () {
    $brands = Product::active()
        ->distinct()
        ->orderBy('brand')
        ->pluck('brand');

    return response()->json($brands);
});
