// Variables globales proporcionadas por el entorno de Canvas
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        // Importaciones de Firebase
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        import { getAuth, signInWithCustomToken, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

        // Inicializar Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        let userId = null;

        /**
         * Autentica al usuario usando un token personalizado o de forma anónima.
         */
        async function authenticate() {
            try {
                if (initialAuthToken) {
                    const userCredential = await signInWithCustomToken(auth, initialAuthToken);
                    userId = userCredential.user.uid;
                } else {
                    const userCredential = await signInAnonymously(auth);
                    userId = userCredential.user.uid;
                }
            } catch (error) {
                console.error("Error de autenticación:", error);
            }
        }

        // Lógica de la aplicación después de la autenticación
        async function setupApp() {
            await authenticate();
            if (!userId) {
                console.error("Autenticación fallida. No se puede acceder a la base de datos.");
                return;
            }

            const reviewsCollection = collection(db, `artifacts/${appId}/public/data/reviews`);
            const reviewForm = document.getElementById('review-form');
            const reviewsContainer = document.getElementById('reviews-container');
            const noReviewsMessage = document.getElementById('no-reviews-message');

            // Suscribirse a las reseñas en tiempo real con onSnapshot
            const q = query(reviewsCollection);
            onSnapshot(q, (snapshot) => {
                reviewsContainer.innerHTML = '';
                if (snapshot.empty) {
                    reviewsContainer.innerHTML = `<p class="text-muted text-center mt-3">Sé el primero en dejar una reseña.</p>`;
                } else {
                    snapshot.forEach(doc => {
                        const review = doc.data();
                        const reviewCard = document.createElement('div');
                        reviewCard.classList.add('card', 'p-3', 'shadow-sm', 'mb-2');
                        reviewCard.innerHTML = `
                            <p class="mb-1"><strong>${review.name}</strong> (${new Date(review.timestamp.seconds * 1000).toLocaleDateString()})</p>
                            <p class="mb-0">${review.text}</p>
                        `;
                        reviewsContainer.appendChild(reviewCard);
                    });
                }
            }, (error) => {
                console.error("Error al obtener reseñas:", error);
                reviewsContainer.innerHTML = `<p class="text-danger text-center mt-3">Hubo un error al cargar las reseñas.</p>`;
            });

            // Enviar la reseña a Firestore
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('reviewer-name').value;
                const text = document.getElementById('review-text').value;

                try {
                    await addDoc(reviewsCollection, {
                        name: name,
                        text: text,
                        timestamp: serverTimestamp()
                    });
                    reviewForm.reset();
                } catch (error) {
                    console.error("Error al añadir la reseña:", error);
                    alert("Error al publicar la reseña. Inténtalo de nuevo más tarde.");
                }
            });
        }

        setupApp();

        // ------------------------------------------------------------------------------------------------
        // Lógica para la sección de Redes Sociales
        // ------------------------------------------------------------------------------------------------
        
        document.addEventListener('DOMContentLoaded', () => {
            const logos = document.querySelectorAll('.social-logo');

            logos.forEach(logo => {
                // Almacena el nombre original del logo en una propiedad
                logo.originalName = logo.getAttribute('data-name');

                logo.addEventListener('mouseover', () => {
                    // Animación de "plato elevado"
                    logo.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
                    logo.style.transform = 'translateY(-10px) scale(1.1)';
                    logo.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';

                    // Muestra el nombre
                    const nameDisplay = document.createElement('div');
                    nameDisplay.textContent = logo.originalName;
                    nameDisplay.classList.add('social-name-display');
                    logo.appendChild(nameDisplay);
                });

                logo.addEventListener('mouseout', () => {
                    // Vuelve al estado original
                    logo.style.transform = 'translateY(0) scale(1)';
                    logo.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.1)';
                    
                    // Elimina el nombre
                    const nameDisplay = logo.querySelector('.social-name-display');
                    if (nameDisplay) {
                        nameDisplay.remove();
                    }
                });
            });
            
            // Actualizar el año en el footer
            document.getElementById('current-year').textContent = new Date().getFullYear();
        });