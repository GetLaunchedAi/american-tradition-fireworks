# American Tradition LLC — Laravel 11 Backend

A full Laravel 11 migration of the original Eleventy + JSON site for American Tradition Fireworks.

## Stack

- **Framework**: Laravel 11
- **Database**: SQLite (dev) / MySQL (production)
- **Auth**: Built-in Laravel session auth (no packages needed)
- **Storage**: Laravel public disk (`storage/app/public` → `public/storage`)
- **Image uploads**: Local public disk via `Storage::disk('public')`

---

## Quick Start

```bash
cd laravel

# Install dependencies
php ../composer.phar install   # or: composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Database
touch database/database.sqlite   # SQLite dev DB
php artisan migrate

# Import products from legacy products.json
php artisan products:import --fresh

# Create admin user (one-time)
php artisan tinker --execute="App\Models\User::create(['name'=>'Admin','email'=>'admin@americantradition.com','password'=>bcrypt('yourpassword')]);"

# Storage symlink
php artisan storage:link

# Start dev server
php artisan serve
```

Open http://localhost:8000

---

## Admin Panel

- **URL**: http://localhost:8000/admin
- **Login**: http://localhost:8000/admin/login
- **Default credentials** (change immediately!):
  - Email: `admin@americantradition.com`
  - Password: `changeme123!`

### Admin Features
- Dashboard with product stats by brand/type
- Full CRUD for products (create, edit, delete)
- Image upload (stored in `storage/app/public/products/`)
- Export all products as `products.json` (compatible with legacy JS)
- Search and filter by brand

---

## Data Import Command

```bash
# Import from the legacy products.json (auto-detects location)
php artisan products:import

# Force fresh import (truncates table first)
php artisan products:import --fresh

# Dry run (preview without writing)
php artisan products:import --dry-run

# Specify a custom file
php artisan products:import /path/to/products.json
```

---

## Routes

### Public
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/` | Home page |
| GET | `/shop` | Product listing (PLP) with filters |
| GET | `/product/{slug}` | Product detail (PDP) |
| GET | `/about` | About page |
| GET | `/contact` | Contact form |
| POST | `/contact` | Submit contact form |
| GET | `/products.json` | Legacy catalog JSON (all active products) |

### API (`/api/*`)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/products` | All active products (JSON) |
| GET | `/api/products/{slug}` | Single product |
| GET | `/api/categories` | All distinct categories |
| GET | `/api/brands` | All distinct brands |

### Admin (`/admin/*`)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/admin` | Dashboard |
| GET/POST | `/admin/login` | Login |
| POST | `/admin/logout` | Logout |
| GET | `/admin/products` | Product list |
| GET | `/admin/products/create` | New product form |
| POST | `/admin/products` | Store product |
| GET | `/admin/products/{id}/edit` | Edit product |
| PUT | `/admin/products/{id}` | Update product |
| DELETE | `/admin/products/{id}` | Delete product |
| GET | `/admin/products/export` | Download products.json |

---

## Database Schema — `products` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Auto-increment primary key |
| `sku` | string (unique) | e.g. `P0044`, `BS8016` |
| `title` | string | Product name |
| `slug` | string (unique) | URL-safe identifier |
| `brand` | string | e.g. `Winda`, `Bright Star` |
| `category` | string (nullable) | Consumer category |
| `case_pack` | string (nullable) | e.g. `12/1` |
| `caliber` | string (nullable) | Pro Series caliber in mm |
| `shots` | string (nullable) | Number of shots (pro) |
| `price` | decimal(10,2) | Sale price |
| `compare_at_price` | decimal(10,2) | Original price (for discount display) |
| `image` | string | Path or URL to product image |
| `youtube_url` | string | YouTube video URL |
| `description` | text | Full product description |
| `subtitle` | string | Short subtitle |
| `badge` | string | Single badge label |
| `badges` | json | Array of badge labels |
| `is_featured` | boolean | Featured on homepage |
| `is_new` | boolean | "New" filter chip |
| `is_on_sale` | boolean | "Sale" filter chip |
| `is_active` | boolean | Visible on site |
| `sort_order` | integer | Manual sort priority |

---

## Production Deployment

1. Update `.env`:
   ```
   APP_ENV=production
   APP_DEBUG=false
   DB_CONNECTION=mysql
   DB_HOST=your-host
   DB_DATABASE=atf_fireworks
   DB_USERNAME=...
   DB_PASSWORD=...
   ```
2. Run `php artisan migrate --force`
3. Run `php artisan products:import --fresh`
4. Run `php artisan config:cache && php artisan route:cache && php artisan view:cache`
5. Point web server document root to `laravel/public/`
6. Add `.htaccess` rewrite rules (see `laravel/public/.htaccess`)
