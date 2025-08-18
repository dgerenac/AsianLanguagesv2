document.addEventListener('DOMContentLoaded', () => {
    const hangulInput = document.getElementById('hangul-input');
    const hangulWritingGrid = document.getElementById('hangul-writing-grid');
    const clearAllButton = document.getElementById('clear-all');
    const downloadPdfButton = document.getElementById('download-pdf');
    const placeholderMessage = document.getElementById('placeholder-message');

    const canvases = [];

    const generateHangulSquares = (text) => {
        hangulWritingGrid.innerHTML = '';
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
                    squareContainer.classList.add('hangul-square-container', 'border', 'border-secondary', 'm-1', 'p-0');
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

                    squareContainer.addEventListener('click', () => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = '#333';
                        ctx.font = '72px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(char, canvas.width / 2, canvas.height / 2);
                    });

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
                hangulWritingGrid.appendChild(phraseContainer);

                if (phraseIndex < phrases.length - 1) {
                    const separator = document.createElement('div');
                    separator.classList.add('p-2');
                    hangulWritingGrid.appendChild(separator);
                }
            }
        });
    };

    hangulInput.addEventListener('input', (event) => {
        const hangulText = event.target.value;
        generateHangulSquares(hangulText);
    });
    
    clearAllButton.addEventListener('click', () => {
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    });

    downloadPdfButton.addEventListener('click', async () => {
        try {
            const gridElement = document.getElementById('hangul-writing-grid');
            if (!gridElement) return;

            const canvas = await html2canvas(gridElement, {
                backgroundColor: "#ffffff"
            });

            const imgData = canvas.toDataURL("image/png");

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("p", "mm", "a4");

            const pageWidth = pdf.internal.pageSize.getWidth();

            const today = new Date().toLocaleDateString("es-ES");
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(16);
            pdf.text("Hangul Worksheet", pageWidth / 2, 15, { align: "center" });

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            pdf.text(`Fecha: ${today}`, pageWidth / 2, 23, { align: "center" });

            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 10, 30, imgWidth, imgHeight);

            pdf.save("hangul-worksheet.pdf");
        } catch (error) {
            console.error("Error generando PDF:", error);
            alert("Hubo un error al generar el PDF.");
        }
    });

    generateHangulSquares('안녕!');
});
