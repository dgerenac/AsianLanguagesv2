let hanziWriters = [];

// Función para generar los cuadrados interactivos de los caracteres
function generateHanziSquares(text) {
  const grid = document.getElementById('tian-zi-ge-grid');
  const placeholder = document.getElementById('placeholder-message');

  grid.innerHTML = '';
  hanziWriters = [];

  if (!text || !text.trim()) {
    placeholder.style.display = 'block';
    return;
  }

  placeholder.style.display = 'none';

  // Recorre cada carácter del texto y crea un cuadro de escritura
  Array.from(text).forEach((char, index) => {
    const container = document.createElement('div');
    container.id = `hanzi-${index}`;
    container.className = 'tian-zi-ge-square border border-secondary m-1'; // Usa las clases de Bootstrap que tenías en HTML
    container.style.width = '100px';
    container.style.height = '100px';
    grid.appendChild(container);

    const writer = HanziWriter.create(container.id, char, {
      width: 100,
      height: 100,
      padding: 5,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 100,
    });

    hanziWriters.push(writer);

    container.addEventListener('click', () => writer.animateCharacter());
  });
}

// Función para inicializar los eventos y la lógica al cargar la página
function init() {
  // Actualizar el año en el footer
  document.getElementById('current-year').textContent = new Date().getFullYear();

  // Genera los cuadrados por defecto al cargar la página
  generateHanziSquares('你好');

  // Escucha cambios en el input
  const hanziInput = document.getElementById('hanzi-input');
  if (hanziInput) {
    hanziInput.addEventListener('input', (e) => {
      const value = e.target.value.replace(/\s/g, ''); // Elimina espacios
      generateHanziSquares(value);
    });
  }

  // Escucha el clic del botón de animar
  const animateAllButton = document.getElementById('animate-all');
  if (animateAllButton) {
    animateAllButton.addEventListener('click', () => {
      hanziWriters.forEach(writer => writer.animateCharacter());
    });
  }

  // Lógica para el botón de descarga del PDF
  const downloadPdfButton = document.getElementById('download-pdf');
  if (downloadPdfButton) {
    downloadPdfButton.addEventListener('click', () => {
      alert('La funcionalidad para descargar el PDF está en desarrollo. ¡Pronto estará disponible!');
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
