<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'sku'              => ['required', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($productId)],
            'title'            => ['required', 'string', 'max:255'],
            'slug'             => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productId)],
            'brand'            => ['required', 'string', 'max:100'],
            'category'         => ['nullable', 'string', 'max:255'],
            'case_pack'        => ['nullable', 'string', 'max:50'],
            'caliber'          => ['nullable', 'string', 'max:50'],
            'shots'            => ['nullable', 'string', 'max:50'],
            'price'            => ['nullable', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'youtube_url'      => ['nullable', 'url', 'max:500'],
            'image'            => ['nullable', 'image', 'max:5120'],
            'description'      => ['nullable', 'string'],
            'subtitle'         => ['nullable', 'string', 'max:255'],
            'badge'            => ['nullable', 'string', 'max:100'],
            'badges'           => ['nullable', 'array'],
            'badges.*'         => ['string', 'max:100'],
            'is_featured'      => ['boolean'],
            'is_new'           => ['boolean'],
            'is_on_sale'       => ['boolean'],
            'is_active'        => ['boolean'],
            'sort_order'       => ['nullable', 'integer', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Auto-generate slug if not provided
        if (empty($this->slug) && !empty($this->title)) {
            $this->merge(['slug' => \Illuminate\Support\Str::slug($this->title)]);
        }

        // Normalise checkboxes (HTML forms send nothing for unchecked)
        $this->merge([
            'is_featured' => $this->boolean('is_featured'),
            'is_new'      => $this->boolean('is_new'),
            'is_on_sale'  => $this->boolean('is_on_sale'),
            'is_active'   => $this->boolean('is_active', true),
        ]);
    }
}
