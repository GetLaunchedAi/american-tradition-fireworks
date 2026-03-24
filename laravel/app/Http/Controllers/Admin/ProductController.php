<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class ProductController extends Controller
{
    public function index(Request $request): View
    {
        $query = Product::query();

        if ($search = $request->get('q')) {
            $query->search($search);
        }

        if ($brand = $request->get('brand')) {
            $query->where('brand', $brand);
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $products = $query->orderBy('sort_order')->orderBy('title')->paginate(50)->withQueryString();
        $brands   = Product::distinct()->orderBy('brand')->pluck('brand');

        return view('admin.products.index', compact('products', 'brands'));
    }

    public function create(): View
    {
        $brands     = Product::distinct()->orderBy('brand')->pluck('brand');
        $categories = Product::whereNotNull('category')->distinct()->orderBy('category')->pluck('category');

        return view('admin.products.create', compact('brands', 'categories'));
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $product = Product::create($data);

        return redirect()
            ->route('admin.products.edit', $product)
            ->with('success', "Product \"{$product->title}\" created successfully.");
    }

    public function edit(Product $product): View
    {
        $brands     = Product::distinct()->orderBy('brand')->pluck('brand');
        $categories = Product::whereNotNull('category')->distinct()->orderBy('category')->pluck('category');

        return view('admin.products.edit', compact('product', 'brands', 'categories'));
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image from storage if it's a storage path
            if ($product->image && !str_starts_with($product->image, '/images')) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $product->update($data);

        return redirect()
            ->route('admin.products.edit', $product)
            ->with('success', "Product \"{$product->title}\" updated successfully.");
    }

    public function destroy(Product $product): RedirectResponse
    {
        $title = $product->title;
        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', "Product \"{$title}\" deleted.");
    }

    /**
     * Export all products as a JSON file (mirrors the old products.json workflow).
     */
    public function export(): \Illuminate\Http\Response
    {
        $products = Product::all()->map(fn ($p) => $p->toApiArray());
        $json     = json_encode(['products' => $products], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return response($json, 200, [
            'Content-Type'        => 'application/json',
            'Content-Disposition' => 'attachment; filename="products.json"',
        ]);
    }
}
