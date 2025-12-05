# Guía de Deployment para Railway

## Configuración Inicial

### 1. Preparar el Build de React

Antes de hacer deploy, necesitas actualizar las URLs en el archivo `.env.production` del proyecto React:

```env
REACT_APP_API_URL=https://tu-app.railway.app/api
REACT_APP_WS_URL=wss://tu-app.railway.app
```

**Nota**: Reemplaza `tu-app.railway.app` con la URL real que te asigne Railway.

### 2. Generar el Build de Producción

Desde el directorio `integradora-web`:

```powershell
npm run build:deploy
```

Este comando:
- Genera el build de producción de React
- Copia automáticamente los archivos a `Integradora/public/react-app`

### 3. Verificar Localmente

Antes de hacer deploy, prueba que todo funcione localmente:

```powershell
cd c:\Laravel12\Proyecto\Integradora
php artisan serve
```

Abre `http://localhost:8000` y verifica:
- ✓ La aplicación React carga correctamente
- ✓ La navegación entre rutas funciona
- ✓ Las llamadas a la API funcionan (aunque apunten a localhost)

---

## Deploy en Railway

### 1. Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Selecciona el proyecto `Integradora`

### 2. Configurar Variables de Entorno

En Railway, agrega las siguientes variables de entorno:

**Aplicación Laravel:**
```
APP_NAME="Gelato App"
APP_ENV=production
APP_KEY=base64:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
APP_DEBUG=false
APP_URL=https://tu-app.railway.app

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=XXXXXXXX
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=XXXXXXXX

BROADCAST_DRIVER=reverb
CACHE_DRIVER=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_LIFETIME=120

REVERB_APP_ID=XXXXXXXX
REVERB_APP_KEY=XXXXXXXX
REVERB_APP_SECRET=XXXXXXXX
REVERB_HOST=tu-app.railway.app
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

**Notas importantes:**
- Genera `APP_KEY` con: `php artisan key:generate --show`
- Railway te proporcionará automáticamente las credenciales de la base de datos
- Actualiza las variables de Reverb según tu configuración

### 3. Configurar Base de Datos

Railway creará automáticamente una base de datos MySQL. Asegúrate de:
1. Copiar las credenciales de la base de datos a las variables de entorno
2. Las migraciones se ejecutarán automáticamente en el primer deploy

### 4. Hacer Deploy

1. Asegúrate de que el build de React esté en `public/react-app`
2. Haz commit de todos los cambios:
   ```powershell
   git add .
   git commit -m "Configurar deploy con React build integrado"
   git push
   ```
3. Railway detectará el push y comenzará el deployment automáticamente

### 5. Actualizar URLs de Producción

Una vez que Railway te asigne una URL:

1. Actualiza `.env.production` en `integradora-web` con la URL real
2. Regenera el build:
   ```powershell
   cd integradora-web
   npm run build:deploy
   ```
3. Haz commit y push de nuevo:
   ```powershell
   cd ../Integradora
   git add public/react-app
   git commit -m "Actualizar build con URLs de producción"
   git push
   ```

---

## Verificación Post-Deploy

Una vez desplegado, verifica:

- [ ] La aplicación carga en la URL de Railway
- [ ] El login/registro funciona
- [ ] Las imágenes y assets cargan correctamente
- [ ] Las rutas de React Router funcionan
- [ ] Las llamadas a la API funcionan
- [ ] WebSockets (Reverb) funciona para notificaciones en tiempo real

---

## Troubleshooting

### Error 404 en rutas de React
- Verifica que `web.php` tenga la ruta catch-all configurada
- Asegúrate de que el build esté en `public/react-app`

### Assets no cargan (404)
- Verifica que las rutas en `react.blade.php` sean correctas
- Revisa que el `asset-manifest.json` exista en `public/react-app`

### Error de conexión a la API
- Verifica que las variables `REACT_APP_API_URL` estén correctas en el build
- Asegúrate de que las rutas API estén bajo `/api`

### Base de datos no conecta
- Verifica las credenciales en las variables de entorno de Railway
- Asegúrate de que las migraciones se hayan ejecutado

---

## Mantenimiento

### Actualizar el Frontend

Cada vez que hagas cambios en React:

```powershell
cd integradora-web
npm run build:deploy
cd ../Integradora
git add public/react-app
git commit -m "Actualizar frontend"
git push
```

### Actualizar el Backend

Los cambios en Laravel se desplegarán automáticamente al hacer push:

```powershell
git add .
git commit -m "Descripción de cambios"
git push
```
