using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;

namespace Empresa.Controllers
{
    public class EmpresaController : Controller
    {
        // Página principal para subir logo
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GuardarLogo(string imageBase64)
        {
            if (!string.IsNullOrEmpty(imageBase64))
            {
                try
                {
                    // Quitar encabezado "data:image/png;base64,"
                    var base64Data = imageBase64.Split(',')[1];
                    byte[] bytes = Convert.FromBase64String(base64Data);

                    // Ruta fija en C:
                    string folderPath = @"C:\Cliente";

                    // Crear carpeta si no existe
                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    // Nombre de archivo único
                    string fileName = "logo_" + DateTime.Now.Ticks + ".png";
                    string fullPath = Path.Combine(folderPath, fileName);

                    // Guardar el archivo en disco
                    System.IO.File.WriteAllBytes(fullPath, bytes);

                    // Devolvemos el nombre del archivo
                    return Json(new { success = true, fileName = fileName });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = ex.Message });
                }
            }

            return Json(new { success = false });
        }

        // Permite ver la imagen desde el navegador
        public ActionResult VerLogo(string fileName)
        {
            string filePath = Path.Combine(@"C:\Cliente", fileName);
            if (System.IO.File.Exists(filePath))
            {
                byte[] fileBytes = System.IO.File.ReadAllBytes(filePath);
                return File(fileBytes, "image/png");
            }
            return HttpNotFound();
        }

        public ActionResult Configuracion()
        {
            return View();
        }
    }
}
