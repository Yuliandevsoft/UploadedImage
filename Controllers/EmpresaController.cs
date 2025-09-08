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
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GuardarLogo(int idEmpresa, string imageBase64)
        {
            if (!string.IsNullOrEmpty(imageBase64))
            {
                try
                {
                    var base64Data = imageBase64.Split(',')[1];
                    byte[] bytes = Convert.FromBase64String(base64Data);

                    string folderPath = @"C:\Cliente";
                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    // Nombre de archivo según ID de empresa
                    string fileName = $"logo_{idEmpresa}.png";
                    string fullPath = Path.Combine(folderPath, fileName);

                    bool sobreescrito = System.IO.File.Exists(fullPath);

                    // Guardar (sobreescribe si existe)
                    System.IO.File.WriteAllBytes(fullPath, bytes);

                    return Json(new { success = true, fileName = fileName, sobrescrito = sobreescrito });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = ex.Message });
                }
            }
            return Json(new { success = false });
        }

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
            ViewBag.idEmpresa = 444444;
            return View();
        }
    }
}
