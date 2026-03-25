{{-- Shared product form partial for create and edit views --}}
<div class="form-grid">
    {{-- SKU --}}
    <div class="form-group">
        <label for="sku">SKU *</label>
        <input id="sku" type="text" name="sku" value="{{ old('sku', $product->sku ?? '') }}"
               placeholder="e.g. P1234 or BS8016" required class="input">
        @error('sku')<span class="form-error">{{ $message }}</span>@enderror
    </div>

    {{-- Brand --}}
    <div class="form-group">
        <label for="brand">Brand *</label>
        <input id="brand" type="text" name="brand" value="{{ old('brand', $product->brand ?? 'Winda') }}"
               list="brand-list" required class="input">
        <datalist id="brand-list">
            @foreach($brands as $b)
                <option value="{{ $b }}">
            @endforeach
        </datalist>
        @error('brand')<span class="form-error">{{ $message }}</span>@enderror
    </div>

    {{-- Title (full width) --}}
    <div class="form-group" style="grid-column: 1 / -1;">
        <label for="title">Title *</label>
        <input id="title" type="text" name="title" value="{{ old('title', $product->title ?? '') }}"
               required class="input" placeholder="Product title">
        @error('title')<span class="form-error">{{ $message }}</span>@enderror
    </div>

    {{-- Slug --}}
    <div class="form-group">
        <label for="slug">Slug (URL)</label>
        <input id="slug" type="text" name="slug" value="{{ old('slug', $product->slug ?? '') }}"
               placeholder="auto-generated" class="input">
        @error('slug')<span class="form-error">{{ $message }}</span>@enderror
    </div>

    {{-- Subtitle --}}
    <div class="form-group">
        <label for="subtitle">Subtitle</label>
        <input id="subtitle" type="text" name="subtitle" value="{{ old('subtitle', $product->subtitle ?? '') }}"
               class="input" placeholder="Short subtitle">
    </div>
</div>

<hr style="border-color: var(--border); margin: 24px 0;">
<h3 style="font-size:15px; margin-bottom:16px; color:var(--muted);">Consumer Fireworks Fields</h3>

<div class="form-grid">
    <div class="form-group">
        <label for="category">Category</label>
        <input id="category" type="text" name="category" value="{{ old('category', $product->category ?? '') }}"
               list="category-list" class="input" placeholder="e.g. Fountain, Cake, Rockets">
        <datalist id="category-list">
            @foreach($categories as $cat)
                <option value="{{ $cat }}">
            @endforeach
        </datalist>
    </div>
    <div class="form-group">
        <label for="case_pack">Case Pack</label>
        <input id="case_pack" type="text" name="case_pack" value="{{ old('case_pack', $product->case_pack ?? '') }}"
               class="input" placeholder="e.g. 12/1">
    </div>
</div>

<hr style="border-color: var(--border); margin: 24px 0;">
<h3 style="font-size:15px; margin-bottom:16px; color:var(--muted);">Pro / Bright Star Fields</h3>

<div class="form-grid">
    <div class="form-group">
        <label for="caliber">Caliber (mm)</label>
        <input id="caliber" type="text" name="caliber" value="{{ old('caliber', $product->caliber ?? '') }}"
               class="input" placeholder="e.g. 30">
    </div>
    <div class="form-group">
        <label for="shots">Shots</label>
        <input id="shots" type="text" name="shots" value="{{ old('shots', $product->shots ?? '') }}"
               class="input" placeholder="e.g. 49">
    </div>
</div>

<hr style="border-color: var(--border); margin: 24px 0;">
<h3 style="font-size:15px; margin-bottom:16px; color:var(--muted);">Pricing</h3>

<div class="form-grid">
    <div class="form-group">
        <label for="price">Price ($)</label>
        <input id="price" type="number" name="price" step="0.01" min="0"
               value="{{ old('price', $product->price ?? '') }}" class="input" placeholder="0.00">
    </div>
    <div class="form-group">
        <label for="compare_at_price">Compare-at Price ($)</label>
        <input id="compare_at_price" type="number" name="compare_at_price" step="0.01" min="0"
               value="{{ old('compare_at_price', $product->compare_at_price ?? '') }}" class="input" placeholder="0.00">
    </div>
</div>

<hr style="border-color: var(--border); margin: 24px 0;">
<h3 style="font-size:15px; margin-bottom:16px; color:var(--muted);">Media</h3>

<div class="form-grid">
    <div class="form-group">
        <label for="youtube_url">YouTube URL</label>
        <input id="youtube_url" type="url" name="youtube_url"
               value="{{ old('youtube_url', $product->youtube_url ?? '') }}"
               class="input" placeholder="https://youtu.be/…">
        @error('youtube_url')<span class="form-error">{{ $message }}</span>@enderror
    </div>
    <div class="form-group">
        <label for="image">Product Image</label>
        <input id="image" type="file" name="image" accept="image/*" class="input">
        @if($product && !empty($product->image))
            <div style="margin-top:8px;">
                <img src="{{ $product->image_url }}" alt="Current image" style="height:64px; border-radius:6px; border:1px solid var(--border);" onerror="this.style.display='none'">
                <p style="font-size:11px; color:var(--muted); margin-top:4px;">Current: {{ $product->image }}</p>
            </div>
        @endif
        @error('image')<span class="form-error">{{ $message }}</span>@enderror
    </div>
</div>

<hr style="border-color: var(--border); margin: 24px 0;">
<h3 style="font-size:15px; margin-bottom:16px; color:var(--muted);">Description & Badges</h3>

<div class="form-grid">
    <div class="form-group" style="grid-column: 1 / -1;">
        <label for="description">Description</label>
        <textarea id="description" name="description" class="input" rows="4" placeholder="Product description…">{{ old('description', $product->description ?? '') }}</textarea>
    </div>
    <div class="form-group">
        <label for="badge">Badge (single)</label>
        <input id="badge" type="text" name="badge" value="{{ old('badge', $product->badge ?? '') }}"
               class="input" placeholder="e.g. Best Seller">
    </div>
    <div class="form-group">
        <label for="sort_order">Sort Order</label>
        <input id="sort_order" type="number" name="sort_order" min="0"
               value="{{ old('sort_order', $product->sort_order ?? 0) }}" class="input">
    </div>
</div>

<hr style="border-color: var(--border); margin: 24px 0;">
<h3 style="font-size:15px; margin-bottom:16px; color:var(--muted);">Flags</h3>

<div style="display:flex; gap:24px; flex-wrap:wrap;">
    <label class="checkbox-row">
        <input type="checkbox" name="is_active" value="1" {{ old('is_active', $product->is_active ?? true) ? 'checked' : '' }}>
        Active (visible on site)
    </label>
    <label class="checkbox-row">
        <input type="checkbox" name="is_featured" value="1" {{ old('is_featured', $product->is_featured ?? false) ? 'checked' : '' }}>
        Featured
    </label>
    <label class="checkbox-row">
        <input type="checkbox" name="is_new" value="1" {{ old('is_new', $product->is_new ?? false) ? 'checked' : '' }}>
        New Arrival
    </label>
    <label class="checkbox-row">
        <input type="checkbox" name="is_on_sale" value="1" {{ old('is_on_sale', $product->is_on_sale ?? false) ? 'checked' : '' }}>
        On Sale
    </label>
</div>
