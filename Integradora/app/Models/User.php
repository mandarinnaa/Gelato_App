<?php

namespace App\Models;

// ✅ AGREGADO: Para sistema de reseteo de contraseña
use Illuminate\Contracts\Auth\CanResetPassword;
use App\Notifications\ResetPasswordNotification;

// Los demás imports ya los tenías
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Log;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;

// ✅ AGREGADO: implements CanResetPassword
class User extends Authenticatable implements CanResetPassword
{
    use HasFactory, Notifiable, HasApiTokens;

    // ✅ AGREGADO: 'email_verified_at' a los fillable para usuarios de Google
    protected $fillable = [
        'name',
        'email',
        'phone',
        'profile_photo',
        'password',
        'role_id',
        'membership_id',
        'membership_expires_at',
        'membership_cancelled_at',
        'membership_auto_renew',
        'points',
        'driver_status_id',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['profile_photo_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'membership_expires_at' => 'datetime',
            'membership_cancelled_at' => 'datetime',
            'membership_auto_renew' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * ✅ MÉTODO NUEVO: Enviar notificación personalizada de reseteo de contraseña
     * Este método override el comportamiento por defecto de Laravel
     * Detecta si es usuario de Google para personalizar el mensaje del email
     */
    public function sendPasswordResetNotification($token)
    {
        // Detectar si es usuario de Google (tiene foto de perfil de URL externa)
        $isGoogleUser = filter_var($this->profile_photo, FILTER_VALIDATE_URL);

        Log::info('📧 Enviando notificación de reseteo de contraseña', [
            'user_id' => $this->id,
            'email' => $this->email,
            'is_google_user' => $isGoogleUser
        ]);

        // Enviar notificación personalizada
        $this->notify(new ResetPasswordNotification($token, $isGoogleUser));
    }

    /**
     * Get the profile photo URL attribute.
     * ← ESTE MÉTODO YA LO TENÍAS, NO CAMBIÓ
     */
    public function getProfilePhotoUrlAttribute(): ?string
    {
        if (!$this->profile_photo) {
            return null;
        }

        if (filter_var($this->profile_photo, FILTER_VALIDATE_URL)) {
            return $this->profile_photo;
        }

        return '/storage/' . $this->profile_photo;
    }

    // ========================================
    // RELACIONES - NO CAMBIARON
    // ========================================
    
    /**
     * Get the role that owns the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the membership that owns the user.
     */
    public function membership(): BelongsTo
    {
        return $this->belongsTo(Membership::class);
    }

    /**
     * Get the driver status that owns the user.
     */
    public function driverStatus(): BelongsTo
    {
        return $this->belongsTo(DriverStatus::class);
    }

    /**
     * Get the orders for the user (as client).
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the orders assigned to the user (as delivery person).
     */
    public function deliveries(): HasMany
    {
        return $this->hasMany(Order::class, 'delivery_person_id');
    }

    /**
     * Get the addresses for the user.
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    /**
     * Get the sales registered by the user (as employee).
     */
    public function salesAsEmployee(): HasMany
    {
        return $this->hasMany(Sale::class, 'employee_id');
    }

    /**
     * Get the cart for the user.
     */
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * Get or create cart for the user.
     */
    public function getOrCreateCart()
    {
        return $this->cart()->firstOrCreate(
            ['user_id' => $this->id],
            ['total' => 0]
        );
    }

    // ========================================
    // MÉTODOS DE ROLES - NO CAMBIARON
    // ========================================
    
    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $roleName): bool
    {
        return $this->role->name === $roleName;
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role->name, $roles);
    }

    /**
     * Check if user is superadmin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('superadmin');
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is client.
     */
    public function isClient(): bool
    {
        return $this->hasRole('cliente');
    }

    /**
     * Check if user is delivery person.
     */
    public function isDelivery(): bool
    {
        return $this->hasRole('repartidor');
    }

    /**
     * Check if driver is available for delivery.
     */
    public function isAvailableForDelivery(): bool
    {
        return $this->isDelivery() && 
               $this->driverStatus && 
               $this->driverStatus->name === 'disponible';
    }

    /**
     * Check if driver is currently delivering.
     */
    public function isCurrentlyDelivering(): bool
    {
        return $this->isDelivery() && 
               $this->driverStatus && 
               $this->driverStatus->name === 'ocupado';
    }

    // ========================================
    // MÉTODOS DE TRANSACCIONES - NO CAMBIARON
    // ========================================

    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Obtener transacciones completadas
     */
    public function completedTransactions()
    {
        return $this->hasMany(PaymentTransaction::class)
                    ->where('status', 'completed')
                    ->orderBy('completed_at', 'desc');
    }

    // ========================================
    // SISTEMA DE PUNTOS - NO CAMBIÓ
    // ========================================

    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class);
    }

    /**
     * Obtener balance de puntos disponibles
     */
    public function getAvailablePointsAttribute(): int
    {
        $earned = $this->pointTransactions()
            ->where('type', 'earned')
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->sum('points');
        
        $redeemed = $this->pointTransactions()
            ->where('type', 'redeemed')
            ->sum('points');
        
        return max(0, $earned - abs($redeemed));
    }

    /**
     * Calcular puntos a ganar por una compra
     * - Sin membresía: 2%
     * - Premium (membership_id = 2): 5%
     * - VIP (membership_id = 3): 10%
     */
    public function calculatePointsForPurchase(float $amount): int
    {
        $percentage = match($this->membership_id) {
            3 => 0.10,
            2 => 0.05,
            default => 0.02  
        };
        
        $points = (int) floor($amount * $percentage);
        
        Log::info('💰 Calculando puntos por compra', [
            'user_id' => $this->id,
            'membership_id' => $this->membership_id,
            'membership_name' => $this->membership ? $this->membership->name : 'Sin membresía',
            'amount' => $amount,
            'percentage' => ($percentage * 100) . '%',
            'points_calculated' => $points
        ]);
        
        return $points;
    }

    /**
     * Agregar puntos
     */
    public function addPoints(int $points, string $description, ?int $orderId = null): PointTransaction
    {
        $transaction = $this->pointTransactions()->create([
            'type' => 'earned',
            'points' => $points,
            'description' => $description,
            'order_id' => $orderId,
            'expires_at' => now()->addYear()
        ]);
        
        $this->increment('points', $points);
        
        return $transaction;
    }

    /**
     * Canjear puntos (SIN LÍMITE)
     * Solo verifica que tenga suficientes puntos disponibles
     */
    public function redeemPoints(int $points, string $description, ?int $orderId = null): PointTransaction
    {
        if ($this->available_points < $points) {
            throw new \Exception('Puntos insuficientes. Disponibles: ' . $this->available_points);
        }
        
        $transaction = $this->pointTransactions()->create([
            'type' => 'redeemed',
            'points' => -abs($points),
            'description' => $description,
            'order_id' => $orderId
        ]);
        
        $this->decrement('points', $points);
        
        Log::info('✅ Puntos canjeados', [
            'user_id' => $this->id,
            'points_redeemed' => $points,
            'remaining_points' => $this->available_points,
            'order_id' => $orderId
        ]);
        
        return $transaction;
    }

    // ===================================================================
    // MEMBERSHIP MANAGEMENT METHODS
    // ===================================================================

    /**
     * Check if user has an active membership
     */
    public function hasMembership(): bool
    {
        return $this->membership_id !== null && !$this->membershipIsExpired();
    }

    /**
     * Check if membership is expired
     */
    public function membershipIsExpired(): bool
    {
        if (!$this->membership_expires_at) {
            return false;
        }

        return now()->isAfter($this->membership_expires_at);
    }

    /**
     * Get days remaining until membership expires
     */
    public function membershipDaysRemaining(): ?int
    {
        if (!$this->membership_expires_at) {
            return null;
        }

        if ($this->membershipIsExpired()) {
            return 0;
        }

        return now()->diffInDays($this->membership_expires_at, false);
    }

    /**
     * Check if membership is cancelled
     */
    public function membershipIsCancelled(): bool
    {
        return $this->membership_cancelled_at !== null;
    }

    /**
     * Check if user can cancel their membership
     */
    public function canCancelMembership(): bool
    {
        return $this->hasMembership() && !$this->membershipIsCancelled();
    }

    /**
     * Check if user can reactivate their membership
     */
    public function canReactivateMembership(): bool
    {
        return $this->membershipIsCancelled() && !$this->membershipIsExpired();
    }

/**
 * Get the reviews created by the user.
 */
public function reviews(): HasMany
{
    return $this->hasMany(ProductReview::class);
}
}