(function (window) {
    const DEFAULT_MARGIN_MM = 10;

    const ensurePdfDependencies = () => {
        if (typeof window.html2canvas !== 'function') {
            throw new Error('html2canvas no está cargado. Revisa la conexión al CDN antes de descargar el PDF.');
        }

        if (!window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
            throw new Error('jsPDF no está cargado. Revisa la conexión al CDN antes de descargar el PDF.');
        }
    };

    const waitForFonts = async () => {
        if (document.fonts && typeof document.fonts.ready?.then === 'function') {
            await document.fonts.ready;
        }
    };

    const renderElementToCanvas = async (element) => {
        if (!element) {
            throw new Error('No se encontró el elemento que se debe convertir a PDF.');
        }

        await waitForFonts();

        const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
        const canvas = await window.html2canvas(element, {
            backgroundColor: '#ffffff',
            logging: false,
            scale,
            useCORS: true,
            windowWidth: document.documentElement.scrollWidth,
        });

        if (!canvas.width || !canvas.height) {
            throw new Error('No se pudo capturar contenido visible para el PDF.');
        }

        return canvas;
    };

    const addCanvasToPdfPages = (pdf, canvas, margin = DEFAULT_MARGIN_MM) => {
        const imgData = canvas.toDataURL('image/png');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const printableWidth = pageWidth - (margin * 2);
        const printableHeight = pageHeight - (margin * 2);
        const imgHeight = (canvas.height * printableWidth) / canvas.width;

        let renderedHeight = 0;

        pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, imgHeight);
        renderedHeight += printableHeight;

        while (renderedHeight < imgHeight) {
            pdf.addPage();
            pdf.addImage(
                imgData,
                'PNG',
                margin,
                margin - renderedHeight,
                printableWidth,
                imgHeight
            );
            renderedHeight += printableHeight;
        }
    };

    const downloadElementAsPdf = async ({ element, filename, title }) => {
        ensurePdfDependencies();

        const canvas = await renderElementToCanvas(element);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        if (title) {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const today = new Date().toLocaleDateString('es-ES');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.text(title, pageWidth / 2, 14, { align: 'center' });
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.text(`Fecha: ${today}`, pageWidth / 2, 21, { align: 'center' });
            addCanvasToPdfPages(pdf, canvas, 28);
        } else {
            addCanvasToPdfPages(pdf, canvas);
        }

        pdf.save(filename);
    };


    const HANZI_BOX_SIZE_PX = 100;
    const HANZI_PAGE_WIDTH_PX = 794;
    const HANZI_PAGE_MIN_HEIGHT_PX = 1123;
    const HANZI_BOXES_PER_PAGE = 48;
    const MAX_HANZI_PDF_CHARACTERS = 720;

    const isHanziPracticeCharacter = (character) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(character);

    const createElement = (tagName, className, textContent) => {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    };

    const chunkCharacters = (characters, size) => {
        const chunks = [];
        for (let index = 0; index < characters.length; index += size) {
            chunks.push(characters.slice(index, index + size));
        }
        return chunks;
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const createHanziPracticeBox = (character) => {
        const box = createElement('div', 'tian-zi-ge-square border border-secondary hanzi-practice-box');
        box.dataset.char = character;
        box.style.width = `${HANZI_BOX_SIZE_PX}px`;
        box.style.height = `${HANZI_BOX_SIZE_PX}px`;
        box.style.border = '1px solid #6c757d';
        box.style.position = 'relative';
        box.style.backgroundColor = '#ffffff';
        box.style.backgroundImage = 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><line x1="0" y1="0" x2="100" y2="100" stroke="%23DDD" /><line x1="100" y1="0" x2="0" y2="100" stroke="%23DDD" /><line x1="50" y1="0" x2="50" y2="100" stroke="%23DDD" /><line x1="0" y1="50" x2="100" y2="50" stroke="%23DDD" /></svg>\')';
        box.style.backgroundSize = 'contain';
        box.style.backgroundRepeat = 'no-repeat';
        box.style.overflow = 'hidden';

        const glyph = createElement('span', 'hanzi-practice-glyph', character);
        glyph.style.position = 'absolute';
        glyph.style.inset = '0';
        glyph.style.display = 'flex';
        glyph.style.alignItems = 'center';
        glyph.style.justifyContent = 'center';
        glyph.style.color = '#111111';
        glyph.style.opacity = '0.18';
        glyph.style.fontFamily = '"Noto Serif SC", "KaiTi", "STKaiti", "Noto Serif CJK SC", "Noto Sans CJK SC", "Microsoft YaHei", "SimSun", serif';
        glyph.style.fontSize = '76px';
        glyph.style.fontWeight = '400';
        glyph.style.lineHeight = '1';
        glyph.style.transform = 'translateY(-2px)';
        glyph.style.zIndex = '1';

        box.appendChild(glyph);
        return box;
    };

    const createHanziWorksheetPage = ({ characters, date, location }) => {
        const worksheet = createElement('section', 'hanzi-printable-worksheet');
        worksheet.setAttribute('aria-hidden', 'true');
        worksheet.style.width = `${HANZI_PAGE_WIDTH_PX}px`;
        worksheet.style.minHeight = `${HANZI_PAGE_MIN_HEIGHT_PX}px`;
        worksheet.style.background = '#ffffff';
        worksheet.style.color = '#111111';
        worksheet.style.fontFamily = 'Arial, "Microsoft YaHei", "PingFang SC", sans-serif';
        worksheet.style.boxSizing = 'border-box';
        worksheet.style.padding = '0 52px 52px';

        const header = createElement('header', 'hanzi-worksheet-header');
        header.style.height = '84px';
        header.style.display = 'grid';
        header.style.gridTemplateColumns = '1fr auto 1fr';
        header.style.alignItems = 'center';
        header.style.borderBottom = '2px solid #ff2f55';
        header.style.margin = '0 -52px 30px';
        header.style.padding = '0 52px';
        header.style.boxSizing = 'border-box';
        header.style.background = '#f7f7f7';

        const dateLabel = createElement('div', 'hanzi-worksheet-meta', `日期: ${date || '__________'}`);
        dateLabel.style.fontSize = '17px';
        dateLabel.style.fontWeight = '700';
        const title = createElement('h1', 'hanzi-worksheet-title', '汉字书写练习');
        title.style.margin = '0';
        title.style.fontSize = '28px';
        title.style.fontWeight = '800';
        title.style.letterSpacing = '2px';
        const locationLabel = createElement('div', 'hanzi-worksheet-meta', `地点: ${location || '__________'}`);
        locationLabel.style.fontSize = '17px';
        locationLabel.style.fontWeight = '700';
        locationLabel.style.textAlign = 'right';

        header.append(dateLabel, title, locationLabel);
        worksheet.appendChild(header);

        const grid = createElement('div', 'hanzi-worksheet-grid');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(6, ${HANZI_BOX_SIZE_PX}px)`;
        grid.style.gridAutoRows = `${HANZI_BOX_SIZE_PX}px`;
        grid.style.gap = '16px 14px';
        grid.style.alignContent = 'start';
        grid.style.justifyContent = 'center';

        characters.forEach((character) => {
            if (isHanziPracticeCharacter(character)) {
                grid.appendChild(createHanziPracticeBox(character));
                return;
            }

            const punctuation = createElement('span', 'hanzi-worksheet-punctuation', character);
            punctuation.style.color = 'rgba(0, 0, 0, 0.28)';
            punctuation.style.fontSize = '32px';
            punctuation.style.minWidth = '18px';
            punctuation.style.textAlign = 'center';
            grid.appendChild(punctuation);
        });

        worksheet.appendChild(grid);
        return worksheet;
    };

    const ensureHanziGuideFont = () => {
        if (document.querySelector('link[data-asian-languages-hanzi-font]')) return;

        const fontLink = document.createElement('link');
        fontLink.dataset.asianLanguagesHanziFont = 'true';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400&display=swap';
        document.head.appendChild(fontLink);
    };

    const waitForPdfLayout = () => new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

    const withHiddenPrintableElement = async (element, callback) => {
        const host = createElement('div', 'pdf-render-host');
        host.style.position = 'fixed';
        host.style.left = '-10000px';
        host.style.top = '0';
        host.style.zIndex = '-1';
        host.style.background = '#ffffff';
        host.appendChild(element);
        document.body.appendChild(host);

        try {
            return await callback(element);
        } finally {
            host.remove();
        }
    };

    const tryDownloadHanziWorksheetFromFirebase = async ({ characters, filename, date, location }) => {
        const response = await fetch('/generarHanziPDF', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                characters,
                filename: filename.replace(/\.pdf$/i, ''),
                date,
                location,
            }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.includes('application/pdf')) {
            const errorMessage = await response.text().catch(() => 'No se pudo generar el PDF en Firebase.');
            throw new Error(errorMessage || 'No se pudo generar el PDF en Firebase.');
        }

        const pdfBlob = await response.blob();
        downloadBlob(pdfBlob, filename);
    };

    const downloadHanziWorksheetLocally = async ({ characters, filename, date, location }) => {
        const pages = chunkCharacters(characters, HANZI_BOXES_PER_PAGE);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
            const worksheet = createHanziWorksheetPage({
                characters: pages[pageIndex],
                date,
                location,
            });

            await withHiddenPrintableElement(worksheet, async (element) => {
                ensureHanziGuideFont();
                await waitForPdfLayout();
                const canvas = await renderElementToCanvas(element);
                const imgData = canvas.toDataURL('image/png');
                if (pageIndex > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            });
        }

        pdf.save(filename);
    };

    const downloadHanziWorksheetPdf = async ({ characters, filename = 'hanzi-worksheet.pdf', date, location }) => {
        ensurePdfDependencies();

        const printableCharacters = Array.from((characters || '').replace(/\s/g, ''));
        if (printableCharacters.length === 0) {
            throw new Error('No hay caracteres Hanzi para generar el PDF.');
        }

        if (printableCharacters.length > MAX_HANZI_PDF_CHARACTERS) {
            throw new Error(`Por ahora el PDF permite máximo ${MAX_HANZI_PDF_CHARACTERS} caracteres para evitar archivos demasiado pesados.`);
        }

        const formattedDate = date || new Date().toLocaleDateString('es-ES');
        const charactersText = printableCharacters.join('');

        try {
            await tryDownloadHanziWorksheetFromFirebase({
                characters: charactersText,
                filename,
                date: formattedDate,
                location,
            });
        } catch (firebaseError) {
            console.warn('Firebase PDF generation unavailable; using browser fallback.', firebaseError);
            await downloadHanziWorksheetLocally({
                characters: printableCharacters,
                filename,
                date: formattedDate,
                location,
            });
        }
    };

    window.AsianLanguagesPdf = {
        downloadElementAsPdf,
        downloadHanziWorksheetPdf,
    };
})(window);
