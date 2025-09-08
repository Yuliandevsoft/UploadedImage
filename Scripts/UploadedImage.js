document.addEventListener('DOMContentLoaded', function () {

    let cropper;

    // Referencias de elementos
    const inputLogo = document.getElementById('inputLogo');
    const preview = document.getElementById('preview');
    const btnRecortar = document.getElementById('btnRecortar');
    const btnReset = document.getElementById('btnReset');
    const logoGuardado = document.getElementById('logoGuardado');

    const sectionEditar = document.getElementById('sectionEditar');
    const sectionVista = document.getElementById('sectionVista');
    const titleVista = document.getElementById('TitleVista');
    const mensajeEl = document.getElementById('Mensaje');

    // Helpers de visibilidad
    function hideAllSections() {
        if (sectionEditar) sectionEditar.style.display = 'none';
        if (sectionVista) sectionVista.style.display = 'none';
    }
    function showEditSection() {
        if (sectionEditar) sectionEditar.style.display = 'block';
        if (sectionVista) sectionVista.style.display = 'none';
    }
    function showPreviewSection() {
        if (sectionEditar) sectionEditar.style.display = 'none';
        if (sectionVista) sectionVista.style.display = 'block';
    }

    // Estado inicial: ocultar todo hasta que el usuario seleccione o guarde
    hideAllSections();

    // Inicializar modal (Materialize) y manejar apertura/cierre
    const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems, {
        onOpenStart: function () {
            // Cada vez que se abre el modal: ocultar la vista final
            // (según El requisito: la vista solo se muestra después de guardar)
            hideAllSections();
            // limpiar preview temporal (no elimina lo guardado en servidor)
            preview.removeAttribute('src');
            preview.style.display = 'none';
        },
        onCloseEnd: function () {
            resetModal();
        }
    });

    // Función para resetear todo el modal
    function resetModal() {
        inputLogo.value = '';
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        preview.removeAttribute('src');
        preview.style.display = 'none';
        logoGuardado.removeAttribute('src');
        logoGuardado.style.display = 'none';
        titleVista.innerText = '';
        mensajeEl.innerHTML = '';
        // Ocultar secciones para que no quede nada visible
        hideAllSections();
    }

    // Cargar imagen en preview y Cropper
    function loadFileToPreview(file) {
        if (!file) {
            // si no hay archivo (ej. usuario canceló), ocultar todo
            if (cropper) { cropper.destroy(); cropper = null; }
            preview.removeAttribute('src');
            preview.style.display = 'none';
            hideAllSections();
            return;
        }

        // Si carga un nuevo archivo, ocultar la vista guardada**
        logoGuardado.removeAttribute('src');
        logoGuardado.style.display = 'none';
        titleVista.innerText = '';

        const reader = new FileReader();
        reader.onload = function (event) {
            preview.src = event.target.result;
            // mostrar solo la sección de edición
            showEditSection();
            preview.style.display = 'block';

            if (cropper) cropper.destroy();
            cropper = new Cropper(preview, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
                background: false,
                movable: true,
                zoomable: true,
                guides: true
            });
        };
        reader.readAsDataURL(file);
    }

    // Detectar cambio en input
    inputLogo.addEventListener('change', function (e) {
        if (e.target.files && e.target.files.length > 0) {
            loadFileToPreview(e.target.files[0]);
        } else {
            // usuario canceló la selección -> ocultar todo
            if (cropper) { cropper.destroy(); cropper = null; }
            preview.removeAttribute('src');
            preview.style.display = 'none';
            hideAllSections();
        }
    });

    // Botón Recortar / Guardar
    btnRecortar.addEventListener('click', function () {
        if (!cropper) {
            showMessage('Debe subir un logo antes de guardar', 'red');
            return;
        }

        const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
        const croppedImage = canvas.toDataURL('image/png');

        fetch(UrlGuardar, {
            method: 'POST',
            body: JSON.stringify({ imageBase64: croppedImage }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    // Mostrar solo la vista previa final (y ocultar edición)
                    // Añadimos cache-buster para forzar recarga
                    logoGuardado.src = UrlVerLogo + "?fileName=" + encodeURIComponent(res.fileName) + "&t=" + Date.now();
                    logoGuardado.style.display = 'block';
                    titleVista.innerText = 'Vista Previa';

                    // Mostrar la sección de vista y ocultar editor
                    showPreviewSection();

                    showMessage('El logo se guardó correctamente', 'green');

                    // Resetear cropper y preview temporal
                    if (cropper) cropper.destroy();
                    cropper = null;
                    preview.removeAttribute('src');
                    preview.style.display = 'none';
                    inputLogo.value = ''; // permite seleccionar la misma imagen posteriormente
                }
            })
            .catch(() => { M.toast({ html: 'Error de red', displayLength: 2500 }); });
    });

    // Botón Resetear: borra todo y oculta secciones
    btnReset.addEventListener('click', function () {
        resetModal();
    });

    // Función para mostrar mensaje temporal
    function showMessage(text, color) {
        const html = `<div class="card-panel ${color} lighten-4 ${color}-text text-darken-4 items-center" style="max-height: 40px; margin: auto; display: flex; align-items: center; padding: 5 10px;">
                        <i class="material-icons left">check_circle</i>
                        ${text}
                      </div>`;
        mensajeEl.innerHTML = html;
        setTimeout(() => { mensajeEl.innerHTML = ''; }, 3000);
    }

});
