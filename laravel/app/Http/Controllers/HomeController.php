<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function index(): View
    {
        $featured = Product::active()->featured()->orderBy('sort_order')->limit(6)->get();

        return view('pages.home', compact('featured'));
    }
}
