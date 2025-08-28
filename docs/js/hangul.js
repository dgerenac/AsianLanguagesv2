document.addEventListener('DOMContentLoaded', function () {
    // --- ELEMENTOS DEL DOM ---
    const hangulInput = document.getElementById('hangul-input');
    const writingGrid = document.getElementById('hangul-writing-grid');
    const placeholder = document.getElementById('placeholder-message');
    const clearButton = document.getElementById('clear-all');
    const downloadButton = document.getElementById('download-pdf');
    const currentYearSpan = document.getElementById('current-year');

    // --- LÓGICA PRINCIPAL ---

    // 1. Actualizar el año en el footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // 2. Función para actualizar la cuadrícula en la PANTALLA
    const updateGrid = () => {
        const text = hangulInput.value.trim();
        writingGrid.innerHTML = ''; // Limpiamos la cuadrícula

        if (text.length === 0) {
            writingGrid.appendChild(placeholder); // Mostramos el mensaje inicial si no hay texto
            return;
        }

        // Creamos una caja para cada caracter en la pantalla
        text.split('').forEach(char => {
            if (char.trim() !== '') {
                const cell = document.createElement('div');
                cell.className = 'hangul-cell p-2 border m-1 d-flex justify-content-center align-items-center';
                cell.style.width = '80px';
                cell.style.height = '80px';
                cell.style.fontSize = '2.5rem';
                cell.textContent = char;
                writingGrid.appendChild(cell);
            }
        });
    };

    // 3. Función para generar y descargar el PDF (¡LA NUEVA LÓGICA!)
    const generatePdf = () => {
        const text = hangulInput.value.trim();
        if (text.length === 0) {
            alert('Por favor, escribe algunos caracteres Hangul primero.');
            return;
        }

        // Inicializamos jsPDF en orientación vertical (portrait), unidades en mm, y tamaño A4.
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // --- AÑADIMOS CONTENIDO AL PDF ---

        // Título del documento
        doc.setFontSize(22);
        doc.text('Hoja de Práctica de Hangul (한글)', 105, 20, { align: 'center' });

        // Instrucciones
        doc.setFontSize(12);
        doc.text('Usa los espacios para practicar la escritura de cada caracter.', 105, 30, { align: 'center' });

        // --- DIBUJAMOS LA CUADRÍCULA DE PRÁCTICA ---
        const chars = text.split('');
        const boxSize = 20; // Tamaño de cada caja en mm
        const margin = 15; // Margen de la página
        const page_width = doc.internal.pageSize.getWidth();
        let x = margin;
        let y = 50; // Posición Y inicial, debajo del título

        chars.forEach(char => {
            if (char.trim() === '') return; // Omitir espacios

            // Si nos salimos de la página, saltamos a la siguiente línea
            if (x + boxSize > page_width - margin) {
                x = margin;
                y += boxSize;
            }
            
            // Si nos salimos por abajo, creamos una nueva página
            if (y + boxSize > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                y = margin; // Reiniciamos Y en la nueva página
            }

            // Dibujamos la caja de práctica
            doc.setDrawColor(180, 180, 180); // Color gris para las líneas
            doc.rect(x, y, boxSize, boxSize);

            // Escribimos el caracter de ejemplo (más pequeño y en una esquina)
            doc.setFontSize(14);
            doc.setTextColor(150, 150, 150);
            doc.text(char, x + 2, y + 6);
            
            // Movemos la coordenada X para la siguiente caja
            x += boxSize;
        });

        // Guardamos el archivo PDF
        doc.save('mi-hoja-de-practica-hangul.pdf');
    };

    // --- EVENT LISTENERS ---
    hangulInput.addEventListener('input', updateGrid);
    clearButton.addEventListener('click', () => {
        hangulInput.value = '';
        updateGrid();
    });
    downloadButton.addEventListener('click', generatePdf);

    // Llamada inicial para asegurar que el placeholder se muestre
    updateGrid();
});