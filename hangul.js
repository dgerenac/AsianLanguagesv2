document.addEventListener('DOMContentLoaded', () => {

    const hangulInput = document.getElementById('hangul-input');

    const hangulWritingGrid = document.getElementById('hangul-writing-grid');

    const clearAllButton = document.getElementById('clear-all');

    const downloadPdfButton = document.getElementById('download-pdf');

    const placeholderMessage = document.getElementById('placeholder-message');

    const hangulRomanizationDisplay = document.getElementById('hangul-romanization-display'); // Nuevo elemento



    const canvases = []; // Almacenará las instancias de canvas



    /**

     * Genera los cuadros interactivos para cada carácter de Hangul.

     * @param {string} text Los caracteres a generar.

     */

    const generateHangulSquares = (text) => {

        hangulWritingGrid.innerHTML = ''; // Limpia la cuadrícula actual

        canvases.length = 0; // Limpia el array de canvases

        hangulRomanizationDisplay.textContent = 'Romanization: '; // Limpiar la romanización



        if (text.trim().length === 0) {

            placeholderMessage.style.display = 'block';

            return;

        } else {

            placeholderMessage.style.display = 'none';

        }



        // Dividir el texto por espacios para obtener frases

        const phrases = text.trim().split(' ');

        let currentRomanizationText = 'Romanization: ';



        phrases.forEach((phrase, phraseIndex) => {

            if (phrase.length > 0) {

                const phraseContainer = document.createElement('div');

                phraseContainer.classList.add('d-flex', 'flex-wrap');



                for (const char of phrase) {

                    const squareContainer = document.createElement('div');

                    squareContainer.classList.add('hangul-square-container', 'border', 'border-secondary', 'm-1', 'p-0');

                    squareContainer.style.width = '100px';

                    squareContainer.style.height = '100px';

                    squareContainer.style.position = 'relative';



                    const canvas = document.createElement('canvas');

                    canvas.width = 100;

                    canvas.height = 100;

                    canvas.style.position = 'absolute';

                    canvas.style.top = '0';

                    canvas.style.left = '0';

                    squareContainer.appendChild(canvas);

                    

                    const charDisplay = document.createElement('div');

                    charDisplay.textContent = char;

                    charDisplay.style.fontSize = '3em';

                    charDisplay.style.textAlign = 'center';

                    charDisplay.style.color = '#ccc';

                    charDisplay.style.position = 'absolute';

                    charDisplay.style.top = '50%';

                    charDisplay.style.left = '50%';

                    charDisplay.style.transform = 'translate(-50%, -50%)';

                    charDisplay.style.pointerEvents = 'none'; // Para que no bloquee el canvas

                    squareContainer.appendChild(charDisplay);



                    phraseContainer.appendChild(squareContainer);

                    canvases.push(canvas);



                    // Lógica para dibujar el carácter al hacer clic

                    squareContainer.addEventListener('click', () => {

                        const ctx = canvas.getContext('2d');

                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        ctx.fillStyle = '#333';

                        ctx.font = '72px Arial';

                        ctx.textAlign = 'center';

                        ctx.textBaseline = 'middle';

                        ctx.fillText(char, canvas.width / 2, canvas.height / 2);

                    });



                    // Lógica para dibujar con el mouse/táctil

                    let isDrawing = false;

                    const ctx = canvas.getContext('2d');

                    ctx.strokeStyle = '#333';

                    ctx.lineWidth = 3;

                    ctx.lineCap = 'round';



                    const startDrawing = (e) => {

                        isDrawing = true;

                        charDisplay.style.color = 'transparent'; // Oculta el carácter gris al empezar a dibujar

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

        hangulRomanizationDisplay.textContent = currentRomanizationText.trim(); // Mostrar la romanización

    };



    // Escucha cambios en el input del usuario

    hangulInput.addEventListener('input', (event) => {

        const hangulText = event.target.value;

        generateHangulSquares(hangulText);

    });

    

    // Botón para borrar todos los canvas

    clearAllButton.addEventListener('click', () => {

        canvases.forEach(canvas => {

            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);

        });

    });



    // Lógica para el botón de descarga de PDF (se mantiene igual)

    downloadPdfButton.addEventListener('click', async () => {

        if (canvases.length === 0) {

            alert('No hay caracteres para descargar. Por favor, escribe algunos en el campo de texto.');

            return;

        }



        downloadPdfButton.textContent = 'Generating PDF...';

        downloadPdfButton.disabled = true;



        try {

            const gridContainer = document.getElementById('hangul-writing-grid');

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



    // Generar la palabra "annyeong" por defecto al cargar la página

    generateHangulSquares('안녕!');

});
