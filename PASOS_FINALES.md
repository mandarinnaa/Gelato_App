# ✅ Pasos Finales para Deploy en Railway

## Estado Actual
- ✅ URL de Railway: `https://gelatoapp-production.up.railway.app/`
- ✅ Variables de entorno actualizadas en `.env.production`
- ✅ Configuración de Laravel lista

## 🚀 Pasos que Debes Seguir

### 1. Regenerar el Build de React

```powershell
cd c:\Laravel12\Proyecto\integradora-web
npm run build:deploy
```

Este comando:
- Creará el build de producción con las URLs de Railway
- Copiará automáticamente los archivos a `Integradora/public/react-app`

### 2. Subir a Git

```powershell
cd c:\Laravel12\Proyecto\Integradora
git add .
git commit -m "Actualizar build con URLs de producción de Railway"
git push
```

### 3. Configurar Variables de Entorno en Railway

Ve a tu proyecto en Railway → Tu servicio → **Variables** y asegúrate de tener:

**CRÍTICO - APP_KEY:**
```
APP_KEY=base64:cSVdY1ja0WsOiQRb+VBdSvYCsNA4/Ixj6gS5zHBiMNQ=
```

**Otras variables importantes:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://gelatoapp-production.up.railway.app

SESSION_DRIVER=database
QUEUE_CONNECTION=database
BROADCAST_DRIVER=reverb

# Reverb (WebSockets)
REVERB_APP_ID=gelato-app
REVERB_APP_KEY=gelato-key
REVERB_APP_SECRET=gelato-secret
REVERB_HOST=gelatoapp-production.up.railway.app
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_APP_KEY=gelato-key
VITE_REVERB_HOST=gelatoapp-production.up.railway.app
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

**Nota:** Railway debería haber configurado automáticamente las variables de MySQL (`DB_*`). Si no, agrégalas desde la pestaña de la base de datos.

### 4. Esperar el Deploy

Railway detectará el push y redesplegará automáticamente. Puedes ver el progreso en:
- Railway Dashboard → Tu proyecto → Deployments

### 5. Verificar que Todo Funcione

Una vez que el deploy termine, abre:
```
https://gelatoapp-production.up.railway.app/
```

Verifica:
- [ ] La aplicación carga
- [ ] Puedes hacer login/registro
- [ ] Las imágenes cargan
- [ ] Las rutas funcionan
- [ ] Las llamadas API funcionan

---

## 🔧 Si Algo Sale Mal

### Error: "No application encryption key"
- Agrega el `APP_KEY` en las variables de Railway (arriba)
- Redeploy

### Error 500
- Revisa los logs en Railway: Deployments → View Logs
- Verifica que todas las variables estén configuradas

### La aplicación no carga
- Verifica que el build esté en `public/react-app`
- Asegúrate de haber hecho `git push`

### Assets no cargan (404)
- Verifica que hiciste `npm run build:deploy` antes del push
- Revisa que `.gitignore` permita `public/react-app`

---

## 📝 Resumen Rápido

1. `npm run build:deploy` (en integradora-web)
2. `git add . && git commit -m "..." && git push` (en Integradora)
3. Configurar `APP_KEY` en Railway
4. Esperar deploy
5. ¡Listo! 🎉
