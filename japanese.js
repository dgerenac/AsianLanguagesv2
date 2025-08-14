document.addEventListener('DOMContentLoaded', () => {
    const japaneseInput = document.getElementById('japanese-input');
    const japaneseWritingGrid = document.getElementById('japanese-writing-grid');
    const animateAllButton = document.getElementById('animate-all');
    const clearAllButton = document.getElementById('clear-all');
    const downloadPdfButton = document.getElementById('download-pdf');
    const placeholderMessage = document.getElementById('placeholder-message');

    let writers = [];

    const generateJapaneseSquares = (characters) => {
        japaneseWritingGrid.innerHTML = '';
        writers.length = 0;

        if (characters.length === 0) {
            placeholderMessage.style.display = 'block';
            return;
        } else {
            placeholderMessage.style.display = 'none';
        }

        const phrases = characters.trim().split(' ');

        phrases.forEach((phrase, phraseIndex) => {
            if (phrase.length > 0) {
                const phraseContainer = document.createElement('div');
                phraseContainer.classList.add('d-flex', 'flex-wrap');

                for (const char of phrase) {
                    const squareContainer = document.createElement('div');
                    squareContainer.classList.add('japanese-square-container', 'border', 'border-secondary', 'm-1', 'p-0');
                    const squareId = `japanese-square-${char}-${Date.now()}`;
                    squareContainer.id = squareId;
                    squareContainer.style.width = '100px';
                    squareContainer.style.height = '100px';
                    phraseContainer.appendChild(squareContainer);
                    
                    const writer = HanziWriter.create(squareId, char, {
                        width: 100,
                        height: 100,
                        padding: 5,
                        strokeAnimationSpeed: 1,
                        delayBetweenStrokes: 100,
                        radicalColor: '#20c997',
                        showCharacter: true
                    });
                    
                    squareContainer.addEventListener('click', () => writer.animateCharacter());
                    writers.push(writer);
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

    animateAllButton.addEventListener('click', () => {
        writers.forEach(writer => writer.animateCharacter());
    });

    clearAllButton.addEventListener('click', () => {
        japaneseInput.value = '';
        generateJapaneseSquares('');
    });

    if (downloadPdfButton) {
        downloadPdfButton.addEventListener('click', () => {
            alert('PDF download functionality for HanziWriter is still in development. Please check back later!');
        });
    }

    generateJapaneseSquares('こんにちは');
});