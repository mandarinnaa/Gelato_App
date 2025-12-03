<?php
// routes/api.php - VERSIÓN CORREGIDA
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\PasswordResetController;
use App\Http\Controllers\API\ContactController;
use App\Http\Controllers\API\{
    AuthController,
    UserController,
    BaseProductController,
    CustomProductController,
    PayPalPaymentController,
    CategoryController,
    OrderController,
    SaleController,
    RoleController,
    MembershipController,
    CatalogController,
    AddressController,
    CartController,
    DashboardController,
    DeliveryStatusController,
    DriverStatusController,
    FillingController,
    FlavorController,
    PaymentMethodController,
    PointsController,
    ProductReviewController,
    ToppingController,
    MessageController
};

/*
|--------------------------------------------------------------------------
| Rutas Públicas (sin autenticación)
|--------------------------------------------------------------------------
*/
// ===================================================================
// PASSWORD RESET (PÚBLICAS)
// ===================================================================
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'reset']);
Route::post('/password/verify-token', [PasswordResetController::class, 'verifyToken']);

// ===================================================================
// FORMULARIO DE CONTACTO (PÚBLICO)
// ===================================================================
Route::post('/contact/send', [ContactController::class, 'send']);

// ===================================================================
// AUTENTICACIÓN (PÚBLICAS)
// ===================================================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleAuth']);

// Catálogo público
Route::prefix('catalog')->group(function () {
    Route::get('/flavors', [CatalogController::class, 'flavors']);
    Route::get('/sizes', [CatalogController::class, 'sizes']);
    Route::get('/fillings', [CatalogController::class, 'fillings']);
    Route::get('/toppings', [CatalogController::class, 'toppings']);
});

// Recursos públicos
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/memberships', [MembershipController::class, 'index']);
Route::get('/payment-methods', [PaymentMethodController::class, 'index']);

// Productos públicos
Route::prefix('base-products-public')->group(function () {
    Route::get('/', [BaseProductController::class, 'index']);
    Route::get('/{id}', [BaseProductController::class, 'show']);
});

// Sabores, Rellenos y Toppings públicos
Route::get('/flavors', [FlavorController::class, 'index']);
Route::get('/flavors/{id}', [FlavorController::class, 'show']);
Route::get('/fillings', [FillingController::class, 'index']);
Route::get('/fillings/{id}', [FillingController::class, 'show']);
Route::get('/toppings', [ToppingController::class, 'index']);
Route::get('/toppings/{id}', [ToppingController::class, 'show']);

// ===================================================================
// TICKETS PÚBLICOS (con token en query string)
// ===================================================================
Route::get('/sales/{saleId}/ticket', [SaleController::class, 'generateTicket'])
    ->name('sales.ticket');
Route::get('/sales/{saleId}/ticket/download', [SaleController::class, 'downloadTicket'])
    ->name('sales.ticket.download');

Route::get('/orders/{orderId}/ticket', [OrderController::class, 'generateTicket'])
    ->name('orders.ticket');
Route::get('/orders/{orderId}/ticket/download', [OrderController::class, 'downloadTicket'])
    ->name('orders.ticket.download');

// ===================================================================
// 📊 REPORTES PDF PÚBLICOS (con token en query string)
// ===================================================================
Route::get('/dashboard/report/{period}', [DashboardController::class, 'generateReport'])
    ->name('dashboard.report');

// PayPal callbacks (públicos)
Route::get('/paypal/capture-order', [PayPalPaymentController::class, 'captureOrder']);

/*
|--------------------------------------------------------------------------
| Rutas Protegidas (REQUIEREN autenticación)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // ===================================================================
    // AUTENTICACIÓN (PROTEGIDAS)
    // ===================================================================
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // ===================================================================
    // ✅ SISTEMA DE PUNTOS
    // ===================================================================
    Route::prefix('points')->group(function () {
        Route::get('/balance', [PointsController::class, 'balance']);
        Route::get('/history', [PointsController::class, 'history']);
        Route::post('/calculate-discount', [PointsController::class, 'calculateDiscount']);
        Route::get('/earn-info', [PointsController::class, 'earnInfo']);
    });
    
    // ===================================================================
    // USUARIOS
    // ===================================================================
    Route::apiResource('users', UserController::class);
    Route::post('/users/{user}/profile-photo', [UserController::class, 'updateProfilePhoto']);
    Route::delete('/users/{user}/profile-photo', [UserController::class, 'deleteProfilePhoto']);
    Route::patch('/users/{user}/phone', [UserController::class, 'updatePhone']);
    
    // ===================================================================
    // PRODUCTOS BASE
    // ===================================================================
    Route::prefix('base-products')->group(function () {
        Route::get('/', [BaseProductController::class, 'index']);
        Route::get('/{id}', [BaseProductController::class, 'show']);
        
        // Operaciones Admin - RESTRICTED TO SUPERADMIN
        Route::middleware('role:superadmin')->group(function () {
            Route::post('/', [BaseProductController::class, 'store']);
            Route::match(['put', 'patch'], '/{id}', [BaseProductController::class, 'update']);
            Route::delete('/{id}', [BaseProductController::class, 'destroy']);
        });
    });
    
    // ===================================================================
    // PRODUCTOS PERSONALIZADOS
    // ===================================================================
    Route::prefix('custom-products')->group(function () {
        Route::get('/', [CustomProductController::class, 'index']);
        Route::get('/{id}', [CustomProductController::class, 'show']);
        Route::post('/', [CustomProductController::class, 'store']);
        Route::delete('/{id}', [CustomProductController::class, 'destroy']);
        Route::post('/calculate-price', [CustomProductController::class, 'calculatePrice']);
    });
    
    // ===================================================================
    // CARRITO
    // ===================================================================
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/base-product', [CartController::class, 'addBaseProduct']);
        Route::post('/custom-product', [CartController::class, 'addCustomProduct']);
        Route::put('/items/{itemId}', [CartController::class, 'updateItem']);
        Route::delete('/items/{itemId}', [CartController::class, 'removeItem']);
        Route::delete('/clear', [CartController::class, 'clear']);
        Route::post('/checkout', [CartController::class, 'checkout']);
    });
    
    // ===================================================================
    // PEDIDOS
    // ===================================================================
    Route::apiResource('orders', OrderController::class);
    Route::post('/orders/{order}/update-status', [OrderController::class, 'updateStatus']);
    Route::get('/orders/{order}/tracking', [OrderController::class, 'tracking']);
    
    // Rutas solo para admin - RESTRICTED TO SUPERADMIN
    Route::middleware('role:superadmin')->group(function () {
        Route::post('/orders/{order}/assign-delivery', [OrderController::class, 'assignDelivery']);
        Route::get('/orders/delivery-workload', [OrderController::class, 'deliveryWorkload']);
    });

    // ===================================================================
    // MENSAJERÍA EN TIEMPO REAL
    // ===================================================================
    Route::get('/orders/{order}/messages', [MessageController::class, 'index']);
    Route::post('/orders/{order}/messages', [MessageController::class, 'store']);
    
    // ===================================================================
    // 🚚 ESTADOS DE ENTREGA (Acceso para todos los autenticados - LECTURA)
    // ===================================================================
    Route::get('/delivery-statuses', [DeliveryStatusController::class, 'index']);
    Route::get('/delivery-statuses/{deliveryStatus}', [DeliveryStatusController::class, 'show']);
    
    // ===================================================================
    // DIRECCIONES
    // ===================================================================
    Route::apiResource('addresses', AddressController::class);
    Route::get('/my-addresses', [AddressController::class, 'myAddresses']);
    
    // ===================================================================
    // MEMBRESÍAS
    // ===================================================================
    Route::get('/membership/current', [MembershipController::class, 'getCurrentMembership']);
    Route::post('/membership/cancel', [MembershipController::class, 'cancelMembership']);
    Route::post('/membership/reactivate', [MembershipController::class, 'reactivateMembership']);
    Route::post('/memberships/{membership}/create-paypal-order', [MembershipController::class, 'createPayPalOrder']);
    Route::post('/memberships/{membership}/upgrade', [MembershipController::class, 'upgrade']);
    
    // Rutas de administración - RESTRICTED TO SUPERADMIN
    Route::middleware('role:superadmin')->group(function () {
        Route::post('/memberships', [MembershipController::class, 'store']);
        Route::put('/memberships/{membership}', [MembershipController::class, 'update']);
        Route::delete('/memberships/{membership}', [MembershipController::class, 'destroy']);
    });
    
    // ===================================================================
    // PAYPAL (Protegidas)
    // ===================================================================
    Route::prefix('paypal')->group(function () {
        Route::post('/create-order', [PayPalPaymentController::class, 'createOrder']);
        Route::get('/order-details/{orderId}', [PayPalPaymentController::class, 'getOrderDetails']);
    });
    
    // ===================================================================
    // ADMIN - Gestión de Catálogo - RESTRICTED TO SUPERADMIN
    // ===================================================================
    Route::middleware('role:superadmin')->group(function () {

        // Categorías
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        
        // Sabores, Rellenos y Toppings
        Route::post('/flavors', [FlavorController::class, 'store']);
        Route::put('/flavors/{id}', [FlavorController::class, 'update']);
        Route::delete('/flavors/{id}', [FlavorController::class, 'destroy']);
        
        Route::post('/fillings', [FillingController::class, 'store']);
        Route::put('/fillings/{id}', [FillingController::class, 'update']);
        Route::delete('/fillings/{id}', [FillingController::class, 'destroy']);
        
        Route::post('/toppings', [ToppingController::class, 'store']);
        Route::put('/toppings/{id}', [ToppingController::class, 'update']);
        Route::delete('/toppings/{id}', [ToppingController::class, 'destroy']);
        
        // Estados de entrega (solo crear, editar, eliminar - el GET está arriba)
        Route::post('/delivery-statuses', [DeliveryStatusController::class, 'store']);
        Route::put('/delivery-statuses/{deliveryStatus}', [DeliveryStatusController::class, 'update']);
        Route::delete('/delivery-statuses/{deliveryStatus}', [DeliveryStatusController::class, 'destroy']);
    });

    // ===================================================================
    // 📊 DASHBOARD ROUTES (API protegidas) - RESTRICTED TO SUPERADMIN
    // ===================================================================
    Route::prefix('dashboard')->middleware('role:superadmin')->group(function () {
        // Dashboard routes
        // Consolidated endpoint (OPTIMIZED) - Use this instead of individual calls
        Route::get('/all-data', [DashboardController::class, 'getAllDashboardData']);
        
        // Individual endpoints (kept for backwards compatibility)
        Route::get('/stats', [DashboardController::class, 'getStats']);
        Route::get('/revenue-chart', [DashboardController::class, 'getRevenueChart']);
        Route::get('/orders-by-status', [DashboardController::class, 'getOrdersByStatus']);
        Route::get('/top-products', [DashboardController::class, 'getTopProducts']);
        Route::get('/recent-orders', [DashboardController::class, 'getRecentOrders']);
        Route::get('/revenue-by-month', [DashboardController::class, 'getRevenueByMonth']);
        Route::get('/revenue-by-year', [DashboardController::class, 'getRevenueByYear']);
    });
    
    // ===================================================================
    // SUPERADMIN
    // ===================================================================
    Route::middleware('role:superadmin')->group(function () {
        Route::apiResource('roles', RoleController::class);
    });
    
    // ===================================================================
    // REPARTIDORES
    // ===================================================================
    Route::apiResource('driver-statuses', DriverStatusController::class);
    Route::post('/driver-status/change', [DriverStatusController::class, 'changeStatus']);
    
    // ===================================================================
    // VENTAS EN TIENDA
    // ===================================================================
    Route::apiResource('sales', SaleController::class);
    
});

// ===================================================================
// PRODUCT REVIEWS (Públicas y Protegidas)
// ===================================================================

// Rutas públicas de reviews (solo lectura)
Route::get('/products/{product}/reviews', [ProductReviewController::class, 'index']);
Route::get('/products/{product}/reviews/stats', [ProductReviewController::class, 'stats']);

// Rutas protegidas de reviews (requieren autenticación)
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('products/{product}/reviews')->group(function () {
        Route::get('/can-review', [ProductReviewController::class, 'canReview']);
        Route::get('/my-review', [ProductReviewController::class, 'myReview']);
        Route::post('/', [ProductReviewController::class, 'store']);
        Route::put('/{review}', [ProductReviewController::class, 'update']);
        Route::delete('/{review}', [ProductReviewController::class, 'destroy']);
    });
});