<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #F3F0E7;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
        }
        .header h1 {
            font-size: 32px;
            font-weight: 900;
            color: #000;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .header p {
            font-size: 14px;
            color: #666;
            margin-top: 8px;
            font-weight: 500;
        }
        .content {
            padding: 40px 30px;
        }
        .intro-text {
            font-size: 15px;
            color: #666;
            margin-bottom: 30px;
            font-weight: 500;
        }
        .info-section {
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid #f0f0f0;
        }
        .info-section:last-of-type {
            border-bottom: none;
        }
        .label {
            font-weight: 700;
            color: #000;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            display: block;
        }
        .value {
            color: #333;
            font-size: 16px;
            font-weight: 500;
            word-wrap: break-word;
        }
        .value a {
            color: #000;
            text-decoration: none;
            border-bottom: 2px solid #000;
            transition: opacity 0.2s;
        }
        .value a:hover {
            opacity: 0.7;
        }
        .message-section {
            margin-top: 32px;
        }
        .message-box {
            background-color: #F3F0E7;
            border-left: 4px solid #000;
            padding: 24px;
            border-radius: 12px;
            margin-top: 12px;
            font-size: 15px;
            color: #333;
            line-height: 1.7;
            font-weight: 500;
        }
        .tip-box {
            margin-top: 32px;
            padding: 20px 24px;
            background-color: #f9f9f9;
            border-radius: 12px;
            border: 1px solid #e0e0e0;
        }
        .tip-box p {
            margin: 0;
            color: #666;
            font-size: 13px;
            font-weight: 500;
        }
        .tip-box strong {
            color: #000;
            font-weight: 700;
        }
        .footer {
            background-color: #F3F0E7;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }
        .footer-brand {
            font-size: 18px;
            font-weight: 900;
            color: #000;
            margin-bottom: 8px;
            letter-spacing: -0.3px;
        }
        .footer-timestamp {
            color: #999;
            font-size: 12px;
            font-weight: 500;
        }
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                border-radius: 16px;
            }
            .header {
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 26px;
            }
            .content {
                padding: 30px 20px;
            }
            .footer {
                padding: 24px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Gelato</h1>
            <p>Nuevo Mensaje de Contacto</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <p class="intro-text">
                Has recibido un nuevo mensaje desde el formulario de contacto de tu sitio web.
            </p>

            <!-- Name -->
            <div class="info-section">
                <span class="label">Nombre</span>
                <div class="value">{{ $contactData['name'] }}</div>
            </div>

            <!-- Email -->
            <div class="info-section">
                <span class="label">Email</span>
                <div class="value">
                    <a href="mailto:{{ $contactData['email'] }}">
                        {{ $contactData['email'] }}
                    </a>
                </div>
            </div>

            <!-- Phone (if provided) -->
            @if(!empty($contactData['phone']))
            <div class="info-section">
                <span class="label">Teléfono</span>
                <div class="value">
                    <a href="tel:{{ $contactData['phone'] }}">
                        {{ $contactData['phone'] }}
                    </a>
                </div>
            </div>
            @endif

            <!-- Subject -->
            <div class="info-section">
                <span class="label">Asunto</span>
                <div class="value">{{ $contactData['subject'] }}</div>
            </div>

            <!-- Message -->
            <div class="message-section">
                <span class="label">Mensaje</span>
                <div class="message-box">
                    {{ $contactData['message'] }}
                </div>
            </div>

            <!-- Tip Box -->
            <div class="tip-box">
                <p>
                    <strong>Nota:</strong> Puedes responder directamente a este email para contactar al cliente.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-brand">Gelato Pastelería</div>
            <div class="footer-timestamp">
                Email recibido el {{ date('d/m/Y H:i:s') }}
            </div>
        </div>
    </div>
</body>
</html>