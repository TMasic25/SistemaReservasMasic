/* ========================================
   RESERVAS MASIC - LÓGICA DEL CLIENTE
   JavaScript Principal
   ======================================== */

// === CONFIGURACIÓN ===
const CONFIG = {
    // URL del Google Apps Script (DEBES REEMPLAZAR ESTO)
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwOSSW33zw7iHgll8gwA7Pqmxs0_7utXPdnlq8d7DgO3tD11i_SBr_HPIfkA5xRTH_mNg/exec',
    
    // Configuración de fechas
    MIN_DAYS_ADVANCE: 1, // Días mínimos de anticipación
    MAX_DAYS_ADVANCE: 90, // Días máximos de anticipación
    
    // Validación
    MIN_PASSENGERS: 1,
    MAX_PASSENGERS: 50,
};

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    initializeFlatpickr();
    initializeEventListeners();
    
    console.log('✅ Sistema Reservas MASIC inicializado correctamente');
});

// === FLATPICKR - SELECTOR DE FECHAS ===
function initializeFlatpickr() {
    const fechaInput = document.getElementById('fecha');
    
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + CONFIG.MIN_DAYS_ADVANCE);
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + CONFIG.MAX_DAYS_ADVANCE);
    
    flatpickr(fechaInput, {
        locale: 'es',
        minDate: minDate,
        maxDate: maxDate,
        dateFormat: 'd/m/Y',
        altInput: true,
        altFormat: 'j \\de F \\de Y',
        disableMobile: false,
        onChange: function(selectedDates, dateStr, instance) {
            clearError('fecha');
        }
    });
}

// === EVENT LISTENERS ===
function initializeEventListeners() {
    const form = document.getElementById('reservaForm');
    const btnLimpiar = document.getElementById('btnLimpiar');
    
    // Submit del formulario
    form.addEventListener('submit', handleSubmit);
    
    // Botón limpiar
    btnLimpiar.addEventListener('click', limpiarFormulario);
    
    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearError(this.id);
        });
    });
    
    // Validación de número de pasajeros
    const pasajerosInput = document.getElementById('pasajeros');
    pasajerosInput.addEventListener('input', function() {
        if (this.value > CONFIG.MAX_PASSENGERS) {
            this.value = CONFIG.MAX_PASSENGERS;
        }
        if (this.value < CONFIG.MIN_PASSENGERS) {
            this.value = CONFIG.MIN_PASSENGERS;
        }
    });
}

// === VALIDACIÓN DE CAMPOS INDIVIDUALES ===
function validateField(field) {
    const fieldId = field.id;
    const fieldValue = field.value.trim();
    
    let isValid = true;
    let errorMessage = '';
    
    switch(fieldId) {
        case 'nombre':
            if (fieldValue.length < 3) {
                isValid = false;
                errorMessage = 'El nombre debe tener al menos 3 caracteres';
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
                isValid = false;
                errorMessage = 'Ingrese un email válido';
            }
            break;
            
        case 'telefono':
            const phoneRegex = /^[+]?[\d\s()-]{8,}$/;
            if (!phoneRegex.test(fieldValue)) {
                isValid = false;
                errorMessage = 'Ingrese un teléfono válido';
            }
            break;
            
        case 'fecha':
            if (!fieldValue) {
                isValid = false;
                errorMessage = 'Seleccione una fecha';
            }
            break;
            
        case 'horario':
            if (fieldValue.length < 3) {
                isValid = false;
                errorMessage = 'Ingrese un horario válido (ej: 09:00 - 10:30)';
            }
            break;
            
        case 'origen':
            if (fieldValue.length < 2) {
                isValid = false;
                errorMessage = 'Ingrese un origen válido';
            }
            break;
            
        case 'destino':
            if (fieldValue.length < 2) {
                isValid = false;
                errorMessage = 'Ingrese un destino válido';
            }
            break;
            
        case 'pasajeros':
            const numPasajeros = parseInt(fieldValue);
            if (isNaN(numPasajeros) || numPasajeros < CONFIG.MIN_PASSENGERS || numPasajeros > CONFIG.MAX_PASSENGERS) {
                isValid = false;
                errorMessage = `Cantidad de pasajeros debe estar entre ${CONFIG.MIN_PASSENGERS} y ${CONFIG.MAX_PASSENGERS}`;
            }
            break;
    }
    
    if (!isValid) {
        showError(fieldId, errorMessage);
    } else {
        clearError(fieldId);
    }
    
    return isValid;
}

// === VALIDACIÓN COMPLETA DEL FORMULARIO ===
function validateForm() {
    const form = document.getElementById('reservaForm');
    const requiredFields = ['nombre', 'email', 'telefono', 'fecha', 'horario', 'origen', 'destino', 'pasajeros'];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// === MOSTRAR ERROR ===
function showError(fieldId, message) {
    const errorElement = document.getElementById(`error-${fieldId}`);
    const formGroup = document.getElementById(fieldId).closest('.form-group');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    if (formGroup) {
        formGroup.classList.add('error');
    }
}

// === LIMPIAR ERROR ===
function clearError(fieldId) {
    const errorElement = document.getElementById(`error-${fieldId}`);
    const formGroup = document.getElementById(fieldId).closest('.form-group');
    
    if (errorElement) {
        errorElement.classList.remove('show');
    }
    
    if (formGroup) {
        formGroup.classList.remove('error');
    }
}

// === GENERAR CÓDIGO DE RESERVA ===
function generarCodigoReserva() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `RES-${timestamp}-${random}`;
}

// === OBTENER DATOS DEL FORMULARIO ===
function obtenerDatosFormulario() {
    const tipoViajeRadio = document.querySelector('input[name="tipoViaje"]:checked');
    
    return {
        codigoReserva: generarCodigoReserva(),
        timestamp: new Date().toISOString(),
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        fecha: document.getElementById('fecha').value,
        horario: document.getElementById('horario').value.trim(),
        origen: document.getElementById('origen').value.trim(),
        destino: document.getElementById('destino').value.trim(),
        pasajeros: parseInt(document.getElementById('pasajeros').value),
        tipoViaje: tipoViajeRadio ? tipoViajeRadio.value : 'Solo Ida',
        observaciones: document.getElementById('observaciones').value.trim(),
        estado: 'Pendiente'
    };
}

// === MANEJAR ENVÍO DEL FORMULARIO ===
async function handleSubmit(e) {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
        Swal.fire({
            icon: 'error',
            title: 'Formulario incompleto',
            text: 'Por favor complete todos los campos requeridos correctamente',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    // Verificar URL del script
    if (CONFIG.SCRIPT_URL === 'https://script.google.com/macros/s/AKfycbwOSSW33zw7iHgll8gwA7Pqmxs0_7utXPdnlq8d7DgO3tD11i_SBr_HPIfkA5xRTH_mNg/exec') {
        Swal.fire({
            icon: 'warning',
            title: 'Configuración pendiente',
            text: 'Por favor configure la URL del Google Apps Script en el archivo app.js',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    // Mostrar loading
    mostrarLoading(true);
    
    try {
        // Obtener datos
        const datos = obtenerDatosFormulario();
        
        // Enviar a Google Sheets
        const response = await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });
        
        // Mostrar confirmación (no-cors no permite leer response)
        mostrarLoading(false);
        
        await Swal.fire({
            icon: 'success',
            title: '¡Reserva Enviada!',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p><strong>Código de Reserva:</strong> ${datos.codigoReserva}</p>
                    <p><strong>Nombre:</strong> ${datos.nombre}</p>
                    <p><strong>Fecha:</strong> ${datos.fecha}</p>
                    <p><strong>Ruta:</strong> ${datos.origen} → ${datos.destino}</p>
                    <p><strong>Pasajeros:</strong> ${datos.pasajeros}</p>
                    <hr style="margin: 15px 0;">
                    <p style="color: #10b981; font-weight: 600;">
                        ✅ Recibirá confirmación por Email y WhatsApp
                    </p>
                    <p style="color: #64748b; font-size: 0.9rem; margin-top: 10px;">
                        Guarde su código de reserva para consultas
                    </p>
                </div>
            `,
            confirmButtonText: 'Entendido',
            allowOutsideClick: false
        });
        
        // Limpiar formulario
        limpiarFormulario();
        
    } catch (error) {
        console.error('Error al enviar reserva:', error);
        mostrarLoading(false);
        
        Swal.fire({
            icon: 'error',
            title: 'Error al enviar',
            text: 'Hubo un problema al procesar su reserva. Por favor intente nuevamente.',
            confirmButtonText: 'Entendido'
        });
    }
}

// === MOSTRAR/OCULTAR LOADING ===
function mostrarLoading(mostrar) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const btnEnviar = document.getElementById('btnEnviar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    
    if (mostrar) {
        loadingSpinner.classList.add('show');
        btnEnviar.disabled = true;
        btnLimpiar.disabled = true;
    } else {
        loadingSpinner.classList.remove('show');
        btnEnviar.disabled = false;
        btnLimpiar.disabled = false;
    }
}

// === LIMPIAR FORMULARIO ===
function limpiarFormulario() {
    Swal.fire({
        title: '¿Limpiar formulario?',
        text: "Se borrarán todos los datos ingresados",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('reservaForm').reset();
            
            // Limpiar todos los errores
            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(error => error.classList.remove('show'));
            
            const formGroups = document.querySelectorAll('.form-group.error');
            formGroups.forEach(group => group.classList.remove('error'));
            
            // Resetear pasajeros a 1
            document.getElementById('pasajeros').value = 1;
            
            // Mensaje de confirmación
            Swal.fire({
                icon: 'success',
                title: 'Formulario limpio',
                text: 'Puede ingresar una nueva reserva',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

// === FUNCIONES DE UTILIDAD ===

// Formatear teléfono (opcional - para uso futuro)
function formatearTelefono(telefono) {
    return telefono.replace(/\D/g, '');
}

// Validar si es mayor de edad (opcional - para uso futuro)
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return edad;
}

// === LOG DE DESARROLLO ===
console.log('%c🚌 Reservas MASIC v1.0', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%cSistema de Reservas de Transporte', 'color: #64748b; font-size: 14px;');
console.log('%c⚠️ IMPORTANTE: Configura CONFIG.SCRIPT_URL con tu URL de Google Apps Script', 'color: #f59e0b; font-weight: bold;');
