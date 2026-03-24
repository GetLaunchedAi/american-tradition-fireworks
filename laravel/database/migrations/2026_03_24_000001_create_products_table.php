<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('brand')->default('Winda');

            // Consumer product fields
            $table->string('category')->nullable();
            $table->string('case_pack')->nullable();

            // Pro/Bright Star fields
            $table->string('caliber')->nullable();
            $table->string('shots')->nullable();

            // Pricing & display
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('compare_at_price', 10, 2)->nullable();

            // Media
            $table->string('image')->nullable();
            $table->string('youtube_url')->nullable();

            // Rich content
            $table->text('description')->nullable();
            $table->string('subtitle')->nullable();
            $table->string('badge')->nullable();
            $table->json('badges')->nullable();

            // Merchandising flags
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new')->default(false);
            $table->boolean('is_on_sale')->default(false);
            $table->boolean('is_active')->default(true);

            // Sort order
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->index('category');
            $table->index('brand');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
