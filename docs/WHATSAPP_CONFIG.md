# 📱 GUÍA DE CONFIGURACIÓN DE WHATSAPP

## Notificaciones Automáticas por WhatsApp para Reservas MASIC

---

## 📋 ÍNDICE

1. [Introducción](#introducción)
2. [Opción 1: Twilio (Recomendado)](#opción-1-twilio)
3. [Opción 2: Waboxapp](#opción-2-waboxapp)
4. [Opción 3: Ultramsg](#opción-3-ultramsg)
5. [Opción 4: CallMeBot (Gratis)](#opción-4-callmebot)
6. [Opción 5: WhatsApp Business API Oficial](#opción-5-whatsapp-business-api-oficial)
7. [Comparación de Opciones](#comparación-de-opciones)
8. [Solución de Problemas](#solución-de-problemas)

---

## 📖 INTRODUCCIÓN

El sistema Reservas MASIC soporta envío automático de notificaciones por WhatsApp a los clientes cuando realizan una reserva. Para esto, necesitas integrar una API de WhatsApp de terceros.

### ¿Por qué usar una API?
WhatsApp no permite envío automatizado sin una API oficial o de terceros. Las opciones disponibles son:

- **APIs Oficiales:** Requieren aprobación de Meta (Facebook)
- **APIs de Terceros:** Más fáciles de usar, algunas son gratuitas

---

## 🏆 OPCIÓN 1: TWILIO (RECOMENDADO)

### Ventajas
- ✅ Muy confiable y estable
- ✅ Documentación excelente
- ✅ Sandbox gratuito para pruebas
- ✅ Escalable para producción
- ✅ Usado por empresas grandes

### Desventajas
- ❌ Requiere verificación para producción
- ❌ Costos después del trial (pero accesibles)

---

### Paso 1: Crear Cuenta en Twilio

1. Ve a [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Haz clic en **"Start for free"**
3. Completa el formulario de registro:
   - Nombre
   - Email
   - Contraseña
4. Verifica tu email
5. Verifica tu número de teléfono personal

### Paso 2: Activar WhatsApp Sandbox

1. En el Dashboard de Twilio, busca el menú lateral
2. Ve a: **Messaging → Try it out → Send a WhatsApp message**
3. Verás instrucciones como:
   ```
   Join your sandbox by sending this code: join [código-único]
   To: +1 415 523 8886
   ```
4. Abre WhatsApp en tu teléfono
5. Crea un nuevo chat con el número: **+1 415 523 8886**
6. Envía el mensaje: **join [tu-código]**
7. Recibirás un mensaje de confirmación

### Paso 3: Obtener Credenciales

1. En el Dashboard de Twilio, ve a **Account → API Keys & Tokens**
2. Copia estos datos:
   - **Account SID** (algo como: ACxxxxxxxxxxxxxx)
   - **Auth Token** (haz clic en "Show" para verlo)
3. Anota el **número de WhatsApp sandbox:** `+1 415 523 8886` (o el que te asignaron)

### Paso 4: Configurar en Apps Script

Abre tu archivo `Code.gs` en Google Apps Script y actualiza:

```javascript
const CONFIG = {
  // ... otras configuraciones ...
  
  // Configuración de WhatsApp - TWILIO
  WHATSAPP_ENABLED: true,
  WHATSAPP_API_URL: 'https://api.twilio.com/2010-04-01/Accounts/TU_ACCOUNT_SID/Messages.json',
  WHATSAPP_API_TOKEN: 'TU_AUTH_TOKEN_AQUI',
  WHATSAPP_FROM: '+14155238886', // El número de WhatsApp sandbox de Twilio
};
```

Reemplaza:
- `TU_ACCOUNT_SID` con tu Account SID
- `TU_AUTH_TOKEN_AQUI` con tu Auth Token

### Paso 5: Actualizar la Función de Envío

En el mismo archivo `Code.gs`, busca la función `enviarWhatsAppTwilio` y actualízala si es necesario:

```javascript
function enviarWhatsAppTwilio(telefono, mensaje) {
  if (CONFIG.WHATSAPP_API_URL === 'TU_URL_API_WHATSAPP') {
    Logger.log('⚠️ WhatsApp no configurado');
    return;
  }
  
  try {
    const accountSid = 'TU_ACCOUNT_SID'; // Reemplaza con tu SID
    const authToken = CONFIG.WHATSAPP_API_TOKEN;
    
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const payload = {
      From: `whatsapp:${CONFIG.WHATSAPP_FROM}`,
      To: `whatsapp:${telefono}`,
      Body: mensaje
    };
    
    const options = {
      method: 'post',
      contentType: 'application/x-www-form-urlencoded',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(accountSid + ':' + authToken)
      },
      payload: payload
    };
    
    const response = UrlFetchApp.fetch(url, options);
    Logger.log('✅ WhatsApp enviado via Twilio: ' + response.getContentText());
    
  } catch (error) {
    Logger.log('❌ Error en WhatsApp Twilio: ' + error.toString());
  }
}
```

### Paso 6: Probar

1. Guarda el script
2. Haz clic en **Implementar → Nueva implementación**
3. Realiza una reserva de prueba con tu número
4. Deberías recibir un WhatsApp

### Paso 7: Pasar a Producción (Opcional)

Para usar números reales (no sandbox):

1. En Twilio, solicita un **número de WhatsApp aprobado**
2. Completa el proceso de verificación de Meta
3. Actualiza `WHATSAPP_FROM` con tu nuevo número
4. Los clientes NO necesitarán enviar "join" primero

### Costos de Twilio

- **Trial gratuito:** $15 USD en créditos
- **Producción:** ~$0.005 USD por mensaje WhatsApp
- Muy económico para volúmenes pequeños/medianos

---

## 📦 OPCIÓN 2: WABOXAPP

### Ventajas
- ✅ Muy fácil de usar
- ✅ No requiere aprobación de Meta
- ✅ Interfaz web sencilla
- ✅ Webhook disponible

### Desventajas
- ❌ Menos conocido que Twilio
- ❌ Requiere mantener WhatsApp Web conectado

---

### Configuración Rápida

1. Ve a [https://www.waboxapp.com](https://www.waboxapp.com)
2. Crea una cuenta
3. Conecta tu número de WhatsApp
4. Ve a **API** en el panel
5. Copia tu **API Token**
6. Usa la API URL: `https://www.waboxapp.com/api/send/chat`

### Configurar en Apps Script

```javascript
const CONFIG = {
  WHATSAPP_ENABLED: true,
  WHATSAPP_API_URL: 'https://www.waboxapp.com/api/send/chat',
  WHATSAPP_API_TOKEN: 'TU_TOKEN_WABOXAPP',
  WHATSAPP_FROM: 'TU_NUMERO', // Tu número conectado
};
```

### Función de Envío para Waboxapp

Agrega esta función en `Code.gs`:

```javascript
function enviarWhatsAppWaboxapp(telefono, mensaje) {
  try {
    const payload = {
      token: CONFIG.WHATSAPP_API_TOKEN,
      uid: telefono,
      to: telefono,
      custom_uid: Date.now().toString(),
      text: mensaje
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(CONFIG.WHATSAPP_API_URL, options);
    Logger.log('✅ WhatsApp enviado via Waboxapp');
    
  } catch (error) {
    Logger.log('❌ Error en WhatsApp Waboxapp: ' + error.toString());
  }
}
```

Luego actualiza la función `enviarWhatsAppConfirmacion` para usar `enviarWhatsAppWaboxapp` en lugar de `enviarWhatsAppTwilio`.

---

## 🚀 OPCIÓN 3: ULTRAMSG

### Ventajas
- ✅ Muy económico
- ✅ Fácil configuración
- ✅ API simple
- ✅ Dashboard intuitivo

### Configuración

1. Ve a [https://ultramsg.com](https://ultramsg.com)
2. Crea una cuenta
3. Conecta tu WhatsApp escaneando QR
4. Obtén tu **Instance ID** y **Token**

### Configurar en Apps Script

```javascript
const CONFIG = {
  WHATSAPP_ENABLED: true,
  WHATSAPP_API_URL: 'https://api.ultramsg.com/instance{instanceId}/messages/chat',
  WHATSAPP_API_TOKEN: 'TU_TOKEN_ULTRAMSG',
  WHATSAPP_INSTANCE_ID: 'TU_INSTANCE_ID',
};
```

### Función de Envío

```javascript
function enviarWhatsAppUltramsg(telefono, mensaje) {
  try {
    const url = `https://api.ultramsg.com/instance${CONFIG.WHATSAPP_INSTANCE_ID}/messages/chat`;
    
    const payload = {
      token: CONFIG.WHATSAPP_API_TOKEN,
      to: telefono,
      body: mensaje
    };
    
    const options = {
      method: 'post',
      contentType: 'application/x-www-form-urlencoded',
      payload: payload
    };
    
    const response = UrlFetchApp.fetch(url, options);
    Logger.log('✅ WhatsApp enviado via Ultramsg');
    
  } catch (error) {
    Logger.log('❌ Error en WhatsApp Ultramsg: ' + error.toString());
  }
}
```

---

## 🆓 OPCIÓN 4: CALLMEBOT (GRATIS)

### Ventajas
- ✅ 100% Gratuito
- ✅ Sin registro complejo
- ✅ Inmediato

### Desventajas
- ❌ Limitado a mensajes simples
- ❌ Sin personalización
- ❌ Menos confiable para producción

### Configuración

1. Agrega el número de CallMeBot a tus contactos: **+34 644 44 41 10**
2. Envía un mensaje con el texto: **I allow callmebot to send me messages**
3. Recibirás un **API Key**

### Configurar en Apps Script

```javascript
const CONFIG = {
  WHATSAPP_ENABLED: true,
  WHATSAPP_API_URL: 'https://api.callmebot.com/whatsapp.php',
  WHATSAPP_API_TOKEN: 'TU_API_KEY_CALLMEBOT',
};
```

### Función de Envío

```javascript
function enviarWhatsAppCallMeBot(telefono, mensaje) {
  try {
    // CallMeBot solo soporta tu propio número registrado
    const url = `${CONFIG.WHATSAPP_API_URL}?phone=${telefono}&text=${encodeURIComponent(mensaje)}&apikey=${CONFIG.WHATSAPP_API_TOKEN}`;
    
    const response = UrlFetchApp.fetch(url);
    Logger.log('✅ WhatsApp enviado via CallMeBot');
    
  } catch (error) {
    Logger.log('❌ Error en WhatsApp CallMeBot: ' + error.toString());
  }
}
```

**⚠️ Nota:** CallMeBot solo puede enviar mensajes al número que registraste, no a números arbitrarios de clientes.

---

## 🏢 OPCIÓN 5: WHATSAPP BUSINESS API OFICIAL

### Para Empresas Grandes

Si eres una empresa mediana/grande y quieres la solución oficial:

1. Solicita acceso en [https://business.whatsapp.com/products/business-platform](https://business.whatsapp.com/products/business-platform)
2. Completa el proceso de verificación de Meta
3. Obtén aprobación (puede tomar semanas)
4. Integra usando la API oficial

### Ventajas
- ✅ Solución oficial de Meta
- ✅ Máxima confiabilidad
- ✅ Soporte empresarial

### Desventajas
- ❌ Proceso de aprobación largo
- ❌ Requiere verificación empresarial
- ❌ Costos más altos

---

## 📊 COMPARACIÓN DE OPCIONES

| API | Costo | Dificultad | Confiabilidad | Recomendado Para |
|-----|-------|------------|---------------|------------------|
| **Twilio** | Trial gratis, luego pago | Media | ⭐⭐⭐⭐⭐ | Producción profesional |
| **Waboxapp** | Freemium | Fácil | ⭐⭐⭐⭐ | Pequeñas empresas |
| **Ultramsg** | Económico | Fácil | ⭐⭐⭐⭐ | Startups |
| **CallMeBot** | Gratis | Muy fácil | ⭐⭐ | Pruebas personales |
| **API Oficial** | Alto | Difícil | ⭐⭐⭐⭐⭐ | Empresas grandes |

### Nuestra Recomendación

- 🏆 **Mejor para empezar:** Twilio (sandbox gratuito)
- 💰 **Mejor costo/beneficio:** Ultramsg o Waboxapp
- 🚀 **Mejor para producción:** Twilio o API Oficial

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### No se envían mensajes

1. **Verifica las credenciales:**
   - API Token correcto
   - URL correcta
   - Número en formato correcto (+56912345678)

2. **Revisa los logs:**
   - En Apps Script: Ver → Logs
   - Busca mensajes de error

3. **Verifica el formato del número:**
   ```javascript
   // Correcto:
   +56912345678
   
   // Incorrecto:
   56912345678 (falta el +)
   +56 9 1234 5678 (tiene espacios)
   ```

### Mensajes llegan tarde

- Las APIs gratuitas pueden tener delays
- Twilio es el más rápido y confiable
- Verifica tu conexión a internet

### Error de autorización

- Verifica que el token no haya expirado
- Regenera el token en el panel de la API
- Actualiza el token en `Code.gs`

---

## ✅ CHECKLIST DE CONFIGURACIÓN

Antes de poner en producción:

- [ ] API de WhatsApp seleccionada y configurada
- [ ] Credenciales copiadas en `Code.gs`
- [ ] `WHATSAPP_ENABLED` configurado en `true`
- [ ] Función de envío actualizada para tu API
- [ ] Script re-implementado en Apps Script
- [ ] Prueba enviada y recibida exitosamente
- [ ] Formato de mensaje personalizado según necesidad
- [ ] Números de prueba funcionando correctamente

---

## 🎓 MEJORES PRÁCTICAS

### 1. Formato de Mensajes
- Usa emojis para mejorar la lectura
- Mantén mensajes concisos
- Incluye toda la información importante
- Usa negrita con asteriscos (*texto*)

### 2. Gestión de Errores
- Implementa reintentos en caso de fallos
- Log todos los intentos de envío
- Notifica al admin si falla el envío

### 3. Privacidad
- No envíes información sensible por WhatsApp
- Cumple con regulaciones de protección de datos
- Obtén consentimiento de los usuarios

### 4. Límites de Envío
- Respeta los límites de cada API
- Implementa throttling si es necesario
- Monitorea tu cuota de mensajes

---

## 📚 RECURSOS ADICIONALES

### Documentación Oficial
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp)
- [Google Apps Script UrlFetchApp](https://developers.google.com/apps-script/reference/url-fetch)

### Tutoriales
- [Video: Integrar WhatsApp con Google Sheets](https://youtube.com)
- [Artículo: WhatsApp Business API Guide](https://ejemplo.com)

---

## 🆘 SOPORTE

¿Problemas con la configuración de WhatsApp?

1. Revisa esta guía completa
2. Verifica los logs en Apps Script
3. Consulta la documentación de tu API elegida
4. Busca en Stack Overflow
5. Contacta al soporte de tu proveedor de API

---

**Desarrollado para Reservas MASIC**  
Última actualización: Noviembre 2025
