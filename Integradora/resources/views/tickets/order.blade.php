<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket #{{ $order->id }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            line-height: 1.5;
            color: #000000;
            width: 180px;
            padding: 2px;
            font-weight: bold;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3px;
            padding-bottom: 3px;
            border-bottom: 3px solid #000000;
        }
        
        .business-name {
            font-family: 'Montserrat', sans-serif;
            font-size: 22px;
            font-weight: 900;
            margin-bottom: 3px;
            letter-spacing: 2px;
            color: #000000;
        }
        
        .business-info {
            font-size: 11px;
            font-weight: bold;
            color: #000000;
        }
        
        .ticket-info {
            margin: 5px 0;
            font-size: 12px;
            padding: 3px 0;
            font-weight: bold;
        }
        
        .ticket-info div {
            margin: 2px 0;
        }
        
        .ticket-number {
            font-size: 14px;
            font-weight: 900;
            text-align: center;
            margin-bottom: 3px;
            padding-bottom: 3px;
            border-bottom: 2px dashed #000000;
        }
        
        .separator-solid {
            border-top: 3px solid #000000;
            margin: 5px 0;
        }
        
        .delivery-info {
            margin: 5px 0;
            padding: 3px 0;
        }
        
        .delivery-info-title {
            font-size: 12px;
            font-weight: 900;
            margin-bottom: 3px;
            color: #000000;
            text-decoration: underline;
        }
        
        .delivery-info-text {
            font-size: 11px;
            font-weight: bold;
            line-height: 1.3;
            color: #000000;
        }
        
        .items-table {
            width: 100%;
            margin: 5px 0;
        }
        
        .items-header {
            font-weight: 900;
            border-bottom: 3px solid #000000;
            padding-bottom: 3px;
            margin-bottom: 5px;
            font-size: 12px;
            color: #000000;
        }
        
        .item-row {
            margin: 5px 0;
            padding: 3px 0;
            border-bottom: 2px dotted #333333;
        }
        
        .item-row:last-child {
            border-bottom: none;
        }
        
        .item-name {
            font-size: 12px;
            font-weight: 900;
            margin-bottom: 2px;
            color: #000000;
        }
        
        .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-weight: bold;
            color: #000000;
        }
        
        .totals {
            margin-top: 6px;
            padding-top: 5px;
            border-top: 3px solid #000000;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 12px;
            font-weight: bold;
            color: #000000;
        }
        
        .tax-notice {
            font-size: 9px;
            font-style: italic;
            color: #000000;
            text-align: right;
            margin-top: 2px;
            font-weight: bold;
        }
        
        .total-final {
            font-size: 16px;
            font-weight: 900;
            padding-top: 5px;
            border-top: 3px double #000000;
            margin-top: 5px;
            color: #000000;
        }
        
        .footer {
            text-align: center;
            margin-top: 6px;
            padding-top: 5px;
            border-top: 3px solid #000000;
            font-size: 11px;
        }
        
        .thank-you {
            font-weight: 900;
            font-size: 14px;
            margin: 5px 0;
            letter-spacing: 1px;
            color: #000000;
        }
        
        .footer-note {
            margin-top: 3px;
            font-size: 10px;
            line-height: 1.4;
            font-weight: bold;
            color: #000000;
        }
        
        .status-badge {
            display: inline-block;
            padding: 2px 5px;
            background-color: #e0e0e0;
            border-radius: 2px;
            font-size: 10px;
            font-weight: 900;
            color: #000000;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="business-name">GELATO</div>
        <div class="business-info">Pedido Online</div>
    </div>
    
    <!-- Ticket Info -->
    <div class="ticket-info">
        <div class="ticket-number">PEDIDO #{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}</div>
        <div>Fecha: {{ $order->created_at->format('d/m/Y H:i') }}</div>
        <div>Cliente: {{ $order->user->name }}</div>
        <div>Tel: {{ $order->user->phone }}</div>
        <div>Pago: {{ $order->paymentMethod->name }}</div>
        <div>Estado: <span class="status-badge">{{ strtoupper($order->deliveryStatus->name) }}</span></div>
        @if($order->paypal_order_id)
        <div style="font-size: 10px; margin-top: 2px;">PayPal: {{ substr($order->paypal_order_id, 0, 12) }}...</div>
        @endif
    </div>
    
    <div class="separator-solid"></div>
    
    <!-- Delivery Address -->
    <div class="delivery-info">
        <div class="delivery-info-title">ENTREGA:</div>
        <div class="delivery-info-text">
            <div>{{ $order->address->street }} {{ $order->address->number }}</div>
            <div>{{ $order->address->neighborhood }}</div>
            <div>{{ $order->address->city }}, {{ $order->address->state }}</div>
            <div>CP: {{ $order->address->postal_code }}</div>
            @if($order->address->reference)
            <div><strong>Ref:</strong> {{ $order->address->reference }}</div>
            @endif
        </div>
        
        @if($order->deliveryPerson)
        <div style="margin-top: 4px; padding-top: 4px; border-top: 2px dashed #000000;">
            <div class="delivery-info-title">REPARTIDOR:</div>
            <div class="delivery-info-text">{{ $order->deliveryPerson->name }}</div>
        </div>
        @endif
    </div>
    
    <div class="separator-solid"></div>
    
    <!-- Items -->
    <div class="items-table">
        <div class="items-header">
            <div style="display: flex; justify-content: space-between;">
                <span>PRODUCTO</span>
                <span>TOTAL</span>
            </div>
        </div>
        
        @foreach($order->orderItems as $item)
        <div class="item-row">
            @if($item->product_type === 'base' && $item->baseProduct)
                <div class="item-name">{{ $item->baseProduct->name }}</div>
            @elseif($item->product_type === 'custom' && $item->customProduct)
                <div class="item-name">Pastel Personalizado</div>
                <div style="font-size: 11px; margin-left: 3px; font-weight: bold;">
                    - Sabor: {{ $item->customProduct->flavor->name }}
                    @if($item->customProduct->size) • Tam: {{ $item->customProduct->size->name }} @endif
                    @if($item->customProduct->filling) • Rell: {{ $item->customProduct->filling->name }} @endif
                </div>
            @else
                <div class="item-name">{{ $item->product_name ?? 'Producto' }}</div>
            @endif
            
            <div class="item-details">
                <span>{{ $item->quantity }}x ${{ number_format($item->unit_price, 2) }}</span>
                <span>${{ number_format($item->subtotal, 2) }}</span>
            </div>
        </div>
        @endforeach
    </div>
    
    <!-- Totals -->
    <div class="totals">
        @php
            $subtotal = $order->orderItems->sum('subtotal');
            $shipping = 50.00;
        @endphp
        
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${{ number_format($subtotal, 2) }}</span>
        </div>
        
        <div class="total-row">
            <span>Envio:</span>
            <span>${{ number_format($shipping, 2) }}</span>
        </div>
        
        <div class="tax-notice">
            * IVA incluido
        </div>
        
        <div class="total-row total-final">
            <span>TOTAL:</span>
            <span>${{ number_format($order->total, 2) }}</span>
        </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <div class="thank-you">¡GRACIAS POR
        TU COMPRA!</div>
        <div class="separator-solid"></div>
        <div class="footer-note">
            Comprobante valido
        </div>
        <div class="footer-note">
            Rastrea tu pedido
        </div>
        <div class="footer-note">
            online
        </div>
    </div>
</body>
</html>