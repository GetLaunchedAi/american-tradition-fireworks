<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $stats = [
            'total'    => Product::count(),
            'active'   => Product::active()->count(),
            'featured' => Product::featured()->count(),
            'consumer' => Product::active()->whereNull('caliber')->count(),
            'pro'      => Product::active()->whereNotNull('caliber')->count(),
        ];

        $brands = Product::selectRaw('brand, count(*) as count')
            ->groupBy('brand')
            ->orderByDesc('count')
            ->get();

        $recentProducts = Product::latest()->limit(10)->get();

        return view('admin.dashboard', compact('stats', 'brands', 'recentProducts'));
    }
}
