<?php

use Illuminate\Support\Facades\Route;

// Servir la aplicación React para todas las rutas no-API
Route::get('/{any}', function () {
    return view('react');
})->where('any', '^(?!api).*$');
