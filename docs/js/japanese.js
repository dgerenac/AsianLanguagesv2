document.addEventListener('DOMContentLoaded', () => {
    // --- 1. OBTENER ELEMENTOS DEL DOM ---
    const japaneseInput = document.getElementById('japanese-input');
    const japaneseWritingGrid = document.getElementById('japanese-writing-grid');
    const clearAllButton = document.getElementById('clear-all');
    const downloadPdfButton = document.getElementById('download-pdf');
    const placeholderMessage = document.getElementById('placeholder-message');

    const canvases = [];

    // --- 2. FUNCIÓN PARA GENERAR LA CUADRÍCULA INTERACTIVA (EN PANTALLA) ---
    const generateJapaneseSquares = (text) => {
        japaneseWritingGrid.innerHTML = '';
        canvases.length = 0;

        if (text.trim().length === 0) {
            if(placeholderMessage) placeholderMessage.style.display = 'block';
            return;
        } else {
            if(placeholderMessage) placeholderMessage.style.display = 'none';
        }

        const phrases = text.trim().split(' ');
        let charAnimationCounter = 0;

        phrases.forEach((phrase) => {
            if (phrase.length > 0) {
                const phraseContainer = document.createElement('div');
                phraseContainer.classList.add('d-flex', 'flex-wrap', 'justify-content-center');

                for (const char of phrase) {
                    const squareContainer = document.createElement('div');
                    squareContainer.classList.add('japanese-square-container', 'border', 'm-1', 'position-relative');
                    squareContainer.style.width = '100px';
                    squareContainer.style.height = '100px';
                    squareContainer.classList.add('animate__animated', 'animate__zoomIn');
                    squareContainer.style.animationDelay = `${charAnimationCounter * 50}ms`;

                    const canvas = document.createElement('canvas');
                    canvas.width = 100;
                    canvas.height = 100;
                    canvas.style.position = 'absolute';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    squareContainer.appendChild(canvas);

                    const charDisplay = document.createElement('div');
                    charDisplay.textContent = char;
                    charDisplay.classList.add('position-absolute', 'top-50', 'start-50', 'translate-middle');
                    charDisplay.style.fontSize = '3.5em';
                    charDisplay.style.color = '#e0e0e0';
                    charDisplay.style.pointerEvents = 'none';
                    squareContainer.appendChild(charDisplay);

                    phraseContainer.appendChild(squareContainer);
                    canvases.push(canvas);

                    setupDrawing(canvas, charDisplay);
                    charAnimationCounter++;
                }
                japaneseWritingGrid.appendChild(phraseContainer);
            }
        });
    };

    const setupDrawing = (canvas, charDisplay) => {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        let isDrawing = false;

        const getEventPosition = (event) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = event.touches ? event.touches[0].clientX : event.clientX;
            const clientY = event.touches ? event.touches[0].clientY : event.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const startDrawing = (e) => {
            e.preventDefault();
            isDrawing = true;
            charDisplay.style.color = 'transparent';
            const pos = getEventPosition(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        };

        const draw = (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const pos = getEventPosition(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        };

        const stopDrawing = () => {
            isDrawing = false;
            ctx.closePath();
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);
    };

    // --- 3. EVENT LISTENERS ---

    japaneseInput.addEventListener('input', (event) => {
        generateJapaneseSquares(event.target.value);
    });

    clearAllButton.addEventListener('click', () => {
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const charDisplay = canvas.nextElementSibling;
            if (charDisplay) charDisplay.style.color = '#e0e0e0';
        });
    });

    // *** ¡LÓGICA DEL PDF DEFINITIVA! ***
    downloadPdfButton.addEventListener('click', () => {
        const text = japaneseInput.value.trim();
        if (text.length === 0) {
            alert('Por favor, escribe algunos caracteres japoneses primero.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // --- PASO CLAVE: USAR LA FUENTE QUE CARGAMOS ---
        // El archivo vfs_fonts.js ya registró la fuente, ahora solo la usamos.
        doc.addFont('NotoSansJP-Regular-normal.ttf', 'NotoSansJP', 'normal');
        doc.setFont('NotoSansJP');

        // Título del documento (usamos una fuente estándar para el español)
        doc.setFont('Helvetica');
        doc.setFontSize(22);
        doc.text('Hoja de Práctica de Japonés', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Usa los espacios para practicar la escritura de cada caracter.', 105, 30, { align: 'center' });

        // --- Dibujamos la cuadrícula de práctica ---
        const chars = text.split('');
        const boxSize = 20;
        const margin = 15;
        const page_width = doc.internal.pageSize.getWidth();
        let x = margin;
        let y = 50;

        chars.forEach(char => {
            if (char.trim() === '') return;

            if (x + boxSize > page_width - margin) {
                x = margin;
                y += boxSize;
            }
            
            if (y + boxSize > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                y = margin;
            }

            doc.setDrawColor(180, 180, 180);
            doc.rect(x, y, boxSize, boxSize);

            // Volvemos a la fuente japonesa para los caracteres
            doc.setFont('NotoSansJP');
            doc.setFontSize(14);
            doc.setTextColor(150, 150, 150);
            doc.text(char, x + 2, y + 6);

            x += boxSize;
        });

        doc.save('hoja-practica-japones.pdf');
    });

    // --- 4. LLAMADA INICIAL ---
    generateJapaneseSquares('こんにちは');
});
