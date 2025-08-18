document.addEventListener('DOMContentLoaded', () => {
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

    const readAloudButtons = document.querySelectorAll('.read-aloud-btn');
        readAloudButtons.forEach(button => {
            button.addEventListener('click', () => {
                const textToRead = button.closest('.intro-text-container').querySelector('p').textContent;
                
                const langCode = button.getAttribute('data-lang');
                
                const utterance = new SpeechSynthesisUtterance(textToRead);
                
                utterance.lang = langCode;

                window.speechSynthesis.speak(utterance);
            });
        });
    
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});