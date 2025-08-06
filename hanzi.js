document.addEventListener('DOMContentLoaded', () => {
    const hanziInput = document.getElementById('hanzi-input');
    const tianZiGeGrid = document.getElementById('tian-zi-ge-grid');
    const animateAllButton = document.getElementById('animate-all');
    const downloadPdfButton = document.getElementById('download-pdf');
    const romanizationDisplay = document.getElementById('hanzi-romanization-display');
    const placeholderMessage = document.getElementById('placeholder-message');

    const writers = [];

    function groupCharacters(text) {
        return text.trim().split(/\s+/);
    }

    function generateHanziSquares(text) {
        const phrases = groupCharacters(text);
        tianZiGeGrid.innerHTML = '';
        writers.length = 0;

        if (!text.trim()) {
            placeholderMessage.style.display = 'block';
            romanizationDisplay.textContent = 'Romanization:';
            return;
        } else {
            placeholderMessage.style.display = 'none';
        }

        romanizationDisplay.textContent = 'Romanization: ' + window.pinyin.getPinyin(text.replace(/\s/g, ''), ' ', false, false);

        phrases.forEach((phrase) => {
            const phraseContainer = document.createElement('div');
            phraseContainer.classList.add('phrase-container', 'd-flex', 'flex-row', 'mb-3', 'justify-content-center');

            for (const char of phrase) {
                const squareContainer = document.createElement('div');
                squareContainer.classList.add('tian-zi-ge-square', 'border', 'border-secondary', 'm-1');

                const squareId = `hanzi-square-${char}-${Math.random().toString(36).substr(2, 9)}`;
                squareContainer.id = squareId;
                phraseContainer.appendChild(squareContainer);

                const writer = HanziWriter.create(squareId, char, {
                    width: 100,
                    height: 100,
                    padding: 5,
                    strokeAnimationSpeed: 1,
                    delayBetweenStrokes: 100,
                    showOutline: true,
                });

                squareContainer.addEventListener('click', () => writer.animateCharacter());

                writers.push(writer);
            }

            tianZiGeGrid.appendChild(phraseContainer);
        });
    }

    hanziInput.addEventListener('input', (event) => {
        const text = event.target.value;
        generateHanziSquares(text);
    });

    animateAllButton.addEventListener('click', () => {
        writers.forEach((writer) => writer.animateCharacter());
    });

    downloadPdfButton.addEventListener('click', () => {
        html2canvas(tianZiGeGrid).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height + 100]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('hanzi_worksheet.pdf');
        });
    });

    // Footer year update
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Cargar ejemplo por defecto
    generateHanziSquares('你好 世界');
});
