document.addEventListener('DOMContentLoaded', () => {
    const logos = document.querySelectorAll('.social-logo');

    logos.forEach(logo => {
        logo.originalName = logo.getAttribute('data-name');
        logo.addEventListener('mouseover', () => {
            logo.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
            logo.style.transform = 'translateY(-10px) scale(1.1)';
            logo.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
            const nameDisplay = document.createElement('div');
            nameDisplay.textContent = logo.originalName;
            nameDisplay.classList.add('social-name-display');
            logo.appendChild(nameDisplay);
        });
        logo.addEventListener('mouseout', () => {
            logo.style.transform = 'translateY(0) scale(1)';
            logo.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.1)';
            const nameDisplay = logo.querySelector('.social-name-display');
            if (nameDisplay) {
                nameDisplay.remove();
            }
        });
    });

    // Script para actualizar el año en el footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});