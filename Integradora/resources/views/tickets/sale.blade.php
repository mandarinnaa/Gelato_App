<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket #{{ $sale->id }}</title>
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
        
        .logo {
            width: 140px;
            height: auto;
            margin: 0 auto 3px;
            display: block;
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
            text-align: left;
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
        <img src="{{ public_path('storage/img/sereno2.png') }}" alt="Logo" class="logo">
    </div>
    
    <!-- Ticket Info -->
    <div class="ticket-info">
        <div class="ticket-number">TICKET #{{ str_pad($sale->id, 6, '0', STR_PAD_LEFT) }}</div>
        <div>Fecha: {{ $sale->created_at->format('d/m/Y H:i') }}</div>
        <div>Cajero: {{ $sale->employee->name }}</div>
        <div>Pago: {{ $sale->paymentMethod->name }}</div>
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
        
        @foreach($sale->saleItems as $item)
        <div class="item-row">
            <div class="item-name">{{ $item->product->name }}</div>
            <div class="item-details">
                <span>{{ $item->quantity }} x ${{ number_format($item->unit_price, 2) }}</span>
                <span>${{ number_format($item->subtotal, 2) }}</span>
            </div>
        </div>
        @endforeach
    </div>
    
    <!-- Totals -->
    <div class="totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${{ number_format($sale->total, 2) }}</span>
        </div>
        
        <div class="tax-notice">
            * IVA incluido
        </div>
        
        <div class="total-row total-final">
            <span>TOTAL:</span>
            <span>${{ number_format($sale->total, 2) }}</span>
        </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <div class="thank-you">¡GRACIAS POR
        SU COMPRA!</div>
        <div class="separator-solid"></div>
        <div class="footer-note">
            Ticket valido
        </div>
        <div class="footer-note">
            como comprobante
        </div>
        <div class="footer-note">
            de compra
        </div>
    </div>
</body>
</html>