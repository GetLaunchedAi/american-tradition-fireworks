@extends('layouts.admin')
@section('title', 'Add Product')

@section('content')
<div class="page-header">
    <h1>Add Product</h1>
    <p class="subtitle"><a href="{{ route('admin.products.index') }}" style="color:var(--muted); text-decoration:none;">← Back to Products</a></p>
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
    <form method="POST" action="{{ route('admin.products.store') }}" enctype="multipart/form-data">
        @csrf
        @php $product = null; @endphp
        @include('admin.products._form')
        <div style="margin-top:28px; display:flex; gap:12px;">
            <button type="submit" class="btn btn-primary">Create Product</button>
            <a href="{{ route('admin.products.index') }}" class="btn btn-outline">Cancel</a>
        </div>
    </form>
</div>
@endsection
