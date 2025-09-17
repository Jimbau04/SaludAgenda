// Variables globales
let selectedSpecialty = '';
let currentUser = null;
let editingCitaId = null;

// Manejo de tabs
function openTab(evt, tabName) {
    document.querySelectorAll(".tabcontent").forEach(tc => {
        tc.classList.remove("active");
        tc.style.display = "none";
    });
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

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



// Verificar si el usuario está registrado
function verificarUsuario() {
    const email = document.getElementById('correoVerificacion').value.trim();
    
    if (!email) {
        mostrarPopup('Por favor ingresa tu correo electrónico');
        return;
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarPopup('Por favor ingresa un correo electrónico válido');
        return;
    }

    // Buscar en usuarios registrados
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.correo === email);

    if (usuario) {
        // Usuario encontrado
        currentUser = usuario;
        mostrarUsuarioVerificado(usuario);
        mostrarFormularioCita();
        ocultarAlertaRegistro();
    } else {
        // Usuario no encontrado
        currentUser = null;
        ocultarUsuarioVerificado();
        ocultarFormularioCita();
        mostrarAlertaRegistro();
    }
}

function mostrarUsuarioVerificado(usuario) {
    const userInfo = document.getElementById('user-info');
    const userDetails = document.getElementById('user-details');
    
    userDetails.innerHTML = `
        <p><i class="bi bi-person"></i> <strong>Nombre:</strong> ${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}</p>
        <p><i class="bi bi-envelope"></i> <strong>Correo:</strong> ${usuario.correo}</p>
        <p><i class="bi bi-telephone"></i> <strong>Teléfono:</strong> ${usuario.telefono}</p>
    `;
    
    userInfo.style.display = 'block';
}

function ocultarUsuarioVerificado() {
    document.getElementById('user-info').style.display = 'none';
}

function mostrarFormularioCita() {
    document.getElementById('cita-form-container').style.display = 'block';
}

function ocultarFormularioCita() {
    document.getElementById('cita-form-container').style.display = 'none';
    // Limpiar selección de especialidad
    selectedSpecialty = '';
    document.querySelectorAll('.specialty-card').forEach(c => c.classList.remove('selected'));
}

function mostrarAlertaRegistro() {
    document.getElementById('registration-alert').style.display = 'block';
}

function ocultarAlertaRegistro() {
    document.getElementById('registration-alert').style.display = 'none';
}

// Manejo de selección de especialidades
document.querySelectorAll('.specialty-card').forEach(card => {
    card.addEventListener('click', function() {
        if (!currentUser) return;
        
        // Remover selección previa
        document.querySelectorAll('.specialty-card').forEach(c => c.classList.remove('selected'));
        
        // Seleccionar nueva especialidad
        this.classList.add('selected');
        selectedSpecialty = this.dataset.specialty;
        document.getElementById('especialidadSelect').value = selectedSpecialty;
        document.getElementById('especialidadError').style.display = 'none';
    });
});

// Validación y envío del formulario de cita
document.getElementById("formCita").addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        mostrarPopup('Primero debes verificar tu correo electrónico');
        return;
    }
    
    // Validar especialidad seleccionada
    if (!selectedSpecialty) {
        document.getElementById('especialidadError').style.display = 'block';
        document.querySelector('.specialty-grid').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    const cita = {
        id: Date.now(),
        nombre: currentUser.nombre + (currentUser.apellidoP ? " " + currentUser.apellidoP : ""),
        correo: currentUser.correo,
        telefono: currentUser.telefono,
        especialidad: document.getElementById("especialidadSelect").value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value,
        motivo: document.getElementById("motivo").value.trim(),
        estatus: "Activa",
        fechaCreacion: new Date().toISOString()
    };

    const citaDateTime = new Date(`${cita.fecha}T${cita.hora}`);
    const ahora = new Date();

    if (citaDateTime < ahora) {
        mostrarPopup("⚠️ La fecha y hora no pueden ser pasadas.");
        return;
    }

    let citas = JSON.parse(localStorage.getItem("citas")) || [];
    citas.push(cita);
    localStorage.setItem("citas", JSON.stringify(citas));
    
    // Mostrar mensaje de éxito con animación
    const btn = e.target.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> ¡Guardado!';
    btn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    
    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.style.background = '';
        mostrarPopup("✅ Cita guardada con éxito. Folio: " + cita.id);
        document.getElementById("fecha").value = '';
        document.getElementById("motivo").value = '';
        selectedSpecialty = '';
        document.querySelectorAll('.specialty-card').forEach(c => c.classList.remove('selected'));
    }, 1500);
});

// Consultar citas - Nueva función mejorada
document.getElementById("formConsultar").addEventListener("submit", function(e) {
    e.preventDefault();
    aplicarFiltros();
});

function aplicarFiltros() {
    const correo = document.getElementById("consultaCorreo").value.trim().toLowerCase();
    const especialidad = document.getElementById("filtroEspecialidad").value;
    const estatus = document.getElementById("filtroEstatus").value;
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    let citas = JSON.parse(localStorage.getItem("citas")) || [];

    const filtradas = citas.filter(cita => {
        const citaFecha = new Date(cita.fecha).getTime();

        const cumpleCorreo = !correo || cita.correo.toLowerCase().includes(correo);
        const cumpleEspecialidad = !especialidad || cita.especialidad === especialidad;
        const cumpleEstatus = !estatus || cita.estatus === estatus;
        const cumpleFechaInicio = !fechaInicio || citaFecha >= new Date(fechaInicio + 'T00:00:00').getTime();
        const cumpleFechaFin = !fechaFin || citaFecha <= new Date(fechaFin  + 'T23:59:59').getTime();

        return cumpleCorreo && cumpleEspecialidad && cumpleEstatus && cumpleFechaInicio && cumpleFechaFin;
    });

    mostrarCitas(filtradas);
}


function cargarTodasLasCitas() {
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    mostrarCitas(citas);
}


function mostrarCitas(citas) {
    const tbody = document.getElementById("resultadoCitas");
    const cardsContainer = document.getElementById("resultadoCitasCards");

    tbody.innerHTML = "";
    cardsContainer.innerHTML = "";

    if (citas.length === 0) {
        const emptyHtml = `
            <div class="text-center py-4">
                <i class="bi bi-search" style="font-size: 3rem; color: #6c757d;"></i>
                <p class="text-muted mt-2">No se encontraron citas con los criterios especificados.</p>
            </div>
        `;
        tbody.innerHTML = `<tr><td colspan="8">${emptyHtml}</td></tr>`;
        cardsContainer.innerHTML = emptyHtml;
        return;
    }

    citas.forEach(cita => {
        const estatusFinal = cita.estatus;
        const badgeClass = getStatusBadgeClass(estatusFinal);

        const acciones = estatusFinal !== "Cancelada" && estatusFinal !== "Confirmada" ? `
            <div class="btn-group" role="group">
                <button class="btn btn-warning btn-sm" onclick="modificarCita(${cita.id})" title="Modificar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-info btn-sm" onclick="cambiarEstatus(${cita.id}, 'Confirmada')" title="Confirmar">
                    <i class="bi bi-check-circle"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="cancelarCita(${cita.id})" title="Cancelar">
                    <i class="bi bi-x-circle"></i>
                </button>
            </div>
        ` : '<span class="text-muted">Sin acciones</span>';

        // Vista tabla
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${cita.id}</strong></td>
            <td>${cita.nombre}</td>
            <td>${cita.correo}</td>
            <td>
                <span class="d-flex align-items-center">
                    ${getSpecialtyIcon(cita.especialidad)}
                    <span class="ms-2">${cita.especialidad}</span>
                </span>
            </td>
            <td>${formatDateOnly(cita.fecha)}</td>
            <td>${cita.hora}</td>
            <td><span class="badge ${badgeClass}">${estatusFinal}</span></td>
            <td>${acciones}</td>
        `;
        tbody.appendChild(row);

        // Vista card
        const card = document.createElement("div");
        card.className = "cita-card";
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h5><i class="bi bi-ticket-detailed"></i> Folio: ${cita.id}</h5>
                    <span class="badge ${badgeClass}">${estatusFinal}</span>
                </div>
                <div class="specialty-icon" style="font-size: 2rem;">
                    ${getSpecialtyIcon(cita.especialidad)}
                </div>
            </div>

            <div class="row">
                <div class="col-6">
                    <p><strong><i class="bi bi-hospital"></i> Especialidad:</strong> ${cita.especialidad}</p>
                    <p><strong><i class="bi bi-calendar-date"></i> Fecha:</strong> ${cita.fecha.split("T")[0]}</p>
                    <p><strong><i class="bi bi-clock"></i> Hora:</strong> ${cita.hora}</p>
                </div>
                <div class="col-6">
                    <p><strong><i class="bi bi-person"></i> Nombre:</strong> ${cita.nombre}</p>
                    <p><strong><i class="bi bi-telephone"></i> Teléfono:</strong> ${cita.telefono}</p>
                </div>
            </div>

            <p><strong><i class="bi bi-chat-square-text"></i> Motivo:</strong> ${cita.motivo}</p>

            <div class="mt-3">
                ${estatusFinal !== "Cancelada" && estatusFinal !== "Confirmada" ? `
                    <button class="btn btn-warning btn-sm me-2" onclick="modificarCita(${cita.id})">
                        <i class="bi bi-pencil"></i> Modificar
                    </button>
                    <button class="btn btn-info btn-sm me-2" onclick="cambiarEstatus(${cita.id}, 'Confirmada')">
                        <i class="bi bi-check-circle"></i> Confirmar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="cancelarCita(${cita.id})">
                        <i class="bi bi-x-circle"></i> Cancelar
                    </button>
                ` : ""}
            </div>
        `;
        cardsContainer.appendChild(card);
    });
}

function getStatusBadgeClass(estatus) {
    const classes = {
        'Activa': 'bg-primary',
        'Confirmada': 'bg-success',
        'Cancelada': 'bg-danger'
    };
    return classes[estatus] || 'bg-secondary';
}

function cambiarEstatus(id, nuevoEstatus) {
    let citas = JSON.parse(localStorage.getItem("citas")) || [];
    citas = citas.map(c => c.id === id ? {...c, estatus: nuevoEstatus} : c);
    localStorage.setItem("citas", JSON.stringify(citas));
    aplicarFiltros(); // Reaplica filtros actuales
    mostrarPopup(`✅ Cita ${nuevoEstatus.toLowerCase()} exitosamente.`);
}



function exportarCitas() {
    let citas = JSON.parse(localStorage.getItem("citas")) || [];
    
    // Aplicar los mismos filtros que están activos
    const correo = document.getElementById("consultaCorreo").value.trim().toLowerCase();
    const especialidad = document.getElementById("filtroEspecialidad").value;
    const estatus = document.getElementById("filtroEstatus").value;
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;
    

    if (correo || especialidad || estatus || fechaInicio || fechaFin) {
        citas = citas.filter(cita => {
        const citaFecha = new Date(cita.fecha).getTime();

        const cumpleCorreo = !correo || cita.correo.toLowerCase().includes(correo);
        const cumpleEspecialidad = !especialidad || cita.especialidad === especialidad;
        const cumpleEstatus = !estatus || cita.estatus === estatus;
        const cumpleFechaInicio = !fechaInicio || citaFecha >= new Date(fechaInicio).getTime();
        const cumpleFechaFin = !fechaFin || citaFecha <= new Date(fechaFin  + 'T23:59:59').getTime();

        return cumpleCorreo && cumpleEspecialidad && cumpleEstatus && cumpleFechaInicio && cumpleFechaFin;
    });
    }

    if (citas.length === 0) {
        mostrarPopup("No hay citas para exportar con los filtros aplicados.");
        return;
    }

    const contenido = citas.map(cita => {
        const fecha = new Date(cita.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        return `
            FOLIO: ${cita.id}
            Paciente: ${cita.nombre}
            Correo: ${cita.correo}
            Teléfono: ${cita.telefono}
            Especialidad: ${cita.especialidad}
            Fecha: ${fechaFormateada}
            Hora: ${cita.hora}
            Estado: ${cita.estatus}
            Motivo: ${cita.motivo}
            ----------------------------------------
        `;
    }).join('\n');

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'citas_filtradas.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarPopup("📁 Archivo exportado exitosamente.");
}

// Funciones auxiliares
function getSpecialtyIcon(specialty) {
    const icons = {
        'Laboratorio': '<i class="bi bi-clipboard-data"></i>',
        'Ultrasonido': '<i class="bi bi-soundwave"></i>',
        'RayosX': '<i class="bi bi-radioactive"></i>',
        'ResonanciaMagnetica': '<i class="bi bi-disc"></i>',
        'Tomografia': '<i class="bi bi-circle-square"></i>',
        'Lentes': '<i class="bi bi-eyeglasses"></i>',
        'Papanicolaou': '<i class="bi bi-file-medical"></i>',
        'Densitometria': '<i class="bi bi-activity"></i>',
        'Nutricion': '<i class="bi bi-apple"></i>',
        'Mastografia': '<i class="bi bi-heart-pulse"></i>'
    };
    return icons[specialty] || '<i class="bi bi-hospital"></i>';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateOnly(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Cancelar cita
function cancelarCita(id) {
    if (confirm('¿Está seguro de que desea cancelar esta cita?')) {
        let citas = JSON.parse(localStorage.getItem("citas")) || [];
        citas = citas.map(c => c.id === id ? {...c, estatus: "Cancelada"} : c);
        localStorage.setItem("citas", JSON.stringify(citas));
        mostrarPopup("✅ Cita cancelada exitosamente.");
        aplicarFiltros(); // Reaplica filtros actuales
    }
}

// Modificar cita
function modificarCita(id) {
    let citas = JSON.parse(localStorage.getItem("citas")) || [];
    const cita = citas.find(c => c.id === id);
    if (!cita) return;

    // Cambiar a tab de generar
    openTab({currentTarget: document.querySelectorAll(".tab-btn")[0]}, "generar");
    
    // Verificar usuario automáticamente
    document.getElementById('correoVerificacion').value = cita.correo;
    verificarUsuario();
    
    // Llenar el formulario después de un breve delay para asegurar que el usuario se cargue
    setTimeout(() => {
        document.getElementById("fecha").value = cita.fecha;
        document.getElementById("motivo").value = cita.motivo;

        // Seleccionar especialidad
        selectedSpecialty = cita.especialidad;
        document.getElementById('especialidadSelect').value = selectedSpecialty;
        document.querySelectorAll('.specialty-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.specialty === cita.especialidad) {
                card.classList.add('selected');
            }
        });

        // Eliminar la cita antigua
        let citasActualizadas = JSON.parse(localStorage.getItem("citas")) || [];
        citasActualizadas = citasActualizadas.filter(c => c.id !== id);
        localStorage.setItem("citas", JSON.stringify(citasActualizadas));
        
        mostrarPopup("📝 Cita cargada para modificación. Realice los cambios necesarios y guarde.");
    }, 500);
}

// Establecer fecha mínima como ahora
document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.min = now.toISOString().slice(0, 16);
    }
});

// Permitir Enter para verificar usuario
document.getElementById('correoVerificacion').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        verificarUsuario();
    }
});