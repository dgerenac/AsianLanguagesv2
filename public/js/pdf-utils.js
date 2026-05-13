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

    window.AsianLanguagesPdf = {
        downloadElementAsPdf,
    };
})(window);
