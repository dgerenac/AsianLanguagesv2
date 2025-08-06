document.addEventListener('DOMContentLoaded', () => {
    const hanziInput = document.getElementById('hanzi-input');
    const tianZiGeGrid = document.getElementById('tian-zi-ge-grid');
    const animateAllButton = document.getElementById('animate-all');
    const downloadPdfButton = document.getElementById('download-pdf');
    const placeholderMessage = document.getElementById('placeholder-message');
    const hanziRomanizationDisplay = document.getElementById('hanzi-romanization-display');

    const writers = [];

    const generateHanziSquares = (text) => {
        tianZiGeGrid.innerHTML = '';
        writers.length = 0;
        hanziRomanizationDisplay.textContent = 'Romanization:';

        if (text.trim().length === 0) {
            placeholderMessage.style.display = 'block';
            return;
        } else {
            placeholderMessage.style.display = 'none';
        }

        const phrases = text.trim().split(' ');
        let currentRomanizationText = 'Romanization:';

        phrases.forEach((phrase, phraseIndex) => {
            if (phrase.length > 0) {
                const phraseContainer = document.createElement('div');
                phraseContainer.classList.add('d-flex', 'flex-wrap', 'justify-content-center', 'mb-3');

                for (const char of phrase) {
                    const squareContainer = document.createElement('div');
                    squareContainer.classList.add('tian-zi-ge-square', 'border', 'border-secondary', 'm-1');

                    const squareId = `hanzi-square-${char}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
                    squareContainer.id = squareId;
                    phraseContainer.appendChild(squareContainer);

                    const writer = HanziWriter.create(squareId, char, {
                        width: 100,
                        height: 100,
                        padding: 5,
                        strokeAnimationSpeed: 1,
                        delayBetweenStrokes: 100,
                        onComplete: (data) => {
                            console.log(`Animación de ${data.character} completada.`);
                        }
                    });

                    squareContainer.addEventListener('click', () => {
                        writer.animateCharacter();
                    });

                    writers.push(writer);
                    currentRomanizationText += ` ${char}`;
                }

                tianZiGeGrid.appendChild(phraseContainer);

                if (phraseIndex < phrases.length - 1) {
                    const separator = document.createElement('hr');
                    separator.classList.add('w-100', 'my-2');
                    tianZiGeGrid.appendChild(separator);
                    currentRomanizationText += '   '; // Separador visual entre frases
                }
            }
        });

        hanziRomanizationDisplay.textContent = currentRomanizationText.trim();
    };

    hanziInput.addEventListener('input', (event) => {
        const hanziText = event.target.value;
        generateHanziSquares(hanziText);
    });

    animateAllButton.addEventListener('click', () => {
        writers.forEach(writer => writer.animateCharacter());
    });

    downloadPdfButton.addEventListener('click', async () => {
        if (writers.length === 0) {
            alert('No hay caracteres para descargar. Por favor, escribe algunos en el campo de texto.');
            return;
        }

        downloadPdfButton.textContent = 'Generating PDF...';
        downloadPdfButton.disabled = true;

        try {
            const canvas = await html2canvas(tianZiGeGrid, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = pdf.internal.pageSize.getWidth() - 20;
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('hanzi-worksheet.pdf');
            alert('PDF generado y descargado correctamente!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Hubo un error al generar el PDF. Revisa la consola para más detalles.');
        } finally {
            downloadPdfButton.textContent = 'Download PDF';
            downloadPdfButton.disabled = false;
        }
    });

    generateHanziSquares('你好');
});
