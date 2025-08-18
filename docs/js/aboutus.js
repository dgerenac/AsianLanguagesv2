
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        import { getAuth, signInWithCustomToken, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        let userId = null;

        
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
            
            document.getElementById('current-year').textContent = new Date().getFullYear();
        });