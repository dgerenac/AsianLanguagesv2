// Arreglo global de escritores HanziWriter
let hanziWriters = [];

// Función principal para generar los cuadros y funcionalidades
function generateHanziSquares(text) {
    const grid = document.getElementById('tian-zi-ge-grid');
    const romanizationDisplay = document.getElementById('hanzi-romanization-display');
    const placeholder = document.getElementById('placeholder-message');

    // Limpiar contenido previo
    grid.innerHTML = '';
    romanizationDisplay.textContent = 'Romanization:';
    hanziWriters = [];

    if (!text || text.trim() === '') {
        placeholder.style.display = 'block';
        return;
    } else {
        placeholder.style.display = 'none';
    }

    Array.from(text).forEach((char, index) => {
        // Crear contenedor para cada carácter
        const container = document.createElement('div');
        container.className = 'hanzi-square';
        container.style.width = '100px';
        container.style.height = '100px';
        container.style.margin = '5px';
        container.id = `hanzi-${index}`;
        grid.appendChild(container);

        // Crear instancia HanziWriter
        const writer = HanziWriter.create(container.id, char, {
            width: 100,
            height: 100,
            padding: 5,
            showOutline: true,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 100,
        });

        // Guardar escritor en el arreglo global
        hanziWriters.push(writer);

        // Animación al hacer clic en el cuadro
        container.addEventListener('click', () => {
            writer.animateCharacter();
        });

        // Mostrar pinyin si TinyPinyin está disponible
        if (window.Pinyin && Pinyin.isSupported()) {
            const pinyin = Pinyin.convertToPinyin(char, ' ', true);
            romanizationDisplay.textContent += ` ${pinyin}`;
        }
    });
}

// Inicializar al cargar la página con “你好”
document.addEventListener('DOMContentLoaded', () => {
    generateHanziSquares('你好');

    // Escuchar cambios en el input de usuario
    const input = document.getElementById('hanzi-input');
    input.addEventListener('input', (e) => {
        generateHanziSquares(e.target.value);
    });

    // Botón de animar todos
    const animateAllBtn = document.getElementById('animate-all');
    animateAllBtn.addEventListener('click', () => {
        hanziWriters.forEach(writer => writer.animateCharacter());
    });

    // Botón de descarga de PDF (en progreso)
    const downloadBtn = document.getElementById('download-pdf');
    downloadBtn.addEventListener('click', () => {
        alert("PDF export not implemented yet.");
    });
});
