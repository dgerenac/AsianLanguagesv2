document.addEventListener('DOMContentLoaded', () => {
    // ... tus variables de elementos del DOM ...
    const hangulInput = document.getElementById('hangul-input');
    const hangulWritingGrid = document.getElementById('hangul-writing-grid');
    const clearAllButton = document.getElementById('clear-all');
    const downloadPdfButton = document.getElementById('download-pdf');
    const placeholderMessage = document.getElementById('placeholder-message');
    const hangulRomanizationDisplay = document.getElementById('hangul-romanization-display');

    const canvases = []; 

    const generateHangulSquares = (text) => {
        hangulWritingGrid.innerHTML = '';
        canvases.length = 0;
        hangulRomanizationDisplay.textContent = 'Romanization: ';

        if (text.trim().length === 0) {
            placeholderMessage.style.display = 'block';
            return;
        } else {
            placeholderMessage.style.display = 'none';
        }

        const phrases = text.trim().split(' ');
        let currentRomanizationText = 'Romanization: ';

        phrases.forEach((phrase, phraseIndex) => {
            if (phrase.length > 0) {
                const phraseContainer = document.createElement('div');
                phraseContainer.classList.add('d-flex', 'flex-wrap');

                for (const char of phrase) {
                    const squareContainer = document.createElement('div');
                    squareContainer.classList.add('hangul-square-container');
                    phraseContainer.appendChild(squareContainer);

                    const charDisplay = document.createElement('div');
                    charDisplay.textContent = char;
                    charDisplay.classList.add('char-display'); // Usamos la nueva clase de CSS
                    squareContainer.appendChild(charDisplay);

                    const canvas = document.createElement('canvas');
                    canvas.width = 100;
                    canvas.height = 100;
                    squareContainer.appendChild(canvas);

                    canvases.push(canvas);

                    // Lógica para dibujar con el mouse/táctil
                    let isDrawing = false;
                    const ctx = canvas.getContext('2d');
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';

                    // ... (El resto de la lógica de dibujo, que ya tenías, se mantiene igual)
                    const startDrawing = (e) => {
                        isDrawing = true;
                        charDisplay.style.visibility = 'hidden'; // Oculta el carácter gris al empezar a dibujar
                        const pos = getMousePos(canvas, e);
                        ctx.beginPath();
                        ctx.moveTo(pos.x, pos.y);
                    };

                    const draw = (e) => {
                        if (!isDrawing) return;
                        const pos = getMousePos(canvas, e);
                        ctx.lineTo(pos.x, pos.y);
                        ctx.stroke();
                    };

                    const stopDrawing = () => {
                        isDrawing = false;
                        ctx.closePath();
                    };

                    const getMousePos = (canvas, event) => {
                        const rect = canvas.getBoundingClientRect();
                        let clientX, clientY;
                        if (event.touches) {
                            clientX = event.touches[0].clientX;
                            clientY = event.touches[0].clientY;
                        } else {
                            clientX = event.clientX;
                            clientY = event.clientY;
                        }
                        return {
                            x: clientX - rect.left,
                            y: clientY - rect.top
                        };
                    };
                    
                    canvas.addEventListener('mousedown', startDrawing);
                    canvas.addEventListener('mousemove', draw);
                    canvas.addEventListener('mouseup', stopDrawing);
                    canvas.addEventListener('mouseout', stopDrawing);
                    canvas.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        startDrawing(e);
                    });
                    canvas.addEventListener('touchmove', (e) => {
                        e.preventDefault();
                        draw(e);
                    });
                    canvas.addEventListener('touchend', stopDrawing);
                    
                }
                hangulWritingGrid.appendChild(phraseContainer);

                if (phraseIndex < phrases.length - 1) {
                    const separator = document.createElement('div');
                    separator.classList.add('p-2');
                    hangulWritingGrid.appendChild(separator);
                }
            }
        });
        hangulRomanizationDisplay.textContent = currentRomanizationText.trim();
    };

    // ... (El resto de los listeners para `input`, `clearAllButton`, `downloadPdfButton` se mantienen igual)
    hangulInput.addEventListener('input', (event) => {
        const hangulText = event.target.value;
        generateHangulSquares(hangulText);
    });

    clearAllButton.addEventListener('click', () => {
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        // También volvemos a mostrar el carácter de fondo después de borrar
        const charDisplays = document.querySelectorAll('.char-display');
        charDisplays.forEach(display => display.style.visibility = 'visible');
    });

    downloadPdfButton.addEventListener('click', async () => {
        // ... (Tu código de descarga de PDF, que está correcto)
        if (canvases.length === 0) {
            alert('No hay caracteres para descargar. Por favor, escribe algunos en el campo de texto.');
            return;
        }

        downloadPdfButton.textContent = 'Generating PDF...';
        downloadPdfButton.disabled = true;

        try {
            const gridContainer = document.getElementById('hangul-writing-grid');
            // Aseguramos que la cuadrícula de fondo se renderice en el PDF
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = gridContainer.outerHTML;
            tempDiv.querySelector('.hangul-writing-grid').style.backgroundImage = 'none'; // Desactivamos la cuadrícula de fondo para el HTML2Canvas
            
            // Creamos un canvas con el contenido visible
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

            pdf.save('hangul-worksheet.pdf');
            alert('PDF generado y descargado correctamente!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Hubo un error al generar el PDF. Por favor, revisa la consola para más detalles.');
        } finally {
            downloadPdfButton.textContent = 'Download PDF';
            downloadPdfButton.disabled = false;
        }
    });

    generateHangulSquares('안녕하세요');
});
