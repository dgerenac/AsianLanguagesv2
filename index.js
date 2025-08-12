document.addEventListener('DOMContentLoaded', () => {
    // ... Código existente para la animación de los botones de las tarjetas ...

    const languageButtons = document.querySelectorAll('.language-cards-section .card .btn');

    languageButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            
            const card = button.closest('.card');
            
            card.classList.add('animate__animated', 'animate__zoomOutDown');

            card.addEventListener('animationend', () => {
                window.location.href = button.href;
            }, { once: true });
        });
    });

    // --- NUEVO CÓDIGO PARA LA LECTURA EN VOZ ALTA ---
    const readAloudButtons = document.querySelectorAll('.read-aloud-btn');

    readAloudButtons.forEach(button => {
        button.addEventListener('click', () => {
            // El texto a leer es el párrafo hermano anterior
            const textToRead = button.closest('.intro-text-container').querySelector('p').textContent;
            
            // Obtenemos el idioma del atributo data-lang del botón
            const langCode = button.getAttribute('data-lang');
            
            // Creamos un nuevo objeto para la lectura
            const utterance = new SpeechSynthesisUtterance(textToRead);
            
            // Asignamos el idioma al objeto
            utterance.lang = langCode;

            // Leemos el texto
            window.speechSynthesis.speak(utterance);
        });
    });
    // --- FIN DEL NUEVO CÓDIGO ---

    // Código para actualizar el año en el footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});