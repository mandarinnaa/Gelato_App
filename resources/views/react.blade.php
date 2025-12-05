<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="{{ asset('react-app/favicon.ico') }}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Gelato App" />
    <link rel="apple-touch-icon" href="{{ asset('react-app/logo192.png') }}" />
    <link rel="manifest" href="{{ asset('react-app/manifest.json') }}" />
    <title>Gelato App</title>
    @php
        $manifest = json_decode(file_get_contents(public_path('react-app/asset-manifest.json')), true);
        $mainJs = $manifest['files']['main.js'] ?? null;
        $mainCss = $manifest['files']['main.css'] ?? null;
    @endphp
    @if($mainCss)
    <link rel="stylesheet" href="{{ asset('react-app' . $mainCss) }}" />
    @endif
</head>
<body>
    <noscript>Necesitas habilitar JavaScript para ejecutar esta aplicación.</noscript>
    <div id="root"></div>
    @if($mainJs)
    <script src="{{ asset('react-app' . $mainJs) }}"></script>
    @endif
</body>
</html>
