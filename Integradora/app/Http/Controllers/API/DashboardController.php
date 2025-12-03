<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Sale;
use App\Models\BaseProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class DashboardController extends Controller
{
    /**
     * Get all dashboard data in a single request (OPTIMIZED)
     */
    public function getAllDashboardData(Request $request)
    {
        try {
            $period = $request->get('period', 'month');
            $month = $request->get('month');
            $year = $request->get('year');
            
            // Calculate date range once
            $dates = $this->getDateRange($period, $month, $year);
            $startDate = $dates['start'];
            $endDate = $dates['end'];

            // Get previous period for comparisons
            $prevDates = $this->getPreviousDateRange($period, $startDate, $month, $year);
            $prevStartDate = $prevDates['start'];
            $prevEndDate = $prevDates['end'];

            // Fetch all data with optimized queries
            $stats = $this->getStatsData($startDate, $endDate, $prevStartDate, $prevEndDate);
            $revenueChart = $this->buildChartData($startDate, $endDate, $period);
            $ordersByStatus = $this->getOrdersByStatusData($startDate, $endDate);
            $topProducts = $this->getTopProductsData($startDate, $endDate);
            $recentOrders = $this->getRecentOrdersData();
            $revenueByYear = $this->getRevenueByYearData();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'revenueChart' => $revenueChart,
                    'ordersByStatus' => $ordersByStatus,
                    'topProducts' => $topProducts,
                    'recentOrders' => $recentOrders,
                    'revenueByYear' => $revenueByYear
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getAllDashboardData: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos del dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard statistics with filters
     */
    public function getStats(Request $request)
    {
        try {
            $period = $request->get('period', 'month');
            $month = $request->get('month'); // Format: YYYY-MM
            $year = $request->get('year');
            
            $dates = $this->getDateRange($period, $month, $year);
            $startDate = $dates['start'];
            $endDate = $dates['end'];

            // Log para debug
            Log::info('Dashboard Stats - Fechas', [
                'period' => $period,
                'month' => $month,
                'year' => $year,
                'startDate' => $startDate->toDateTimeString(),
                'endDate' => $endDate->toDateTimeString(),
                'timezone' => config('app.timezone')
            ]);

            $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
            $totalSales = Sale::whereBetween('created_at', [$startDate, $endDate])->count();
            $totalProducts = BaseProduct::where('available', true)->count();
            
            $ordersRevenue = Order::whereBetween('created_at', [$startDate, $endDate])->sum('total');
            $salesRevenue = Sale::whereBetween('created_at', [$startDate, $endDate])->sum('total');
            $totalRevenue = $ordersRevenue + $salesRevenue;

            $prevDates = $this->getPreviousDateRange($period, $startDate, $month, $year);
            $prevStartDate = $prevDates['start'];
            $prevEndDate = $prevDates['end'];

            $prevOrdersRevenue = Order::whereBetween('created_at', [$prevStartDate, $prevEndDate])->sum('total');
            $prevSalesRevenue = Sale::whereBetween('created_at', [$prevStartDate, $prevEndDate])->sum('total');
            $prevTotalRevenue = $prevOrdersRevenue + $prevSalesRevenue;

            $revenueChange = $prevTotalRevenue > 0 
                ? (($totalRevenue - $prevTotalRevenue) / $prevTotalRevenue) * 100 
                : 0;

            $prevTotalOrders = Order::whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();
            $ordersChange = $prevTotalOrders > 0 
                ? (($totalOrders - $prevTotalOrders) / $prevTotalOrders) * 100 
                : 0;

            $prevTotalSales = Sale::whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();
            $salesChange = $prevTotalSales > 0 
                ? (($totalSales - $prevTotalSales) / $prevTotalSales) * 100 
                : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'totalOrders' => $totalOrders,
                    'totalSales' => $totalSales,
                    'totalProducts' => $totalProducts,
                    'revenue' => round($totalRevenue, 2),
                    'ordersChange' => round($ordersChange, 1),
                    'salesChange' => round($salesChange, 1),
                    'revenueChange' => round($revenueChange, 1),
                    'period' => $period
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getStats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getRevenueChart(Request $request)
    {
        try {
            $period = $request->get('period', 'month');
            $month = $request->get('month');
            $year = $request->get('year');
            
            $dates = $this->getDateRange($period, $month, $year);
            $startDate = $dates['start'];
            $endDate = $dates['end'];

            $chartData = $this->buildChartData($startDate, $endDate, $period);

            return response()->json([
                'success' => true,
                'data' => $chartData
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getRevenueChart: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener gráfica de ingresos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getOrdersByStatus(Request $request)
    {
        try {
            $period = $request->get('period', 'month');
            $month = $request->get('month');
            $year = $request->get('year');
            
            $dates = $this->getDateRange($period, $month, $year);
            $startDate = $dates['start'];
            $endDate = $dates['end'];

            $orders = Order::whereBetween('created_at', [$startDate, $endDate])
                ->with('deliveryStatus')
                ->get();

            $statusData = [];
            foreach ($orders as $order) {
                $statusName = $order->deliveryStatus ? $order->deliveryStatus->name : 'Pendiente';
                if (!isset($statusData[$statusName])) {
                    $statusData[$statusName] = 0;
                }
                $statusData[$statusName]++;
            }

            $result = [];
            foreach ($statusData as $name => $amount) {
                $result[] = [
                    'name' => ucfirst($name),
                    'amount' => $amount
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getOrdersByStatus: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pedidos por estado',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTopProducts(Request $request)
    {
        try {
            $period = $request->get('period', 'month');
            $month = $request->get('month');
            $year = $request->get('year');
            
            $dates = $this->getDateRange($period, $month, $year);
            $startDate = $dates['start'];
            $endDate = $dates['end'];

            Log::info('getTopProducts - Fechas', [
                'period' => $period,
                'startDate' => $startDate->toDateTimeString(),
                'endDate' => $endDate->toDateTimeString(),
            ]);

            // Mapas separados para Orders y Sales
            $ordersMap = [];
            $salesMap = [];

            // Obtener productos de órdenes (solo base products, excluir custom)
            $orders = Order::whereBetween('created_at', [$startDate, $endDate])
                ->with('orderItems')
                ->get();

            Log::info('Total orders found: ' . $orders->count());

            foreach ($orders as $order) {
                foreach ($order->orderItems as $item) {
                    // Solo incluir productos base (product_type = 'base')
                    if ($item->product_type === 'base') {
                        $name = $item->product_name ?? 'Producto';
                        $ordersMap[$name] = ($ordersMap[$name] ?? 0) + $item->quantity;
                    }
                }
            }

            Log::info('Orders products map', $ordersMap);

            // Obtener productos de ventas
            $sales = Sale::whereBetween('created_at', [$startDate, $endDate])
                ->with('saleItems.product')
                ->get();

            Log::info('Total sales found: ' . $sales->count());

            foreach ($sales as $sale) {
                foreach ($sale->saleItems as $item) {
                    $name = $item->product ? $item->product->name : 'Producto';
                    $salesMap[$name] = ($salesMap[$name] ?? 0) + $item->quantity;
                }
            }

            Log::info('Sales products map', $salesMap);

            // Combinar todos los productos únicos
            $allProducts = array_unique(array_merge(array_keys($ordersMap), array_keys($salesMap)));

            // Crear array con ambas categorías
            $topProducts = [];
            foreach ($allProducts as $name) {
                $ordersQty = $ordersMap[$name] ?? 0;
                $salesQty = $salesMap[$name] ?? 0;
                $total = $ordersQty + $salesQty;

                if ($total > 0) { // Solo incluir si hay ventas
                    $topProducts[] = [
                        'date' => $name,
                        'Pedidos' => $ordersQty,
                        'Ventas' => $salesQty,
                        'total' => $total
                    ];
                }
            }

            // Ordenar por total de ventas
            usort($topProducts, function($a, $b) {
                return $b['total'] - $a['total'];
            });

            // Tomar top 10 y remover el campo 'total' auxiliar
            $topProducts = array_slice($topProducts, 0, 10);
            foreach ($topProducts as &$product) {
                unset($product['total']);
            }

            Log::info('Final top products', ['count' => count($topProducts), 'data' => $topProducts]);

            return response()->json([
                'success' => true,
                'data' => $topProducts
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getTopProducts: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener productos top',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getRecentOrders(Request $request)
    {
        try {
            $limit = $request->get('limit', 5);

            $orders = Order::with(['user', 'deliveryStatus'])
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getRecentOrders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pedidos recientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get revenue by month (últimos 12 meses)
     */
    public function getRevenueByMonth(Request $request)
    {
        try {
            Carbon::setLocale('es');
            $now = Carbon::now(config('app.timezone'));
            $data = [];

            // Últimos 12 meses
            for ($i = 11; $i >= 0; $i--) {
                $date = $now->copy()->subMonths($i);
                $startDate = $date->copy()->startOfMonth();
                $endDate = $date->copy()->endOfMonth();

                $ordersRevenue = Order::whereBetween('created_at', [$startDate, $endDate])
                    ->sum('total');
                $salesRevenue = Sale::whereBetween('created_at', [$startDate, $endDate])
                    ->sum('total');

                $data[] = [
                    'date' => $date->locale('es')->format('M y'),
                    'Pedidos' => round($ordersRevenue, 2),
                    'Ventas' => round($salesRevenue, 2),
                    'Total' => round($ordersRevenue + $salesRevenue, 2)
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getRevenueByMonth: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener ingresos por mes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get revenue by year (Enero - Diciembre del año actual)
     */
    public function getRevenueByYear(Request $request)
    {
        try {
            Carbon::setLocale('es');
            $now = Carbon::now(config('app.timezone'));
            $currentYear = $now->year;
            $data = [];

            // Meses de Enero a Diciembre del año actual
            for ($month = 1; $month <= 12; $month++) {
                $date = Carbon::create($currentYear, $month, 1, 0, 0, 0, config('app.timezone'));
                $startDate = $date->copy()->startOfMonth();
                $endDate = $date->copy()->endOfMonth();

                $ordersRevenue = Order::whereBetween('created_at', [$startDate, $endDate])
                    ->sum('total');
                $salesRevenue = Sale::whereBetween('created_at', [$startDate, $endDate])
                    ->sum('total');

                $total = $ordersRevenue + $salesRevenue;

                $data[] = [
                    'date' => $date->locale('es')->format('M y'),
                    'Pedidos' => round($ordersRevenue, 2),
                    'Ventas' => round($salesRevenue, 2),
                    'Total' => round($total, 2)
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getRevenueByYear: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener ingresos anuales',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function generateReport(Request $request, $period)
{
    try {
        // Validar token si existe (opcional para mayor seguridad)
        $token = $request->query('token');
        if ($token) {
            // Opcional: Validar que el token pertenece a un admin
            $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
            if (!$user || !in_array($user->role->name, ['superadmin', 'admin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado'
                ], 403);
            }
        }

        Log::info('Generando reporte para período: ' . $period);

        // Obtener mes y año de los parámetros de consulta
        $month = $request->query('month');
        $year = $request->query('year');

        // Usar getDateRange que ya tiene la lógica correcta para day/week/month
        $dates = $this->getDateRange($period, $month, $year);
        $startDate = $dates['start'];
        $endDate = $dates['end'];
        
        Log::info('Generando reporte con fechas', [
            'period' => $period,
            'month' => $month,
            'year' => $year,
            'startDate' => $startDate->toDateTimeString(),
            'endDate' => $endDate->toDateTimeString()
        ]);

        // Obtener todos los datos necesarios
        $stats = $this->getStatsForReport($startDate, $endDate);
        $revenueData = $this->buildChartData($startDate, $endDate, $period);
        $ordersByStatus = $this->getOrdersByStatusForReport($startDate, $endDate);
        $topProducts = $this->getTopProductsForReport($startDate, $endDate);
        $recentOrders = $this->getRecentOrdersForReport($startDate, $endDate);
        $revenueByYear = $this->getRevenueByYearData();

        $data = [
            'period' => $period,
            'startDate' => $startDate->format('d/m/Y'),
            'endDate' => $endDate->format('d/m/Y'),
            'stats' => $stats,
            'revenueData' => $revenueData,
            'ordersByStatus' => $ordersByStatus,
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
            'revenueByYear' => $revenueByYear,
            'business_name' => config('app.name', 'Pastelería Noemí'),
        ];

        Log::info('Datos preparados para PDF', ['data_keys' => array_keys($data)]);

        $pdf = Pdf::loadView('reports.dashboard', $data);
        $pdf->setPaper('letter', 'portrait');

        $filename = 'reporte-' . $period . '-' . $startDate->format('Y-m-d') . '.pdf';
        
        return $pdf->stream($filename);
    } catch (\Exception $e) {
        Log::error('Error al generar reporte PDF: ' . $e->getMessage());
        Log::error('Stack trace: ' . $e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Error al generar el reporte',
            'error' => $e->getMessage()
        ], 500);
    }
}

    // Optimized Helper Methods for Consolidated Endpoint

    private function getStatsData($startDate, $endDate, $prevStartDate, $prevEndDate)
    {
        // Fetch current period data
        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalSales = Sale::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalProducts = BaseProduct::where('available', true)->count();
        
        $ordersRevenue = Order::whereBetween('created_at', [$startDate, $endDate])->sum('total');
        $salesRevenue = Sale::whereBetween('created_at', [$startDate, $endDate])->sum('total');
        $totalRevenue = $ordersRevenue + $salesRevenue;

        // Fetch previous period data for comparison
        $prevOrdersRevenue = Order::whereBetween('created_at', [$prevStartDate, $prevEndDate])->sum('total');
        $prevSalesRevenue = Sale::whereBetween('created_at', [$prevStartDate, $prevEndDate])->sum('total');
        $prevTotalRevenue = $prevOrdersRevenue + $prevSalesRevenue;

        $revenueChange = $prevTotalRevenue > 0 
            ? (($totalRevenue - $prevTotalRevenue) / $prevTotalRevenue) * 100 
            : 0;

        $prevTotalOrders = Order::whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();
        $ordersChange = $prevTotalOrders > 0 
            ? (($totalOrders - $prevTotalOrders) / $prevTotalOrders) * 100 
            : 0;

        $prevTotalSales = Sale::whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();
        $salesChange = $prevTotalSales > 0 
            ? (($totalSales - $prevTotalSales) / $prevTotalSales) * 100 
            : 0;

        return [
            'totalOrders' => $totalOrders,
            'totalSales' => $totalSales,
            'totalProducts' => $totalProducts,
            'revenue' => round($totalRevenue, 2),
            'ordersChange' => round($ordersChange, 1),
            'salesChange' => round($salesChange, 1),
            'revenueChange' => round($revenueChange, 1)
        ];
    }

    private function getOrdersByStatusData($startDate, $endDate)
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->with('deliveryStatus:id,name')
            ->get(['delivery_status_id']);

        $statusCounts = [];
        foreach ($orders as $order) {
            $statusName = $order->deliveryStatus ? $order->deliveryStatus->name : 'Sin estado';
            if (!isset($statusCounts[$statusName])) {
                $statusCounts[$statusName] = 0;
            }
            $statusCounts[$statusName]++;
        }

        $result = [];
        foreach ($statusCounts as $name => $amount) {
            $result[] = [
                'name' => $name,
                'amount' => $amount
            ];
        }

        return $result;
    }

    private function getTopProductsData($startDate, $endDate)
    {
        // Get top products from orders
        $orderProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('base_products', 'order_items.base_product_id', '=', 'base_products.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select('base_products.name as date', DB::raw('SUM(order_items.quantity) as Pedidos'))
            ->groupBy('base_products.id', 'base_products.name')
            ->orderByDesc('Pedidos')
            ->limit(10)
            ->get();

        // Get top products from sales (POS)
        $saleProducts = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('base_products', 'sale_items.product_id', '=', 'base_products.id')
            ->whereBetween('sales.created_at', [$startDate, $endDate])
            ->select('base_products.name as date', DB::raw('SUM(sale_items.quantity) as Ventas'))
            ->groupBy('base_products.id', 'base_products.name')
            ->orderByDesc('Ventas')
            ->limit(10)
            ->get();

        return [
            'orders' => $orderProducts->map(fn($p) => ['name' => $p->date, 'value' => $p->Pedidos])->toArray(),
            'sales' => $saleProducts->map(fn($p) => ['name' => $p->date, 'value' => $p->Ventas])->toArray()
        ];
    }

    private function getRecentOrdersData()
    {
        return Order::with(['user:id,name', 'deliveryStatus:id,name'])
            ->select('id', 'user_id', 'delivery_status_id', 'total', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getRevenueByYearData()
    {
        Carbon::setLocale('es');
        $now = Carbon::now(config('app.timezone'));
        $currentYear = $now->year;
        $data = [];

        for ($month = 1; $month <= 12; $month++) {
            $date = Carbon::create($currentYear, $month, 1, 0, 0, 0, config('app.timezone'));
            $startDate = $date->copy()->startOfMonth();
            $endDate = $date->copy()->endOfMonth();

            $ordersRevenue = Order::whereBetween('created_at', [$startDate, $endDate])->sum('total');
            $salesRevenue = Sale::whereBetween('created_at', [$startDate, $endDate])->sum('total');
            $total = $ordersRevenue + $salesRevenue;

            $data[] = [
                'date' => $date->locale('es')->format('M y'),
                'Ganancia' => round($total, 2)
            ];
        }

        return $data;
    }

    // Helper Methods

    /**
     * Get date range based on period, month and year
     */
    private function getDateRange($period, $month = null, $year = null)
    {
        Carbon::setLocale('es');
        $now = Carbon::now(config('app.timezone'));
        
        // Si se especifica mes y año
        if ($month && $year) {
            $targetDate = Carbon::createFromFormat('Y-m', "$year-$month", config('app.timezone'));
            $currentMonth = $now->format('Y-m');
            $targetMonth = $targetDate->format('Y-m');
            
            // Si el mes seleccionado es el mes actual, usar período específico
            if ($targetMonth === $currentMonth) {
                switch ($period) {
                    case 'day':
                        return [
                            'start' => $now->copy()->startOfDay(),
                            'end' => $now->copy()->endOfDay()
                        ];
                    case 'week':
                        return [
                            'start' => $now->copy()->startOfWeek(),
                            'end' => $now->copy()->endOfWeek()
                        ];
                    case 'month':
                    default:
                        return [
                            'start' => $now->copy()->startOfMonth(),
                            'end' => $now->copy()->endOfMonth()
                        ];
                }
            } else {
                // Si es un mes anterior, siempre mostrar el mes completo
                return [
                    'start' => $targetDate->copy()->startOfMonth(),
                    'end' => $targetDate->copy()->endOfMonth()
                ];
            }
        }
        
        // Si no se especifica mes/año, usar el período actual
        switch ($period) {
            case 'day':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay()
                ];
            case 'week':
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek()
                ];
            case 'month':
            default:
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth()
                ];
        }
    }

    /**
     * Get previous date range for comparison
     */
    private function getPreviousDateRange($period, $currentStart, $month = null, $year = null)
    {
        // Si hay mes/año especificado, comparar con el mes anterior
        if ($month && $year) {
            $prevDate = Carbon::createFromFormat('Y-m', "$year-$month", config('app.timezone'))
                ->subMonth();
            
            return [
                'start' => $prevDate->copy()->startOfMonth(),
                'end' => $prevDate->copy()->endOfMonth()
            ];
        }
        
        // Si no, usar la lógica normal
        $current = Carbon::parse($currentStart);
        switch ($period) {
            case 'day':
                return [
                    'start' => $current->copy()->subDay()->startOfDay(),
                    'end' => $current->copy()->subDay()->endOfDay()
                ];
            case 'week':
                return [
                    'start' => $current->copy()->subWeek()->startOfWeek(),
                    'end' => $current->copy()->subWeek()->endOfWeek()
                ];
            case 'month':
            default:
                return [
                    'start' => $current->copy()->subMonth()->startOfMonth(),
                    'end' => $current->copy()->subMonth()->endOfMonth()
                ];
        }
    }

    private function getStartDate($period)
    {
        // Asegurarse de usar la zona horaria de la aplicación
        Carbon::setLocale('es');
        $now = Carbon::now(config('app.timezone'));
        
        switch ($period) {
            case 'day':
                return $now->copy()->startOfDay();
            case 'week':
                return $now->copy()->startOfWeek();
            case 'month':
            default:
                return $now->copy()->startOfMonth();
        }
    }

    private function getPreviousStartDate($period, $currentStart)
    {
        $current = Carbon::parse($currentStart);
        switch ($period) {
            case 'day':
                return $current->copy()->subDay()->startOfDay();
            case 'week':
                return $current->copy()->subWeek()->startOfWeek();
            case 'month':
            default:
                return $current->copy()->subMonth()->startOfMonth();
        }
    }

    private function buildChartData($startDate, $endDate, $period)
    {
        $data = [];
        $current = $startDate->copy();

        // Obtener todas las órdenes y ventas del período
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])->get();
        $sales = Sale::whereBetween('created_at', [$startDate, $endDate])->get();

        // Para semana, asegurarnos de mostrar exactamente 7 días
        if ($period === 'week') {
            for ($i = 0; $i < 7; $i++) {
                $dateLabel = $this->formatDateLabel($current, $period);
                
                // Filtrar órdenes del día actual
                $dayOrders = $orders->filter(function($order) use ($current) {
                    $orderDate = Carbon::parse($order->created_at);
                    return $orderDate->format('Y-m-d') === $current->format('Y-m-d');
                });

                // Filtrar ventas del día actual
                $daySales = $sales->filter(function($sale) use ($current) {
                    $saleDate = Carbon::parse($sale->created_at);
                    return $saleDate->format('Y-m-d') === $current->format('Y-m-d');
                });

                $ordersTotal = $dayOrders->sum('total');
                $salesTotal = $daySales->sum('total');

                $data[] = [
                    'date' => $dateLabel,
                    'Pedidos' => round($ordersTotal, 2),
                    'Ventas' => round($salesTotal, 2)
                ];

                $current->addDay();
            }
        } else {
            // Para día y mes, mantener la lógica original
            while ($current <= $endDate) {
                $dateLabel = $this->formatDateLabel($current, $period);
                
                // Filtrar órdenes del día/hora actual
                $dayOrders = $orders->filter(function($order) use ($current, $period) {
                    return $this->isSamePeriod($order->created_at, $current, $period);
                });

                // Filtrar ventas del día/hora actual
                $daySales = $sales->filter(function($sale) use ($current, $period) {
                    return $this->isSamePeriod($sale->created_at, $current, $period);
                });

                $ordersTotal = $dayOrders->sum('total');
                $salesTotal = $daySales->sum('total');

                $data[] = [
                    'date' => $dateLabel,
                    'Pedidos' => round($ordersTotal, 2),
                    'Ventas' => round($salesTotal, 2)
                ];

                $current = $this->incrementDate($current, $period);
            }
        }

        return $data;
    }

    private function isSamePeriod($dateTime, $compareDate, $period)
    {
        $date = Carbon::parse($dateTime);
        switch ($period) {
            case 'day':
                return $date->format('Y-m-d H') === $compareDate->format('Y-m-d H');
            case 'week':
            case 'month':
            default:
                return $date->format('Y-m-d') === $compareDate->format('Y-m-d');
        }
    }

    private function formatDateLabel($date, $period)
    {
        switch ($period) {
            case 'day':
                return $date->format('H:00');
            case 'week':
            case 'month':
            default:
                return $date->locale('es')->format('d M');
        }
    }

    private function incrementDate($date, $period)
    {
        switch ($period) {
            case 'day':
                return $date->copy()->addHour();
            case 'week':
            case 'month':
            default:
                return $date->copy()->addDay();
        }
    }

    // Report Helper Methods

    private function getStatsForReport($startDate, $endDate)
    {
        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalSales = Sale::whereBetween('created_at', [$startDate, $endDate])->count();
        $ordersRevenue = Order::whereBetween('created_at', [$startDate, $endDate])->sum('total');
        $salesRevenue = Sale::whereBetween('created_at', [$startDate, $endDate])->sum('total');

        return [
            'totalOrders' => $totalOrders,
            'totalSales' => $totalSales,
            'revenue' => round($ordersRevenue + $salesRevenue, 2),
            'ordersRevenue' => round($ordersRevenue, 2),
            'salesRevenue' => round($salesRevenue, 2)
        ];
    }

    private function getOrdersByStatusForReport($startDate, $endDate)
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->with('deliveryStatus')
            ->get();

        $statusData = [];
        foreach ($orders as $order) {
            $statusName = $order->deliveryStatus ? $order->deliveryStatus->name : 'Pendiente';
            if (!isset($statusData[$statusName])) {
                $statusData[$statusName] = 0;
            }
            $statusData[$statusName]++;
        }

        $result = [];
        foreach ($statusData as $name => $amount) {
            $result[] = [
                'name' => ucfirst($name),
                'amount' => $amount
            ];
        }

        return $result;
    }

    private function getTopProductsForReport($startDate, $endDate)
    {
        // Mapas separados para Orders y Sales
        $ordersMap = [];
        $salesMap = [];

        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->with('orderItems')
            ->get();

        foreach ($orders as $order) {
            foreach ($order->orderItems as $item) {
                $name = $item->product_name ?? 'Producto';
                $ordersMap[$name] = ($ordersMap[$name] ?? 0) + $item->quantity;
            }
        }

        $sales = Sale::whereBetween('created_at', [$startDate, $endDate])
            ->with('saleItems.product')
            ->get();

        foreach ($sales as $sale) {
            foreach ($sale->saleItems as $item) {
                $name = $item->product ? $item->product->name : 'Producto';
                $salesMap[$name] = ($salesMap[$name] ?? 0) + $item->quantity;
            }
        }

        // Combinar todos los productos únicos
        $allProducts = array_unique(array_merge(array_keys($ordersMap), array_keys($salesMap)));

        $topProducts = [];
        foreach ($allProducts as $name) {
            $ordersQty = $ordersMap[$name] ?? 0;
            $salesQty = $salesMap[$name] ?? 0;
            $total = $ordersQty + $salesQty;

            $topProducts[] = [
                'name' => $name,
                'orders_quantity' => $ordersQty,
                'sales_quantity' => $salesQty,
                'total' => $total
            ];
        }

        usort($topProducts, function($a, $b) {
            return $b['total'] - $a['total'];
        });

        return array_slice($topProducts, 0, 10);
    }

    private function getRecentOrdersForReport($startDate, $endDate)
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->with(['user', 'deliveryStatus'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return $orders->map(function($order) {
            return [
                'id' => $order->id,
                'user' => [
                    'name' => $order->user ? $order->user->name : 'N/A'
                ],
                'created_at' => $order->created_at,
                'delivery_status' => [
                    'name' => $order->deliveryStatus ? $order->deliveryStatus->name : 'pendiente'
                ],
                'total' => $order->total
            ];
        })->toArray();
    }
}