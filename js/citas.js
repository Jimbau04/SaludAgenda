// Variables globales
        let selectedSpecialty = '';
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

        // Manejo de selección de especialidades
        document.querySelectorAll('.specialty-card').forEach(card => {
            card.addEventListener('click', function() {
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
            
            // Validar especialidad seleccionada
            if (!selectedSpecialty) {
                document.getElementById('especialidadError').style.display = 'block';
                document.querySelector('.specialty-grid').scrollIntoView({ behavior: 'smooth' });
                return;
            }
            
            const cita = {
                id: Date.now(),
                nombre: document.getElementById("nombre").value.trim(),
                correo: document.getElementById("correo").value.trim(),
                telefono: document.getElementById("telefono").value.trim(),
                especialidad: selectedSpecialty,
                fecha: document.getElementById("fecha").value,
                motivo: document.getElementById("motivo").value.trim(),
                estatus: "Activa"
            };

            if (new Date(cita.fecha) < new Date()) {
                alert("⚠️ La fecha y hora no pueden ser pasadas.");
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
                alert("✅ Cita guardada con éxito. Folio: " + cita.id);
                e.target.reset();
                selectedSpecialty = '';
                document.querySelectorAll('.specialty-card').forEach(c => c.classList.remove('selected'));
            }, 1500);
        });

        // Consultar citas
        document.getElementById("formConsultar").addEventListener("submit", function(e) {
            e.preventDefault();
            const correo = document.getElementById("consultaCorreo").value.trim();
            const especialidad = document.getElementById("filtroEspecialidad").value;
            const fechaInicio = document.getElementById("fechaInicio").value;
            const fechaFin = document.getElementById("fechaFin").value;
        
            let citas = JSON.parse(localStorage.getItem("citas")) || [];
            let filtradas = citas.filter(c => {
                const citaFecha = new Date(c.fecha).getTime();
                const cumpleCorreo = c.correo === correo;
                const cumpleEspecialidad = !especialidad || c.especialidad === especialidad;
                const cumpleFechaInicio = !fechaInicio || citaFecha >= new Date(fechaInicio).getTime();
                const cumpleFechaFin = !fechaFin || citaFecha <= new Date(fechaFin + 'T23:59:59').getTime();
                
                return cumpleCorreo && cumpleEspecialidad && cumpleFechaInicio && cumpleFechaFin;
            });
        
            mostrarCitas(filtradas);
        });
        
        function mostrarCitas(citas) {
            const resultado = document.getElementById("resultadoCitas");
            resultado.innerHTML = "";
        
            if (citas.length === 0) {
                resultado.innerHTML = `
                    <div class="text-center py-4">
                        <i class="bi bi-search" style="font-size: 3rem; color: #6c757d;"></i>
                        <p class="text-muted mt-2">No se encontraron citas con los criterios especificados.</p>
                    </div>
                `;
                return;
            }
        
            const citasHtml = citas.map(cita => `
                <div class="cita-card">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5><i class="bi bi-ticket-detailed"></i> Folio: ${cita.id}</h5>
                            <span class="badge ${getStatusBadgeClass(cita.estatus)}">
                                ${cita.estatus}
                            </span>
                        </div>
                        <div class="specialty-icon" style="font-size: 2rem;">
                            ${getSpecialtyIcon(cita.especialidad)}
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong><i class="bi bi-hospital"></i> Especialidad:</strong> ${cita.especialidad}</p>
                            <p><strong><i class="bi bi-calendar-date"></i> Fecha:</strong> ${formatDate(cita.fecha)}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong><i class="bi bi-person"></i> Nombre:</strong> ${cita.nombre}</p>
                            <p><strong><i class="bi bi-telephone"></i> Teléfono:</strong> ${cita.telefono}</p>
                        </div>
                    </div>
                    
                    <p><strong><i class="bi bi-chat-square-text"></i> Motivo:</strong> ${cita.motivo}</p>
                    
                    <div class="mt-3">
                        ${cita.estatus !== 'Cancelada' ? `
                            <button class="btn btn-warning btn-sm me-2" onclick="modificarCita(${cita.id})">
                                <i class="bi bi-pencil"></i> Modificar
                            </button>
                            <button class="btn btn-info btn-sm me-2" onclick="cambiarEstatus(${cita.id}, 'Confirmada')">
                                <i class="bi bi-check-circle"></i> Confirmar
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="cancelarCita(${cita.id})">
                                <i class="bi bi-x-circle"></i> Cancelar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        
            resultado.innerHTML = citasHtml;
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
            document.getElementById("formConsultar").dispatchEvent(new Event("submit"));
        }
        
        function exportarCitas() {
            const correo = document.getElementById("consultaCorreo").value.trim();
            if (!correo) {
                alert("Por favor, ingrese un correo electrónico para exportar las citas.");
                return;
            }
        
            let citas = JSON.parse(localStorage.getItem("citas")) || [];
            citas = citas.filter(c => c.correo === correo);
        
            if (citas.length === 0) {
                alert("No hay citas para exportar.");
                return;
            }
        
            const contenido = citas.map(cita => `
        FOLIO: ${cita.id}
        Paciente: ${cita.nombre}
        Especialidad: ${cita.especialidad}
        Fecha: ${formatDate(cita.fecha)}
        Estado: ${cita.estatus}
        Motivo: ${cita.motivo}
        ----------------------------------------
        `).join('\n');
        
            const blob = new Blob([contenido], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'citas.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Funciones auxiliares
        function getSpecialtyIcon(specialty) {
            const icons = {
                'Pediatría': '<i class="bi bi-person-hearts"></i>',
                'Ginecología': '<i class="bi bi-gender-female"></i>',
                'Odontología': '<i class="bi bi-emoji-smile"></i>',
                'Cardiología': '<i class="bi bi-heart-pulse"></i>'
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

        // Cancelar cita
        function cancelarCita(id) {
            if (confirm('¿Está seguro de que desea cancelar esta cita?')) {
                let citas = JSON.parse(localStorage.getItem("citas")) || [];
                citas = citas.map(c => c.id === id ? {...c, estatus: "Cancelada"} : c);
                localStorage.setItem("citas", JSON.stringify(citas));
                alert("✅ Cita cancelada exitosamente.");
                document.getElementById("formConsultar").dispatchEvent(new Event("submit"));
            }
        }

        // Modificar cita
        function modificarCita(id) {
            let citas = JSON.parse(localStorage.getItem("citas")) || [];
            const cita = citas.find(c => c.id === id);
            if (!cita) return;

            // Cambiar a tab de generar
            openTab({currentTarget: document.querySelectorAll(".tab-btn")[1]}, "generar");
            
            // Llenar el formulario
            document.getElementById("nombre").value = cita.nombre;
            document.getElementById("correo").value = cita.correo;
            document.getElementById("telefono").value = cita.telefono;
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
            citas = citas.filter(c => c.id !== id);
            localStorage.setItem("citas", JSON.stringify(citas));
            
            alert("📝 Cita cargada para modificación. Realice los cambios necesarios y guarde.");
        }

        // Establecer fecha mínima como ahora
        document.addEventListener('DOMContentLoaded', function() {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            document.getElementById('fecha').min = now.toISOString().slice(0, 16);
        });
