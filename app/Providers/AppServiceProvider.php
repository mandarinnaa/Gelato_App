<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Validación de algoritmo de Luhn para tarjetas
        Validator::extend('luhn', function ($attribute, $value, $parameters, $validator) {
            $value = preg_replace('/\D/', '', $value);
            
            if (strlen($value) < 13 || strlen($value) > 19) {
                return false;
            }
            
            $sum = 0;
            $numDigits = strlen($value);
            $parity = $numDigits % 2;
            
            for ($i = 0; $i < $numDigits; $i++) {
                $digit = (int) $value[$i];
                
                if ($i % 2 == $parity) {
                    $digit *= 2;
                }
                
                if ($digit > 9) {
                    $digit -= 9;
                }
                
                $sum += $digit;
            }
            
            return ($sum % 10) == 0;
        });

    }
}