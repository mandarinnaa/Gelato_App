<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #1e293b;
            line-height: 1.3;
        }

        .container {
            padding: 15px;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #1e293b;
            padding-bottom: 12px;
        }

        .header h1 {
            font-size: 22px;
            color: #1e293b;
            margin-bottom: 6px;
            font-weight: bold;
        }

        .header .subtitle {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 6px;
        }

        .header .date-range {
            font-size: 11px;
            color: #475569;
            font-weight: bold;
        }

        /* Stats Grid - 4 columnas */
        .stats-container {
            width: 100%;
            margin-bottom: 20px;
        }

        .stats-row {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
        }

        .stat-card {
            flex: 1;
            padding: 12px;
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 6px;
            text-align: center;
        }

        .stat-card.featured {
            background: #1e293b;
            border: 1.5px solid #1e293b;
        }

        .stat-label {
            font-size: 8px;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 6px;
            display: block;
            letter-spacing: 0.5px;
            font-weight: 600;
        }

        .stat-card.featured .stat-label {
            color: #cbd5e1;
        }

        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
            display: block;
            margin-bottom: 4px;
        }

        .stat-card.featured .stat-value {
            color: white;
            font-size: 22px;
        }

        .stat-change {
            font-size: 8px;
            font-weight: 600;
            margin-top: 4px;
        }

        .stat-change.positive { color: #10b981; }
        .stat-change.negative { color: #ef4444; }
        .stat-change.neutral { color: #64748b; }

        /* Section */
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 2px solid #e2e8f0;
        }

        .section-subtitle {
            font-size: 9px;
            color: #64748b;
            margin-bottom: 10px;
        }

        /* Table Styles */
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        .table th {
            background: #1e293b;
            color: white;
            padding: 8px 6px;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
            font-weight: bold;
            border: 1px solid #0f172a;
        }

        .table td {
            padding: 7px 6px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 9px;
            border-left: 1px solid #f1f5f9;
            border-right: 1px solid #f1f5f9;
        }

        .table tr:nth-child(even) {
            background: #f8fafc;
        }

        .table tr:hover {
            background: #f1f5f9;
        }

        /* Compact Table - for revenue data */
        .table-compact {
            font-size: 8px;
        }

        .table-compact th {
            padding: 6px 4px;
            font-size: 8px;
        }

        .table-compact td {
            padding: 5px 4px;
        }

        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
        }

        .status-pendiente { background: #fef3c7; color: #92400e; }
        .status-en_camino { background: #dbeafe; color: #1e40af; }
        .status-preparando { background: #dbeafe; color: #1e40af; }
        .status-entregado { background: #d1fae5; color: #065f46; }
        .status-completado { background: #d1fae5; color: #065f46; }
        .status-cancelado { background: #fee2e2; color: #991b1b; }

        /* Two columns layout */
        .two-columns {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
        }

        .column {
            flex: 1;
        }

        /* Summary box */
        .summary-box {
            background: #f1f5f9;
            padding: 10px;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
            margin-bottom: 15px;
        }

        .summary-label {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .summary-value {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 12px;
            left: 15px;
            right: 15px;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
        }

        /* Utility classes */
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .text-blue { color: #3b82f6; }
        .text-green { color: #10b981; }
        .text-red { color: #ef4444; }
        .text-gray { color: #64748b; }

        /* Page break control */
        .page-break {
            page-break-after: always;
        }

        .no-break {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>{{ $business_name ?? 'Reporte de Dashboard' }}</h1>
            <div class="subtitle">Reporte Administrativo - {{ ucfirst($period ?? 'Mes') }}</div>
            <div class="date-range">Período: {{ $startDate ?? date('d/m/Y') }} - {{ $endDate ?? date('d/m/Y') }}</div>
        </div>

        <!-- Stats Cards - Primera fila -->
        <div class="stats-container">
            <div class="stats-row">
                <div class="stat-card">
                    <span class="stat-label">Total Pedidos</span>
                    <span class="stat-value">{{ number_format($stats['totalOrders'] ?? 0) }}</span>
                    @if(isset($stats['ordersChange']))
                        <div class="stat-change {{ $stats['ordersChange'] >= 0 ? 'positive' : 'negative' }}">
                            {{ $stats['ordersChange'] > 0 ? '↑' : '↓' }} {{ number_format(abs($stats['ordersChange']), 1) }}% vs anterior
                        </div>
                    @endif
                </div>
                <div class="stat-card">
                    <span class="stat-label">Total Ventas</span>
                    <span class="stat-value">{{ number_format($stats['totalSales'] ?? 0) }}</span>
                    @if(isset($stats['salesChange']))
                        <div class="stat-change {{ $stats['salesChange'] >= 0 ? 'positive' : 'negative' }}">
                            {{ $stats['salesChange'] > 0 ? '↑' : '↓' }} {{ number_format(abs($stats['salesChange']), 1) }}% vs anterior
                        </div>
                    @endif
                </div>
                <div class="stat-card">
                    <span class="stat-label">Total Productos</span>
                    <span class="stat-value">{{ number_format($stats['totalProducts'] ?? 0) }}</span>
                    <div class="stat-change neutral">Activos en inventario</div>
                </div>
                <div class="stat-card featured">
                    <span class="stat-label">Ingresos Totales</span>
                    <span class="stat-value">${{ number_format($stats['revenue'] ?? 0, 2) }}</span>
                    @if(isset($stats['revenueChange']))
                        <div class="stat-change {{ $stats['revenueChange'] >= 0 ? 'positive' : 'negative' }}">
                            {{ $stats['revenueChange'] > 0 ? '↑' : '↓' }} {{ number_format(abs($stats['revenueChange']), 1) }}% vs anterior
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Resumen Ejecutivo -->
        @php
            $totalPedidosRevenue = 0;
            $totalVentasRevenue = 0;
            if(isset($revenueData)) {
                foreach($revenueData as $data) {
                    $totalPedidosRevenue += $data['Pedidos'] ?? 0;
                    $totalVentasRevenue += $data['Ventas'] ?? 0;
                }
            }
            $totalCombinado = $totalPedidosRevenue + $totalVentasRevenue;
        @endphp

        <div class="summary-box no-break">
            <div class="summary-label">Resumen del Período</div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                <div>
                    <span class="text-gray" style="font-size: 9px;">Ingresos Pedidos:</span>
                    <span class="text-blue font-bold" style="font-size: 12px; margin-left: 6px;">${{ number_format($totalPedidosRevenue, 2) }}</span>
                </div>
                <div>
                    <span class="text-gray" style="font-size: 9px;">Ingresos Ventas:</span>
                    <span class="text-green font-bold" style="font-size: 12px; margin-left: 6px;">${{ number_format($totalVentasRevenue, 2) }}</span>
                </div>
                <div>
                    <span class="text-gray" style="font-size: 9px;">Total Combinado:</span>
                    <span class="font-bold" style="font-size: 12px; margin-left: 6px;">${{ number_format($totalCombinado, 2) }}</span>
                </div>
            </div>
        </div>

        <!-- Comparación de Ingresos - TABLA COMPLETA DEL MES -->
        <div class="section no-break">
            <div class="section-title">Comparación Detallada de Ingresos</div>
            <div class="section-subtitle">Pedidos vs Ventas - Desglose diario completo del período</div>
            
            <table class="table table-compact">
                <thead>
                    <tr>
                        <th style="width: 20%;">Fecha</th>
                        <th class="text-right" style="width: 26%;">Pedidos (MXN)</th>
                        <th class="text-right" style="width: 26%;">Ventas (MXN)</th>
                        <th class="text-right" style="width: 28%;">Total (MXN)</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $hasData = false;
                    @endphp
                    @if(isset($revenueData) && count($revenueData) > 0)
                        @foreach($revenueData as $data)
                            @php
                                $pedidos = $data['Pedidos'] ?? 0;
                                $ventas = $data['Ventas'] ?? 0;
                                $total = $pedidos + $ventas;
                                if($total > 0) $hasData = true;
                            @endphp
                            <tr>
                                <td class="font-bold">{{ $data['date'] ?? 'N/A' }}</td>
                                <td class="text-right {{ $pedidos > 0 ? 'text-blue' : 'text-gray' }}">
                                    ${{ number_format($pedidos, 2) }}
                                </td>
                                <td class="text-right {{ $ventas > 0 ? 'text-green' : 'text-gray' }}">
                                    ${{ number_format($ventas, 2) }}
                                </td>
                                <td class="text-right font-bold">
                                    ${{ number_format($total, 2) }}
                                </td>
                            </tr>
                        @endforeach
                        
                        @if(!$hasData)
                            <tr>
                                <td colspan="4" class="text-center text-gray" style="padding: 15px;">
                                    No hay ingresos registrados en este período
                                </td>
                            </tr>
                        @endif
                    @else
                        <tr>
                            <td colspan="4" class="text-center text-gray" style="padding: 15px;">
                                No hay datos disponibles para mostrar
                            </td>
                        </tr>
                    @endif
                </tbody>
                <tfoot>
                    <tr style="background: #f1f5f9; font-weight: bold;">
                        <td>TOTAL</td>
                        <td class="text-right text-blue">${{ number_format($totalPedidosRevenue, 2) }}</td>
                        <td class="text-right text-green">${{ number_format($totalVentasRevenue, 2) }}</td>
                        <td class="text-right" style="font-size: 10px;">${{ number_format($totalCombinado, 2) }}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Ingresos Anuales y Meta Mensual -->
        <div class="two-columns">
            <div class="column">
                <!-- Ingresos por Año -->
                <div class="section no-break">
                    <div class="section-title">Ingresos por Mes (Año Actual)</div>
                    <div class="section-subtitle">Desglose mensual de ingresos totales</div>
                    
                    <table class="table table-compact">
                        <thead>
                            <tr>
                                <th style="width: 50%;">Mes</th>
                                <th class="text-right" style="width: 50%;">Ingresos (MXN)</th>
                            </tr>
                        </thead>
                        <tbody>
                            @php
                                $totalYearRevenue = 0;
                            @endphp
                            @if(isset($revenueByYear) && count($revenueByYear) > 0)
                                @foreach($revenueByYear as $monthData)
                                    @php
                                        $amount = $monthData['Ganancia'] ?? 0;
                                        $totalYearRevenue += $amount;
                                    @endphp
                                    <tr>
                                        <td class="font-bold">{{ $monthData['date'] ?? 'N/A' }}</td>
                                        <td class="text-right {{ $amount > 0 ? 'text-blue' : 'text-gray' }}">
                                            ${{ number_format($amount, 2) }}
                                        </td>
                                    </tr>
                                @endforeach
                            @else
                                <tr>
                                    <td colspan="2" class="text-center text-gray" style="padding: 15px;">
                                        No hay datos anuales disponibles
                                    </td>
                                </tr>
                            @endif
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>TOTAL AÑO</td>
                                <td class="text-right">${{ number_format($totalYearRevenue, 2) }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div class="column">
                <!-- Progreso de Meta Mensual -->
                <div class="section no-break">
                    <div class="section-title">Progreso de Meta Mensual</div>
                    <div class="section-subtitle">Objetivo: $50,000.00 MXN</div>
                    
                    @php
                        $monthlyGoal = 50000;
                        $currentRevenue = $stats['revenue'] ?? 0;
                        $progressPercent = min(100, ($currentRevenue / $monthlyGoal) * 100);
                        $remaining = max(0, $monthlyGoal - $currentRevenue);
                    @endphp
                    
                    <div style="background: #f8fafc; padding: 16px; border-radius: 4px; margin-top: 10px; border: 2px solid #cbd5e1;">
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">
                                Ingresos Actuales
                            </div>
                            <div style="font-size: 20px; font-weight: 700; color: #1e3a8a;">
                                ${{ number_format($currentRevenue, 2) }}
                            </div>
                        </div>
                        
                        <!-- Progress Bar -->
                        <div style="background: #e0e7ff; height: 24px; border-radius: 4px; overflow: hidden; margin-bottom: 12px; border: 1px solid #cbd5e1;">
                            <div style="background: #1e3a8a; height: 100%; width: {{ $progressPercent }}%; display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: 700;">
                                {{ number_format($progressPercent, 1) }}%
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; font-size: 9px;">
                            <div>
                                <span style="color: #64748b; font-weight: 600;">Restante:</span>
                                <span style="color: #1a1a1a; font-weight: 700; margin-left: 4px;">${{ number_format($remaining, 2) }}</span>
                            </div>
                            <div>
                                <span style="color: #64748b; font-weight: 600;">Meta:</span>
                                <span style="color: #1a1a1a; font-weight: 700; margin-left: 4px;">${{ number_format($monthlyGoal, 2) }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Additional Stats -->
                    <div style="margin-top: 12px; padding: 12px; background: #ffffff; border: 2px solid #cbd5e1; border-radius: 4px;">
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 8px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 3px;">
                                Promedio Diario Necesario
                            </div>
                            <div style="font-size: 14px; font-weight: 700; color: #1a1a1a;">
                                @php
                                    $daysInMonth = date('t');
                                    $currentDay = date('j');
                                    $daysRemaining = max(1, $daysInMonth - $currentDay);
                                    $dailyAverage = $remaining / $daysRemaining;
                                @endphp
                                ${{ number_format($dailyAverage, 2) }}
                            </div>
                            <div style="font-size: 7px; color: #64748b; margin-top: 2px;">
                                ({{ $daysRemaining }} días restantes)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Two Columns: Orders by Status + Top Products -->
        <div class="two-columns">
            <div class="column">
                <!-- Orders by Status -->
                <div class="section no-break">
                    <div class="section-title">Pedidos por Estado</div>
                    <div class="section-subtitle">Distribución de estados de entrega</div>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th style="width: 60%;">Estado</th>
                                <th class="text-right" style="width: 40%;">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            @if(isset($ordersByStatus) && count($ordersByStatus) > 0)
                                @php
                                    $totalOrdersStatus = array_sum(array_column($ordersByStatus, 'amount'));
                                @endphp
                                @foreach($ordersByStatus as $status)
                                    @php
                                        $statusName = strtolower(str_replace(' ', '_', $status['name'] ?? 'pendiente'));
                                        $percentage = $totalOrdersStatus > 0 ? ($status['amount'] / $totalOrdersStatus) * 100 : 0;
                                    @endphp
                                    <tr>
                                        <td>
                                            <span class="status-badge status-{{ $statusName }}">
                                                {{ ucfirst($status['name'] ?? 'N/A') }}
                                            </span>
                                        </td>
                                        <td class="text-right">
                                            <span class="font-bold">{{ $status['amount'] ?? 0 }}</span>
                                            <span class="text-gray" style="font-size: 8px; margin-left: 4px;">({{ number_format($percentage, 1) }}%)</span>
                                        </td>
                                    </tr>
                                @endforeach
                            @else
                                <tr>
                                    <td colspan="2" class="text-center text-gray" style="padding: 15px;">No hay datos de estados</td>
                                </tr>
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="column">
                <!-- Top Products -->
                <div class="section no-break">
                    <div class="section-title">Top 10 Productos</div>
                    <div class="section-subtitle">Productos más vendidos (Pedidos + Ventas)</div>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th style="width: 10%;">#</th>
                                <th style="width: 60%;">Producto</th>
                                <th class="text-right" style="width: 30%;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            @if(isset($topProducts) && count($topProducts) > 0)
                                @foreach(array_slice($topProducts, 0, 10) as $index => $product)
                                    @php
                                        $total = $product['total'] ?? 0;
                                    @endphp
                                    @if($total > 0)
                                        <tr>
                                            <td class="text-center text-gray font-bold">{{ $index + 1 }}</td>
                                            <td>{{ $product['name'] ?? 'N/A' }}</td>
                                            <td class="text-right font-bold">{{ $total }}</td>
                                        </tr>
                                    @endif
                                @endforeach
                            @else
                                <tr>
                                    <td colspan="3" class="text-center text-gray" style="padding: 15px;">No hay productos vendidos</td>
                                </tr>
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Recent Orders -->
        <div class="section no-break">
            <div class="section-title">Pedidos Recientes</div>
            <div class="section-subtitle">Últimos {{ isset($recentOrders) ? count($recentOrders) : 0 }} pedidos registrados en el sistema</div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 8%;">ID</th>
                        <th style="width: 25%;">Cliente</th>
                        <th style="width: 20%;">Fecha y Hora</th>
                        <th class="text-center" style="width: 22%;">Estado</th>
                        <th class="text-right" style="width: 25%;">Total (MXN)</th>
                    </tr>
                </thead>
                <tbody>
                    @if(isset($recentOrders) && count($recentOrders) > 0)
                        @foreach($recentOrders as $order)
                            @php
                                $statusName = strtolower(str_replace(' ', '_', $order['delivery_status']['name'] ?? 'pendiente'));
                            @endphp
                            <tr>
                                <td class="font-bold text-blue">#{{ $order['id'] ?? 'N/A' }}</td>
                                <td>{{ $order['user']['name'] ?? 'Usuario' }}</td>
                                <td style="font-size: 8px;">
                                    {{ isset($order['created_at']) ? \Carbon\Carbon::parse($order['created_at'])->format('d/m/Y H:i') : 'N/A' }}
                                </td>
                                <td class="text-center">
                                    <span class="status-badge status-{{ $statusName }}">
                                        {{ ucfirst($order['delivery_status']['name'] ?? 'Pendiente') }}
                                    </span>
                                </td>
                                <td class="text-right font-bold">${{ number_format($order['total'] ?? 0, 2) }}</td>
                            </tr>
                        @endforeach
                    @else
                        <tr>
                            <td colspan="5" class="text-center text-gray" style="padding: 15px;">No hay pedidos recientes</td>
                        </tr>
                    @endif
                </tbody>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div><strong>{{ $business_name ?? 'Sistema de Gestión' }}</strong> - Reporte generado el {{ date('d/m/Y H:i') }} hrs</div>
            <div style="margin-top: 2px;">Dashboard Administrativo - Todos los derechos reservados</div>
        </div>
    </div>
</body>
</html>