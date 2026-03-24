<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ShopController extends Controller
{
    public function index(Request $request): View
    {
        $query = Product::active();

        if ($search = $request->get('q')) {
            $query->search($search);
        }

        if ($brand = $request->get('brand')) {
            $query->byBrand($brand);
        }

        if ($category = $request->get('category')) {
            $query->byCategory($category);
        }

        if ($request->get('filter') === 'new') {
            $query->where('is_new', true);
        } elseif ($request->get('filter') === 'best') {
            $query->where('is_featured', true);
        } elseif ($request->get('filter') === 'sale') {
            $query->where('is_on_sale', true);
        }

        // Price filters
        if ($price = $request->get('price')) {
            match ($price) {
                '0-25'  => $query->where('price', '<=', 25),
                '25-75' => $query->whereBetween('price', [25, 75]),
                '75+'   => $query->where('price', '>=', 75),
                default => null,
            };
        }

        // Sort
        match ($request->get('sort', 'featured')) {
            'price-asc'   => $query->orderBy('price'),
            'price-desc'  => $query->orderByDesc('price'),
            'title-asc'   => $query->orderBy('title'),
            'title-desc'  => $query->orderByDesc('title'),
            default       => $query->orderBy('sort_order')->orderBy('title'),
        };

        $products   = $query->get();
        $categories = Product::active()->whereNotNull('category')->distinct()->orderBy('category')->pluck('category');
        $brands     = Product::active()->distinct()->orderBy('brand')->pluck('brand');

        return view('pages.shop', compact('products', 'categories', 'brands'));
    }
}
