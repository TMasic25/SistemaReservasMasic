# ⚡ INICIO RÁPIDO - RESERVAS MASIC

## 🎯 Tu Sistema de Reservas Está Listo!

Acabas de recibir un sistema completo de reservas de transporte con:
- ✅ Formulario web profesional y responsive
- ✅ Notificaciones automáticas por Email
- ✅ Notificaciones automáticas por WhatsApp
- ✅ Base de datos en Google Sheets
- ✅ Control de overbooking
- ✅ Código de reserva único por cada solicitud

---

## 📦 ARCHIVOS INCLUIDOS

```
Reservas_MASIC_v1.0/
├── 📄 index.html              ← Formulario de reservas
├── 📄 README.md               ← Documentación completa
├── 📁 css/
│   └── styles.css            ← Estilos profesionales
├── 📁 js/
│   └── app.js                ← Lógica del sistema
└── 📁 docs/
    ├── Code.gs               ← Backend (Google Apps Script)
    ├── INSTALACION.md        ← Guía paso a paso detallada
    └── WHATSAPP_CONFIG.md    ← Configuración de WhatsApp
```

---

## 🚀 PASOS PARA PONER EN MARCHA (5 MINUTOS)

### PASO 1: Crear Google Sheet (30 segundos)
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja
3. Nómbrala: "Reservas_MASIC"
4. Déjala en blanco (el sistema creará los encabezados automáticamente)

### PASO 2: Configurar Google Apps Script (2 minutos)
1. En tu Google Sheet: **Extensiones → Apps Script**
2. Copia TODO el contenido del archivo `docs/Code.gs`
3. Pégalo en el editor (borra el código de ejemplo)
4. Modifica estas líneas (línea 16-18):
   ```javascript
   EMAIL_FROM: 'tu-email@gmail.com',        // ← TU EMAIL
   EMAIL_ADMIN: 'admin@tuempresa.com',      // ← EMAIL ADMIN
   ```
5. Guarda (Ctrl+S)
6. Haz clic en **Implementar → Nueva implementación**
7. Selecciona **Aplicación web**
8. Configura:
   - Ejecutar como: "Yo"
   - Quién tiene acceso: "Cualquier persona"
9. Haz clic en **Implementar**
10. **Autoriza el acceso** cuando te lo pida
11. **COPIA LA URL** que aparece (termina en `/exec`)

### PASO 3: Conectar el Formulario (1 minuto)
1. Abre el archivo `js/app.js`
2. En la línea 8, reemplaza:
   ```javascript
   SCRIPT_URL: 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI',
   ```
   Por:
   ```javascript
   SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby...../exec',
   ```
   (Usa la URL que copiaste en el paso anterior)
3. Guarda el archivo

### PASO 4: Publicar el Formulario (1-2 minutos)

**Opción A - GitHub Pages (Gratis):**
1. Sube los archivos a un repositorio de GitHub
2. Activa GitHub Pages en Settings
3. ¡Listo!

**Opción B - Netlify (Gratis, Recomendado):**
1. Ve a [Netlify](https://www.netlify.com)
2. Arrastra la carpeta del proyecto
3. ¡Tu sitio está online en 30 segundos!

**Opción C - Tu propio hosting:**
1. Sube todos los archivos a tu servidor
2. Accede mediante tu dominio

### PASO 5: Probar (30 segundos)
1. Abre tu formulario
2. Completa una reserva de prueba (usa tu email y teléfono)
3. Verifica que:
   - Aparezca el mensaje de confirmación
   - Se guarde en Google Sheets
   - Recibas el email de confirmación
   - Recibas email en tu cuenta de admin

---

## 📱 CONFIGURAR WHATSAPP (OPCIONAL - 5-10 MINUTOS)

Si quieres notificaciones por WhatsApp:

### Opción Recomendada: Twilio (Tiene trial gratuito)

1. **Crear cuenta:**
   - Ve a [Twilio](https://www.twilio.com/try-twilio)
   - Registrate gratis
   - Verifica tu teléfono

2. **Activar WhatsApp Sandbox:**
   - En Twilio: Messaging → Try it out → WhatsApp
   - Desde tu WhatsApp personal, envía "join [código]" al número +1 415 523 8886
   - Recibirás confirmación

3. **Obtener credenciales:**
   - Copia tu **Account SID** y **Auth Token**

4. **Configurar en Code.gs:**
   ```javascript
   WHATSAPP_ENABLED: true,
   WHATSAPP_API_URL: 'https://api.twilio.com/2010-04-01/Accounts/TU_ACCOUNT_SID/Messages.json',
   WHATSAPP_API_TOKEN: 'TU_AUTH_TOKEN',
   WHATSAPP_FROM: '+14155238886',
   ```

5. **Re-implementar** el script en Apps Script

📘 **Guía completa de WhatsApp:** Ver `docs/WHATSAPP_CONFIG.md`

---

## 🎨 PERSONALIZACIÓN RÁPIDA

### Cambiar Colores
Abre `css/styles.css`, línea 11:
```css
:root {
    --primary-color: #2563eb;  /* ← Cambia este color */
}
```

### Ajustar Capacidad del Bus
Abre `docs/Code.gs`, línea 22:
```javascript
CAPACIDAD_DEFAULT: 40,  /* ← Cambia la capacidad */
```

### Modificar Porcentaje de Overbooking
Abre `docs/Code.gs`, línea 21:
```javascript
OVERBOOKING_PERCENTAGE: 10,  /* ← 10% de overbooking */
```

---

## 📊 GESTIÓN DE RESERVAS

### Ver Reservas
1. Abre tu Google Sheet
2. Todas las reservas aparecen automáticamente
3. Colores por estado:
   - 🟡 Amarillo = Pendiente
   - 🟢 Verde = Confirmada
   - 🔴 Rojo = Cancelada

### Cambiar Estado de Reserva
1. Busca la reserva en la Sheet
2. En la columna "Estado", cambia el valor a:
   - "Pendiente"
   - "Confirmada"
   - "Cancelada"
3. El color se actualiza automáticamente

### Buscar una Reserva
1. Usa Ctrl+F en Google Sheets
2. Busca por:
   - Código de reserva
   - Nombre del cliente
   - Fecha
   - Ruta (origen/destino)

---

## 🔍 PROBAR EL SISTEMA

### Prueba desde Apps Script
1. Abre el editor de Apps Script
2. Selecciona la función `testReserva` (última del archivo)
3. Haz clic en **Ejecutar** (▶️)
4. Revisa que se cree una reserva de prueba en tu Sheet

### Prueba desde el Formulario
1. Abre el formulario en tu navegador
2. Completa todos los campos con datos de prueba
3. Envía la reserva
4. Verifica el mensaje de confirmación
5. Revisa tu Google Sheet
6. Revisa tus emails

---

## ❓ PROBLEMAS COMUNES

### "El formulario no envía"
- ✅ Verifica que configuraste la `SCRIPT_URL` en `js/app.js`
- ✅ Asegúrate de que la URL termine en `/exec`

### "No recibo emails"
- ✅ Verifica que `EMAIL_ENABLED: true` en Code.gs
- ✅ Revisa tu carpeta de SPAM
- ✅ Verifica que configuraste `EMAIL_FROM` y `EMAIL_ADMIN`

### "No se guardan los datos"
- ✅ Verifica que autorizaste el script en Apps Script
- ✅ Revisa los logs: Ver → Registros en Apps Script
- ✅ Verifica que el nombre de la hoja sea "Reservas"

---

## 📚 DOCUMENTACIÓN COMPLETA

Para guías detalladas, consulta:

- 📘 **README.md** - Documentación completa del sistema
- 📘 **docs/INSTALACION.md** - Guía paso a paso detallada
- 📘 **docs/WHATSAPP_CONFIG.md** - Configuración de WhatsApp con todas las opciones

---

## 🎯 CHECKLIST DE INICIO

Antes de ir a producción:

- [ ] Google Sheet creada
- [ ] Apps Script configurado y implementado
- [ ] URL del script copiada en `js/app.js`
- [ ] Emails configurados en Code.gs
- [ ] Formulario publicado online
- [ ] Prueba de reserva completada exitosamente
- [ ] Reserva aparece en Google Sheet
- [ ] Email de confirmación recibido
- [ ] Email de admin recibido
- [ ] WhatsApp configurado (opcional)
- [ ] Colores personalizados (opcional)
- [ ] Capacidad de bus configurada

---

## 💡 TIPS PROFESIONALES

1. **Haz backups periódicos** de tu Google Sheet
2. **Monitorea el email de admin** para nuevas reservas
3. **Responde rápido** a las reservas pendientes
4. **Usa filtros en Google Sheets** para organizar reservas por fecha
5. **Crea vistas personalizadas** para diferentes tipos de consultas
6. **Configura notificaciones en tu email** para no perder reservas

---

## 🎊 ¡LISTO PARA COMENZAR!

Tu sistema está **100% funcional** y listo para recibir reservas reales.

### Próximos Pasos:
1. ✅ Termina la configuración básica (5 min)
2. ✅ Haz varias pruebas
3. ✅ Ajusta colores y textos según tu marca
4. ✅ Configura WhatsApp si lo deseas
5. ✅ Comparte el enlace con tus clientes
6. ✅ ¡Empieza a recibir reservas!

---

## 📞 ¿NECESITAS AYUDA?

- 📖 Lee la documentación completa en **README.md**
- 🔧 Sigue la guía detallada en **docs/INSTALACION.md**
- 💬 Revisa la sección de "Solución de Problemas"
- 📧 Consulta los logs en Google Apps Script

---

## 🚀 CARACTERÍSTICAS IMPLEMENTADAS

✅ Formulario responsive (móvil, tablet, desktop)
✅ Validación de campos en tiempo real
✅ Horarios flexibles (usuario define)
✅ Orígenes y destinos libres
✅ Sistema de overbooking controlado (10%)
✅ Notificaciones por Email (cliente + admin)
✅ Notificaciones por WhatsApp (opcional)
✅ Códigos de reserva únicos
✅ Estados de reserva (Pendiente/Confirmada/Cancelada)
✅ Base de datos en Google Sheets
✅ Selector de fechas profesional
✅ Diseño moderno con animaciones
✅ 100% gratuito (excepto WhatsApp)

---

**Sistema Reservas MASIC v1.0**  
Desarrollado: Noviembre 2025  
Stack: HTML + CSS + JavaScript + Google Apps Script

**¡Éxito con tu sistema de reservas! 🎉**
