document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('hanzi-input');
    const grid = document.getElementById('tian-zi-ge-grid');
    const romanizationDisplay = document.getElementById('hanzi-romanization-display');
    const placeholderMessage = document.getElementById('placeholder-message');
    const animateButton = document.getElementById('animate-all');
    const downloadButton = document.getElementById('download-pdf');

    function generateHanziSquares(text) {
        grid.innerHTML = ''; // Limpiar el grid
        const characters = text.replace(/\s/g, '').split('');

        if (characters.length === 0) {
            placeholderMessage.style.display = 'block';
            romanizationDisplay.textContent = 'Romanization:';
            return;
        }

        placeholderMessage.style.display = 'none';

        // Mostrar romanización con tiny-pinyin
        if (typeof Pinyin !== 'undefined') {
            romanizationDisplay.textContent = 'Romanization: ' + Pinyin.convertToPinyin(text.replace(/\s/g, ''), ' ', false);
        } else {
            romanizationDisplay.textContent = 'Romanization: [library not loaded]';
        }

        characters.forEach((char, index) => {
            const squareContainer = document.createElement('div');
            squareContainer.classList.add('hanzi-square-container');
            squareContainer.style.width = '100px';
            squareContainer.style.height = '100px';
            squareContainer.style.border = '1px solid #ccc';
            squareContainer.style.margin = '5px';

            const writerDiv = document.createElement('div');
            writerDiv.id = 'writer-' + index;
            writerDiv.style.width = '100%';
            writerDiv.style.height = '100%';

            squareContainer.appendChild(writerDiv);
            grid.appendChild(squareContainer);

            const writer = HanziWriter.create(writerDiv.id, char, {
                width: 100,
                height: 100,
                padding: 5,
                showOutline: true,
                showCharacter: false
            });

            writer.quiz();
        });
    }

    // Escuchar cambios en el input
    input.addEventListener('input', function () {
        const text = input.value.trim();
        generateHanziSquares(text);
    });

    // Botón de animar todos los caracteres
    animateButton.addEventListener('click', function () {
        const characters = input.value.trim().replace(/\s/g, '').split('');
        characters.forEach((char, index) => {
            const writer = HanziWriter.create('writer-' + index, char, {
                width: 100,
                height: 100,
                padding: 5,
                showOutline: true,
                showCharacter: false
            });
            writer.animateCharacter();
        });
    });

    // Botón de descargar como PDF
    downloadButton.addEventListener('click', function () {
        html2canvas(grid).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth * 0.9;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const marginX = (pageWidth - imgWidth) / 2;

            pdf.addImage(imgData, 'PNG', marginX, 20, imgWidth, imgHeight);
            pdf.save('hanzi_worksheet.pdf');
        });
    });
});
