# 🚌 RESERVAS MASIC

## Sistema de Reservas de Transporte de Pasajeros

Sistema web profesional para gestión de reservas de transporte, con notificaciones automáticas por Email y WhatsApp, integrado con Google Sheets como base de datos.

---

## ✨ CARACTERÍSTICAS PRINCIPALES

### 🎯 Funcionalidades Core
- ✅ Formulario de reservas responsive (móvil, tablet, desktop)
- ✅ Validación de campos en tiempo real
- ✅ Horarios flexibles (usuario define horario)
- ✅ Orígenes y destinos libres
- ✅ Sistema de overbooking controlado (10% configurable)
- ✅ Confirmación automática con revisión posterior
- ✅ Códigos de reserva únicos generados automáticamente

### 📧 Notificaciones Automáticas
- ✅ Email de confirmación al cliente (con detalles completos)
- ✅ Email de notificación al administrador
- ✅ WhatsApp automático al cliente (opcional - requiere configuración)

### 📊 Base de Datos
- ✅ Google Sheets como base de datos (sin costos)
- ✅ Almacenamiento automático de todas las reservas
- ✅ Formato profesional con colores según estado
- ✅ Hasta 10 millones de celdas de capacidad

### 🎨 Diseño
- ✅ Interfaz moderna y profesional
- ✅ Totalmente responsive (se adapta a todos los dispositivos)
- ✅ Animaciones suaves
- ✅ Alertas visuales con SweetAlert2
- ✅ Selector de fechas con Flatpickr

---

## 📋 REQUISITOS

### Obligatorios
- Cuenta de Google (Gmail)
- Navegador web moderno
- Editor de código (VS Code recomendado)

### Opcionales
- Cuenta de Twilio, Waboxapp u otra API de WhatsApp (para notificaciones WhatsApp)
- Hosting web o servicio gratuito (GitHub Pages, Netlify, etc.)

---

## 🚀 INSTALACIÓN RÁPIDA

### 1️⃣ Clonar o Descargar el Proyecto
```bash
# Si usas Git
git clone [URL_DEL_REPOSITORIO]

# O descarga el ZIP y extráelo
```

### 2️⃣ Configurar Google Sheets
1. Crea una nueva Google Sheet
2. Nómbrala "Reservas_MASIC"
3. Guarda el ID de la hoja

### 3️⃣ Configurar Google Apps Script
1. En la Google Sheet: Extensiones → Apps Script
2. Copia el contenido de `docs/Code.gs`
3. Pégalo en el editor
4. Configura las variables en la sección `CONFIG`
5. Implementa como Web App
6. Copia la URL de implementación

### 4️⃣ Configurar el Formulario
1. Abre `js/app.js`
2. Reemplaza `SCRIPT_URL` con la URL del paso anterior
3. Guarda el archivo

### 5️⃣ Publicar
- Sube los archivos a tu hosting
- O usa GitHub Pages / Netlify (gratis)
- ¡Listo para recibir reservas!

📘 **Guía completa:** Ver `docs/INSTALACION.md` para instrucciones detalladas paso a paso.

---

## 📁 ESTRUCTURA DEL PROYECTO

```
Reservas_Masic/
│
├── index.html              # Formulario principal
│
├── css/
│   └── styles.css         # Estilos profesionales y responsive
│
├── js/
│   └── app.js             # Lógica del cliente y validaciones
│
├── docs/
│   ├── Code.gs            # Google Apps Script (backend)
│   ├── INSTALACION.md     # Guía de instalación completa
│   └── WHATSAPP_CONFIG.md # Guía de configuración de WhatsApp
│
└── README.md              # Este archivo
```

---

## 🔧 CONFIGURACIÓN

### Datos Capturados por el Sistema

El formulario captura los siguientes datos:

**Información del Solicitante:**
- ✅ Nombre completo (obligatorio)
- ✅ Email (obligatorio)
- ✅ Teléfono (obligatorio)
- ⚪ Dirección de recogida (opcional)

**Detalles del Viaje:**
- ✅ Fecha del viaje (obligatorio)
- ✅ Horario (obligatorio, texto libre)
- ✅ Origen (obligatorio, texto libre)
- ✅ Destino (obligatorio, texto libre)
- ✅ Cantidad de pasajeros (obligatorio, 1-50)
- ✅ Tipo de viaje (Solo Ida / Ida y Retorno)
- ⚪ Observaciones (opcional)

**Generados Automáticamente:**
- Código de reserva único
- Fecha y hora de registro
- Estado (Pendiente / Confirmada / Cancelada)

---

## ⚙️ PERSONALIZACIÓN

### Colores y Estilos
Edita `css/styles.css`, sección `:root`:
```css
:root {
    --primary-color: #2563eb;  /* Color principal */
    --primary-hover: #1d4ed8;  /* Color hover */
    /* ... más variables ... */
}
```

### Capacidad y Overbooking
Edita `docs/Code.gs`, sección `CONFIG`:
```javascript
const CONFIG = {
  OVERBOOKING_PERCENTAGE: 10,  // 10% de overbooking
  CAPACIDAD_DEFAULT: 40,        // Capacidad del bus
};
```

### Días de Anticipación
Edita `js/app.js`, sección `CONFIG`:
```javascript
const CONFIG = {
  MIN_DAYS_ADVANCE: 1,   // Días mínimos
  MAX_DAYS_ADVANCE: 90,  // Días máximos
};
```

---

## 📱 NOTIFICACIONES WHATSAPP

El sistema soporta notificaciones automáticas por WhatsApp usando APIs externas.

### Opciones de APIs de WhatsApp:
1. **Twilio** (Recomendado para producción)
2. **Waboxapp** (Sencillo y económico)
3. **WhatsApp Business API** (Oficial)
4. **Ultramsg** (Económico)
5. **CallMeBot** (Gratis pero limitado)

📘 **Guía completa:** Ver `docs/WHATSAPP_CONFIG.md` para configuración detallada.

---

## 📊 GESTIÓN DE RESERVAS

### Estados de Reserva
- **Pendiente** 🟡 - Reserva recién creada, esperando revisión
- **Confirmada** 🟢 - Reserva aprobada por el administrador
- **Cancelada** 🔴 - Reserva cancelada

### Overbooking Controlado
El sistema permite un 10% de overbooking por defecto (configurable):
- Capacidad default: 40 pasajeros
- Con 10% overbooking: hasta 44 pasajeros
- El sistema rechaza reservas que excedan este límite

### Modificar Estado de Reservas
1. Abre la Google Sheet
2. Busca la reserva por código
3. Cambia el valor en la columna "Estado"
4. El color de la celda se actualiza automáticamente

---

## 🧪 PRUEBAS

### Probar el Sistema Completo
```javascript
// En el editor de Apps Script:
// 1. Selecciona la función "testReserva"
// 2. Haz clic en "Ejecutar" (▶️)
// 3. Verifica que se cree la reserva en la Sheet
// 4. Verifica que recibas los emails de prueba
```

### Probar Localmente
1. Abre `index.html` en tu navegador
2. Completa el formulario
3. Las notificaciones no se verán (CORS), pero los datos se guardarán

---

## 🔒 SEGURIDAD

### Validaciones Implementadas
- ✅ Validación de campos en el cliente (JavaScript)
- ✅ Validación de campos en el servidor (Apps Script)
- ✅ Protección contra inyección de código
- ✅ Rate limiting natural de Google Apps Script
- ✅ Sanitización de datos antes de guardar

### Recomendaciones
- 🔐 Configura permisos adecuados en Google Sheets
- 🔐 Usa HTTPS en producción
- 🔐 Considera agregar CAPTCHA si hay problemas de spam
- 🔐 Realiza backups periódicos de la Google Sheet

---

## 📈 ROADMAP (FASES FUTURAS)

### Fase 2: Panel de Administración
- Panel web para gestionar reservas
- Búsqueda y filtros avanzados
- Cambio de estado de reservas desde el panel
- Estadísticas básicas

### Fase 3: Funcionalidades Avanzadas
- Dashboard con métricas y gráficos
- Reportes exportables (PDF, Excel)
- Gestión de rutas y horarios predefinidos
- Sistema de pagos integrado (opcional)

### Fase 4: Integración
- Integración con Sistema de Control
- Dashboard unificado
- Single Sign-On
- API para integraciones externas

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### El formulario no envía datos
- Verifica la `SCRIPT_URL` en `js/app.js`
- Asegúrate de que termine en `/exec`
- Revisa la consola del navegador (F12)

### No recibo emails
- Verifica `EMAIL_ENABLED = true` en Code.gs
- Revisa la carpeta SPAM
- Verifica los logs en Apps Script

### Error de autorización
- Vuelve a autorizar el script en Apps Script
- Asegúrate de permitir todos los permisos

### WhatsApp no funciona
- Verifica las credenciales de la API
- Asegúrate de que `WHATSAPP_ENABLED = true`
- Revisa los logs en Apps Script

📘 **Más soluciones:** Ver `docs/INSTALACION.md` sección "Solución de Problemas"

---

## 📚 TECNOLOGÍAS UTILIZADAS

### Frontend
- HTML5
- CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript Vanilla (ES6+)
- Flatpickr (selector de fechas)
- SweetAlert2 (alertas bonitas)

### Backend
- Google Apps Script (JavaScript en servidor)
- Google Sheets API

### Integraciones
- Gmail API (emails automáticos)
- APIs de WhatsApp (Twilio, Waboxapp, etc.)

---

## 📄 LICENCIA

Este proyecto es software libre y puede ser usado, modificado y distribuido según las necesidades de tu empresa.

---

## 👥 CONTRIBUCIONES

Si deseas mejorar este sistema:
1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 SOPORTE

### Recursos de Ayuda
- 📘 Guía de Instalación: `docs/INSTALACION.md`
- 📱 Configuración WhatsApp: `docs/WHATSAPP_CONFIG.md`
- 🐛 Sección de Issues en GitHub
- 📧 Email de soporte: [tu-email-de-soporte]

### Links Útiles
- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [Flatpickr Docs](https://flatpickr.js.org/)
- [SweetAlert2 Docs](https://sweetalert2.github.io/)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)

---

## 🎉 CRÉDITOS

**Sistema de Reservas MASIC v1.0**  
Desarrollado para: MASIC Transport  
Fecha: Noviembre 2025  
Stack: HTML + CSS + JavaScript + Google Apps Script + Google Sheets

---

## 🚀 ¡COMIENZA AHORA!

1. ✅ Lee la guía de instalación completa en `docs/INSTALACION.md`
2. ✅ Configura tu Google Sheet
3. ✅ Implementa el Apps Script
4. ✅ Publica tu formulario
5. ✅ ¡Empieza a recibir reservas!

**¡Éxito con tu sistema de reservas! 🎊**
