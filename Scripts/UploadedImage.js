document.addEventListener('DOMContentLoaded', function () {

    let cropper;
    let isSaving = false;

    const inputLogo = document.getElementById('inputLogo');
    const previewLogo = document.getElementById('previewLogo');
    const btnRecortarLogo = document.getElementById('btnRecortarLogo');
    const btnResetLogo = document.getElementById('btnResetLogo');
    const logoGuardado = document.getElementById('logoGuardado');
    const sectionEditarLogo = document.getElementById('sectionEditarLogo');
    const sectionVistaLogo = document.getElementById('sectionVistaLogo');
    const TitleVistaLogo = document.getElementById('TitleVistaLogo');
    const MensajeLogoEl = document.getElementById('MensajeLogo');

    function hideAllSections() {
        if (sectionEditarLogo) sectionEditarLogo.style.display = 'none';
        if (sectionVistaLogo) sectionVistaLogo.style.display = 'none';
        actualizarBotones();
    }

    function showEditSection() {
        sectionEditarLogo.style.display = 'block';
        sectionVistaLogo.style.display = 'none';
        actualizarBotones();
    }

    function showpreviewLogoSection() {
        sectionEditarLogo.style.display = 'none';
        sectionVistaLogo.style.display = 'block';
        actualizarBotones();
    }

    // Función para mostrar u ocultar los botones según sección
    function actualizarBotones() {
        if (sectionVistaLogo.style.display !== 'none') {
            btnRecortarLogo.style.display = 'none';
            btnResetLogo.style.display = 'none';
        } else {
            btnRecortarLogo.style.display = 'inline-block';
            btnResetLogo.style.display = 'inline-block';
        }
    }

    hideAllSections();

    const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems, {
        onOpenStart: function () {
            hideAllSections();
            previewLogo.removeAttribute('src');
            previewLogo.style.display = 'none';
        },
        onCloseEnd: function () { resetModal(); }
    });

    function resetModal() {
        inputLogo.value = '';
        if (cropper) { cropper.destroy(); cropper = null; }
        previewLogo.removeAttribute('src'); previewLogo.style.display = 'none';
        logoGuardado.removeAttribute('src'); logoGuardado.style.display = 'none';
        TitleVistaLogo.innerText = '';
        MensajeLogoEl.innerHTML = '';
        hideAllSections();
        isSaving = false;
        btnRecortarLogo.classList.remove("disabled");
    }

    function loadFileTopreviewLogo(file) {
        if (!file) {
            if (cropper) cropper.destroy();
            previewLogo.removeAttribute('src');
            hideAllSections();
            return;
        }

        logoGuardado.removeAttribute('src');
        logoGuardado.style.display = 'none';
        TitleVistaLogo.innerText = '';

        const reader = new FileReader();
        reader.onload = function (event) {
            previewLogo.src = event.target.result;
            showEditSection();
            previewLogo.style.display = 'block';
            if (cropper) cropper.destroy();
            cropper = new Cropper(previewLogo, {
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

    inputLogo.addEventListener('change', function (e) {
        if (e.target.files && e.target.files.length > 0) {
            loadFileTopreviewLogo(e.target.files[0]);
        } else {
            if (cropper) cropper.destroy();
            previewLogo.removeAttribute('src');
            hideAllSections();
        }
    });

    //GUARDAR LOGO
    btnRecortarLogo.addEventListener('click', function () {

        if (isSaving) return;


        if (!cropper) { showMessage('Debe subir un logo antes de guardar', 'red'); return; }

        isSaving = true;
        btnRecortarLogo.classList.add("disabled");

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
                    TitleVistaLogo.innerText = 'Vista Previa';
                    showpreviewLogoSection();

                    if (res.sobrescrito) {
                        showMessage('El logo fue actualizado', 'green');
                    } else {
                        showMessage('El logo se guardó correctamente', 'green');
                    }

                    if (cropper) cropper.destroy(); cropper = null;
                    previewLogo.removeAttribute('src');
                    previewLogo.style.display = 'none';
                    inputLogo.value = '';
                }
            })
            .catch(() => {
                M.toast({ html: 'Error de red', displayLength: 2500 });
            })
            .finally(() => {
                isSaving = false;
                btnRecortarLogo.classList.remove("disabled");
            });
    });

    btnResetLogo.addEventListener('click', function () { resetModal(); });

    function showMessage(text, color) {
        const html = `<div class="card-panel ${color} lighten-4 ${color}-text text-darken-4 items-center" 
                        style="max-height: 40px; margin: auto; display: flex; align-items: center; padding: 5 10px;">
                        <i class="material-icons left">check_circle</i>${text}
                      </div>`;
        MensajeLogoEl.innerHTML = html;
        setTimeout(() => { MensajeLogoEl.innerHTML = ''; }, 3000);
    }

});