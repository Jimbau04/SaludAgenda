// === registro.js ===

    function mostrarPopup(mensaje) {
            // Crear contenedor principal
            const popup = document.createElement("div");
            popup.className = "popup";
            popup.innerHTML = `
                <div class="popup-content">
                    <p>${mensaje}</p>
                    <button class="popup-btn">Cerrar</button>
                </div>
            `;

            // Evento cerrar
            const btn = popup.querySelector(".popup-btn");
            btn.addEventListener("click", () => popup.remove());

            // Agregar al body
            document.body.appendChild(popup);
    }

    function mostrarConfirmacion(mensaje, onConfirm) {
        const popup = document.createElement("div");
        popup.className = "popup";
        popup.innerHTML = `
            <div class="popup-content">
                <p>${mensaje}</p>
                <div style="margin-top:12px;">
                    <button class="popup-btn btn-confirmar" style="background: linear-gradient(90deg, #415c76, #3498db);">Sí</button>
                    <button class="popup-btn btn-cancelar">No</button>
                </div>
            </div>
        `;

        // estilos adicionales a los botones
        const btnConfirmar = popup.querySelector(".btn-confirmar");
       
        btnConfirmar.style.marginRight = "8px";

        const btnCancelar = popup.querySelector(".btn-cancelar");
        btnCancelar.style.background = "#6c757d"; // gris

        // Acción de confirmar
        btnConfirmar.addEventListener("click", () => {
            popup.remove();
            if (typeof onConfirm === "function") onConfirm();
        });

        // Acción de cancelar
        btnCancelar.addEventListener("click", () => {
            popup.remove();
        });

        document.body.appendChild(popup);
    }
class RegistroUsuarios {
    constructor() {
        this.form = document.getElementById("formRegistro");
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener("submit", (e) => this.handleSubmit(e));
        
        // Validar fecha mínima en tiempo real
        const fechaInput = document.getElementById("fecha");
        if (fechaInput) {
            fechaInput.addEventListener("input", (e) => {
                const hoy = new Date().toISOString().split("T")[0];
                e.target.min = hoy;
                if (e.target.value < hoy) {
                    e.target.value = hoy;
                }
            });
        }

        // Validar teléfono en tiempo real
        document.getElementById("telefono").addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        });

        // Validar que el correo no esté duplicado en tiempo real
        document.getElementById("correo").addEventListener("blur", (e) => {
            this.validarCorreoDuplicado(e.target.value);
        });
    }

    validarCorreoDuplicado(correo) {
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const correoExiste = usuarios.some(u => u.correo === correo);
        
        const correoInput = document.getElementById("correo");
        const feedbackDiv = document.getElementById("correo-feedback") || this.crearFeedbackDiv(correoInput);
        
        if (correoExiste) {
            correoInput.classList.add("is-invalid");
            feedbackDiv.textContent = "Este correo ya está registrado";
            feedbackDiv.className = "invalid-feedback d-block";
            return false;
        } else if (correo && this.validarFormatoCorreo(correo)) {
            correoInput.classList.remove("is-invalid");
            correoInput.classList.add("is-valid");
            feedbackDiv.textContent = "Correo disponible";
            feedbackDiv.className = "valid-feedback d-block";
            return true;
        } else {
            correoInput.classList.remove("is-invalid", "is-valid");
            feedbackDiv.className = "invalid-feedback";
            return false;
        }
    }

    crearFeedbackDiv(input) {
        const feedbackDiv = document.createElement("div");
        feedbackDiv.id = "correo-feedback";
        input.parentNode.appendChild(feedbackDiv);
        return feedbackDiv;
    }

    validarFormatoCorreo(correo) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    }

    validarFormulario() {
        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const telefono = document.getElementById("telefono").value.trim();

        // Validación de campos obligatorios para registro de usuario
        if (!nombre || !correo || !telefono) {
            this.mostrarError("Todos los campos son obligatorios");
            return false;
        }

        // Validación de nombre (solo letras y espacios)
        if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(nombre)) {
            this.mostrarError("El nombre solo debe contener letras");
            return false;
        }

        // Validación de correo
        if (!this.validarFormatoCorreo(correo)) {
            this.mostrarError("Ingrese un correo electrónico válido");
            return false;
        }

        // Validar que el correo no esté duplicado
        if (!this.validarCorreoDuplicado(correo)) {
            this.mostrarError("Este correo ya está registrado");
            return false;
        }

        // Validación de teléfono
        if (!/^[0-9]{8,10}$/.test(telefono)) {
            this.mostrarError("El teléfono debe tener entre 8 y 10 dígitos");
            return false;
        }

        // Si hay campos de cita (especialidad, fecha, hora, motivo), validarlos también
        const especialidad = document.getElementById("especialidad");
        const fecha = document.getElementById("fecha");
        const hora = document.getElementById("hora");
        const motivo = document.getElementById("motivo");

        if (especialidad && fecha && hora && motivo) {
            if (!especialidad.value || !fecha.value || !hora.value || !motivo.value.trim()) {
                this.mostrarError("Todos los campos de la cita son obligatorios");
                return false;
            }

            // Validación de fecha
            const fechaSeleccionada = new Date(fecha.value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            if (fechaSeleccionada < hoy) {
                this.mostrarError("No se permiten fechas pasadas");
                return false;
            }
        }

        return true;
    }

    mostrarError(mensaje) {
        // Si hay SweetAlert2 disponible, usarlo
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error de validación',
                text: mensaje,
                confirmButtonColor: '#0d6efd'
            });
        } else {
            mostrarPopup("⚠️ " + mensaje);
        }
    }

    mostrarExito(mensaje) {
        // Si hay SweetAlert2 disponible, usarlo
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: mensaje,
                confirmButtonColor: '#198754'
            });
        } else {
            mostrarPopup("✅ " + mensaje);
        }
    }

    guardarUsuario(usuario) {
        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        usuarios.push(usuario);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    guardarCita(datos) {
        let citas = JSON.parse(localStorage.getItem("citas")) || [];
        citas.push(datos);
        localStorage.setItem("citas", JSON.stringify(citas));
    }

    handleSubmit(event) {
        event.preventDefault();

        if (!this.validarFormulario()) return;

        // Crear objeto usuario
        const usuario = {
            id: Date.now(),
            nombre: document.getElementById("nombre").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            telefono: document.getElementById("telefono").value.trim(),
            fechaRegistro: new Date().toISOString()
        };

        // Guardar usuario
        this.guardarUsuario(usuario);

        // Si hay campos de cita, crear y guardar la cita también
        const especialidad = document.getElementById("especialidad");
        const fecha = document.getElementById("fecha");
        const hora = document.getElementById("hora");
        const motivo = document.getElementById("motivo");

        if (especialidad && fecha && hora && motivo && 
            especialidad.value && fecha.value && hora.value && motivo.value.trim()) {
            
            const cita = {
                id: Date.now() + 1, // Asegurar ID único
                nombre: usuario.nombre,
                correo: usuario.correo,
                telefono: usuario.telefono,
                especialidad: especialidad.value,
                fecha: fecha.value + "T" + hora.value, // Combinar fecha y hora
                motivo: motivo.value.trim(),
                estatus: "Activa",
                fechaCreacion: new Date().toISOString()
            };

            this.guardarCita(cita);
            this.mostrarExito("Usuario registrado y cita agendada correctamente. ID de cita: " + cita.id);
        } else {
            mostrarConfirmacion(
                "✅Usuario registrado correctamente. Ahora puedes agendar citas en la sección correspondiente. ¿Deseas ir a la página de citas?",
                () => {
                    // Si el usuario confirma
                    window.location.href = "citas.html";
                }
            );
        }

        // Limpiar formulario
        this.form.reset();
        
        // Limpiar validaciones visuales
        document.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
            el.classList.remove('is-valid', 'is-invalid');
        });

        // Opcional: Redirigir a la página de citas después de un delay
        
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    new RegistroUsuarios();
});