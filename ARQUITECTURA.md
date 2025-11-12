# 🏗️ ARQUITECTURA DEL SISTEMA - RESERVAS MASIC

## Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO / CLIENTE                        │
│                    (Navegador Web - Móvil/Desktop)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FORMULARIO WEB (Frontend)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • index.html  - Estructura HTML                         │  │
│  │  • styles.css  - Diseño responsive y moderno             │  │
│  │  • app.js      - Validaciones y lógica del cliente       │  │
│  │                                                            │  │
│  │  Librerías Externas:                                      │  │
│  │  ✓ Flatpickr   - Selector de fechas                      │  │
│  │  ✓ SweetAlert2 - Alertas bonitas                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS POST Request
                             │ (Datos JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (Google Apps Script - Code.gs)             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Función doPost(e):                                       │  │
│  │  1️⃣  Recibe datos del formulario                        │  │
│  │  2️⃣  Valida datos en el servidor                        │  │
│  │  3️⃣  Verifica disponibilidad (overbooking)              │  │
│  │  4️⃣  Genera código de reserva único                     │  │
│  │  5️⃣  Guarda en Google Sheets                            │  │
│  │  6️⃣  Envía notificaciones                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────┬──────────────────────┬───────────────────┬──────────┘
           │                      │                   │
           ▼                      ▼                   ▼
    ┌──────────────┐      ┌─────────────┐    ┌──────────────┐
    │   GOOGLE     │      │   GMAIL     │    │  WHATSAPP    │
    │   SHEETS     │      │    API      │    │    API       │
    │              │      │             │    │              │
    │  • Reservas  │      │ • Email     │    │ • Twilio     │
    │  • Formato   │      │   Cliente   │    │ • Waboxapp   │
    │  • Estados   │      │ • Email     │    │ • Ultramsg   │
    │  • Búsqueda  │      │   Admin     │    │ • Otros...   │
    └──────────────┘      └─────────────┘    └──────────────┘
           │                      │                   │
           │                      │                   │
           ▼                      ▼                   ▼
    ┌──────────────┐      ┌─────────────┐    ┌──────────────┐
    │ ADMINISTRADOR│      │   CLIENTE   │    │   CLIENTE    │
    │              │      │  (Email)    │    │ (WhatsApp)   │
    │ • Visualiza  │      │             │    │              │
    │   Reservas   │      │ Recibe      │    │ Recibe       │
    │ • Gestiona   │      │ Confirmación│    │ Confirmación │
    │   Estados    │      │             │    │              │
    └──────────────┘      └─────────────┘    └──────────────┘
```

---

## 🔄 FLUJO DE DATOS DETALLADO

### 1️⃣ USUARIO COMPLETA EL FORMULARIO

```
Usuario ingresa:
├── 👤 Datos Personales
│   ├── Nombre completo
│   ├── Email
│   ├── Teléfono
│   └── Dirección de recogida (opcional)
│
└── 🚌 Datos del Viaje
    ├── Fecha del viaje (selector calendario)
    ├── Horario (texto libre)
    ├── Origen (texto libre)
    ├── Destino (texto libre)
    ├── Cantidad de pasajeros (1-50)
    ├── Tipo de viaje (Solo Ida / Ida y Retorno)
    └── Observaciones (opcional)
```

### 2️⃣ VALIDACIÓN EN EL CLIENTE (JavaScript)

```javascript
app.js realiza:
├── Validación de campos obligatorios
├── Validación de formato de email
├── Validación de formato de teléfono
├── Validación de rango de pasajeros (1-50)
├── Validación de fecha (dentro del rango permitido)
└── Generación de código de reserva único
```

### 3️⃣ ENVÍO AL BACKEND

```
fetch(SCRIPT_URL, {
  method: 'POST',
  body: JSON.stringify(datos)
})
│
├── Datos enviados en formato JSON
├── Conexión HTTPS segura
└── Modo: no-cors (por restricciones de Google)
```

### 4️⃣ PROCESAMIENTO EN APPS SCRIPT

```
Code.gs procesa:
│
├── 📥 Recepción de datos
│   └── Parsea JSON del request
│
├── ✅ Validación en servidor
│   ├── Verifica campos obligatorios
│   └── Sanitiza datos
│
├── 🔍 Verificación de disponibilidad
│   ├── Consulta reservas existentes
│   ├── Cuenta pasajeros por fecha/horario/ruta
│   ├── Aplica regla de overbooking (10%)
│   └── Rechaza si excede capacidad
│
├── 💾 Guardado en Google Sheets
│   ├── Crea hoja "Reservas" si no existe
│   ├── Agrega fila con todos los datos
│   ├── Aplica formato y colores
│   └── Estado inicial: "Pendiente"
│
└── 📧 Envío de notificaciones
    ├── Email al cliente (confirmación)
    ├── Email al admin (notificación)
    └── WhatsApp al cliente (si está habilitado)
```

### 5️⃣ NOTIFICACIONES ENVIADAS

```
┌─────────────────────────────────────┐
│     EMAIL AL CLIENTE                │
├─────────────────────────────────────┤
│ • Código de reserva                 │
│ • Detalles completos del viaje      │
│ • Estado: Pendiente                 │
│ • Instrucciones para consultas      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     EMAIL AL ADMIN                  │
├─────────────────────────────────────┤
│ • Nueva reserva recibida            │
│ • Datos del cliente                 │
│ • Detalles del viaje                │
│ • Acción requerida: Confirmar       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     WHATSAPP AL CLIENTE             │
├─────────────────────────────────────┤
│ • Mensaje de confirmación           │
│ • Código de reserva                 │
│ • Resumen del viaje                 │
│ • Estado: Pendiente                 │
└─────────────────────────────────────┘
```

---

## 🗄️ ESTRUCTURA DE LA BASE DE DATOS (Google Sheets)

### Hoja: "Reservas"

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| **A** - Fecha Registro | DateTime | Timestamp automático | 11/11/2025 14:30:45 |
| **B** - Código Reserva | String | ID único generado | RES-1731344565-742 |
| **C** - Nombre | String | Nombre del cliente | Juan Pérez |
| **D** - Email | String | Email del cliente | juan@email.com |
| **E** - Teléfono | String | Teléfono del cliente | +56912345678 |
| **F** - Dirección Recogida | String | Dirección opcional | Av. Principal 123 |
| **G** - Fecha Viaje | String | Fecha del viaje | 15/11/2025 |
| **H** - Horario | String | Horario del viaje | 09:00 - 10:30 |
| **I** - Origen | String | Lugar de partida | Santiago |
| **J** - Destino | String | Lugar de llegada | Valparaíso |
| **K** - Pasajeros | Number | Cantidad de pasajeros | 4 |
| **L** - Tipo Viaje | String | Solo Ida o Ida y Retorno | Ida y Retorno |
| **M** - Observaciones | String | Notas del cliente | Equipaje adicional |
| **N** - Estado | String | Estado de la reserva | Pendiente / Confirmada / Cancelada |
| **O** - Notas Admin | String | Notas del administrador | Confirmado por teléfono |

### Estados de Reserva

```
🟡 PENDIENTE
├── Estado inicial de toda reserva
├── Color de fondo: Amarillo claro (#fef3c7)
├── Requiere acción del administrador
└── Cliente recibe "pendiente de confirmación"

🟢 CONFIRMADA
├── Reserva aprobada por el admin
├── Color de fondo: Verde claro (#d1fae5)
├── Cliente debe ser notificado manualmente
└── Reserva lista para el viaje

🔴 CANCELADA
├── Reserva cancelada por admin o cliente
├── Color de fondo: Rojo claro (#fee2e2)
├── No se cuenta para disponibilidad
└── Se mantiene en el registro histórico
```

---

## ⚙️ SISTEMA DE OVERBOOKING

### Funcionamiento

```
Capacidad Base del Bus: 40 pasajeros
Porcentaje Overbooking: 10%
════════════════════════════════════
Capacidad Máxima Permitida: 44 pasajeros

Cálculo:
40 × (1 + 10/100) = 40 × 1.10 = 44
```

### Validación de Disponibilidad

```javascript
Para cada nueva reserva:
│
├── Buscar reservas existentes con:
│   ├── Misma fecha
│   ├── Mismo horario
│   ├── Mismo origen
│   └── Mismo destino
│
├── Sumar pasajeros de reservas:
│   ├── Estado: Pendiente ✓
│   ├── Estado: Confirmada ✓
│   └── Estado: Cancelada ✗ (no se cuenta)
│
├── Verificar límite:
│   └── (pasajeros_actuales + pasajeros_nuevos) ≤ 44
│
└── Resultado:
    ├── SI: Acepta reserva ✓
    └── NO: Rechaza reserva ✗
```

---

## 🔒 SEGURIDAD Y VALIDACIONES

### Capa 1: Cliente (JavaScript)

```javascript
Validaciones en el navegador:
├── Campos obligatorios no vacíos
├── Formato de email válido (regex)
├── Formato de teléfono válido (regex)
├── Rango de pasajeros (1-50)
├── Fecha dentro del rango permitido
│   ├── Mínimo: +1 día desde hoy
│   └── Máximo: +90 días desde hoy
└── Feedback visual inmediato
```

### Capa 2: Servidor (Apps Script)

```javascript
Validaciones en Google Apps Script:
├── Verificar que todos los datos llegaron
├── Sanitizar strings (evitar inyección)
├── Validar tipos de datos
├── Verificar disponibilidad real
└── Manejo de errores con try-catch
```

### Capa 3: Google Sheets

```
Protección de datos:
├── Permisos de Google configurables
├── Historial de cambios automático
├── Backup en Google Drive
└── Recuperación ante errores
```

---

## 📊 TECNOLOGÍAS Y LIBRERÍAS

### Frontend

```
HTML5
├── Estructura semántica
├── Accesibilidad (labels, ARIA)
└── Validación nativa de formularios

CSS3
├── Variables CSS (custom properties)
├── Flexbox y Grid Layout
├── Media Queries (responsive)
├── Animaciones y transiciones
└── Gradientes y sombras

JavaScript ES6+
├── Módulos y funciones modernas
├── Async/Await para peticiones
├── Template literals
├── Destructuring
└── Arrow functions
```

### Librerías Externas

```
Flatpickr v4.6+
├── Selector de fechas
├── Localización en español
├── Configuración de rangos
└── Modo móvil-friendly

SweetAlert2 v11+
├── Alertas modernas
├── Modales personalizables
├── Confirmaciones elegantes
└── Iconos y animaciones
```

### Backend

```
Google Apps Script
├── JavaScript en servidor
├── Integración nativa con Google Workspace
├── Triggers y automatizaciones
└── Web Apps (endpoints HTTP)

APIs Integradas
├── Google Sheets API
├── Gmail API (envío de emails)
├── UrlFetch (llamadas HTTP)
└── Utilities (encoding, parsing)
```

---

## 🌐 HOSTING Y DESPLIEGUE

### Opciones de Hosting del Frontend

```
Opción 1: GitHub Pages (GRATIS)
├── Push a repositorio GitHub
├── Settings → Pages → Enable
├── URL: https://usuario.github.io/repo
└── SSL automático incluido

Opción 2: Netlify (GRATIS, Recomendado)
├── Drag & drop de carpeta
├── Deploy automático en 30 seg
├── URL: https://nombre.netlify.app
├── SSL automático incluido
└── CI/CD integrado

Opción 3: Vercel (GRATIS)
├── Similar a Netlify
├── Excelente performance
└── Ideal para proyectos web

Opción 4: Hosting Propio
├── Subir archivos via FTP
├── Requiere servidor web
└── Configurar SSL manualmente
```

### Backend (Google Apps Script)

```
Siempre Hospedado en Google Cloud
├── 100% gratuito (sin límites normales)
├── Alta disponibilidad
├── Escalabilidad automática
├── SSL incluido
└── URL estable: script.google.com
```

---

## 📈 LÍMITES Y CAPACIDAD

### Google Apps Script (Quotas)

```
Límites Diarios (Cuenta Gratuita):
├── Email sends: 100/día (GmailApp)
├── URL fetches: 20,000/día
├── Execution time: 6 min/ejecución
└── Script runtime: 90 min/día

Límites de Google Sheets:
├── 10 millones de celdas por hoja
├── 256 columnas por hoja
├── 40,000 nuevas filas/petición
└── Prácticamente ilimitado para este uso
```

### Recomendaciones de Escala

```
Pequeño (< 100 reservas/mes)
└── Configuración default perfecta ✓

Mediano (100-1000 reservas/mes)
└── Sin problemas, solo monitorear ✓

Grande (> 1000 reservas/mes)
├── Considerar múltiples hojas por mes
├── Implementar archivado automático
└── Monitorear quotas de email ⚠️

Muy Grande (> 5000 reservas/mes)
└── Considerar migrar a base de datos real
```

---

## 🔧 MANTENIMIENTO Y MONITOREO

### Logs y Debugging

```
Google Apps Script:
├── Ver → Logs (Ctrl+Enter)
├── Registros de ejecución
├── Errores y stack traces
└── Console.log() personalizado

Navegador (Cliente):
├── F12 → Console
├── Network tab (ver requests)
├── Errores de JavaScript
└── Performance monitoring
```

### Backups Recomendados

```
Frecuencia Sugerida:
├── Semanal: Export de Google Sheet
├── Mensual: Backup completo del proyecto
└── Antes de cambios mayores: Snapshot

Métodos de Backup:
├── Google Sheets: File → Download as → Excel
├── Google Sheets: File → Make a copy
├── Código: Git commits regulares
└── Base de datos: Scripts de export automático
```

---

## 🎯 OPTIMIZACIONES IMPLEMENTADAS

### Performance

```
✓ Validación en cliente (menos carga en servidor)
✓ Lazy loading de librerías externas (CDN)
✓ CSS minificado en producción
✓ Compresión GZIP automática (hosting)
✓ Caché de recursos estáticos
```

### UX/UI

```
✓ Loading spinner durante envío
✓ Validación en tiempo real
✓ Mensajes de error claros
✓ Confirmación visual con código
✓ Diseño responsive (móvil primero)
✓ Animaciones suaves y profesionales
```

### Seguridad

```
✓ HTTPS obligatorio
✓ Sanitización de inputs
✓ Validación de doble capa
✓ No se exponen credenciales
✓ Logs de todas las operaciones
```

---

## 📌 PRÓXIMAS MEJORAS (Roadmap)

### Fase 2: Panel de Administración Web
- [ ] Dashboard web para admin
- [ ] Búsqueda avanzada de reservas
- [ ] Edición de reservas desde panel
- [ ] Estadísticas visuales

### Fase 3: Features Avanzadas
- [ ] Sistema de pagos online
- [ ] QR codes para reservas
- [ ] Notificaciones push
- [ ] App móvil nativa

### Fase 4: Integración Total
- [ ] Integración con Sistema de Control
- [ ] Single Sign-On (SSO)
- [ ] API REST pública
- [ ] Webhooks para integraciones

---

**Sistema Reservas MASIC v1.0**  
Arquitectura: Cliente-Servidor  
Stack: HTML + CSS + JS + Google Apps Script  
Database: Google Sheets  
Status: ✅ Producción Ready
