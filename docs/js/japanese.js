<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>Práctica de Japonés y Lector de Texto | Asian Languages</title>
    <meta name="description" content="Genera hojas de práctica para escritura japonesa (Hiragana, Katakana, Kanji) y utiliza nuestra herramienta de texto a voz para mejorar tu pronunciación.">
    <meta name="keywords" content="aprender japonés, hiragana, katakana, kanji, práctica de escritura, texto a voz japonés">
    <meta name="author" content="David Gerena">

    <!-- Favicon -->
    <link rel="icon" href="https://placehold.co/32x32/EB455F/FFFFFF?text=A" type="image/png">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">

    <!-- Bootstrap CSS (CORREGIDO) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" xintegrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- jsPDF & html2canvas Libraries (para tu script) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

    <!-- Custom Styles -->
    <style>
        :root {
            --primary-color: #2B3467;
            --secondary-color: #BAD7E9;
            --accent-color: #EB455F;
            --light-color: #FCFDFE;
            --dark-color: #1c1c1c;
            --font-family: 'Poppins', sans-serif;
            --font-family-jp: 'Noto Sans JP', sans-serif;
        }
        body {
            font-family: var(--font-family);
            background-color: #f8f9fa;
            padding-top: 70px;
        }
        h1, h2, h3, h4, h5, h6 {
            font-weight: 700;
            color: var(--primary-color);
        }
        .section-padding { padding: 60px 0; }
        .navbar { transition: all 0.3s ease; }
        .navbar.scrolled {
            background-color: rgba(255, 255, 255, 0.95);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .nav-link:hover, .nav-link.active { color: var(--accent-color) !important; }
        .footer {
            background-color: var(--primary-color);
            color: var(--secondary-color);
            padding: 50px 0;
        }
        .footer a { color: var(--secondary-color); text-decoration: none; }
        .footer a:hover { color: var(--light-color); }
        .btn-custom {
            background-color: var(--accent-color);
            border-color: var(--accent-color);
            color: white;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 50px;
            transition: all 0.3s ease;
        }
        .btn-custom:hover {
            background-color: #d43a50;
            border-color: #d43a50;
            transform: translateY(-3px);
        }
        /* Estilos para tu funcionalidad de dibujo */
        .japanese-input, .tts-textarea {
             font-family: var(--font-family-jp);
             font-size: 1.2rem;
        }
        .japanese-square-container {
            cursor: crosshair;
            touch-action: none; /* Mejora la experiencia en móviles */
        }
        .tts-controls .btn {
            font-size: 1.5rem;
            width: 60px;
            height: 60px;
            border-radius: 50%;
        }
        .progress {
            height: 10px;
        }
    </style>
</head>
<body>

    <header>
        <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top scrolled">
            <div class="container">
                <a class="navbar-brand fw-bold fs-4" href="index.html">
                    <img src="https://placehold.co/32x32/EB455F/FFFFFF?text=A" alt="Logo" style="vertical-align: middle; margin-right: 8px;">
                    AsianLanguages
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item"><a class="nav-link" href="index.html">Inicio</a></li>
                        <li class="nav-item"><a class="nav-link" href="chino.html">Chino</a></li>
                        <li class="nav-item"><a class="nav-link active" aria-current="page" href="japanese.html">Japonés</a></li>
                        <li class="nav-item"><a class="nav-link" href="coreano.html">Coreano</a></li>
                        <li class="nav-item"><a class="nav-link" href="contacto.html">Contacto</a></li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <main class="container">
        <section id="pdf-generator" class="section-padding text-center">
            <h2 class="display-5 mb-3">Práctica de Escritura Japonesa</h2>
            <p class="lead mb-5">Escribe para generar tu hoja de práctica. ¡Puedes dibujar sobre los caracteres!</p>
            
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="mb-4">
                        <input type="text" id="japanese-input" class="form-control form-control-lg text-center japanese-input" placeholder="Ej: こんにちは 日本語 カタカナ">
                    </div>
                    <div id="japanese-writing-grid" class="d-flex flex-wrap justify-content-center border rounded p-3 mb-4 bg-white shadow-sm" style="min-height: 120px;">
                        <div id="placeholder-message" class="text-muted align-self-center">Tu hoja de práctica aparecerá aquí...</div>
                    </div>
                    <div>
                        <!-- ID CORREGIDO para que coincida con tu JS -->
                        <button id="clear-all" class="btn btn-secondary me-2">Limpiar Dibujo</button>
                        <button id="download-pdf" class="btn btn-custom">Descargar PDF</button>
                    </div>
                </div>
            </div>
        </section>

        <hr class="my-5">

        <!-- La sección de Texto a Voz sigue igual, no necesita cambios -->
        <section id="text-to-speech" class="section-padding text-center">
            <h2 class="display-5 mb-3">Práctica de Pronunciación</h2>
            <p class="lead mb-5">Pega cualquier texto en japonés y escúchalo para perfeccionar tu acento y entonación.</p>
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card shadow-sm">
                        <div class="card-body p-4">
                            <textarea id="tts-text" class="form-control tts-textarea" rows="6" placeholder="Pega aquí tu texto en japonés... 例えば、これは音声合成のテストです。"></textarea>
                            <div class="progress mt-3" role="progressbar" aria-label="Progreso de lectura" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                                <div id="tts-progress-bar" class="progress-bar bg-success" style="width: 0%"></div>
                            </div>
                            <div class="tts-controls mt-4">
                                <button id="tts-play-pause" class="btn btn-success"><i class="bi bi-play-fill"></i></button>
                                <button id="tts-stop" class="btn btn-danger ms-2"><i class="bi bi-stop-fill"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer mt-5">
        <div class="container">
            <div class="row">
                <div class="col-12 text-center">
                    <p class="mb-0">&copy; <span id="current-year"></span> AsianLanguages. Todos los derechos reservados por David.</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS Bundle (CORREGIDO) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" xintegrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    
    <!-- Enlazando a tu archivo JS externo -->
    <script src="js/japanese.js"></script>

    <!-- Script para la funcionalidad de Texto a Voz (se mantiene aquí para no mezclar lógicas) -->
    <script>
    document.addEventListener('DOMContentLoaded', function () {
        // --- INICIALIZACIÓN ---
        // Tu japanese.js ya se encarga del año, así que esta línea se puede borrar si la tienes allí.
        // Si no, la puedes dejar.
        if(document.getElementById('current-year')) {
            document.getElementById('current-year').textContent = new Date().getFullYear();
        }

        // --- FUNCIONALIDAD DE TEXTO A VOZ (TTS) ---
        const ttsTextArea = document.getElementById('tts-text');
        const playPauseBtn = document.getElementById('tts-play-pause');
        const stopBtn = document.getElementById('tts-stop');
        const progressBar = document.getElementById('tts-progress-bar');
        const playIcon = '<i class="bi bi-play-fill"></i>';
        const pauseIcon = '<i class="bi bi-pause-fill"></i>';

        let utterance = null;

        if ('speechSynthesis' in window) {
            playPauseBtn.addEventListener('click', () => {
                if (speechSynthesis.paused && utterance) {
                    speechSynthesis.resume();
                    playPauseBtn.innerHTML = pauseIcon;
                } else if (speechSynthesis.speaking) {
                    speechSynthesis.pause();
                    playPauseBtn.innerHTML = playIcon;
                } else {
                    const text = ttsTextArea.value.trim();
                    if (text.length > 0) {
                        utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = 'ja-JP';
                        
                        utterance.onstart = () => { playPauseBtn.innerHTML = pauseIcon; };
                        utterance.onboundary = (event) => {
                            const progress = (event.charIndex + event.charLength) / text.length * 100;
                            progressBar.style.width = progress + '%';
                        };
                        utterance.onend = () => {
                            playPauseBtn.innerHTML = playIcon;
                            progressBar.style.width = '0%';
                            utterance = null;
                        };
                        utterance.onerror = (event) => {
                            console.error('TTS Error:', event.error);
                            alert('No se pudo reproducir el audio. Puede que tu navegador necesite un paquete de voz en japonés.');
                        };
                        speechSynthesis.speak(utterance);
                    }
                }
            });

            stopBtn.addEventListener('click', () => {
                speechSynthesis.cancel();
                playPauseBtn.innerHTML = playIcon;
                progressBar.style.width = '0%';
                utterance = null;
            });

        } else {
            alert('Tu navegador no soporta la síntesis de voz.');
            document.getElementById('text-to-speech').style.display = 'none';
        }
    });
    </script>
</body>
</html>
