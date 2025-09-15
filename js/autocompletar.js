
/**
 * autocompletado-usuarios.js
 * Sistema de autocompletado para formulario
 *
 */

(function() {
    'use strict';

    // Configuración del módulo
    const CONFIG = {
        DEBOUNCE_TIME: 500,
        STORAGE_KEY: 'saludagenda_usuarios',
        LOADING_DELAY: 300,
        ALERT_DURATION: 5000
    };

    // Variables globales del módulo
    let debounceTimer = null;
    let usuarioEncontrado = false;

    /**
     * Inicialización del módulo cuando el DOM esté listo
     */
    function init() {
        // Verificar que estemos en la página correcta
        const correoField = document.getElementById('correo');
        if (!correoField) {
            console.log('Autocompletado: Campo de correo no encontrado, módulo no inicializado');
            return;
        }

        console.log('Autocompletado: Inicializando módulo...');
        
        // Crear elementos de UI necesarios
        createUIElements();
        
        // Configurar event listeners
        setupEventListeners();
        
        console.log('Autocompletado: Módulo inicializado correctamente');
    }

    /**
     * Crear elementos de interfaz necesarios para el autocompletado
     */
    function createUIElements() {
        const correoField = document.getElementById('correo');
        const correoContainer = correoField.closest('.col-md-6') || correoField.parentElement;

        // Crear indicador de carga
        if (!document.getElementById('autocompletado-loading')) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'autocompletado-loading';
            loadingIndicator.className = 'd-none mt-2';
            loadingIndicator.innerHTML = `
                <div class="d-flex align-items-center text-primary">
                    <div class="spinner-border spinner-border-sm me-2" role="status">
                        <span class="visually-hidden">Verificando usuario...</span>
                    </div>
                    <small>Verificando datos del usuario...</small>
                </div>
            `;
            correoContainer.appendChild(loadingIndicator);
        }

        // Crear alerta de usuario encontrado
        if (!document.getElementById('autocompletado-alerta-encontrado')) {
            const alertaEncontrado = document.createElement('div');
            alertaEncontrado.id = 'autocompletado-alerta-encontrado';
            alertaEncontrado.className = 'alert alert-info d-none mt-2';
            alertaEncontrado.innerHTML = `
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong>¡Usuario encontrado!</strong> Datos completados automáticamente.
                <button type="button" class="btn-close" onclick="AutocompletadoUsuarios.ocultarAlerta('autocompletado-alerta-encontrado')"></button>
            `;
            correoContainer.appendChild(alertaEncontrado);
        }

        // Crear alerta de usuario nuevo
        if (!document.getElementById('autocompletado-alerta-nuevo')) {
            const alertaNuevo = document.createElement('div');
            alertaNuevo.id = 'autocompletado-alerta-nuevo';
            alertaNuevo.className = 'alert alert-warning d-none mt-2';
            alertaNuevo.innerHTML = `
                <i class="bi bi-info-circle-fill me-2"></i>
                Este correo no está registrado. Complete sus datos personales.
                <button type="button" class="btn-close" onclick="AutocompletadoUsuarios.ocultarAlerta('autocompletado-alerta-nuevo')"></button>
            `;
            correoContainer.appendChild(alertaNuevo);
        }
    }

    /**
     * Configurar todos los event listeners necesarios
     */
    function setupEventListeners() {
        const correoField = document.getElementById('correo');
        
        if (correoField) {
            // Evento principal de autocompletado
            correoField.addEventListener('input', handleCorreoInput);
            correoField.addEventListener('blur', handleCorreoBlur);
            
            console.log('Autocompletado: Event listeners configurados en campo de correo');
        }

        // Formatear teléfono si existe
        const telefonoField = document.getElementById('telefono');
        if (telefonoField) {
            telefonoField.addEventListener('input', formatearTelefono);
        }
    }

    /**
     * Manejar cambios en el campo de correo
     */
    function handleCorreoInput(e) {
        const correo = e.target.value.trim();
        
        // Limpiar timer anterior
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Ocultar alertas
        ocultarTodasLasAlertas();
        
        // Si está vacío, limpiar campos
        if (!correo) {
            limpiarCamposAutocompletados();
            return;
        }

        // Validar formato antes de buscar
        if (!isValidEmail(correo)) {
            return;
        }

        // Aplicar debounce
        debounceTimer = setTimeout(() => {
            buscarUsuario(correo, false);
        }, CONFIG.DEBOUNCE_TIME);
    }

    /**
     * Manejar cuando el campo pierde el foco
     */
    function handleCorreoBlur(e) {
        const correo = e.target.value.trim();
        if (correo && isValidEmail(correo)) {
            buscarUsuario(correo, true);
        }
    }

    /**
     * Buscar usuario en localStorage
     */
    function buscarUsuario(correo, mostrarAlerta = false) {
        if (mostrarAlerta) {
            mostrarCarga(true);
        }

        // Simular delay para mejor UX
        setTimeout(() => {
            try {
                const usuario = obtenerUsuarioPorCorreo(correo);
                
                if (usuario) {
                    autocompletarDatos(usuario);
                    usuarioEncontrado = true;
                    
                    if (mostrarAlerta) {
                        mostrarAlerta('autocompletado-alerta-encontrado');
                    }
                    
                    console.log('Autocompletado: Usuario encontrado y datos completados');
                } else {
                    limpiarCamposAutocompletados();
                    usuarioEncontrado = false;
                    
                    if (mostrarAlerta) {
                        mostrarAlerta('autocompletado-alerta-nuevo');
                    }
                    
                    console.log('Autocompletado: Usuario no encontrado');
                }
                
                // Disparar evento personalizado
                dispatchAutocompletadoEvent(correo, usuario);
                
            } catch (error) {
                console.error('Autocompletado: Error al buscar usuario:', error);
                usuarioEncontrado = false;
            } finally {
                mostrarCarga(false);
            }
        }, mostrarAlerta ? CONFIG.LOADING_DELAY : 0);
    }

    /**
     * Autocompletar datos del usuario encontrado
     */
    function autocompletarDatos(usuario) {
        // Mapeo de campos según el formulario
        const camposMapeados = mapearCamposUsuario(usuario);
        
        // Autocompletar con animación
        Object.entries(camposMapeados).forEach(([fieldId, valor], index) => {
            setTimeout(() => {
                const campo = document.getElementById(fieldId);
                if (campo && valor) {
                    campo.value = valor;
                    
                    // Efecto visual
                    campo.classList.add('is-valid');
                    setTimeout(() => {
                        campo.classList.remove('is-valid');
                    }, 2000);
                }
            }, index * 100); // Animación escalonada
        });
    }

    /**
     * Mapear campos del usuario según el tipo de formulario
     */
    function mapearCamposUsuario(usuario) {
        const campos = {};
        
        // Campo nombre (puede ser completo o separado)
        const nombreField = document.getElementById('nombre');
        if (nombreField) {
            let nombreCompleto = usuario.nombre || '';
            if (usuario.apellidoPaterno) {
                nombreCompleto += ' ' + usuario.apellidoPaterno;
            }
            if (usuario.apellidoMaterno) {
                nombreCompleto += ' ' + usuario.apellidoMaterno;
            }
            campos.nombre = nombreCompleto.trim();
        }

        // Apellidos separados (si existen los campos)
        const apellidoPaternoField = document.getElementById('apellidoPaterno');
        if (apellidoPaternoField && usuario.apellidoPaterno) {
            campos.apellidoPaterno = usuario.apellidoPaterno;
        }

        const apellidoMaternoField = document.getElementById('apellidoMaterno');
        if (apellidoMaternoField && usuario.apellidoMaterno) {
            campos.apellidoMaterno = usuario.apellidoMaterno;
        }

        // Teléfono
        if (usuario.telefono) {
            campos.telefono = usuario.telefono;
        }

        return campos;
    }

    /**
     * Limpiar campos que fueron autocompletados
     */
    function limpiarCamposAutocompletados() {
        const camposALimpiar = ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'telefono'];
        
        camposALimpiar.forEach(fieldId => {
            const campo = document.getElementById(fieldId);
            if (campo) {
                campo.value = '';
                campo.classList.remove('is-valid', 'is-invalid');
            }
        });
    }

    /**
     * Obtener usuario por correo electrónico
     */
    function obtenerUsuarioPorCorreo(correo) {
        try {
            // Primero intentar usar la función global si existe
            if (window.SaludAgenda && typeof window.SaludAgenda.obtenerUsuarioPorCorreo === 'function') {
                return window.SaludAgenda.obtenerUsuarioPorCorreo(correo);
            }
            
            // Fallback: buscar directamente en localStorage
            const usuarios = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
            return usuarios.find(usuario => 
                usuario.correo && usuario.correo.toLowerCase() === correo.toLowerCase()
            );
        } catch (error) {
            console.error('Autocompletado: Error al obtener usuario:', error);
            return null;
        }
    }

    /**
     * Formatear campo de teléfono
     */
    function formatearTelefono(e) {
        let valor = e.target.value.replace(/[^0-9]/g, '');
        if (valor.length > 10) {
            valor = valor.substring(0, 10);
        }
        e.target.value = valor;
    }

    /**
     * Validar formato de email
     */
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Mostrar/ocultar indicador de carga
     */
    function mostrarCarga(mostrar) {
        const loading = document.getElementById('autocompletado-loading');
        if (loading) {
            loading.classList.toggle('d-none', !mostrar);
        }
    }

    /**
     * Mostrar alerta específica
     */
    function mostrarAlerta(alertaId) {
        const alerta = document.getElementById(alertaId);
        if (alerta) {
            alerta.classList.remove('d-none');
            
            // Auto-ocultar después de un tiempo
            setTimeout(() => {
                alerta.classList.add('d-none');
            }, CONFIG.ALERT_DURATION);
        }
    }

    /**
     * Ocultar todas las alertas
     */
    function ocultarTodasLasAlertas() {
        const alertas = [
            'autocompletado-alerta-encontrado',
            'autocompletado-alerta-nuevo'
        ];
        
        alertas.forEach(alertaId => {
            const alerta = document.getElementById(alertaId);
            if (alerta) {
                alerta.classList.add('d-none');
            }
        });
    }

    /**
     * Ocultar alerta específica (función pública)
     */
    function ocultarAlerta(alertaId) {
        const alerta = document.getElementById(alertaId);
        if (alerta) {
            alerta.classList.add('d-none');
        }
    }

    /**
     * Disparar evento personalizado de autocompletado
     */
    function dispatchAutocompletadoEvent(correo, usuario) {
        const evento = new CustomEvent('autocompletadoUsuario', {
            detail: {
                correo: correo,
                usuario: usuario,
                encontrado: !!usuario
            }
        });
        document.dispatchEvent(evento);
    }

    /**
     * API Pública del módulo
     */
    const AutocompletadoAPI = {
        // Función para ocultar alertas (llamada desde HTML)
        ocultarAlerta: ocultarAlerta,
        
        // Verificar si un usuario fue encontrado
        isUsuarioEncontrado: function() {
            return usuarioEncontrado;
        },
        
        // Buscar usuario manualmente
        buscarUsuario: function(correo) {
            if (isValidEmail(correo)) {
                return obtenerUsuarioPorCorreo(correo);
            }
            return null;
        },
        
        // Limpiar autocompletado
        limpiar: function() {
            limpiarCamposAutocompletados();
            ocultarTodasLasAlertas();
            usuarioEncontrado = false;
        },
        
        // Configurar evento personalizado
        onAutocompletado: function(callback) {
            document.addEventListener('autocompletadoUsuario', callback);
        }
    };

    // Exponer API globalmente
    window.AutocompletadoUsuarios = AutocompletadoAPI;

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
