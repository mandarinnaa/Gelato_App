<?php

return [
    'mode' => env('PAYPAL_MODE', 'sandbox'), // sandbox o live
    
    'sandbox' => [
        'client_id' => env('PAYPAL_SANDBOX_CLIENT_ID', ''),
        'secret' => env('PAYPAL_SANDBOX_SECRET', ''),
    ],
    
    'live' => [
        'client_id' => env('PAYPAL_LIVE_CLIENT_ID', ''),
        'secret' => env('PAYPAL_LIVE_SECRET', ''),
    ],
    
    'payment_action' => 'Sale',
    'currency' => 'MXN',
    'notify_url' => '',
    'locale' => 'es_MX',
    'validate_ssl' => true,
];