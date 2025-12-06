<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="/react-app/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Gelato App" />
    <link rel="apple-touch-icon" href="/react-app/logo192.png" />
    <link rel="manifest" href="/react-app/manifest.json" />
    <title>Gelato App</title>
    @php
        $manifestPath = public_path('react-app/asset-manifest.json');
        if (file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
            $mainCss = $manifest['files']['main.css'] ?? null;
            $mainJs = $manifest['files']['main.js'] ?? null;
        } else {
            $mainCss = null;
            $mainJs = null;
        }
    @endphp
    @if($mainCss)
    <link href="{{ $mainCss }}" rel="stylesheet">
    @endif
</head>
<body>
    <noscript>Necesitas habilitar JavaScript para ejecutar esta aplicación.</noscript>
    <div id="root"></div>
    @if($mainJs)
    <script src="{{ $mainJs }}"></script>
    @endif
</body>
</html>
