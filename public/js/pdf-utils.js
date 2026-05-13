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


    const HANZI_BOX_SIZE_PX = 58;
    const HANZI_PAGE_WIDTH_PX = 794;
    const HANZI_PAGE_MIN_HEIGHT_PX = 1123;

    const isHanziPracticeCharacter = (character) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(character);

    const createElement = (tagName, className, textContent) => {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    };

    const createHanziPracticeBox = (character) => {
        const box = createElement('div', 'hanzi-practice-box');
        box.style.width = `${HANZI_BOX_SIZE_PX}px`;
        box.style.height = `${HANZI_BOX_SIZE_PX}px`;
        box.style.border = '1.5px solid #8a8a8a';
        box.style.position = 'relative';
        box.style.display = 'inline-flex';
        box.style.alignItems = 'center';
        box.style.justifyContent = 'center';
        box.style.background = [
            'linear-gradient(45deg, transparent calc(50% - 0.5px), #d5d5d5 calc(50% - 0.5px), #d5d5d5 calc(50% + 0.5px), transparent calc(50% + 0.5px))',
            'linear-gradient(-45deg, transparent calc(50% - 0.5px), #d5d5d5 calc(50% - 0.5px), #d5d5d5 calc(50% + 0.5px), transparent calc(50% + 0.5px))',
            'linear-gradient(90deg, transparent calc(50% - 0.5px), #eeeeee calc(50% - 0.5px), #eeeeee calc(50% + 0.5px), transparent calc(50% + 0.5px))',
            'linear-gradient(0deg, transparent calc(50% - 0.5px), #eeeeee calc(50% - 0.5px), #eeeeee calc(50% + 0.5px), transparent calc(50% + 0.5px))',
            '#ffffff',
        ].join(', ');

        const glyph = createElement('span', 'hanzi-practice-glyph', character);
        glyph.style.color = 'rgba(0, 0, 0, 0.16)';
        glyph.style.fontFamily = '"Noto Serif CJK SC", "Noto Serif CJK", "SimSun", "Songti SC", "KaiTi", serif';
        glyph.style.fontSize = '42px';
        glyph.style.fontWeight = '400';
        glyph.style.lineHeight = '1';
        glyph.style.transform = 'translateY(-1px)';
        box.appendChild(glyph);

        return box;
    };

    const createHanziWorksheetTemplate = ({ characters, date, location }) => {
        const printableCharacters = Array.from(characters).filter((character) => character.trim().length > 0);
        const worksheet = createElement('section', 'hanzi-printable-worksheet');
        worksheet.setAttribute('aria-hidden', 'true');
        worksheet.style.width = `${HANZI_PAGE_WIDTH_PX}px`;
        worksheet.style.minHeight = `${HANZI_PAGE_MIN_HEIGHT_PX}px`;
        worksheet.style.background = '#ffffff';
        worksheet.style.color = '#111111';
        worksheet.style.fontFamily = 'Arial, "Microsoft YaHei", "PingFang SC", sans-serif';
        worksheet.style.boxSizing = 'border-box';
        worksheet.style.padding = '0 48px 48px';

        const header = createElement('header', 'hanzi-worksheet-header');
        header.style.height = '72px';
        header.style.display = 'grid';
        header.style.gridTemplateColumns = '1fr auto 1fr';
        header.style.alignItems = 'center';
        header.style.borderBottom = '2px solid #ff2f55';
        header.style.margin = '0 -48px 26px';
        header.style.padding = '0 48px';
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
        grid.style.display = 'flex';
        grid.style.flexWrap = 'wrap';
        grid.style.alignItems = 'center';
        grid.style.alignContent = 'flex-start';
        grid.style.columnGap = '14px';
        grid.style.rowGap = '18px';

        printableCharacters.forEach((character) => {
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

    const downloadHanziWorksheetPdf = async ({ characters, filename = 'hanzi-worksheet.pdf', date, location }) => {
        if (!characters || Array.from(characters.replace(/\s/g, '')).length === 0) {
            throw new Error('No hay caracteres Hanzi para generar el PDF.');
        }

        const formattedDate = date || new Date().toLocaleDateString('es-ES');
        const worksheet = createHanziWorksheetTemplate({
            characters,
            date: formattedDate,
            location,
        });

        await withHiddenPrintableElement(worksheet, async (element) => {
            await downloadElementAsPdf({
                element,
                filename,
            });
        });
    };

    window.AsianLanguagesPdf = {
        downloadElementAsPdf,
        downloadHanziWorksheetPdf,
    };
})(window);
