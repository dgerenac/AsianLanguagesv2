document.addEventListener('DOMContentLoaded', () => {
    const hanziInput = document.getElementById('hanzi-input');
    const tianZiGeGrid = document.getElementById('tian-zi-ge-grid');
    const animateAllButton = document.getElementById('animate-all');
    const downloadPdfButton = document.getElementById('download-pdf');
    const placeholderMessage = document.getElementById('placeholder-message');
    const hanziRomanizationDisplay = document.getElementById('hanzi-romanization-display'); // Nuevo elemento

    const writers = []; // Este array almacenará las instancias de Hanzi Writer

    /**
     * Genera los cuadros interactivos para cada Hanzi character.
     * @param {string} text El texto a generar.
     */
    const generateHanziSquares = (text) => {
        tianZiGeGrid.innerHTML = ''; // Limpiar la cuadrícula actual
        writers.length = 0; // Limpiar el array de escritores
        hanziRomanizationDisplay.textContent = 'Romanization: '; // Limpiar la romanización

        if (text.trim().length === 0) {
            placeholderMessage.style.display = 'block';
            return;
        } else {
            placeholderMessage.style.display = 'none';
        }

        // Dividir el texto por espacios para obtener frases
        const phrases = text.trim().split(' ');
        let currentRomanizationText = 'Romanization: ';

        // Recorrer cada frase
        phrases.forEach((phrase, phraseIndex) => {
            if (phrase.length > 0) {
                // Crear un contenedor para la frase
                const phraseContainer = document.createElement('div');
                phraseContainer.classList.add('d-flex', 'flex-wrap');

                // Recorrer cada carácter de la frase
                for (const char of phrase) {
                    // Crear un contenedor para el Hanzi writer
                    const squareContainer = document.createElement('div');
                    squareContainer.classList.add('tian-zi-ge-square', 'border', 'border-secondary', 'm-1');

                    // Hanzi Writer necesita un ID único para cada SVG que renderiza
                    const squareId = `hanzi-square-${char}-${Date.now()}`;
                    squareContainer.id = squareId;
                    phraseContainer.appendChild(squareContainer);

                    // Crear una nueva instancia de Hanzi Writer para cada cuadro
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

                    // Hacer cada cuadro interactivo (se anima al hacer clic)
                    squareContainer.addEventListener('click', () => {
                        writer.animateCharacter();
                    });

                    writers.push(writer); // Almacenar la instancia para controlarla más tarde
                    currentRomanizationText += char + ' '; // Añadir el carácter a la romanización
                }
                tianZiGeGrid.appendChild(phraseContainer);

                // Añadir un separador visual entre frases (si no es la última)
                if (phraseIndex < phrases.length - 1) {
                    const separator = document.createElement('div');
                    separator.classList.add('p-2');
                    tianZiGeGrid.appendChild(separator);
                    currentRomanizationText += '  '; // Añadir un espacio extra para separar frases en la romanización
                }
            }
        });
        hanziRomanizationDisplay.textContent = currentRomanizationText.trim(); // Mostrar la romanización
    };

    // Escuchar cambios en el input del usuario
    hanziInput.addEventListener('input', (event) => {
        const hanziText = event.target.value;
        generateHanziSquares(hanziText);
    });

    // Lógica para la descarga de PDF (se mantiene igual)
    downloadPdfButton.addEventListener('click', async () => {
        if (writers.length === 0) {
            alert('No hay caracteres para descargar. Por favor, escribe algunos en el campo de texto.');
            return;
        }

        downloadPdfButton.textContent = 'Generating PDF...';
        downloadPdfButton.disabled = true;

        try {
            const gridContainer = document.getElementById('tian-zi-ge-grid');
            const canvas = await html2canvas(gridContainer, { scale: 2 });
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
            alert('Hubo un error al generar el PDF. Por favor, revisa la consola para más detalles.');
        } finally {
            downloadPdfButton.textContent = 'Download PDF';
            downloadPdfButton.disabled = false;
        }
    });

    // Generar caracteres por defecto al cargar la página
    generateHanziSquares('你好');
});
