const { onRequest } = require("firebase-functions/v2/https");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const HANZI_BOXES_PER_PAGE = 108;
const MAX_HANZI_PDF_CHARACTERS = 720;

const normalizeFilename = (filename = "documento") => filename
  .toString()
  .replace(/[^a-z0-9-_]/gi, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "") || "documento";

const chunkArray = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const escapeHtml = (value) => value
  .toString()
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const getCharactersFromText = (characters = "") => Array.from(characters)
  .filter((character) => character.trim().length > 0);

const createHanziWorksheetHtml = ({ characters, date, location }) => {
  const pages = chunkArray(characters, HANZI_BOXES_PER_PAGE);
  const safeDate = escapeHtml(date || "__________");
  const safeLocation = escapeHtml(location || "__________");
  const pageMarkup = pages.map((pageCharacters, pageIndex) => `
    <section class="worksheet-page">
      <header class="worksheet-header">
        <div class="worksheet-meta">日期: ${safeDate}</div>
        <h1>汉字书写练习</h1>
        <div class="worksheet-meta worksheet-location">地点: ${safeLocation}</div>
      </header>
      <main class="worksheet-grid">
        ${pageCharacters.map((character, characterIndex) => `
          <div class="hanzi-square" data-char="${escapeHtml(character)}">
            <div id="hanzi-${pageIndex}-${characterIndex}" class="hanzi-target"></div>
          </div>
        `).join("")}
      </main>
    </section>
  `).join("");

  return `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>汉字书写练习</title>
  <script src="https://cdn.jsdelivr.net/npm/hanzi-writer@2.2.2/dist/hanzi-writer.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ffffff; }
    body { font-family: Arial, "Microsoft YaHei", "PingFang SC", sans-serif; color: #111111; }
    .worksheet-page {
      width: 210mm;
      min-height: 297mm;
      padding: 0 14mm 14mm;
      background: #ffffff;
      page-break-after: always;
    }
    .worksheet-page:last-child { page-break-after: auto; }
    .worksheet-header {
      height: 22mm;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      border-bottom: 1.6px solid #ff2f55;
      margin: 0 -14mm 8mm;
      padding: 0 14mm;
      background: #f7f7f7;
    }
    .worksheet-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 2px;
    }
    .worksheet-meta { font-size: 15px; font-weight: 700; }
    .worksheet-location { text-align: right; }
    .worksheet-grid {
      display: grid;
      grid-template-columns: repeat(9, 16mm);
      grid-auto-rows: 16mm;
      gap: 5mm 4mm;
      align-content: start;
      justify-content: center;
    }
    .hanzi-square {
      width: 16mm;
      height: 16mm;
      position: relative;
      border: 1.1px solid #4f4f4f;
      background: #ffffff;
      overflow: hidden;
    }
    .hanzi-square {
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><line x1="0" y1="0" x2="100" y2="100" stroke="%23DDD" /><line x1="100" y1="0" x2="0" y2="100" stroke="%23DDD" /><line x1="50" y1="0" x2="50" y2="100" stroke="%23DDD" /><line x1="0" y1="50" x2="100" y2="50" stroke="%23DDD" /></svg>');
      background-size: contain;
      background-repeat: no-repeat;
    }
    .hanzi-target {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 1;
    }
  </style>
</head>
<body>
  ${pageMarkup}
  <script>
    window.__HANZI_WORKSHEET_READY__ = false;
    const renderTargets = Array.from(document.querySelectorAll('.hanzi-square'));
    renderTargets.forEach((square) => {
      const target = square.querySelector('.hanzi-target');
      const character = square.dataset.char;
      HanziWriter.create(target.id, character, {
        width: 60,
        height: 60,
        padding: 3,
        radicalColor: '#168F16',
        strokeWidth: 1.8,
      });
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__HANZI_WORKSHEET_READY__ = true;
      });
    });
  </script>
</body>
</html>`;
};

const createBrowser = async () => puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});

/**
 * Cloud Function: generarPDF
 * Recibe: POST { html: "..." }
 * Devuelve: archivo PDF binario
 */
exports.generarPDF = onRequest({
  cors: true,
  memory: "1GiB",
  timeoutSeconds: 30,
}, async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Método no permitido");
  }

  const { html, filename = "documento" } = req.body;

  if (!html) {
    return res.status(400).send("Falta el campo 'html'");
  }

  let browser = null;

  try {
    browser = await createBrowser();
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `attachment; filename="${normalizeFilename(filename)}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).send("Error al generar el PDF");
  } finally {
    if (browser) await browser.close();
  }
});

/**
 * Cloud Function: generarHanziPDF
 * Recibe: POST { characters: "你好", date?: "...", location?: "..." }
 * Devuelve: hoja de práctica Hanzi paginada como PDF binario.
 */
exports.generarHanziPDF = onRequest({
  cors: true,
  memory: "1GiB",
  timeoutSeconds: 120,
}, async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Método no permitido");
  }

  const {
    characters = "",
    filename = "hanzi-worksheet",
    date,
    location,
  } = req.body || {};
  const printableCharacters = getCharactersFromText(characters);

  if (printableCharacters.length === 0) {
    return res.status(400).send("No hay caracteres Hanzi para generar el PDF");
  }

  if (printableCharacters.length > MAX_HANZI_PDF_CHARACTERS) {
    return res.status(400).send(`Máximo ${MAX_HANZI_PDF_CHARACTERS} caracteres por PDF`);
  }

  let browser = null;

  try {
    browser = await createBrowser();
    const page = await browser.newPage();
    const html = createHanziWorksheetHtml({
      characters: printableCharacters,
      date,
      location,
    });

    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.waitForFunction("window.__HANZI_WORKSHEET_READY__ === true", { timeout: 60000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    res.set("Content-Type", "application/pdf");
    res.set("Cache-Control", "no-store");
    res.set("Content-Disposition", `attachment; filename="${normalizeFilename(filename)}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generando PDF Hanzi:", error);
    res.status(500).send("Error al generar el PDF Hanzi");
  } finally {
    if (browser) await browser.close();
  }
});
