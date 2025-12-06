<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class UserPaymentCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payment_method_id',
        'payment_type',
        'card_holder_name',
        'card_number_encrypted',
        'card_last_four',
        'card_brand',
        'expiry_month',
        'expiry_year',
        'paypal_email',
        'paypal_payer_id',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    protected $hidden = [
        'card_number_encrypted',
    ];

    protected $appends = [
        'masked_card_number',
        'display_name',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el método de pago
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Encriptar número de tarjeta antes de guardar
     */
    public function setCardNumberAttribute($value)
    {
        if ($value) {
            $this->attributes['card_last_four'] = substr($value, -4);
            $this->attributes['card_number_encrypted'] = Crypt::encryptString($value);
        }
    }

    /**
     * Desencriptar número de tarjeta
     */
    public function getDecryptedCardNumber()
    {
        if ($this->card_number_encrypted) {
            return Crypt::decryptString($this->card_number_encrypted);
        }
        return null;
    }

    /**
     * Obtener número de tarjeta enmascarado
     */
    public function getMaskedCardNumberAttribute(): ?string
    {
        if ($this->payment_type === 'paypal') {
            return null;
        }
        
        return $this->card_last_four ? '**** **** **** ' . $this->card_last_four : null;
    }

    /**
     * Obtener nombre para mostrar
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->payment_type === 'paypal') {
            return 'PayPal - ' . $this->paypal_email;
        }
        
        return ucfirst($this->card_brand) . ' •••• ' . $this->card_last_four;
    }

    /**
     * Verificar si es PayPal
     */
    public function isPayPal(): bool
    {
        return $this->payment_type === 'paypal';
    }

    /**
     * Verificar si es tarjeta
     */
    public function isCard(): bool
    {
        return $this->payment_type === 'card';
    }

    /**
     * Verificar si la tarjeta está expirada
     */
    public function isExpired(): bool
    {
        if ($this->payment_type === 'paypal') {
            return false;
        }

        $currentYear = (int) date('Y');
        $currentMonth = (int) date('m');
        
        $expiryYear = (int) $this->expiry_year;
        $expiryMonth = (int) $this->expiry_month;
        
        if ($expiryYear < $currentYear) {
            return true;
        }
        
        if ($expiryYear == $currentYear && $expiryMonth < $currentMonth) {
            return true;
        }
        
        return false;
    }

    /**
     * Scope para obtener solo tarjetas activas
     */
    public function scopeActive($query)
    {
        return $query->where(function($q) {
            $q->where('payment_type', 'paypal')
              ->orWhere(function($q2) {
                  $currentYear = date('Y');
                  $currentMonth = date('m');
                  
                  $q2->where('payment_type', 'card')
                     ->where(function($q3) use ($currentYear, $currentMonth) {
                         $q3->where('expiry_year', '>', $currentYear)
                            ->orWhere(function($q4) use ($currentYear, $currentMonth) {
                                $q4->where('expiry_year', '=', $currentYear)
                                   ->where('expiry_month', '>=', $currentMonth);
                            });
                     });
              });
        });
    }
}