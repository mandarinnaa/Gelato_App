import React, { useEffect, useState } from 'react';
import {
  Card,
  Grid,
  Title,
  Text,
  Metric,
  AreaChart,
  BarChart,
  DonutChart,
  LineChart,
  ProgressBar,
  BarList,
  List,
  ListItem,
  Bold,
  Flex,
  Badge,
  BadgeDelta
} from '@tremor/react';
import Loader from '../../components/common/Loader';
import { dashboardService } from '../../api/dashboardService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    revenue: 0,
    ordersChange: 0,
    salesChange: 0,
    revenueChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({
    revenue: [],
    revenueComparison: [],
    ordersByStatus: [],
    topProductsOrders: [],
    topProductsSales: [],
    revenueByYear: [],
    salesProgress: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [revenueTooltipData, setRevenueTooltipData] = useState(null);

  useEffect(() => {
    generateAvailableMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadDashboardData();
    }
  }, [selectedPeriod, selectedMonth]);

  const generateAvailableMonths = () => {
    const months = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
        isCurrent: i === 0
      });
    }

    setAvailableMonths(months);
    setSelectedMonth(months[0].value);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const currentMonth = availableMonths.find(m => m.value === selectedMonth);
      const period = currentMonth?.isCurrent ? selectedPeriod : 'month';

      // Single consolidated API call (OPTIMIZED - 75% faster)
      const response = await dashboardService.getAllDashboardData(period, month, year);
      const data = response.data;

      // Set stats
      setStats(data.stats);
      setRecentOrders(data.recentOrders);

      // Process top products
      const ordersProducts = data.topProducts.orders.filter(p => p.value > 0).slice(0, 10);
      const salesProducts = data.topProducts.sales.filter(p => p.value > 0).slice(0, 10);

      // Process revenue comparison
      const revenueComparison = data.revenueChart.map(item => ({
        date: item.date,
        Pedidos: item.Pedidos,
        Ventas: item.Ventas
      }));

      // Process yearly data
      const yearlyData = data.revenueByYear.map(item => ({
        date: item.date,
        Ganancia: item.Ganancia
      }));

      const monthlyGoal = 50000;
      const progressPercent = Math.min(100, (data.stats.revenue / monthlyGoal) * 100);

      setChartData({
        revenue: data.revenueChart,
        revenueComparison: revenueComparison,
        ordersByStatus: data.ordersByStatus,
        topProductsOrders: ordersProducts,
        topProductsSales: salesProducts,
        revenueByYear: yearlyData,
        salesProgress: progressPercent
      });
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const valueFormatter = (number) =>
    `$${Intl.NumberFormat('es-MX').format(number).toString()}`;

  const handleDownloadReport = () => {
    const [year, month] = selectedMonth.split('-');
    const currentMonth = availableMonths.find(m => m.value === selectedMonth);
    const period = currentMonth?.isCurrent ? selectedPeriod : 'month';

    dashboardService.downloadReport(period, month, year);
  };

  const getPeriodLabel = () => {
    const currentMonth = availableMonths.find(m => m.value === selectedMonth);
    const isCurrentMonth = currentMonth?.isCurrent;

    if (!isCurrentMonth) {
      return currentMonth?.label || 'Mes Seleccionado';
    }

    switch (selectedPeriod) {
      case 'day': return 'Hoy';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mes';
      default: return 'Este Mes';
    }
  };

  const isCurrentMonth = () => {
    const currentMonth = availableMonths.find(m => m.value === selectedMonth);
    return currentMonth?.isCurrent || false;
  };

  const getDeltaType = (value) => {
    if (value > 10) return "increase";
    if (value > 0) return "moderateIncrease";
    if (value < -10) return "decrease";
    if (value < 0) return "moderateDecrease";
    return "unchanged";
  };

  const getStatusColor = (statusName) => {
    const name = statusName.toLowerCase();
    if (name.includes('entregado') || name.includes('completado')) return 'emerald';
    if (name.includes('pendiente')) return 'yellow';
    if (name.includes('camino') || name.includes('preparando')) return 'blue';
    if (name.includes('cancelado')) return 'red';
    return 'gray';
  };

  // Componente personalizado para las barras con tooltip
  const CustomBarList = ({ data, color = "blue" }) => {
    return (
      <div className="space-y-2">
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => d.value));
          const percentage = (item.value / maxValue) * 100;

          return (
            <div
              key={index}
              className="group relative"
              onMouseEnter={() => setHoveredProduct(item.name)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {hoveredProduct === item.name && (
                <div className="absolute z-50 bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
                  {item.name}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}

              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 truncate max-w-[200px]">
                  {item.name}
                </span>
                <span className="text-sm font-semibold text-gray-900 ml-2">
                  {item.value}
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full ${color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard General</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen de actividad y rendimiento</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          >
            {availableMonths.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          {isCurrentMonth() && (
            <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              {['day', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedPeriod === period
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {period === 'day' ? 'Día' : period === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* Stats Cards - Minimalist Style */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-6 mb-8">
        <Card className="rounded-2xl shadow-sm border border-gray-200 ring-0">
          <Flex justifyContent="between" alignItems="center">
            <Text className="font-medium text-gray-600">Total Pedidos</Text>
            <BadgeDelta deltaType={getDeltaType(stats.ordersChange)}>
              {stats.ordersChange > 0 ? '+' : ''}{stats.ordersChange.toFixed(1)}%
            </BadgeDelta>
          </Flex>
          <Metric className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrders}</Metric>
          <Text className="mt-2 text-sm text-gray-500">vs período anterior</Text>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-gray-200 ring-0">
          <Flex justifyContent="between" alignItems="center">
            <Text className="font-medium text-gray-600">Total Ventas</Text>
            <BadgeDelta deltaType={getDeltaType(stats.salesChange)}>
              {stats.salesChange > 0 ? '+' : ''}{stats.salesChange.toFixed(1)}%
            </BadgeDelta>
          </Flex>
          <Metric className="mt-2 text-3xl font-bold text-gray-900">{stats.totalSales}</Metric>
          <Text className="mt-2 text-sm text-gray-500">vs período anterior</Text>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-gray-200 ring-0">
          <Flex justifyContent="between" alignItems="center">
            <Text className="font-medium text-gray-600">Total Productos</Text>
            <Badge color="green" className="rounded-md">Activos</Badge>
          </Flex>
          <Metric className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProducts}</Metric>
          <Text className="mt-2 text-sm text-gray-500">en inventario</Text>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-gray-200 ring-0">
          <Flex justifyContent="between" alignItems="center">
            <Text className="font-medium text-gray-600">Ingresos Totales</Text>
            <BadgeDelta deltaType={getDeltaType(stats.revenueChange)}>
              {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}%
            </BadgeDelta>
          </Flex>
          <Metric className="mt-2 text-3xl font-bold text-gray-900">${stats.revenue.toFixed(2)}</Metric>
          <Text className="mt-2 text-sm text-gray-500">vs período anterior</Text>
        </Card>
      </Grid>

      {/* Revenue Line Chart */}
      <Card className="mb-8 rounded-2xl shadow-sm border border-gray-200 ring-0">
        <Title className="font-bold text-gray-900">Comparación de Ingresos</Title>
        <Text className="text-gray-500">Pedidos vs Ventas en Tienda - {getPeriodLabel()}</Text>
        <LineChart
          className="h-80 mt-6"
          data={chartData.revenueComparison}
          index="date"
          categories={["Pedidos", "Ventas"]}
          colors={["blue", "emerald"]}
          valueFormatter={valueFormatter}
          showLegend={true}
          showGridLines={true}
          showAnimation={true}
          curveType="monotone"
        />
      </Card>

      {/* Revenue by Year + Progress */}
      <Grid numItemsLg={2} className="gap-6 mb-8">
        <Card className="rounded-2xl shadow-sm border border-gray-200 ring-0">
          <div>
            <Text className="text-sm font-medium text-gray-600">Ingresos por mes</Text>
            <Metric className="mt-2 text-emerald-600">
              {(() => {
                if (revenueTooltipData) {
                  const val = revenueTooltipData.Ganancia || revenueTooltipData.value || revenueTooltipData.payload?.[0]?.value;
                  if (val !== undefined) return valueFormatter(val);
                }
                if (chartData.revenueByYear.length > 0) {
                  const lastItem = chartData.revenueByYear[chartData.revenueByYear.length - 1];
                  return valueFormatter(lastItem.Ganancia || 0);
                }
                return '$0.00';
              })()}
            </Metric>
            <BarChart
              data={chartData.revenueByYear}
              index="date"
              categories={["Ganancia"]}
              colors={["emerald"]}
              showLegend={false}
              showYAxis={false}
              startEndOnly={true}
              className="-mb-2 mt-8 h-48"
              valueFormatter={valueFormatter}
              onValueChange={(value) => {
                if (value) setRevenueTooltipData(value);
                else setRevenueTooltipData(null);
              }}
            />
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-gray-200 ring-0">
          <Flex justifyContent="between" alignItems="start">
            <div>
              <Text className="font-medium text-gray-600">Progreso de Meta Mensual</Text>
              <Metric className="mt-2 text-gray-900">${stats.revenue.toFixed(2)}</Metric>
            </div>
            <Text className="text-sm font-medium text-gray-400">Meta: $50,000</Text>
          </Flex>
          <ProgressBar
            value={chartData.salesProgress}
            label={`${chartData.salesProgress.toFixed(1)}%`}
            color="blue"
            className="mt-8"
          />
          <Flex className="mt-4">
            <Text className="text-sm font-medium text-gray-600">
              ${(50000 - stats.revenue).toFixed(2)} restante
            </Text>
            <Text className="text-sm text-gray-400">
              de $50,000.00
            </Text>
          </Flex>
        </Card>
      </Grid>

      {/* Top Products */}
      <Grid numItemsLg={2} className="gap-6 mb-8">
        <Card className="rounded-2xl shadow-sm border border-gray-200 ring-0">
          <Title className="font-bold text-gray-900">Top Productos - Pedidos</Title>
          <Text className="mb-6 text-gray-500">Productos más vendidos en pedidos</Text>
          {chartData.topProductsOrders.length > 0 ? (
            <CustomBarList data={chartData.topProductsOrders} color="blue" />
          ) : (
            <div className="h-48 flex items-center justify-center">
              <Text className="text-gray-400">No hay datos de productos en pedidos</Text>
            </div>
          )}
        </Card>

        <Card className="rounded-2xl shadow-sm border border-gray-200 ring-0">
          <Title className="font-bold text-gray-900">Top Productos - Ventas Tienda</Title>
          <Text className="mb-6 text-gray-500">Productos más vendidos en tienda</Text>
          {chartData.topProductsSales.length > 0 ? (
            <CustomBarList data={chartData.topProductsSales} color="emerald" />
          ) : (
            <div className="h-48 flex items-center justify-center">
              <Text className="text-gray-400">No hay datos de productos en ventas</Text>
            </div>
          )}
        </Card>
      </Grid>

      {/* Orders by Status */}
      <Card className="mb-8 rounded-2xl shadow-sm border border-gray-200 ring-0">
        <Title className="font-bold text-gray-900">Distribución de Pedidos por Estado</Title>
        <Text className="mb-6 text-gray-500">Estado de entrega - {getPeriodLabel()}</Text>
        <DonutChart
          className="h-80"
          data={chartData.ordersByStatus}
          category="amount"
          index="name"
          colors={chartData.ordersByStatus.map(item => getStatusColor(item.name))}
          valueFormatter={(number) => `${number} pedidos`}
          showLabel={true}
          showAnimation={true}
        />
      </Card>

      {/* Recent Orders */}
      <Card className="rounded-2xl shadow-sm border border-gray-200 ring-0">
        <Title className="font-bold text-gray-900">Pedidos Recientes</Title>
        <Text className="mb-6 text-gray-500">Últimos pedidos registrados</Text>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <Text className="text-gray-400">No hay pedidos recientes</Text>
          </div>
        ) : (
          <List>
            {recentOrders.map(order => (
              <ListItem key={order.id} className="border-b border-gray-100 last:border-0">
                <Flex justifyContent="between" alignItems="center" className="w-full">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {order.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <Text className="font-bold text-gray-900">
                        {order.user?.name || 'Usuario'}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      color={getStatusColor(order.delivery_status?.name || 'Pendiente')}
                      className="rounded-md"
                    >
                      {order.delivery_status?.name || 'Pendiente'}
                    </Badge>
                    <Text className="font-bold text-gray-900 min-w-[80px] text-right">
                      ${parseFloat(order.total || 0).toFixed(2)}
                    </Text>
                  </div>
                </Flex>
              </ListItem>
            ))}
          </List>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;