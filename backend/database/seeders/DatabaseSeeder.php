<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\HomepageSection;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        // Admin user
        User::firstOrCreate(
            ['email'=>'admin@ektadigital.co.tz'],
            ['first_name'=>'Ekta','last_name'=>'Admin','password'=>Hash::make('admin123'),'account_type'=>'admin']
        );
        // Test customer
        User::firstOrCreate(
            ['email'=>'customer@test.com'],
            ['first_name'=>'Test','last_name'=>'Customer','password'=>Hash::make('password'),'account_type'=>'b2c','loyalty_points_balance'=>250]
        );

        // Categories
        $categories = [
            ['name'=>'Home Appliances','slug'=>'home-appliances','sort_order'=>1],
            ['name'=>'IT & Office',    'slug'=>'it-office',      'sort_order'=>2],
            ['name'=>'Printers & Toners','slug'=>'printers-toners','sort_order'=>3],
            ['name'=>'Office Supplies','slug'=>'office-supplies', 'sort_order'=>4],
        ];
        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug'=>$cat['slug']], array_merge($cat, ['is_active'=>true]));
        }
        $catMap = Category::pluck('id','slug');

        // Products — use fixed slugs so re-seeding is idempotent
        $products = [
            ['category_slug'=>'home-appliances','name'=>'Samsung 2-Door Refrigerator 200L','slug'=>'samsung-2-door-refrigerator-200l','brand'=>'Samsung','base_price_tzs'=>1200000,'offer_price_tzs'=>980000,'is_featured'=>true,'is_new_arrival'=>true,'is_top_seller'=>true,'description'=>'Energy-efficient double-door fridge with frost-free technology.','variants'=>[['sku'=>'SAM-FRIDGE-200-SIL','colour'=>'Silver','stock_quantity'=>15],['sku'=>'SAM-FRIDGE-200-BLK','colour'=>'Black','stock_quantity'=>8]]],
            ['category_slug'=>'printers-toners','name'=>'HP LaserJet Pro M404dn',           'slug'=>'hp-laserjet-pro-m404dn',         'brand'=>'HP',     'base_price_tzs'=>650000, 'offer_price_tzs'=>null,   'is_featured'=>true,'is_new_arrival'=>false,'is_top_seller'=>true, 'description'=>'High-speed monochrome laser printer for office use.','variants'=>[['sku'=>'HP-LJ-M404DN','model'=>'Standard','stock_quantity'=>20]]],
            ['category_slug'=>'it-office',      'name'=>'Dell 24" FHD Monitor',             'slug'=>'dell-24-fhd-monitor',            'brand'=>'Dell',   'base_price_tzs'=>420000, 'offer_price_tzs'=>380000, 'is_featured'=>true,'is_new_arrival'=>true, 'is_top_seller'=>false,'description'=>'Full HD IPS display with thin bezels.','variants'=>[['sku'=>'DELL-MON-24-BLK','colour'=>'Black','stock_quantity'=>12]]],
            ['category_slug'=>'it-office',      'name'=>'Logitech MX Master 3 Mouse',       'slug'=>'logitech-mx-master-3-mouse',     'brand'=>'Logitech','base_price_tzs'=>85000,  'offer_price_tzs'=>null,   'is_featured'=>false,'is_new_arrival'=>true,'is_top_seller'=>false,'description'=>'Advanced wireless mouse for power users.','variants'=>[['sku'=>'LOG-MXM3-BLK','colour'=>'Black','stock_quantity'=>30],['sku'=>'LOG-MXM3-GRY','colour'=>'Graphite','stock_quantity'=>4]]],
            ['category_slug'=>'home-appliances','name'=>'Midea 1.5HP Split Air Conditioner','slug'=>'midea-15hp-split-air-conditioner','brand'=>'Midea',  'base_price_tzs'=>890000, 'offer_price_tzs'=>null,   'is_featured'=>true,'is_new_arrival'=>false,'is_top_seller'=>true, 'description'=>'Inverter split AC with WiFi control and fast cooling.','variants'=>[['sku'=>'MIDEA-AC-15HP','model'=>'1.5HP','stock_quantity'=>6],['sku'=>'MIDEA-AC-2HP','model'=>'2HP','stock_quantity'=>3]]],
            ['category_slug'=>'printers-toners','name'=>'Canon PIXMA G3470 Ink Tank',       'slug'=>'canon-pixma-g3470-ink-tank',     'brand'=>'Canon',  'base_price_tzs'=>320000, 'offer_price_tzs'=>null,   'is_featured'=>false,'is_new_arrival'=>true,'is_top_seller'=>false,'description'=>'High-yield ink tank printer for home and small office.','variants'=>[['sku'=>'CAN-G3470','model'=>'Standard','stock_quantity'=>0]]],
        ];

        foreach ($products as $pData) {
            $variants   = $pData['variants'];
            $catSlug    = $pData['category_slug'];
            $slug       = $pData['slug'];
            unset($pData['variants'], $pData['category_slug'], $pData['slug']);

            $product = Product::firstOrCreate(
                ['slug' => $slug],
                array_merge($pData, [
                    'category_id' => $catMap[$catSlug],
                    'slug'        => $slug,
                    'vat_rate'    => 0.18,
                    'status'      => 'active',
                    'images'      => ["https://placehold.co/600x600/e6f4f4/008080?text=".urlencode($pData['brand'])],
                ])
            );
            foreach ($variants as $v) {
                ProductVariant::firstOrCreate(
                    ['sku' => $v['sku']],
                    array_merge($v, ['product_id'=>$product->id,'price_adjustment_tzs'=>0])
                );
            }
        }

        // Homepage sections
        foreach (['hero','categories','featured','new_arrivals','loyalty','b2b','promotions','reviews','newsletter'] as $i=>$type) {
            HomepageSection::firstOrCreate(['type'=>$type],['sort_order'=>$i,'is_visible'=>true]);
        }

        $this->command->info('✅ Ekta Digital seeded!');
        $this->command->info('Admin: admin@ektadigital.co.tz / admin123');
        $this->command->info('Customer: customer@test.com / password');
    }
}
