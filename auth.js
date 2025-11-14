/**
 * ============================================
 * AUTH.JS - Sistema de Autenticación Masic
 * ============================================
 * Funciones compartidas para gestión de sesiones
 * y autenticación en el frontend
 * 
 * IMPORTANTE: Este archivo debe ser incluido en TODAS
 * las páginas que requieran autenticación
 */

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================

const MASIC_AUTH_CONFIG = {
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzYLp4TWJPH5vfOuh4DAFvmoiE9K0kYMEGNC0exHHRxd_axnqsQBsp9sLOgDFGebvsp8w/exec',
    SESSION_KEY: 'masic_session',
    USER_KEY: 'masic_user',
    REMEMBER_KEY: 'masic_remember'
};

// ============================================
// GESTIÓN DE SESIÓN
// ============================================

/**
 * Obtiene el token de sesión actual
 * @returns {string|null} Token de sesión o null
 */
function obtenerSessionId() {
    return localStorage.getItem(MASIC_AUTH_CONFIG.SESSION_KEY);
}

/**
 * Obtiene los datos del usuario actual
 * @returns {object|null} Datos del usuario o null
 */
function obtenerUsuarioActual() {
    const userJson = localStorage.getItem(MASIC_AUTH_CONFIG.USER_KEY);
    if (!userJson) return null;
    
    try {
        return JSON.parse(userJson);
    } catch (e) {
        console.error('Error al parsear datos de usuario:', e);
        return null;
    }
}

/**
 * Guarda la sesión en localStorage
 * @param {object} sessionData - Datos de la sesión desde el servidor
 */
function guardarSesion(sessionData) {
    localStorage.setItem(MASIC_AUTH_CONFIG.SESSION_KEY, sessionData.sessionId);
    localStorage.setItem(MASIC_AUTH_CONFIG.USER_KEY, JSON.stringify({
        userId: sessionData.userId,
        nombre: sessionData.nombre,
        email: sessionData.email,
        rol: sessionData.rol,
        expiracion: sessionData.expiracion
    }));
}

/**
 * Elimina la sesión del localStorage
 */
function limpiarSesion() {
    localStorage.removeItem(MASIC_AUTH_CONFIG.SESSION_KEY);
    localStorage.removeItem(MASIC_AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(MASIC_AUTH_CONFIG.REMEMBER_KEY);
    sessionStorage.clear();
}

// ============================================
// VALIDACIÓN DE SESIÓN
// ============================================

/**
 * Verifica si hay una sesión activa válida
 * Redirige a login si no hay sesión válida
 * @param {boolean} redirigir - Si debe redirigir a login en caso de sesión inválida
 * @returns {Promise<object|null>} Datos del usuario si la sesión es válida
 */
async function validarSesionActiva(redirigir = true) {
    const sessionId = obtenerSessionId();
    
    if (!sessionId) {
        if (redirigir) {
            redirigirALogin();
        }
        return null;
    }
    
    try {
        const response = await fetch(MASIC_AUTH_CONFIG.SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accion: 'validarSesion',
                datos: {
                    sessionId: sessionId
                }
            })
        });
        
        const resultado = await response.json();
        
        if (resultado.valida) {
            return resultado.usuario;
        } else {
            limpiarSesion();
            if (redirigir) {
                redirigirALogin();
            }
            return null;
        }
        
    } catch (error) {
        console.error('Error al validar sesión:', error);
        if (redirigir) {
            mostrarError('Error de conexión. Por favor recarga la página.');
        }
        return null;
    }
}

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string|array} rolesPermitidos - Rol o array de roles permitidos
 * @returns {boolean} True si el usuario tiene el rol
 */
function tieneRol(rolesPermitidos) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return false;
    
    if (Array.isArray(rolesPermitidos)) {
        return rolesPermitidos.includes(usuario.rol);
    }
    
    return usuario.rol === rolesPermitidos;
}

/**
 * Verifica si el usuario tiene permiso para una acción
 * @param {string} accion - Acción a verificar
 * @returns {Promise<boolean>} True si tiene permiso
 */
async function tienePermiso(accion) {
    const sessionId = obtenerSessionId();
    if (!sessionId) return false;
    
    try {
        const response = await fetch(MASIC_AUTH_CONFIG.SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accion: 'verificarPermiso',
                datos: {
                    sessionId: sessionId,
                    accion: accion
                }
            })
        });
        
        const resultado = await response.json();
        return resultado.permitido;
        
    } catch (error) {
        console.error('Error al verificar permiso:', error);
        return false;
    }
}

// ============================================
// CERRAR SESIÓN
// ============================================

/**
 * Cierra la sesión actual
 * @param {boolean} redirigir - Si debe redirigir a login después
 */
async function cerrarSesion(redirigir = true) {
    const sessionId = obtenerSessionId();
    
    if (sessionId) {
        try {
            await fetch(MASIC_AUTH_CONFIG.SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accion: 'cerrarSesion',
                    datos: {
                        sessionId: sessionId
                    }
                })
            });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
    
    limpiarSesion();
    
    if (redirigir) {
        redirigirALogin();
    }
}

// ============================================
// NAVEGACIÓN
// ============================================

/**
 * Redirige a la página de login
 */
function redirigirALogin() {
    window.location.href = 'login.html';
}

/**
 * Redirige al sistema de reservas
 */
function redirigirAReservas() {
    window.location.href = 'index.html';
}

/**
 * Redirige al panel de admin
 */
function redirigirAPanelAdmin() {
    window.location.href = 'panel-admin.html';
}

// ============================================
// UI HELPERS
// ============================================

/**
 * Muestra un mensaje de error en pantalla
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarError(mensaje) {
    // Buscar contenedor de alertas
    let alertContainer = document.getElementById('alertContainer');
    
    // Si no existe, crearlo
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.right = '20px';
        alertContainer.style.zIndex = '10000';
        document.body.appendChild(alertContainer);
    }
    
    const alert = document.createElement('div');
    alert.style.cssText = `
        background: #fee;
        color: #c33;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid #c33;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
    `;
    alert.textContent = mensaje;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

/**
 * Muestra un mensaje de éxito en pantalla
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarExito(mensaje) {
    let alertContainer = document.getElementById('alertContainer');
    
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.right = '20px';
        alertContainer.style.zIndex = '10000';
        document.body.appendChild(alertContainer);
    }
    
    const alert = document.createElement('div');
    alert.style.cssText = `
        background: #e8f5e9;
        color: #2e7d32;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid #2e7d32;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
    `;
    alert.textContent = mensaje;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

/**
 * Crea un header de usuario con logout
 * @param {string} containerId - ID del contenedor donde insertar el header
 */
function crearHeaderUsuario(containerId = 'userHeader') {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return;
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Contenedor de header no encontrado:', containerId);
        return;
    }
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: linear-gradient(135deg, #0487a8 0%, #036a82 100%); color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div>
                    <div style="font-weight: 600; font-size: 15px;">${usuario.nombre}</div>
                    <div style="font-size: 13px; opacity: 0.9;">${usuario.rol} - ${usuario.email}</div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                ${usuario.rol === 'Admin' ? `
                    <button onclick="redirigirAPanelAdmin()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s;">
                        👥 Panel Admin
                    </button>
                ` : ''}
                <button onclick="cerrarSesion()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s;">
                    🚪 Cerrar Sesión
                </button>
            </div>
        </div>
    `;
}

/**
 * Oculta elementos según el rol del usuario
 * @param {string} selector - Selector CSS de los elementos a evaluar
 */
function aplicarPermisosPorRol(selector = '[data-rol]') {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return;
    
    const elementos = document.querySelectorAll(selector);
    
    elementos.forEach(elemento => {
        const rolesPermitidos = elemento.getAttribute('data-rol').split(',').map(r => r.trim());
        
        if (!rolesPermitidos.includes(usuario.rol)) {
            elemento.style.display = 'none';
        }
    });
}

// ============================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================

/**
 * Inicializa el sistema de autenticación en una página
 * Llama a esta función al cargar la página
 * @param {object} opciones - Opciones de configuración
 */
async function inicializarAuth(opciones = {}) {
    const config = {
        requiereAuth: true,
        rolesPermitidos: null,
        crearHeader: false,
        containerId: 'userHeader',
        aplicarPermisos: false,
        ...opciones
    };
    
    if (!config.requiereAuth) {
        return;
    }
    
    // Validar sesión
    const usuario = await validarSesionActiva(true);
    
    if (!usuario) {
        return; // Ya redirigió a login
    }
    
    // Verificar roles permitidos
    if (config.rolesPermitidos && !tieneRol(config.rolesPermitidos)) {
        mostrarError('No tienes permisos para acceder a esta página');
        setTimeout(() => {
            redirigirAReservas();
        }, 2000);
        return;
    }
    
    // Crear header si se solicitó
    if (config.crearHeader) {
        crearHeaderUsuario(config.containerId);
    }
    
    // Aplicar permisos por rol
    if (config.aplicarPermisos) {
        aplicarPermisosPorRol();
    }
    
    return usuario;
}

// ============================================
// PROTECCIÓN DE PÁGINAS
// ============================================

/**
 * Protege una página verificando autenticación al cargar
 * Uso: Agregar al inicio del script de cualquier página protegida
 * @param {object} opciones - Opciones de protección
 */
function protegerPagina(opciones = {}) {
    const config = {
        rolesPermitidos: null,
        ...opciones
    };
    
    window.addEventListener('DOMContentLoaded', async function() {
        await inicializarAuth({
            requiereAuth: true,
            rolesPermitidos: config.rolesPermitidos,
            crearHeader: false,
            aplicarPermisos: true
        });
    });
}

// ============================================
// EXPORTAR FUNCIONES PRINCIPALES
// ============================================

// Si se usa como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        obtenerSessionId,
        obtenerUsuarioActual,
        guardarSesion,
        limpiarSesion,
        validarSesionActiva,
        tieneRol,
        tienePermiso,
        cerrarSesion,
        redirigirALogin,
        redirigirAReservas,
        redirigirAPanelAdmin,
        mostrarError,
        mostrarExito,
        crearHeaderUsuario,
        aplicarPermisosPorRol,
        inicializarAuth,
        protegerPagina,
        MASIC_AUTH_CONFIG
    };
}

// ============================================
// AUTO-INICIALIZACIÓN OPCIONAL
// ============================================

/**
 * Si la página tiene el atributo data-require-auth en el body,
 * se inicializa automáticamente
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInicializar);
} else {
    autoInicializar();
}

function autoInicializar() {
    const body = document.body;
    if (!body) return;
    
    const requiereAuth = body.getAttribute('data-require-auth') === 'true';
    const rolesPermitidos = body.getAttribute('data-roles-permitidos');
    const crearHeader = body.getAttribute('data-crear-header') === 'true';
    
    if (requiereAuth) {
        inicializarAuth({
            requiereAuth: true,
            rolesPermitidos: rolesPermitidos ? rolesPermitidos.split(',').map(r => r.trim()) : null,
            crearHeader: crearHeader,
            aplicarPermisos: true
        });
    }
}

console.log('✅ Auth.js cargado correctamente');
