# 🚀 Guía Rápida: Deploy a Railway

## Paso 1: Subir a GitHub (si aún no lo has hecho)

Si tu proyecto no está en GitHub, necesitas subirlo primero:

```powershell
# Verificar si tienes un remote configurado
git remote -v

# Si no tienes remote, crear un repositorio en GitHub y agregarlo:
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Subir los cambios
git push -u origin master
```

## Paso 2: Crear Cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **"Start a New Project"** o **"Login with GitHub"**
3. Autoriza Railway para acceder a tus repositorios de GitHub

## Paso 3: Crear Nuevo Proyecto

1. En el dashboard de Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona tu repositorio `Integradora`
4. Railway detectará automáticamente que es un proyecto Laravel

## Paso 4: Agregar Base de Datos MySQL

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database"**
3. Elige **"MySQL"**
4. Railway creará automáticamente la base de datos y las variables de entorno

## Paso 5: Configurar Variables de Entorno

Haz clic en tu servicio Laravel → pestaña **"Variables"** → Agrega las siguientes:

### Variables Esenciales:

```env
APP_NAME=Gelato App
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}

LOG_CHANNEL=stack
LOG_LEVEL=error

# Railway conectará automáticamente MySQL, pero verifica estas:
DB_CONNECTION=mysql
DB_HOST=${{MYSQL_HOST}}
DB_PORT=${{MYSQL_PORT}}
DB_DATABASE=${{MYSQL_DATABASE}}
DB_USERNAME=${{MYSQL_USER}}
DB_PASSWORD=${{MYSQL_PASSWORD}}

BROADCAST_DRIVER=reverb
CACHE_DRIVER=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_LIFETIME=120
```

### Variables de Reverb (WebSockets):

```env
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
REVERB_HOST=${{RAILWAY_PUBLIC_DOMAIN}}
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_APP_KEY=my-app-key
VITE_REVERB_HOST=${{RAILWAY_PUBLIC_DOMAIN}}
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

### ⚠️ IMPORTANTE: Generar APP_KEY

Railway no puede generar el `APP_KEY` automáticamente. Debes generarlo localmente:

```powershell
php artisan key:generate --show
```

Copia el resultado (algo como `base64:xxxxxxxxxxxxx`) y pégalo en la variable `APP_KEY` en Railway.

## Paso 6: Configurar el Dominio Público

1. En tu servicio Laravel, ve a la pestaña **"Settings"**
2. En la sección **"Networking"**, haz clic en **"Generate Domain"**
3. Railway te asignará una URL como `tu-app.up.railway.app`
4. **Copia esta URL** - la necesitarás para el siguiente paso

## Paso 7: Actualizar Build de React con URL de Producción

Ahora que tienes la URL de Railway, actualiza tu frontend:

1. **Edita** `integradora-web/.env.production`:
   ```env
   REACT_APP_API_URL=https://tu-app.up.railway.app/api
   REACT_APP_WS_URL=wss://tu-app.up.railway.app
   ```
   *(Reemplaza `tu-app.up.railway.app` con tu URL real)*

2. **Regenera el build** con las URLs correctas:
   ```powershell
   cd c:\Laravel12\Proyecto\integradora-web
   npm run build:deploy
   ```

3. **Commit y push** el nuevo build:
   ```powershell
   cd ..\Integradora
   git add public/react-app
   git commit -m "Actualizar build con URLs de producción"
   git push
   ```

Railway detectará el push y redesplegará automáticamente.

## Paso 8: Verificar el Deploy

1. Railway mostrará los logs del deployment en tiempo real
2. Espera a que el deploy termine (verás "Build successful" y "Deployment live")
3. Haz clic en la URL de tu aplicación
4. ¡Tu aplicación debería estar funcionando! 🎉

## Paso 9: Verificación Post-Deploy

Prueba las siguientes funcionalidades:

- [ ] La aplicación carga correctamente
- [ ] El login/registro funciona
- [ ] Las imágenes y assets cargan
- [ ] Las rutas de React Router funcionan
- [ ] Las llamadas a la API funcionan
- [ ] WebSockets/notificaciones funcionan

## 🔧 Troubleshooting

### Error: "No application encryption key has been specified"
- Genera el `APP_KEY` localmente: `php artisan key:generate --show`
- Agrégalo a las variables de entorno en Railway
- Redeploy

### Error 500 en la aplicación
- Revisa los logs en Railway (pestaña "Deployments" → "View Logs")
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que las migraciones se ejecutaron

### Base de datos no conecta
- Verifica que las variables `DB_*` estén correctamente configuradas
- Railway debería configurarlas automáticamente al agregar MySQL

### Assets de React no cargan (404)
- Verifica que el build esté en `public/react-app`
- Asegúrate de haber hecho push del directorio `public/react-app`
- Revisa que `.gitignore` permita `public/react-app`

### WebSockets no funcionan
- Verifica que las variables de Reverb estén configuradas
- Asegúrate de usar `wss://` (no `ws://`) en producción
- Revisa que `REVERB_HOST` tenga tu dominio de Railway

## 📝 Comandos Útiles

```powershell
# Ver logs de Railway (si tienes Railway CLI instalado)
railway logs

# Ejecutar migraciones manualmente
railway run php artisan migrate --force

# Limpiar cache
railway run php artisan config:clear
railway run php artisan cache:clear
```

## 🎯 Resumen Rápido

1. ✅ Subir código a GitHub
2. ✅ Crear proyecto en Railway desde GitHub
3. ✅ Agregar base de datos MySQL
4. ✅ Configurar variables de entorno (especialmente `APP_KEY`)
5. ✅ Generar dominio público
6. ✅ Actualizar `.env.production` con URL de Railway
7. ✅ Regenerar build de React: `npm run build:deploy`
8. ✅ Push a GitHub
9. ✅ Verificar que todo funcione

---

**¿Necesitas ayuda?** Revisa los logs en Railway o consulta la [documentación oficial](https://docs.railway.app/).
