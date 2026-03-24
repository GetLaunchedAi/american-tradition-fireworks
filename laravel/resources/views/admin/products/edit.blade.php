@extends('layouts.admin')
@section('title', 'Edit: ' . $product->title)

@section('content')
<div class="page-header">
    <h1>Edit Product</h1>
    <p class="subtitle">
        <a href="{{ route('admin.products.index') }}" style="color:var(--muted); text-decoration:none;">← Products</a>
        &nbsp;/&nbsp; {{ Str::limit($product->title, 60) }}
    </p>
</div>

@if($errors->any())
    <div class="alert alert--error">
        <strong>Please fix the errors below:</strong>
        <ul style="margin-top:8px; padding-left:16px;">
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<div class="card">
    <form method="POST" action="{{ route('admin.products.update', $product) }}" enctype="multipart/form-data">
        @csrf
        @method('PUT')
        @include('admin.products._form')
        <div style="margin-top:28px; display:flex; gap:12px; align-items:center;">
            <button type="submit" class="btn btn-primary">Save Changes</button>
            <a href="{{ route('product.show', $product->slug) }}" target="_blank" class="btn btn-outline">View on Site</a>
            <form method="POST" action="{{ route('admin.products.destroy', $product) }}" style="margin-left:auto;"
                  onsubmit="return confirm('Permanently delete \'{{ addslashes($product->title) }}\'?')">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-danger">Delete Product</button>
            </form>
        </div>
    </form>
</div>
@endsection
