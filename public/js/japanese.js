document.addEventListener('DOMContentLoaded', () => {
    const japaneseInput = document.getElementById('japanese-input');
    const japaneseWritingGrid = document.getElementById('japanese-writing-grid');
    const clearAllButton = document.getElementById('clear-all');
    const downloadPdfButton = document.getElementById('download-pdf');
    const placeholderMessage = document.getElementById('placeholder-message');

    const canvases = []; 

    const generateJapaneseSquares = (text) => {
        japaneseWritingGrid.innerHTML = ''; 
        canvases.length = 0; 

        if (text.trim().length === 0) {
            placeholderMessage.style.display = 'block';
            return;
        } else {
            placeholderMessage.style.display = 'none';
        }

        const phrases = text.trim().split(' ');

        phrases.forEach((phrase, phraseIndex) => {
            if (phrase.length > 0) {
                const phraseContainer = document.createElement('div');
                phraseContainer.classList.add('d-flex', 'flex-wrap');

                for (const char of phrase) {
                    const squareContainer = document.createElement('div');
                    squareContainer.classList.add('japanese-square-container', 'border', 'border-secondary', 'm-1', 'p-0');
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
                    charDisplay.style.pointerEvents = 'none'; 
                    squareContainer.appendChild(charDisplay);

                    phraseContainer.appendChild(squareContainer);
                    canvases.push(canvas);

                    let isDrawing = false;
                    const ctx = canvas.getContext('2d');
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';

                    const startDrawing = (e) => {
                        isDrawing = true;
                        charDisplay.style.color = 'transparent'; 
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
                japaneseWritingGrid.appendChild(phraseContainer);

                if (phraseIndex < phrases.length - 1) {
                    const separator = document.createElement('div');
                    separator.classList.add('p-2');
                    japaneseWritingGrid.appendChild(separator);
                }
            }
        });
    };

    japaneseInput.addEventListener('input', (event) => {
        const japaneseText = event.target.value;
        generateJapaneseSquares(japaneseText);
    });
    
    clearAllButton.addEventListener('click', () => {
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    });

    downloadPdfButton.addEventListener('click', () => {
        const text = japaneseInput.value.trim();
        if (text.length === 0) {
            alert('Por favor, escribe algunos caracteres japoneses primero.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        doc.setFont('KaiseiDecol', 'normal');

        doc.setFontSize(22);
        doc.text('Hoja de Práctica de Japonés', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Usa los espacios para practicar la escritura de cada caracter.', 105, 30, { align: 'center' });

        const chars = text.split('');
        const boxSize = 25;
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        let x = margin;
        let y = 50;

        chars.forEach(char => {
            if (char.trim() === '') return;

            if (x + boxSize > pageWidth - margin) {
                x = margin;
                y += boxSize + 10; 
            }

            if (y + boxSize > pageHeight - margin) {
                doc.addPage();
                y = 50;
            }

            doc.setDrawColor(0);
            doc.rect(x, y, boxSize, boxSize);

            doc.setDrawColor(180);
            doc.line(x, y + boxSize/2, x + boxSize, y + boxSize/2);
            doc.line(x + boxSize/2, y, x + boxSize/2, y + boxSize);
            doc.line(x, y, x + boxSize, y + boxSize);
            doc.line(x + boxSize, y, x, y + boxSize);

            doc.setTextColor(200);
            doc.setFontSize(18);
            doc.text(char, x + boxSize/2, y + boxSize/2 + 6, { align: 'center' });

            x += boxSize + 5;
        });

        doc.save('hoja-practica-japones.pdf');
    });

    generateJapaneseSquares('こんにちは');
});
