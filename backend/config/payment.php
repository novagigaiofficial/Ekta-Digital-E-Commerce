<?php
return [
    'selcom' => [
        'api_key'      => env('SELCOM_API_KEY'),
        'api_secret'   => env('SELCOM_API_SECRET'),
        'vendor_id'    => env('SELCOM_VENDOR_ID'),
        'base_url'     => env('SELCOM_BASE_URL', 'https://apigw.selcommobile.com/v1'),
        'redirect_url' => env('FRONTEND_URL', 'http://localhost:3000') . '/payment/success',
        'cancel_url'   => env('FRONTEND_URL', 'http://localhost:3000') . '/payment/cancel',
    ],
    'paypal' => [
        'client_id'        => env('PAYPAL_CLIENT_ID'),
        'client_secret'    => env('PAYPAL_CLIENT_SECRET'),
        'mode'             => env('PAYPAL_MODE', 'sandbox'), // sandbox | live
        'return_url'       => env('FRONTEND_URL', 'http://localhost:3000') . '/payment/paypal/success',
        'cancel_url'       => env('FRONTEND_URL', 'http://localhost:3000') . '/payment/paypal/cancel',
        'tzs_to_usd_rate'  => env('PAYPAL_TZS_TO_USD_RATE', 0.00038),
    ],
    'bank' => [
        'account_number' => env('BANK_ACCOUNT_NUMBER'),
        'account_name'   => env('BANK_ACCOUNT_NAME', 'Ekta Digital Ltd'),
        'bank_name'      => env('BANK_NAME', 'CRDB Bank'),
        'branch'         => env('BANK_BRANCH', 'India Street, Dar-es-Salaam'),
        'swift'          => env('BANK_SWIFT', 'CORUTZTZ'),
    ],
];
