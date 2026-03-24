<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function show(string $slug): View
    {
        $product  = Product::active()->where('slug', $slug)->firstOrFail();
        $related  = $product->relatedProducts(8);

        return view('pages.product', compact('product', 'related'));
    }

    /**
     * Public JSON catalog endpoint – mirrors the old /products.json static file.
     */
    public function catalog(Request $request): Response
    {
        $products = Product::active()
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get()
            ->map(fn ($p) => $p->toApiArray());

        return response(['products' => $products])
            ->header('Content-Type', 'application/json')
            ->header('Cache-Control', 'public, max-age=300');
    }
}
