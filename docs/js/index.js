// Se espera a que todo el HTML esté cargado para ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. EFECTO NAVBAR AL HACER SCROLL ---
    // Mantiene el efecto visual que ya teníamos en la barra de navegación.
    const navbar = document.querySelector('.navbar');
    // Es una buena práctica verificar que el elemento exista antes de añadirle eventos.
    if (navbar) {
        window.onscroll = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };
    }

    // --- 2. INICIALIZACIÓN DE ANIMACIONES (AOS) ---
    // Mantiene las animaciones de aparición de las secciones.
    // Verificamos si la librería AOS se cargó correctamente.
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800, // Duración de la animación en milisegundos
            once: true,    // La animación solo ocurre una vez
        });
    }

    // --- 3. ANIMACIÓN EN TARJETAS DE IDIOMAS (Tu idea) ---
    // ¡Mejorado para ser más específico y seguro!
    // Usamos el ID de la sección para asegurar que solo afecte a esas tarjetas.
    const languageButtons = document.querySelectorAll('#idiomas .language-card .btn');
    languageButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Prevenimos la navegación inmediata para dar tiempo a la animación.
            event.preventDefault();
            
            // closest() es perfecto para encontrar el contenedor padre.
            const card = button.closest('.language-card');
            
            if (card) {
                // Añadimos las clases de Animate.css para la animación de salida.
                card.classList.add('animate__animated', 'animate__zoomOutDown');

                // Escuchamos a que la animación termine para navegar a la página.
                // { once: true } es una optimización para que el evento solo se dispare una vez.
                card.addEventListener('animationend', () => {
                    window.location.href = button.href;
                }, { once: true });
            } else {
                // Si por alguna razón no se encuentra la tarjeta, navegamos directamente.
                window.location.href = button.href;
            }
        });
    });

    // --- 4. FUNCIÓN LEER EN VOZ ALTA (Tu idea) ---
    // ¡Excelente para accesibilidad! Ideal para las páginas de cada idioma.
    const readAloudButtons = document.querySelectorAll('.read-aloud-btn');
    
    // Primero, verificamos si el navegador del usuario soporta esta función.
    if ('speechSynthesis' in window) {
        readAloudButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Usamos un atributo 'data-text-target' para saber qué texto leer.
                // Esto es más flexible que buscar un <p> cercano.
                const textElementId = button.getAttribute('data-text-target');
                const textElement = document.getElementById(textElementId);
                
                if (textElement) {
                    const textToRead = textElement.textContent;
                    const langCode = button.getAttribute('data-lang'); // ej: 'zh-CN', 'ja-JP', 'ko-KR'
                    
                    const utterance = new SpeechSynthesisUtterance(textToRead);
                    utterance.lang = langCode;

                    // Detenemos cualquier lectura anterior antes de empezar una nueva.
                    window.speechSynthesis.cancel(); 
                    window.speechSynthesis.speak(utterance);
                }
            });
        });
    } else {
        // Si el navegador no lo soporta, ocultamos los botones para no confundir al usuario.
        console.log('Tu navegador no soporta la síntesis de voz.');
        readAloudButtons.forEach(button => button.style.display = 'none');
    }
    
    // --- 5. AÑO ACTUAL EN EL FOOTER (Tu idea) ---
    // Un detalle profesional que mantiene el footer siempre actualizado.
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});