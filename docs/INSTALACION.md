# 📘 GUÍA DE INSTALACIÓN - RESERVAS MASIC

## Sistema de Reservas de Transporte de Pasajeros

---

## 📋 ÍNDICE

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Configurar Google Sheets](#paso-1-configurar-google-sheets)
3. [Paso 2: Configurar Google Apps Script](#paso-2-configurar-google-apps-script)
4. [Paso 3: Configurar el Formulario Web](#paso-3-configurar-el-formulario-web)
5. [Paso 4: Configurar WhatsApp (Opcional)](#paso-4-configurar-whatsapp)
6. [Paso 5: Probar el Sistema](#paso-5-probar-el-sistema)
7. [Configuraciones Adicionales](#configuraciones-adicionales)
8. [Solución de Problemas](#solución-de-problemas)

---

## 📦 REQUISITOS PREVIOS

- ✅ Cuenta de Google (Gmail)
- ✅ Navegador web moderno (Chrome, Firefox, Safari, Edge)
- ✅ Editor de código (VS Code recomendado) o editor de texto
- ✅ Conocimientos básicos de Google Sheets
- ⚠️ (Opcional) Cuenta de Twilio o API de WhatsApp para notificaciones

---

## 🗂️ PASO 1: CONFIGURAR GOOGLE SHEETS

### 1.1 Crear la Google Sheet

1. Abre [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala: **"Reservas_MASIC"** (o el nombre que prefieras)

### 1.2 Preparar la Hoja

**Opción A: Dejar que el sistema cree automáticamente los encabezados**
- Deja la hoja en blanco
- El script creará automáticamente la hoja "Reservas" con los encabezados cuando reciba la primera reserva

**Opción B: Crear manualmente los encabezados**
1. Renombra la hoja principal a: **"Reservas"**
2. En la fila 1, agrega los siguientes encabezados:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Fecha Registro | Código Reserva | Nombre | Email | Teléfono | Dirección Recogida | Fecha Viaje | Horario | Origen | Destino | Pasajeros | Tipo Viaje | Observaciones | Estado | Notas Admin |

3. Formatea la fila de encabezados:
   - Color de fondo: Azul (#2563eb)
   - Color de texto: Blanco
   - Texto en negrita
   - Centrado

### 1.3 Obtener el ID de la Hoja

1. Copia la URL de tu Google Sheet
2. El ID es la parte entre `/d/` y `/edit`
3. Ejemplo: `https://docs.google.com/spreadsheets/d/`**`1ABC...XYZ`**`/edit`
4. Guarda este ID, lo necesitarás después

---

## 🔧 PASO 2: CONFIGURAR GOOGLE APPS SCRIPT

### 2.1 Acceder al Editor de Scripts

1. En tu Google Sheet, ve a: **Extensiones → Apps Script**
2. Se abrirá el editor de Google Apps Script
3. Elimina el código de ejemplo que aparece por defecto

### 2.2 Copiar el Código del Backend

1. Abre el archivo `docs/Code.gs` de este proyecto
2. Copia **TODO** el contenido
3. Pégalo en el editor de Apps Script
4. Nombra el archivo como: **"Code"** (o déjalo como Code.gs)

### 2.3 Configurar Variables del Script

En la sección `CONFIG` del script (líneas 8-20), configura lo siguiente:

```javascript
const CONFIG = {
  // Nombre de la hoja (debe coincidir con el nombre que le pusiste)
  SHEET_NAME: 'Reservas',
  
  // Configuración de WhatsApp (veremos esto en el Paso 4)
  WHATSAPP_ENABLED: false, // Cambiar a true cuando configures WhatsApp
  WHATSAPP_API_URL: 'TU_URL_API_WHATSAPP',
  WHATSAPP_API_TOKEN: 'TU_TOKEN_API_WHATSAPP',
  WHATSAPP_FROM: 'TU_NUMERO_WHATSAPP',
  
  // Configuración de Email
  EMAIL_ENABLED: true,
  EMAIL_FROM: 'tu-email@gmail.com', // Cambia esto por tu email
  EMAIL_ADMIN: 'admin@tuempresa.com', // Email donde recibirás notificaciones
  
  // Configuración de Overbooking
  OVERBOOKING_PERCENTAGE: 10, // 10% de overbooking permitido
  CAPACIDAD_DEFAULT: 40, // Capacidad por defecto de un bus
};
```

**⚠️ IMPORTANTE:** 
- Reemplaza `EMAIL_FROM` con tu email de Gmail
- Reemplaza `EMAIL_ADMIN` con el email donde quieres recibir notificaciones de nuevas reservas
- Por ahora, deja `WHATSAPP_ENABLED` en `false`

### 2.4 Guardar el Script

1. Haz clic en el **icono de disquete** o presiona `Ctrl+S` (Cmd+S en Mac)
2. Nombra tu proyecto: **"Reservas_MASIC_Backend"**

### 2.5 Implementar como Web App

1. En el editor de Apps Script, haz clic en **"Implementar"** (Deploy) → **"Nueva implementación"** (New deployment)
2. Haz clic en el icono de engranaje ⚙️ junto a "Seleccionar tipo"
3. Selecciona: **"Aplicación web"** (Web app)
4. Configura:
   - **Descripción:** "Sistema de Reservas MASIC v1.0"
   - **Ejecutar como:** "Yo" (tu cuenta)
   - **Quién tiene acceso:** "Cualquier persona" (Anyone)
5. Haz clic en **"Implementar"** (Deploy)

### 2.6 Autorizar el Script

1. Aparecerá un mensaje: **"Se necesita autorización"**
2. Haz clic en **"Autorizar acceso"**
3. Selecciona tu cuenta de Google
4. Aparecerá: "Google no verificó esta app" → Haz clic en **"Avanzado"**
5. Haz clic en **"Ir a Reservas_MASIC_Backend (no seguro)"**
6. Haz clic en **"Permitir"**

### 2.7 Copiar la URL de Implementación

1. Después de autorizar, aparecerá una ventana con la **URL de la aplicación web**
2. Copia esta URL completa (algo como: `https://script.google.com/macros/s/AKfycby...../exec`)
3. **¡GUARDA ESTA URL!** La necesitarás en el siguiente paso

---

## 🌐 PASO 3: CONFIGURAR EL FORMULARIO WEB

### 3.1 Preparar los Archivos

1. Copia todos los archivos del proyecto a una carpeta en tu computadora
2. Estructura de archivos:
```
Reservas_Masic/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── docs/
    ├── Code.gs
    └── INSTALACION.md
```

### 3.2 Configurar la URL del Script

1. Abre el archivo `js/app.js` en tu editor de código
2. Busca la línea 8 (en la sección `CONFIG`):
```javascript
SCRIPT_URL: 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI',
```
3. Reemplaza `'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI'` con la URL que copiaste en el Paso 2.7
4. Ejemplo:
```javascript
SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby...../exec',
```
5. Guarda el archivo

### 3.3 Probar Localmente (Opcional)

Si quieres probar el sistema en tu computadora antes de subirlo:

1. Abre el archivo `index.html` directamente en tu navegador
2. Prueba el formulario
3. **Nota:** Por seguridad de CORS, las notificaciones no se verán, pero los datos sí se guardarán en Google Sheets

### 3.4 Publicar el Formulario

Tienes varias opciones:

#### Opción A: Subir a tu servidor web
- Sube todos los archivos a tu hosting
- Accede mediante tu dominio

#### Opción B: GitHub Pages (GRATIS)
1. Crea un repositorio en GitHub
2. Sube todos los archivos
3. Ve a Settings → Pages
4. Activa GitHub Pages
5. Tu formulario estará en: `https://tuusuario.github.io/reservas-masic`

#### Opción C: Netlify (GRATIS y RECOMENDADO)
1. Ve a [Netlify](https://www.netlify.com)
2. Arrastra la carpeta del proyecto a Netlify
3. Tu formulario estará online en minutos
4. Te dan un dominio gratuito

#### Opción D: Google Sites
1. Crea un Google Site
2. Inserta el código HTML usando "Insertar código"

---

## 📱 PASO 4: CONFIGURAR WHATSAPP (OPCIONAL)

Para enviar notificaciones automáticas por WhatsApp, necesitas una API de WhatsApp. Aquí tienes las opciones más populares:

### Opción 1: Twilio (Recomendado para Producción)

#### 4.1 Crear Cuenta en Twilio
1. Ve a [Twilio](https://www.twilio.com/try-twilio)
2. Crea una cuenta gratuita
3. Verifica tu número de teléfono

#### 4.2 Configurar WhatsApp en Twilio
1. En el dashboard de Twilio, ve a **Messaging → Try it out → Send a WhatsApp message**
2. Sigue las instrucciones para activar WhatsApp
3. Envía `join [tu-código]` al número de sandbox de Twilio

#### 4.3 Obtener Credenciales
1. Ve a **Account → API Keys & Tokens**
2. Copia tu **Account SID** y **Auth Token**
3. Anota tu **número de WhatsApp de Twilio** (formato: +14155238886)

#### 4.4 Configurar en el Script
1. Abre el archivo `docs/Code.gs` en el editor de Apps Script
2. Actualiza la configuración:
```javascript
const CONFIG = {
  // ... otras configuraciones ...
  
  WHATSAPP_ENABLED: true,
  WHATSAPP_API_URL: 'https://api.twilio.com/2010-04-01/Accounts/TU_ACCOUNT_SID/Messages.json',
  WHATSAPP_API_TOKEN: 'TU_AUTH_TOKEN',
  WHATSAPP_FROM: '+14155238886', // Número de WhatsApp de Twilio
};
```
3. Guarda y **vuelve a implementar** el script (Deploy → Nueva implementación)

### Opción 2: Otras APIs de WhatsApp

También puedes usar:
- **Waboxapp** (sencillo y económico)
- **WhatsApp Business API** (oficial, requiere aprobación)
- **CallMeBot** (gratis pero limitado)
- **Ultramsg** (económico y fácil)

Cada una tiene su propia documentación de integración.

---

## ✅ PASO 5: PROBAR EL SISTEMA

### 5.1 Prueba Completa del Flujo

1. **Abrir el formulario:**
   - Ve a la URL donde publicaste tu formulario
   
2. **Llenar el formulario:**
   - Ingresa datos de prueba en todos los campos
   - Usa tu propio email y teléfono para recibir las notificaciones
   
3. **Enviar la reserva:**
   - Haz clic en "Enviar Reserva"
   - Deberías ver un mensaje de confirmación con el código de reserva
   
4. **Verificar en Google Sheets:**
   - Abre tu Google Sheet
   - Verifica que aparezca una nueva fila con los datos
   
5. **Verificar Email:**
   - Revisa tu bandeja de entrada
   - Deberías recibir un email de confirmación
   - También deberías recibir una notificación en el email de admin
   
6. **Verificar WhatsApp (si lo configuraste):**
   - Revisa tu WhatsApp
   - Deberías recibir un mensaje de confirmación

### 5.2 Función de Prueba en Apps Script

También puedes probar desde el editor de Apps Script:

1. En el editor de Apps Script, abre el archivo `Code.gs`
2. Busca la función `testReserva()` (última función del archivo)
3. Selecciona `testReserva` en el menú desplegable de funciones
4. Haz clic en **"Ejecutar"** (▶️)
5. Verifica que se cree una reserva de prueba en tu Sheet

---

## ⚙️ CONFIGURACIONES ADICIONALES

### Personalizar Colores y Estilos

Edita el archivo `css/styles.css`:

```css
:root {
    --primary-color: #2563eb;  /* Color principal - Cambia esto */
    --primary-hover: #1d4ed8;  /* Color hover */
    /* ... más variables ... */
}
```

### Ajustar Capacidad de Overbooking

En `docs/Code.gs`:

```javascript
const CONFIG = {
  // ...
  OVERBOOKING_PERCENTAGE: 10, // Cambia el porcentaje (10% = 10)
  CAPACIDAD_DEFAULT: 40,      // Cambia la capacidad del bus
};
```

### Modificar Días de Anticipación

En `js/app.js`:

```javascript
const CONFIG = {
  // ...
  MIN_DAYS_ADVANCE: 1,  // Días mínimos de anticipación
  MAX_DAYS_ADVANCE: 90, // Días máximos de anticipación
};
```

### Personalizar Emails

En `docs/Code.gs`, busca las funciones:
- `enviarEmailConfirmacion(datos)` - Email al cliente
- `enviarEmailAdmin(datos)` - Email al administrador

Puedes modificar el HTML de los emails según tus necesidades.

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema 1: "El formulario no envía datos"

**Solución:**
- Verifica que hayas configurado correctamente la `SCRIPT_URL` en `js/app.js`
- Asegúrate de que la URL termine en `/exec`
- Revisa la consola del navegador (F12) para ver errores

### Problema 2: "No recibo emails"

**Solución:**
- Verifica que `EMAIL_ENABLED` esté en `true` en Code.gs
- Verifica que hayas configurado `EMAIL_FROM` y `EMAIL_ADMIN` correctamente
- Revisa la carpeta de SPAM
- Verifica los logs en Apps Script: View → Logs

### Problema 3: "Error de autorización en Apps Script"

**Solución:**
- Vuelve a autorizar el script: Implementar → Gestionar implementaciones → Editar → Autorizar de nuevo
- Asegúrate de permitir todos los permisos

### Problema 4: "No funciona WhatsApp"

**Solución:**
- Verifica que `WHATSAPP_ENABLED` esté en `true`
- Verifica tus credenciales de la API de WhatsApp
- Revisa los logs en Apps Script para ver el error específico
- Asegúrate de que el número de teléfono esté en formato internacional (+56...)

### Problema 5: "Los datos no aparecen en Google Sheets"

**Solución:**
- Verifica que el nombre de la hoja coincida con `CONFIG.SHEET_NAME` en Code.gs
- Revisa los logs en Apps Script (Ver → Registros)
- Asegúrate de que la implementación del script esté activa

### Problema 6: "Error de CORS"

**Solución:**
- Este error es normal cuando pruebas localmente
- No afecta el funcionamiento cuando está publicado online
- Los datos se guardan correctamente aunque veas este error

---

## 📞 SOPORTE Y RECURSOS

### Logs y Debugging

Para ver logs en Apps Script:
1. Abre el editor de Apps Script
2. Ve a **View → Logs** (o **Ver → Registros**)
3. Allí verás todos los mensajes de Logger.log()

### Recursos Útiles

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Flatpickr Documentation](https://flatpickr.js.org/)

---

## 🎉 ¡FELICITACIONES!

Has instalado exitosamente el **Sistema de Reservas MASIC**. 

### Próximos Pasos Recomendados:

1. ✅ Realiza varias reservas de prueba
2. ✅ Prueba el sistema en diferentes dispositivos (móvil, tablet, desktop)
3. ✅ Configura un dominio personalizado si es necesario
4. ✅ Capacita a tu equipo en el uso del sistema
5. ✅ Crea un manual de usuario para clientes (opcional)

### Futuras Mejoras (Fase 2):

- 📊 Panel de administración web
- 📈 Dashboard con estadísticas
- 🔍 Sistema de búsqueda de reservas
- 💳 Integración de pagos
- 📱 App móvil (opcional)

---

**¿Necesitas ayuda?** Revisa la sección de "Solución de Problemas" o consulta la documentación oficial de Google Apps Script.

**Desarrollado con ❤️ para MASIC Transport**
