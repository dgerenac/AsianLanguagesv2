const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

/**
 * Cloud Function: generarPDF
 * Recibe: POST { html: "..." }
 * Devuelve: archivo PDF binario
 */
exports.generarPDF = onRequest({
  // Permite llamadas desde tu dominio (CORS)
  cors: true,
  // Memoria necesaria para Chromium
  memory: "1GiB",
  // Tiempo máximo de ejecución (30 segundos)
  timeoutSeconds: 30,
}, async (req, res) => {

  // Solo aceptar peticiones POST
  if (req.method !== "POST") {
    return res.status(405).send("Método no permitido");
  }

  // Extraer el HTML que envía el frontend
  const { html, filename = "documento" } = req.body;

  if (!html) {
    return res.status(400).send("Falta el campo 'html'");
  }

  let browser = null;

  try {
    // Iniciar el navegador Chromium en el servidor
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Cargar el HTML con los caracteres chinos/coreanos
    await page.setContent(html, {
      waitUntil: "networkidle0",  // esperar a que carguen las fuentes
    });

    // Generar el PDF con tamaño A4
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,       // incluir colores de fondo
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    // Enviar el PDF como respuesta
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `attachment; filename="${filename}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).send("Error al generar el PDF");

  } finally {
    // Siempre cerrar el navegador para liberar memoria
    if (browser) await browser.close();
  }
});