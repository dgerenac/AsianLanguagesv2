document.addEventListener('DOMContentLoaded', () => {
    const hanziInput = document.getElementById('hanzi-input');
    const tianZiGeGrid = document.getElementById('tian-zi-ge-grid');
    const animateAllButton = document.getElementById('animate-all');
    const downloadPdfButton = document.getElementById('download-pdf');
    const placeholderMessage = document.getElementById('placeholder-message');
 
    const quizInput = document.getElementById('quiz-input');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const quizTarget = document.getElementById('quiz-target');
    const quizPlaceholder = document.getElementById('quiz-placeholder');
    
    const radicalColor = '#168F16'; 
    const customStrokeWidth = 3; 
 
    let writers = [];
    let quizWriters = [];
 
    // ─────────────────────────────────────────────────────────────────
    // ▼ CAMBIA ESTA URL por la que te dé "firebase deploy" en el paso 6
    // ─────────────────────────────────────────────────────────────────
    const FUNCTION_URL = 'https://console.firebase.google.com/project/asian-languages/usage/details';
 
    console.log("El script hanzi.js se ha cargado correctamente.");
 
    const generateHanziSquares = (characters) => {
        tianZiGeGrid.innerHTML = '';
        writers.length = 0;
 
        if (characters.length === 0) {
            placeholderMessage.style.display = 'block';
            return;
        } else {
            placeholderMessage.style.display = 'none';
        }
 
        for (const char of characters) {
            const squareContainer = document.createElement('div');
            squareContainer.classList.add('tian-zi-ge-square', 'border', 'border-secondary', 'm-1');
            const squareId = `hanzi-square-${char}-${Date.now()}`;
            squareContainer.id = squareId;
            tianZiGeGrid.appendChild(squareContainer);
 
            const writer = HanziWriter.create(squareId, char, {
                width: 100,
                height: 100,
                padding: 5,
                strokeAnimationSpeed: 1,
                delayBetweenStrokes: 100,
                radicalColor: radicalColor,
                strokeWidth: customStrokeWidth
            });
            squareContainer.addEventListener('click', () => writer.animateCharacter());
            writers.push(writer);
        }
    };
 
    const startQuiz = () => {
        const characters = quizInput.value.replace(/\s/g, '').slice(0, 10);
        quizTarget.innerHTML = '';
        quizWriters.length = 0;
 
        if (characters.length === 0) {
            quizPlaceholder.style.display = 'block';
            return;
        } else {
            quizPlaceholder.style.display = 'none';
        }
 
        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            const quizContainerId = `quiz-char-${i}`;
            const quizContainer = document.createElement('div');
            quizContainer.id = quizContainerId;
            quizContainer.classList.add('quiz-square', 'm-1');
            quizContainer.style.width = '150px';
            quizContainer.style.height = '150px';
            quizTarget.appendChild(quizContainer);
 
            const writer = HanziWriter.create(quizContainerId, char, {
                width: 150,
                height: 150,
                padding: 5,
                showCharacter: false,
                showOutline: true,
                radicalColor: '#168F16',
                strokeWidth: customStrokeWidth
            });
            writer.quiz({
                showHintAfterMisses: 1,
                highlightOnComplete: true,
            });
            quizWriters.push(writer);
        }
    };
 
    hanziInput.addEventListener('input', (event) => {
        const hanziText = event.target.value.replace(/\s/g, '');
        generateHanziSquares(hanziText);
    });
 
    animateAllButton.addEventListener('click', () => {
        writers.forEach(writer => writer.animateCharacter());
    });
    
    startQuizBtn.addEventListener('click', () => {
      startQuiz();
    });
 
    // ─────────────────────────────────────────────────────────────────
    // DESCARGA PDF — ahora usa el servidor en lugar de jsPDF/html2canvas
    // ─────────────────────────────────────────────────────────────────
    downloadPdfButton.addEventListener('click', async () => {
        if (writers.length === 0) {
            alert('No hay caracteres para descargar.');
            return;
        }
 
        downloadPdfButton.textContent = 'Generando PDF...';
        downloadPdfButton.disabled = true;
 
        try {
            // 1. Capturar el SVG que HanziWriter ya dibujó en el grid
            const gridContainer = document.getElementById('tian-zi-ge-grid');
 
            // 2. Construir un HTML completo para que Puppeteer lo renderice
            //    Se incluyen los SVGs tal como están pintados en pantalla
            const htmlParaServidor = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            margin: 0;
                            padding: 16px;
                            background: #ffffff;
                            font-family: sans-serif;
                        }
                        #tian-zi-ge-grid {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 8px;
                        }
                        .tian-zi-ge-square {
                            border: 1px solid #ccc;
                            display: inline-block;
                        }
                        /* Líneas guía del cuaderno tian zi ge */
                        svg line {
                            stroke: #ccc;
                            stroke-width: 0.5px;
                        }
                    </style>
                </head>
                <body>
                    <div id="tian-zi-ge-grid">
                        ${gridContainer.innerHTML}
                    </div>
                </body>
                </html>
            `;
 
            // 3. Enviar al Cloud Function y esperar el PDF
            const respuesta = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html: htmlParaServidor,
                    filename: 'hanzi-worksheet',
                }),
            });
 
            if (!respuesta.ok) {
                throw new Error(`Error del servidor: ${respuesta.status}`);
            }
 
            // 4. Descargar el PDF automáticamente
            const blob = await respuesta.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'hanzi-worksheet.pdf';
            link.click();
            URL.revokeObjectURL(url);
 
        } catch (error) {
            console.error('Error generando el PDF:', error);
            alert('Hubo un error al generar el PDF. Revisa la consola para más detalles.');
        } finally {
            downloadPdfButton.textContent = 'Download PDF';
            downloadPdfButton.disabled = false;
        }
    });
 
    generateHanziSquares('你好');
 
    quizInput.value = '中文';
    startQuiz();
});