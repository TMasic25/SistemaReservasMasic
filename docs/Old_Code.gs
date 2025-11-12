/* ========================================
   RESERVAS MASIC - GOOGLE APPS SCRIPT
   Backend y Notificaciones
   ======================================== */

// === CONFIGURACIÓN ===
const CONFIG = {
  // Configuración de la hoja de cálculo
  SHEET_NAME: 'Reservas',
  
  // Configuración de WhatsApp (usando API de WhatsApp Business o Twilio)
  WHATSAPP_ENABLED: true,
  WHATSAPP_API_URL: 'TU_URL_API_WHATSAPP', // Ej: Twilio, Waboxapp, etc.
  WHATSAPP_API_TOKEN: 'TU_TOKEN_API_WHATSAPP',
  WHATSAPP_FROM: 'TU_NUMERO_WHATSAPP', // Formato: +56912345678
  
  // Configuración de Email
  EMAIL_ENABLED: true,
  EMAIL_FROM: 'reservas@masic.com', // O tu email de Gmail
  EMAIL_ADMIN: 'admin@masic.com', // Email del administrador
  
  // Configuración de Overbooking
  OVERBOOKING_PERCENTAGE: 10, // 10% de overbooking permitido
  CAPACIDAD_DEFAULT: 40, // Capacidad por defecto de un bus
};

// === FUNCIÓN PRINCIPAL - RECIBE DATOS DEL FORMULARIO ===
function doPost(e) {
  try {
    // Parsear datos recibidos
    const datos = JSON.parse(e.postData.contents);
    
    // Registrar en Google Sheets
    const resultado = registrarReserva(datos);
    
    if (resultado.success) {
      // Enviar notificaciones
      if (CONFIG.EMAIL_ENABLED) {
        enviarEmailConfirmacion(datos);
        enviarEmailAdmin(datos);
      }
      
      if (CONFIG.WHATSAPP_ENABLED) {
        enviarWhatsAppConfirmacion(datos);
      }
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          codigo: datos.codigoReserva,
          mensaje: 'Reserva registrada exitosamente'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: resultado.error 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    Logger.log('Error en doPost: ' + error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// === REGISTRAR RESERVA EN GOOGLE SHEETS ===
function registrarReserva(datos) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
      crearEncabezados(sheet);
    }
    
    // Verificar overbooking
    const puedeReservar = verificarDisponibilidad(sheet, datos);
    
    if (!puedeReservar.disponible) {
      return {
        success: false,
        error: 'No hay disponibilidad para esta fecha y horario. ' + puedeReservar.mensaje
      };
    }
    
    // Preparar fila de datos
    const fila = [
      new Date(), // Fecha de registro
      datos.codigoReserva,
      datos.nombre,
      datos.email,
      datos.telefono,
      datos.direccion || '',
      datos.fecha,
      datos.horario,
      datos.origen,
      datos.destino,
      datos.pasajeros,
      datos.tipoViaje,
      datos.observaciones || '',
      datos.estado || 'Pendiente',
      '', // Notas del administrador (vacío inicialmente)
    ];
    
    // Agregar fila
    sheet.appendRow(fila);
    
    // Aplicar formato a la última fila
    const lastRow = sheet.getLastRow();
    formatearFila(sheet, lastRow);
    
    Logger.log('Reserva registrada: ' + datos.codigoReserva);
    
    return { success: true };
    
  } catch (error) {
    Logger.log('Error al registrar reserva: ' + error.toString());
    return { 
      success: false, 
      error: 'Error al registrar en la base de datos: ' + error.toString() 
    };
  }
}

// === CREAR ENCABEZADOS DE LA HOJA ===
function crearEncabezados(sheet) {
  const encabezados = [
    'Fecha Registro',
    'Código Reserva',
    'Nombre',
    'Email',
    'Teléfono',
    'Dirección Recogida',
    'Fecha Viaje',
    'Horario',
    'Origen',
    'Destino',
    'Pasajeros',
    'Tipo Viaje',
    'Observaciones',
    'Estado',
    'Notas Admin'
  ];
  
  sheet.appendRow(encabezados);
  
  // Formato de encabezados
  const headerRange = sheet.getRange(1, 1, 1, encabezados.length);
  headerRange.setBackground('#2563eb');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // Congelar fila de encabezados
  sheet.setFrozenRows(1);
  
  // Ajustar ancho de columnas
  sheet.autoResizeColumns(1, encabezados.length);
}

// === FORMATEAR FILA ===
function formatearFila(sheet, rowIndex) {
  const row = sheet.getRange(rowIndex, 1, 1, 15);
  
  // Bordes
  row.setBorder(true, true, true, true, false, false);
  
  // Alineación
  sheet.getRange(rowIndex, 11, 1, 1).setHorizontalAlignment('center'); // Pasajeros
  sheet.getRange(rowIndex, 14, 1, 1).setHorizontalAlignment('center'); // Estado
  
  // Color según estado
  const estado = sheet.getRange(rowIndex, 14).getValue();
  const estadoCell = sheet.getRange(rowIndex, 14);
  
  switch(estado) {
    case 'Pendiente':
      estadoCell.setBackground('#fef3c7'); // Amarillo claro
      estadoCell.setFontColor('#92400e'); // Marrón oscuro
      break;
    case 'Confirmada':
      estadoCell.setBackground('#d1fae5'); // Verde claro
      estadoCell.setFontColor('#065f46'); // Verde oscuro
      break;
    case 'Cancelada':
      estadoCell.setBackground('#fee2e2'); // Rojo claro
      estadoCell.setFontColor('#991b1b'); // Rojo oscuro
      break;
  }
}

// === VERIFICAR DISPONIBILIDAD (OVERBOOKING) ===
function verificarDisponibilidad(sheet, datos) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  let pasajerosReservados = 0;
  
  // Contar pasajeros para la misma fecha y horario
  for (let i = 1; i < values.length; i++) { // Empezar en 1 para saltar encabezados
    const fechaViaje = values[i][6]; // Columna de Fecha Viaje
    const horario = values[i][7]; // Columna de Horario
    const origen = values[i][8]; // Columna de Origen
    const destino = values[i][9]; // Columna de Destino
    const pasajeros = values[i][10]; // Columna de Pasajeros
    const estado = values[i][13]; // Columna de Estado
    
    // Solo contar reservas confirmadas o pendientes (no canceladas)
    if (estado !== 'Cancelada' && 
        fechaViaje === datos.fecha && 
        horario === datos.horario &&
        origen === datos.origen &&
        destino === datos.destino) {
      pasajerosReservados += parseInt(pasajeros);
    }
  }
  
  // Calcular límite con overbooking
  const capacidadMaxima = CONFIG.CAPACIDAD_DEFAULT;
  const limiteOverbooking = Math.floor(capacidadMaxima * (1 + CONFIG.OVERBOOKING_PERCENTAGE / 100));
  
  const pasajerosSolicitados = parseInt(datos.pasajeros);
  const totalPasajeros = pasajerosReservados + pasajerosSolicitados;
  
  if (totalPasajeros <= limiteOverbooking) {
    return {
      disponible: true,
      pasajerosReservados: pasajerosReservados,
      capacidadRestante: limiteOverbooking - totalPasajeros
    };
  } else {
    return {
      disponible: false,
      mensaje: `Capacidad excedida. Pasajeros ya reservados: ${pasajerosReservados}. Capacidad máxima: ${limiteOverbooking}`
    };
  }
}

// === ENVIAR EMAIL DE CONFIRMACIÓN AL CLIENTE ===
function enviarEmailConfirmacion(datos) {
  try {
    const subject = '✅ Confirmación de Reserva - Transportes MASIC';
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; border-radius: 4px; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #2563eb; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #64748b; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 Transportes Masic</h1>
            <p>Confirmación de Reserva</p>
          </div>
          <div class="content">
            <h2>¡Reserva Confirmada!</h2>
            <p>Estimado/a <strong>${datos.nombre}</strong>,</p>
            <p>Su reserva ha sido registrada exitosamente en nuestro sistema.</p>
            
            <div class="info-box">
              <h3 style="color: #2563eb; margin-top: 0;">📋 Detalles de su Reserva</h3>
              <div class="info-row"><span class="label">Código de Reserva:</span> ${datos.codigoReserva}</div>
              <div class="info-row"><span class="label">Fecha del Viaje:</span> ${datos.fecha}</div>
              <div class="info-row"><span class="label">Horario:</span> ${datos.horario}</div>
              <div class="info-row"><span class="label">Origen:</span> ${datos.origen}</div>
              <div class="info-row"><span class="label">Destino:</span> ${datos.destino}</div>
              <div class="info-row"><span class="label">Pasajeros:</span> ${datos.pasajeros}</div>
              <div class="info-row"><span class="label">Tipo de Viaje:</span> ${datos.tipoViaje}</div>
              ${datos.direccion ? `<div class="info-row"><span class="label">Dirección de Recogida:</span> ${datos.direccion}</div>` : ''}
              ${datos.observaciones ? `<div class="info-row"><span class="label">Observaciones:</span> ${datos.observaciones}</div>` : ''}
            </div>
            
            <p><strong>Estado:</strong> <span style="color: #f59e0b;">⏳ Pendiente de Confirmación</span></p>
            <p>Nuestro equipo revisará su solicitud y le contactará pronto para confirmar los detalles finales.</p>
            
            <p style="margin-top: 30px;"><strong>📱 Importante:</strong></p>
            <ul>
              <li>Guarde este código de reserva: <strong>${datos.codigoReserva}</strong></li>
              <li>Recibirá una confirmación final por teléfono o WhatsApp</li>
              <li>Para cambios o cancelaciones, contacte directamente con nosotros</li>
            </ul>
          </div>
          <div class="footer">
            <p>Transportes Masic - Sistema de Reservas</p>
            <p>Este es un correo automático, por favor no responda a este mensaje</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: datos.email,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log('Email enviado a: ' + datos.email);
    
  } catch (error) {
    Logger.log('Error al enviar email al cliente: ' + error.toString());
  }
}

// === ENVIAR EMAIL AL ADMINISTRADOR ===
function enviarEmailAdmin(datos) {
  try {
    const subject = '🔔 Nueva Reserva Recibida - ' + datos.codigoReserva;
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; border-radius: 4px; }
          .info-row { margin: 10px 0; padding: 8px; background: #f1f5f9; border-radius: 4px; }
          .label { font-weight: bold; color: #2563eb; display: inline-block; width: 180px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nueva Reserva</h1>
          </div>
          <div class="content">
            <h2>Se ha registrado una nueva reserva</h2>
            
            <div class="info-box">
              <h3 style="color: #2563eb; margin-top: 0;">👤 Datos del Cliente</h3>
              <div class="info-row"><span class="label">Nombre:</span> ${datos.nombre}</div>
              <div class="info-row"><span class="label">Email:</span> ${datos.email}</div>
              <div class="info-row"><span class="label">Teléfono:</span> ${datos.telefono}</div>
              ${datos.direccion ? `<div class="info-row"><span class="label">Dirección:</span> ${datos.direccion}</div>` : ''}
            </div>
            
            <div class="info-box">
              <h3 style="color: #2563eb; margin-top: 0;">🚌 Detalles del Viaje</h3>
              <div class="info-row"><span class="label">Código:</span> <strong>${datos.codigoReserva}</strong></div>
              <div class="info-row"><span class="label">Fecha:</span> ${datos.fecha}</div>
              <div class="info-row"><span class="label">Horario:</span> ${datos.horario}</div>
              <div class="info-row"><span class="label">Ruta:</span> ${datos.origen} → ${datos.destino}</div>
              <div class="info-row"><span class="label">Pasajeros:</span> ${datos.pasajeros}</div>
              <div class="info-row"><span class="label">Tipo:</span> ${datos.tipoViaje}</div>
              ${datos.observaciones ? `<div class="info-row"><span class="label">Observaciones:</span> ${datos.observaciones}</div>` : ''}
            </div>
            
            <p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <strong>⏳ Acción Requerida:</strong> Por favor revise y confirme esta reserva lo antes posible.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log('Email enviado al administrador');
    
  } catch (error) {
    Logger.log('Error al enviar email al admin: ' + error.toString());
  }
}

// === ENVIAR WHATSAPP AL CLIENTE ===
function enviarWhatsAppConfirmacion(datos) {
  try {
    // Formatear número de teléfono (quitar espacios y caracteres especiales)
    const telefono = datos.telefono.replace(/[\s()-]/g, '');
    
    // Mensaje de WhatsApp
    const mensaje = `
🚌 *Transportes Masic*
✅ *Reserva Confirmada*

Hola ${datos.nombre},

Tu reserva ha sido registrada exitosamente:

📋 *Código:* ${datos.codigoReserva}
📅 *Fecha:* ${datos.fecha}
⏰ *Horario:* ${datos.horario}
📍 *Ruta:* ${datos.origen} → ${datos.destino}
👥 *Pasajeros:* ${datos.pasajeros}
🎫 *Tipo:* ${datos.tipoViaje}

⏳ *Estado:* Pendiente de confirmación

Nuestro equipo te contactará pronto para confirmar los detalles finales.

*Guarda este código de reserva para consultas.*

_Este es un mensaje automático del Sistema de Reservas MASIC_
    `.trim();
    
    // OPCIÓN 1: Usando Twilio (Recomendado para producción)
    enviarWhatsAppTwilio(telefono, mensaje);
    
    // OPCIÓN 2: Usando otra API de WhatsApp
    // enviarWhatsAppOtraAPI(telefono, mensaje);
    
    Logger.log('WhatsApp enviado a: ' + telefono);
    
  } catch (error) {
    Logger.log('Error al enviar WhatsApp: ' + error.toString());
  }
}

// === ENVIAR WHATSAPP VÍA TWILIO ===
function enviarWhatsAppTwilio(telefono, mensaje) {
  if (CONFIG.WHATSAPP_API_URL === 'TU_URL_API_WHATSAPP') {
    Logger.log('⚠️ WhatsApp no configurado - Saltando envío');
    return;
  }
  
  try {
    const payload = {
      from: `whatsapp:${CONFIG.WHATSAPP_FROM}`,
      to: `whatsapp:${telefono}`,
      body: mensaje
    };
    
    const options = {
      method: 'post',
      contentType: 'application/x-www-form-urlencoded',
      headers: {
        'Authorization': 'Bearer ' + CONFIG.WHATSAPP_API_TOKEN
      },
      payload: payload
    };
    
    UrlFetchApp.fetch(CONFIG.WHATSAPP_API_URL, options);
    
  } catch (error) {
    Logger.log('Error en envío de WhatsApp Twilio: ' + error.toString());
  }
}

// === FUNCIÓN DE PRUEBA ===
function testReserva() {
  const datosPrueba = {
    codigoReserva: 'TEST-' + new Date().getTime(),
    timestamp: new Date().toISOString(),
    nombre: 'Juan Pérez Test',
    email: 'test@example.com',
    telefono: '+56912345678',
    direccion: 'Calle Test 123',
    fecha: '15/11/2025',
    horario: '09:00 - 10:30',
    origen: 'Santiago',
    destino: 'Valparaíso',
    pasajeros: 2,
    tipoViaje: 'Ida y Retorno',
    observaciones: 'Reserva de prueba',
    estado: 'Pendiente'
  };
  
  const resultado = registrarReserva(datosPrueba);
  Logger.log('Resultado de prueba: ' + JSON.stringify(resultado));
  
  if (CONFIG.EMAIL_ENABLED) {
    enviarEmailConfirmacion(datosPrueba);
  }
  
  if (CONFIG.WHATSAPP_ENABLED) {
    enviarWhatsAppConfirmacion(datosPrueba);
  }
}
