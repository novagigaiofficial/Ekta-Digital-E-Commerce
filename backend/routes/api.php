<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\LoyaltyController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\HomepageController;
use App\Http\Controllers\Api\HeroSlideController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentController;

// ── Public Routes ─────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post("/login",    [AuthController::class, "login"]);
    Route::post("/forgot-password", [AuthController::class, "forgotPassword"])->middleware("throttle:5,1");
    Route::post('/reset-password',  [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

    // OTP — throttled to 5 requests per minute per IP
    Route::post('/otp/send',   [OtpController::class, 'send'])->middleware('throttle:5,1');
    Route::post('/otp/verify', [OtpController::class, 'verify'])->middleware('throttle:10,1');

    // Products (public)
    Route::get('/products',        [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/categories',      [CategoryController::class, 'index']);
    Route::get('/promotions',      [PromotionController::class, 'active']);

    // Homepage
    Route::get('/homepage/sections', [HomepageController::class, 'index']);
    Route::get('/hero-slides',       [HeroSlideController::class, 'index']);

    // Payment webhooks (public — called by payment gateways, no auth)
    Route::post('/payment/webhook/selcom', [PaymentController::class, 'webhookSelcom']);
    Route::post('/payment/webhook/paypal', [PaymentController::class, 'webhookPayPal']);

    // Contact
    Route::post('/contact', [App\Http\Controllers\Api\ContactController::class, 'store'])->middleware('throttle:5,1');

    // Quote (public — guest or authenticated)
    Route::post('/quotes', [QuoteController::class, 'store']);

    // ── Protected Routes (must be logged in) ──────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/me', [AuthController::class, 'updateProfile']);
        Route::put('/me/password', [AuthController::class, 'changePassword']);
        Route::get('/me',      [AuthController::class, 'me']);

        // Orders
        Route::get('/orders',               [OrderController::class, 'index']);
        Route::post('/orders',              [OrderController::class, 'store']);
        Route::get('/orders/{id}',          [OrderController::class, 'show']);
        Route::get('/orders/{id}/invoice',  [InvoiceController::class, 'download']);
        Route::post('/orders/{id}/confirm-delivery', [OrderController::class, 'confirmDelivery']);

        // Payment
        Route::post('/orders/{id}/pay',           [PaymentController::class, 'initiate']);
        Route::get('/orders/{id}/payment-status', [PaymentController::class, 'status']);
        Route::post('/payment/paypal/capture',    [PaymentController::class, 'capturePayPal']);

        // Loyalty
        Route::get('/loyalty',         [LoyaltyController::class, 'index']);
        Route::post('/loyalty/redeem', [LoyaltyController::class, 'redeem']);

        // Wishlist
        Route::get('/wishlist',         [WishlistController::class, 'index']);
        Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

        // Addresses
        Route::get('/addresses',          [AddressController::class, 'index']);
        Route::post('/addresses',         [AddressController::class, 'store']);
        Route::delete('/addresses/{id}',  [AddressController::class, 'destroy']);

        // ── Admin Only Routes ──────────────────────────────────
        Route::middleware('admin')->group(function () {

            // Products
            Route::post('/admin/products',        [ProductController::class, 'store']);
            Route::put('/admin/products/{id}',    [ProductController::class, 'update']);
            Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);

            // Categories
            Route::post('/admin/categories',        [CategoryController::class, 'store']);
            Route::put('/admin/categories/{id}',    [CategoryController::class, 'update']);
            Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy']);

            // Orders
            Route::get('/admin/orders',                        [OrderController::class, 'adminIndex']);
            Route::get('/admin/orders/{id}',                   [OrderController::class, 'adminShow']);
            Route::put('/admin/orders/{id}',                   [OrderController::class, 'update']);
            Route::post('/admin/orders/{id}/confirm-delivery', [OrderController::class, 'adminConfirmDelivery']);
            Route::get('/admin/orders/{id}/invoice',           [InvoiceController::class, 'download']);
            Route::get('/admin/orders/{id}/invoice/preview',   [InvoiceController::class, 'preview']);

            // Quotes
            Route::get('/admin/quotes',      [QuoteController::class, 'index']);
            Route::put('/admin/quotes/{id}', [QuoteController::class, 'update']);

            // Promotions
            Route::get('/admin/promotions',          [PromotionController::class, 'index']);
            Route::post('/admin/promotions',         [PromotionController::class, 'store']);
            Route::put('/admin/promotions/{id}',     [PromotionController::class, 'update']);
            Route::delete('/admin/promotions/{id}',  [PromotionController::class, 'destroy']);

            // Dashboard & Customers
            Route::get('/admin/dashboard',  [AdminController::class, 'dashboard']);
            Route::get('/admin/customers',  [AdminController::class, 'customers']);

            // Payment — admin can mark orders as paid manually
            Route::post('/admin/orders/{id}/mark-paid', [PaymentController::class, 'adminMarkPaid']);

            // Loyalty — manual adjustment
            Route::post('/admin/loyalty/adjust', [LoyaltyController::class, 'adminAdjust']);

            // Homepage builder
            Route::get('/admin/homepage',               [HomepageController::class, 'adminIndex']);
            Route::post('/admin/homepage/reorder',      [HomepageController::class, 'reorder']);
            Route::post('/admin/homepage/seed',         [HomepageController::class, 'seed']);
            Route::patch('/admin/homepage/{id}/toggle', [HomepageController::class, 'toggleVisibility']);

            // Hero slides
            Route::get('/admin/hero-slides',           [HeroSlideController::class, 'adminIndex']);
            Route::post('/admin/hero-slides',          [HeroSlideController::class, 'store']);
            Route::put('/admin/hero-slides/{id}',      [HeroSlideController::class, 'update']);
            Route::delete('/admin/hero-slides/{id}',   [HeroSlideController::class, 'destroy']);
            Route::post('/admin/hero-slides/reorder',  [HeroSlideController::class, 'reorder']);

            // Contact messages
            Route::get('/admin/contact', [App\Http\Controllers\Api\ContactController::class, 'index']);

            // Uploads (Cloudinary)
            Route::post('/admin/upload/image',   [UploadController::class, 'uploadImage']);
            Route::post('/admin/upload/images',  [UploadController::class, 'uploadImages']);
            Route::post('/admin/upload/video',   [UploadController::class, 'uploadVideo']);
            Route::post('/admin/upload/hero',    [UploadController::class, 'uploadHeroImage']);
            Route::delete('/admin/upload',       [UploadController::class, 'delete']);

            // Invoice template
            Route::get('/admin/invoice-template', [InvoiceController::class, 'getTemplate']);
            Route::put('/admin/invoice-template', [InvoiceController::class, 'updateTemplate']);
        });
    });
});
