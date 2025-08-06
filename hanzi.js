let hanziWriters = [];

function generateHanziSquares(text) {
  const grid = document.getElementById('tian-zi-ge-grid');
  const roman = document.getElementById('hanzi-romanization-display');
  const placeholder = document.getElementById('placeholder-message');

  grid.innerHTML = '';
  hanziWriters = [];
  roman.textContent = 'Romanization:';

  if (!text || !text.trim()) {
    placeholder.style.display = 'block';
    return;
  }

  placeholder.style.display = 'none';

  Array.from(text).forEach((char, index) => {
    const container = document.createElement('div');
    container.id = `hanzi-${index}`;
    container.className = 'hanzi-square';
    container.style.width = '100px';
    container.style.height = '100px';
    container.style.margin = '5px';
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

    if (window.Pinyin && Pinyin.isSupported()) {
      const p = Pinyin.convertToPinyin(char, '', true);
      roman.textContent += ` ${p}`;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  generateHanziSquares('你好');

  const input = document.getElementById('hanzi-input');
  if (input) {
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      generateHanziSquares(value);
    });
  }

  const animateButton = document.getElementById('animate-all');
  if (animateButton) {
    animateButton.addEventListener('click', () => {
      hanziWriters.forEach(writer => writer.animateCharacter());
    });
  }
});
