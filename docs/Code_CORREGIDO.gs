/* ========================================
   RESERVAS MASIC - GOOGLE APPS SCRIPT
   Backend y Notificaciones - VERSIÓN CORREGIDA
   ======================================== */

// === CONFIGURACIÓN ===
const CONFIG = {
  // Nombre de la hoja (IMPORTANTE: debe coincidir exactamente)
  SHEET_NAME: 'Reservas',
  
  // Configuración de WhatsApp (usando API de WhatsApp Business o Twilio)
  WHATSAPP_ENABLED: false, // Cambiar a true cuando configures WhatsApp
  WHATSAPP_API_TOKEN: 'TU_TOKEN_API_WHATSAPP',
  WHATSAPP_FROM: 'TU_NUMERO_WHATSAPP', // Formato: +56912345678
  
  // Configuración de Email
  EMAIL_ENABLED: true,
  EMAIL_FROM: 'reservas@masic.com', // Cambiar por tu email de Gmail
  EMAIL_ADMIN: 'admin@masic.com', // Cambiar por el email del administrador
  
  // Configuración de Overbooking
  OVERBOOKING_PERCENTAGE: 10, // 10% de overbooking permitido
  CAPACIDAD_DEFAULT: 40, // Capacidad por defecto de un bus
};

// === FUNCIÓN PRINCIPAL - RECIBE DATOS DEL FORMULARIO ===
function doPost(e) {
  try {
    Logger.log('📥 Recibiendo nueva reserva...');
    
    // Parsear datos recibidos
    const datos = JSON.parse(e.postData.contents);
    Logger.log('✅ Datos parseados: ' + JSON.stringify(datos));
    
    // Registrar en Google Sheets
    const resultado = registrarReserva(datos);
    
    if (resultado.success) {
      Logger.log('✅ Reserva registrada exitosamente');
      
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
      Logger.log('❌ Error al registrar: ' + resultado.error);
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: resultado.error 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    Logger.log('❌ Error crítico en doPost: ' + error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Error del servidor: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// === REGISTRAR RESERVA EN GOOGLE SHEETS ===
function registrarReserva(datos) {
  try {
    Logger.log('📝 Iniciando registro de reserva...');
    
    // Obtener la hoja de cálculo activa
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!ss) {
      throw new Error('No se pudo acceder a la hoja de cálculo');
    }
    
    Logger.log('✅ Hoja de cálculo obtenida: ' + ss.getName());
    
    // Buscar la hoja por nombre
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    // Si no existe, crearla
    if (!sheet) {
      Logger.log('⚠️ Hoja "' + CONFIG.SHEET_NAME + '" no existe. Creando...');
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
      Logger.log('✅ Hoja creada: ' + sheet.getName());
    }
    
    // Verificar si tiene encabezados (revisar celda A1)
    const primeraFila = sheet.getRange(1, 1).getValue();
    
    if (!primeraFila || primeraFila === '' || primeraFila !== 'Fecha Registro') {
      Logger.log('⚠️ Encabezados no encontrados. Creando...');
      crearEncabezados(sheet);
    } else {
      Logger.log('✅ Encabezados ya existen');
    }
    
    // Verificar disponibilidad
    const puedeReservar = verificarDisponibilidad(sheet, datos);
    
    if (!puedeReservar.disponible) {
      Logger.log('❌ Sin disponibilidad: ' + puedeReservar.mensaje);
      return {
        success: false,
        error: 'No hay disponibilidad. ' + puedeReservar.mensaje
      };
    }
    
    Logger.log('✅ Disponibilidad verificada. Guardando datos...');
    
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
      'Pendiente', // Estado inicial
      '', // Notas del administrador
    ];
    
    // Agregar fila
    sheet.appendRow(fila);
    
    // Aplicar formato a la última fila
    const lastRow = sheet.getLastRow();
    formatearFila(sheet, lastRow);
    
    Logger.log('✅ Reserva guardada en fila ' + lastRow + ': ' + datos.codigoReserva);
    
    return { success: true };
    
  } catch (error) {
    Logger.log('❌ Error al registrar reserva: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    return { 
      success: false, 
      error: 'Error al guardar: ' + error.toString() 
    };
  }
}

// === CREAR ENCABEZADOS DE LA HOJA ===
function crearEncabezados(sheet) {
  try {
    Logger.log('📋 Creando encabezados...');
    
    if (!sheet) {
      throw new Error('Sheet es null o undefined');
    }
    
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
    
    // Limpiar primera fila por si tiene datos
    const rangoLimpiar = sheet.getRange(1, 1, 1, encabezados.length);
    rangoLimpiar.clearContent();
    
    // Insertar encabezados usando setValues (más confiable que appendRow)
    const rangoEncabezados = sheet.getRange(1, 1, 1, encabezados.length);
    rangoEncabezados.setValues([encabezados]);
    
    // Aplicar formato
    rangoEncabezados.setBackground('#2563eb');
    rangoEncabezados.setFontColor('#ffffff');
    rangoEncabezados.setFontWeight('bold');
    rangoEncabezados.setHorizontalAlignment('center');
    rangoEncabezados.setVerticalAlignment('middle');
    
    // Congelar fila de encabezados
    sheet.setFrozenRows(1);
    
    // Ajustar ancho de columnas
    for (let i = 1; i <= encabezados.length; i++) {
      sheet.autoResizeColumn(i);
    }
    
    Logger.log('✅ Encabezados creados exitosamente');
    
  } catch (error) {
    Logger.log('❌ Error al crear encabezados: ' + error.toString());
    throw error;
  }
}

// === FORMATEAR FILA ===
function formatearFila(sheet, rowIndex) {
  try {
    const row = sheet.getRange(rowIndex, 1, 1, 15);
    
    // Bordes
    row.setBorder(true, true, true, true, false, false);
    
    // Alineación
    sheet.getRange(rowIndex, 11).setHorizontalAlignment('center'); // Pasajeros
    sheet.getRange(rowIndex, 14).setHorizontalAlignment('center'); // Estado
    
    // Color según estado
    const estado = sheet.getRange(rowIndex, 14).getValue();
    const estadoCell = sheet.getRange(rowIndex, 14);
    
    switch(estado) {
      case 'Pendiente':
        estadoCell.setBackground('#fef3c7'); // Amarillo claro
        estadoCell.setFontColor('#92400e'); // Marrón oscuro
        estadoCell.setFontWeight('bold');
        break;
      case 'Confirmada':
        estadoCell.setBackground('#d1fae5'); // Verde claro
        estadoCell.setFontColor('#065f46'); // Verde oscuro
        estadoCell.setFontWeight('bold');
        break;
      case 'Cancelada':
        estadoCell.setBackground('#fee2e2'); // Rojo claro
        estadoCell.setFontColor('#991b1b'); // Rojo oscuro
        estadoCell.setFontWeight('bold');
        break;
    }
    
    Logger.log('✅ Formato aplicado a fila ' + rowIndex);
    
  } catch (error) {
    Logger.log('⚠️ Error al formatear fila: ' + error.toString());
    // No lanzar error, el formateo es opcional
  }
}

// === VERIFICAR DISPONIBILIDAD (OVERBOOKING) ===
function verificarDisponibilidad(sheet, datos) {
  try {
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    let pasajerosReservados = 0;
    
    // Contar pasajeros para la misma fecha, horario y ruta
    for (let i = 1; i < values.length; i++) {
      const fechaViaje = values[i][6]; // Columna G - Fecha Viaje
      const horario = values[i][7];    // Columna H - Horario
      const origen = values[i][8];     // Columna I - Origen
      const destino = values[i][9];    // Columna J - Destino
      const pasajeros = values[i][10]; // Columna K - Pasajeros
      const estado = values[i][13];    // Columna N - Estado
      
      // Solo contar reservas activas (no canceladas)
      if (estado !== 'Cancelada' && 
          String(fechaViaje) === String(datos.fecha) && 
          String(horario) === String(datos.horario) &&
          String(origen) === String(datos.origen) &&
          String(destino) === String(datos.destino)) {
        pasajerosReservados += parseInt(pasajeros) || 0;
      }
    }
    
    // Calcular límite con overbooking
    const capacidadMaxima = CONFIG.CAPACIDAD_DEFAULT;
    const limiteOverbooking = Math.floor(capacidadMaxima * (1 + CONFIG.OVERBOOKING_PERCENTAGE / 100));
    
    const pasajerosSolicitados = parseInt(datos.pasajeros) || 0;
    const totalPasajeros = pasajerosReservados + pasajerosSolicitados;
    
    Logger.log('📊 Disponibilidad: ' + pasajerosReservados + ' reservados, ' + 
               pasajerosSolicitados + ' solicitados, límite: ' + limiteOverbooking);
    
    if (totalPasajeros <= limiteOverbooking) {
      return {
        disponible: true,
        pasajerosReservados: pasajerosReservados,
        capacidadRestante: limiteOverbooking - totalPasajeros
      };
    } else {
      return {
        disponible: false,
        mensaje: `Capacidad excedida. Ya hay ${pasajerosReservados} pasajeros reservados. Máximo permitido: ${limiteOverbooking}`
      };
    }
    
  } catch (error) {
    Logger.log('⚠️ Error al verificar disponibilidad: ' + error.toString());
    // En caso de error, permitir la reserva
    return { disponible: true };
  }
}

// === ENVIAR EMAIL DE CONFIRMACIÓN AL CLIENTE ===
function enviarEmailConfirmacion(datos) {
  if (!CONFIG.EMAIL_ENABLED) {
    Logger.log('⚠️ Email deshabilitado en configuración');
    return;
  }
  
  try {
    const subject = '✅ Confirmación de Reserva - MASIC Transport';
    
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 MASIC Transport</h1>
            <p>Confirmación de Reserva</p>
          </div>
          <div class="content">
            <h2>¡Reserva Confirmada!</h2>
            <p>Estimado/a <strong>${datos.nombre}</strong>,</p>
            <p>Su reserva ha sido registrada exitosamente.</p>
            
            <div class="info-box">
              <h3 style="color: #2563eb;">📋 Detalles de su Reserva</h3>
              <div class="info-row"><span class="label">Código:</span> ${datos.codigoReserva}</div>
              <div class="info-row"><span class="label">Fecha:</span> ${datos.fecha}</div>
              <div class="info-row"><span class="label">Horario:</span> ${datos.horario}</div>
              <div class="info-row"><span class="label">Ruta:</span> ${datos.origen} → ${datos.destino}</div>
              <div class="info-row"><span class="label">Pasajeros:</span> ${datos.pasajeros}</div>
              <div class="info-row"><span class="label">Tipo:</span> ${datos.tipoViaje}</div>
            </div>
            
            <p><strong>Estado:</strong> <span style="color: #f59e0b;">⏳ Pendiente de Confirmación</span></p>
            <p>Guarde su código de reserva: <strong>${datos.codigoReserva}</strong></p>
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
    
    Logger.log('✅ Email enviado a: ' + datos.email);
    
  } catch (error) {
    Logger.log('❌ Error al enviar email al cliente: ' + error.toString());
  }
}

// === ENVIAR EMAIL AL ADMINISTRADOR ===
function enviarEmailAdmin(datos) {
  if (!CONFIG.EMAIL_ENABLED) {
    return;
  }
  
  try {
    const subject = '🔔 Nueva Reserva - ' + datos.codigoReserva;
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>🔔 Nueva Reserva Recibida</h2>
        <h3>👤 Cliente: ${datos.nombre}</h3>
        <p><strong>Email:</strong> ${datos.email}</p>
        <p><strong>Teléfono:</strong> ${datos.telefono}</p>
        <hr>
        <h3>🚌 Detalles del Viaje</h3>
        <p><strong>Código:</strong> ${datos.codigoReserva}</p>
        <p><strong>Fecha:</strong> ${datos.fecha}</p>
        <p><strong>Horario:</strong> ${datos.horario}</p>
        <p><strong>Ruta:</strong> ${datos.origen} → ${datos.destino}</p>
        <p><strong>Pasajeros:</strong> ${datos.pasajeros}</p>
        <p><strong>Tipo:</strong> ${datos.tipoViaje}</p>
        ${datos.observaciones ? '<p><strong>Observaciones:</strong> ' + datos.observaciones + '</p>' : ''}
        <hr>
        <p style="background: #fef3c7; padding: 10px; border-radius: 4px;">
          <strong>⏳ Acción Requerida:</strong> Revisar y confirmar esta reserva.
        </p>
      </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log('✅ Email enviado al administrador');
    
  } catch (error) {
    Logger.log('❌ Error al enviar email al admin: ' + error.toString());
  }
}

// === ENVIAR WHATSAPP (PLACEHOLDER) ===
function enviarWhatsAppConfirmacion(datos) {
  if (!CONFIG.WHATSAPP_ENABLED) {
    Logger.log('⚠️ WhatsApp deshabilitado en configuración');
    return;
  }
  
  try {
    const telefono = datos.telefono.replace(/[\s()-]/g, '');
    
    const mensaje = `
🚌 *MASIC Transport*
✅ *Reserva Confirmada*

Hola ${datos.nombre},

📋 *Código:* ${datos.codigoReserva}
📅 *Fecha:* ${datos.fecha}
⏰ *Horario:* ${datos.horario}
📍 *Ruta:* ${datos.origen} → ${datos.destino}
👥 *Pasajeros:* ${datos.pasajeros}

⏳ *Estado:* Pendiente de confirmación

_Guarda este código para consultas._
    `.trim();
    
    Logger.log('📱 WhatsApp configurado pero no se envió (requiere configuración de API)');
    Logger.log('Mensaje: ' + mensaje);
    
    // Aquí irá la integración con tu API de WhatsApp
    // Ver: docs/WHATSAPP_CONFIG.md
    
  } catch (error) {
    Logger.log('❌ Error en WhatsApp: ' + error.toString());
  }
}

// === FUNCIÓN DE PRUEBA ===
function testReserva() {
  Logger.log('🧪 Iniciando prueba de reserva...');
  
  const datosPrueba = {
    codigoReserva: 'TEST-' + new Date().getTime(),
    timestamp: new Date().toISOString(),
    nombre: 'Juan Pérez Test',
    email: 'test@example.com',
    telefono: '+56912345678',
    direccion: 'Calle Test 123',
    fecha: '15/12/2025',
    horario: '09:00 - 10:30',
    origen: 'Santiago',
    destino: 'Valparaíso',
    pasajeros: 2,
    tipoViaje: 'Ida y Retorno',
    observaciones: 'Reserva de prueba del sistema',
    estado: 'Pendiente'
  };
  
  const resultado = registrarReserva(datosPrueba);
  
  if (resultado.success) {
    Logger.log('✅ Prueba exitosa!');
    
    if (CONFIG.EMAIL_ENABLED) {
      enviarEmailConfirmacion(datosPrueba);
      enviarEmailAdmin(datosPrueba);
    }
  } else {
    Logger.log('❌ Prueba fallida: ' + resultado.error);
  }
}

// === FUNCIÓN DE CONFIGURACIÓN INICIAL ===
function configurarHoja() {
  Logger.log('🔧 Configurando hoja de cálculo...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
      Logger.log('✅ Hoja creada: ' + CONFIG.SHEET_NAME);
    }
    
    crearEncabezados(sheet);
    Logger.log('✅ Configuración completada');
    
  } catch (error) {
    Logger.log('❌ Error en configuración: ' + error.toString());
  }
}
