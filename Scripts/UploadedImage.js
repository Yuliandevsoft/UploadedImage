document.addEventListener('DOMContentLoaded', function () {

    let cropper;

    // Referencias de elementos
    const inputLogo = document.getElementById('inputLogo');
    const preview = document.getElementById('preview');
    const btnRecortar = document.getElementById('btnRecortar');
    const btnReset = document.getElementById('btnReset');
    const logoGuardado = document.getElementById('logoGuardado');

    // Inicializar modal con callback al cerrar
    const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems, {
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
        document.getElementById('TitleVista').innerText = '';
        document.getElementById('Mensaje').innerHTML = '';
    }

    // Cargar imagen en preview y Cropper
    function loadFileToPreview(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            preview.src = event.target.result;
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
        loadFileToPreview(e.target.files[0]);
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
                    // Mostrar logo guardado
                    logoGuardado.src = UrlVerLogo + "?fileName=" + res.fileName;
                    logoGuardado.style.display = 'block';
                    document.getElementById('TitleVista').innerText = 'Vista Previa';

                    showMessage('El logo se guardó correctamente', 'green');

                    // Resetear cropper y preview
                    if (cropper) cropper.destroy();
                    cropper = null;
                    preview.removeAttribute('src');
                    preview.style.display = 'none';
                    inputLogo.value = ''; // permite seleccionar la misma imagen
                } else {
                    M.toast({ html: 'Error al guardar', displayLength: 2500 });
                }
            })
            .catch(() => { M.toast({ html: 'Error de red', displayLength: 2500 }); });
    });

    // Botón Resetear
    btnReset.addEventListener('click', resetModal);

    // Función para mostrar mensaje temporal
    function showMessage(text, color) {
        const html = `<div class="card-panel ${color} lighten-4 ${color}-text text-darken-4 items-center" style="max-height: 40px; margin: auto; display: flex; align-items: center; padding: 5 10px;">
                        <i class="material-icons left">check_circle</i>
                        ${text}
                      </div>`;
        document.getElementById('Mensaje').innerHTML = html;
        setTimeout(() => { document.getElementById('Mensaje').innerHTML = ''; }, 3000);
    }

});
