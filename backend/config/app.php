<?php

use Illuminate\Support\Facades\Facade;

return [
    'name'           => env('APP_NAME', 'Ekta Digital'),
    'env'            => env('APP_ENV', 'production'),
    'debug'          => (bool) env('APP_DEBUG', false),
    'url'            => env('APP_URL', 'http://localhost'),
    'timezone'       => env('APP_TIMEZONE', 'Africa/Dar_es_Salaam'),
    'locale'         => env('APP_LOCALE', 'en'),
    'fallback_locale'=> env('APP_FALLBACK_LOCALE', 'en'),
    'faker_locale'   => env('APP_FAKER_LOCALE', 'en_US'),
    'cipher'         => 'AES-256-CBC',
    'key'            => env('APP_KEY'),
    'previous_keys'  => array_filter(explode(',', env('APP_PREVIOUS_KEYS', ''))),
    'maintenance'    => ['driver' => 'file'],

    // WhatsApp (Callmebot)
    'whatsapp_number' => env('WHATSAPP_NUMBER', '255783394445'),
    'whatsapp_api_key'=> env('WHATSAPP_API_KEY'),

    'providers' => Illuminate\Support\AggregateServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
    ])->toArray(),
];
