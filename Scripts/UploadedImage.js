document.addEventListener('DOMContentLoaded', function () {

    let cropper;
    const inputLogo = document.getElementById('inputLogo');
    const preview = document.getElementById('preview');
    const btnRecortar = document.getElementById('btnRecortar');
    const btnReset = document.getElementById('btnReset');
    const logoGuardado = document.getElementById('logoGuardado');
    const sectionEditar = document.getElementById('sectionEditar');
    const sectionVista = document.getElementById('sectionVista');
    const titleVista = document.getElementById('TitleVista');
    const mensajeEl = document.getElementById('Mensaje');

    function hideAllSections() {
        if (sectionEditar) sectionEditar.style.display = 'none';
        if (sectionVista) sectionVista.style.display = 'none';
        actualizarBotones();
    }

    function showEditSection() {
        sectionEditar.style.display = 'block';
        sectionVista.style.display = 'none';
        actualizarBotones();
    }

    function showPreviewSection() {
        sectionEditar.style.display = 'none';
        sectionVista.style.display = 'block';
        actualizarBotones();
    }

    // Función para mostrar u ocultar los botones según sección
    function actualizarBotones() {
        if (sectionVista.style.display !== 'none') {
            btnRecortar.style.display = 'none';
            btnReset.style.display = 'none';
        } else {
            btnRecortar.style.display = 'inline-block';
            btnReset.style.display = 'inline-block';
        }
    }

    hideAllSections();

    const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems, {
        onOpenStart: function () {
            hideAllSections();
            preview.removeAttribute('src');
            preview.style.display = 'none';
        },
        onCloseEnd: function () { resetModal(); }
    });

    function resetModal() {
        inputLogo.value = '';
        if (cropper) { cropper.destroy(); cropper = null; }
        preview.removeAttribute('src'); preview.style.display = 'none';
        logoGuardado.removeAttribute('src'); logoGuardado.style.display = 'none';
        titleVista.innerText = '';
        mensajeEl.innerHTML = '';
        hideAllSections();
    }

    function loadFileToPreview(file) {
        if (!file) { if (cropper) cropper.destroy(); preview.removeAttribute('src'); hideAllSections(); return; }
        logoGuardado.removeAttribute('src'); logoGuardado.style.display = 'none'; titleVista.innerText = '';

        const reader = new FileReader();
        reader.onload = function (event) {
            preview.src = event.target.result;
            showEditSection();
            preview.style.display = 'block';
            if (cropper) cropper.destroy();
            cropper = new Cropper(preview, {
                aspectRatio: 1, viewMode: 1, autoCropArea: 1,
                background: false, movable: true, zoomable: true, guides: true
            });
        };
        reader.readAsDataURL(file);
    }

    inputLogo.addEventListener('change', function (e) {
        if (e.target.files && e.target.files.length > 0) {
            loadFileToPreview(e.target.files[0]);
        } else { if (cropper) cropper.destroy(); preview.removeAttribute('src'); hideAllSections(); }
    });

    btnRecortar.addEventListener('click', function () {
        if (!cropper) { showMessage('Debe subir un logo antes de guardar', 'red'); return; }
        const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
        const croppedImage = canvas.toDataURL('image/png');

        fetch(UrlGuardar, {
            method: 'POST',
            body: JSON.stringify({ imageBase64: croppedImage, idEmpresa: idEmpresa }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    logoGuardado.src = UrlVerLogo + "?fileName=" + encodeURIComponent(res.fileName) + "&t=" + Date.now();
                    logoGuardado.style.display = 'block';
                    titleVista.innerText = 'Vista Previa';
                    showPreviewSection();

                    if (res.sobrescrito) {
                        showMessage('El logo fue sobrescrito correctamente', 'green');
                    } else {
                        showMessage('El logo se guardó correctamente', 'green');
                    }

                    if (cropper) cropper.destroy(); cropper = null;
                    preview.removeAttribute('src'); preview.style.display = 'none';
                    inputLogo.value = '';
                }
            })
            .catch(() => { M.toast({ html: 'Error de red', displayLength: 2500 }); });
    });

    btnReset.addEventListener('click', function () { resetModal(); });

    function showMessage(text, color) {
        const html = `<div class="card-panel ${color} lighten-4 ${color}-text text-darken-4 items-center" style="max-height: 40px; margin: auto; display: flex; align-items: center; padding: 5 10px;">
                        <i class="material-icons left">check_circle</i>${text}
                      </div>`;
        mensajeEl.innerHTML = html;
        setTimeout(() => { mensajeEl.innerHTML = ''; }, 3000);
    }

});
