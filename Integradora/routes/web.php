<?php

use Illuminate\Support\Facades\Route;

// Servir la aplicación React para todas las rutas no-API y no-estáticas
Route::get('/{any}', function () {
    return view('react');
})->where('any', '^(?!api|static|react-app).*$');
