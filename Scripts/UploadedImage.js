document.addEventListener('DOMContentLoaded', function () {
    // Inicializar modal Materialize
    var elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);

    let cropper;

    const inputLogo = document.getElementById('inputLogo');
    const preview = document.getElementById('preview');
    const btnRecortar = document.getElementById('btnRecortar');
    const btnReset = document.getElementById('btnReset');

    function loadFileToPreview(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            preview.src = event.target.result;
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

    inputLogo.addEventListener('change', function (e) {
        loadFileToPreview(e.target.files[0]);
    });

    btnRecortar.addEventListener('click', function () {
        if (!cropper) {
            var Mensaje2 = `
                      <div class="card-panel red lighten-4 red-text text-darken-4 items-center"
                      style="max-height: 40px; margin: auto; display: flex; align-items: center; padding: 5 10px; margin: auto;">
                        <i class="material-icons left">cancel</i>
                        Debe subir un logo antes de guardar
                      </div>`;
            document.getElementById("Mensaje").innerHTML = Mensaje2;

            // Quitar el mensaje después de 3 segundos
            setTimeout(() => {
                document.getElementById("Mensaje").innerHTML = "";
            }, 3000);
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
                    document.getElementById('logoGuardado').src = '/Uploads/Logos/' + res.fileName;
                    var TViewPreview = 'Vista Previa'
                    document.getElementById('TitleVista').innerText = TViewPreview;
                    document.getElementById('logoGuardado').src = UrlVerLogo + "?fileName=" + res.fileName;
                    var Mensaje = `
                      <div class="card-panel green lighten-4 green-text text-darken-4 items-center"
                      style="max-height: 40px; margin: auto; display: flex; align-items: center; padding: 5 10px; margin: auto;">
                        <i class="material-icons left">check_circle</i>
                        El logo se guardó correctamente
                      </div>`;
                    document.getElementById("Mensaje").innerHTML = Mensaje;
                    // Quitar el mensaje después de 3 segundos
                    setTimeout(() => {
                        document.getElementById("Mensaje").innerHTML = "";
                    }, 3000);
                } else {
                    M.toast({ html: 'Error al guardar', displayLength: 2500 });
                }
            })
            .catch(() => { M.toast({ html: 'Error de red', displayLength: 2500 }); });
    });

    btnReset.addEventListener('click', function () {
        inputLogo.value = '';
        if (cropper) { cropper.destroy(); cropper = null; }
        preview.removeAttribute('src');
    });
});
