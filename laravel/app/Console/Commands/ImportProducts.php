<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportProducts extends Command
{
    protected $signature = 'products:import
                            {file? : Path to the products.json file (defaults to public/products.json)}
                            {--fresh : Truncate the products table before importing}
                            {--dry-run : Preview changes without writing to the database}';

    protected $description = 'Import products from the legacy products.json file into the database';

    public function handle(): int
    {
        $file = $this->argument('file')
            ?? base_path('../public/products.json');

        if (!file_exists($file)) {
            // Try the src/_data location
            $alt = base_path('../src/_data/products.json');
            if (file_exists($alt)) {
                $file = $alt;
            } else {
                $this->error("File not found: {$file}");
                return self::FAILURE;
            }
        }

        $this->info("Reading: {$file}");

        $json = json_decode(file_get_contents($file), true);

        if (!isset($json['products']) || !is_array($json['products'])) {
            $this->error('Invalid products.json structure – expected { "products": [ ... ] }');
            return self::FAILURE;
        }

        $items = $json['products'];
        $this->info(count($items) . ' products found.');

        if ($this->option('dry-run')) {
            $this->warn('[Dry run] No data will be written.');
        }

        if ($this->option('fresh') && !$this->option('dry-run')) {
            Product::truncate();
            $this->warn('Table truncated.');
        }

        $created = $updated = $skipped = 0;
        $bar = $this->output->createProgressBar(count($items));
        $bar->start();

        foreach ($items as $item) {
            $sku = trim($item['sku'] ?? '');

            if (empty($sku)) {
                $skipped++;
                $bar->advance();
                continue;
            }

            // Clean up title (some have \r\n embedded)
            $title = str_replace(["\r\n", "\r", "\n"], ' – ', trim($item['title'] ?? ''));
            $slug  = Str::slug($item['slug'] ?? $title);

            // Make slug unique on insert
            if (!$this->option('dry-run')) {
                $baseSlug = $slug;
                $counter  = 1;
                while (Product::where('slug', $slug)->where('sku', '!=', $sku)->exists()) {
                    $slug = $baseSlug . '-' . $counter++;
                }
            }

            $data = [
                'sku'         => $sku,
                'title'       => $title,
                'slug'        => $slug,
                'brand'       => $item['brand'] ?? 'Winda',
                'category'    => $item['category'] ?? null,
                'case_pack'   => $item['casePack'] ?? null,
                'caliber'     => isset($item['caliber']) ? trim($item['caliber']) : null,
                'shots'       => $item['shots'] ?? null,
                'price'       => isset($item['price']) ? (float) $item['price'] : null,
                'youtube_url' => $item['youtubeUrl'] ?? null,
                'image'       => $item['image'] ?? null,
                'description' => $item['description'] ?? null,
                'subtitle'    => $item['subtitle'] ?? null,
                'badge'       => $item['badge'] ?? null,
                'badges'      => isset($item['badges']) ? (array) $item['badges'] : null,
                'is_featured' => (bool) ($item['isFeatured'] ?? false),
                'is_new'      => (bool) ($item['isNew'] ?? false),
                'is_on_sale'  => (bool) ($item['isOnSale'] ?? false),
                'is_active'   => true,
            ];

            if (!$this->option('dry-run')) {
                $existing = Product::where('sku', $sku)->first();

                if ($existing) {
                    $existing->update($data);
                    $updated++;
                } else {
                    Product::create($data);
                    $created++;
                }
            } else {
                $created++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        $this->table(
            ['Created', 'Updated', 'Skipped'],
            [[$created, $updated, $skipped]]
        );

        if (!$this->option('dry-run')) {
            $this->info('Import complete.');
        } else {
            $this->info('[Dry run] Would import/update ' . ($created + $updated) . ' products.');
        }

        return self::SUCCESS;
    }
}
