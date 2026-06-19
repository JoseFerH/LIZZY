document.addEventListener('DOMContentLoaded', () => {
    // 1. Background Randomizer
    initBackground();

    // 2. Canvas Particles (Zero Latency Touch Feedback)
    initParticles();

    // 3. Glowing Elements
    initGlowEffects();

    // 4. Random Phrases Mechanic
    initPhrasesMechanic();

    // 5. Easter Egg (Motion Sensor)
    initEasterEgg();

    // 6. Welcome Screen & Audio Initialization
    initWelcomeScreen();
});

function initWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const enterBtn = document.getElementById('enter-btn');
    const bgMusic = document.getElementById('bg-music');

    if (enterBtn && welcomeScreen) {
        enterBtn.addEventListener('click', () => {
            welcomeScreen.classList.add('hidden');
            if (bgMusic) {
                bgMusic.volume = 0.1; // Low volume
                bgMusic.play().catch(() => { });
            }
        });
    }
}

function initBackground() {
    const bgContainer = document.getElementById('bg-container');

    // Apply 1 of 10 static adaptive patterns
    const patternLayer = document.getElementById('pattern-layer');
    if (patternLayer) {
        const randomPattern = Math.floor(Math.random() * 10) + 1;
        patternLayer.className = 'bg-theme-' + randomPattern;
    }

    // Apply 1 of 3 dynamic animated themes on top or behind
    const themes = ['stars', 'fog', 'rain'];
    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];

    if (selectedTheme === 'stars') {
        for (let i = 0; i < 70; i++) {
            let star = document.createElement('div');
            star.className = 'star';
            star.style.width = (Math.random() * 2.5 + 0.5) + 'px';
            star.style.height = star.style.width;
            star.style.left = Math.random() * 100 + 'vw';
            star.style.top = Math.random() * 100 + 'vh';
            star.style.animationDuration = (Math.random() * 4 + 2) + 's';
            star.style.animationDelay = Math.random() * 5 + 's';
            bgContainer.appendChild(star);
        }
    } else if (selectedTheme === 'fog') {
        let fog1 = document.createElement('div');
        fog1.className = 'fog';
        fog1.style.animationDuration = '30s';

        let fog2 = document.createElement('div');
        fog2.className = 'fog';
        fog2.style.bottom = '-25%';
        fog2.style.opacity = '0.6';
        fog2.style.animationDuration = '22s';
        fog2.style.animationDirection = 'alternate-reverse';
        fog2.style.left = '-20%';

        bgContainer.appendChild(fog1);
        bgContainer.appendChild(fog2);
    } else if (selectedTheme === 'rain') {
        for (let i = 0; i < 40; i++) {
            let rain = document.createElement('div');
            rain.className = 'particle-rain';
            rain.style.left = Math.random() * 100 + 'vw';
            rain.style.animationDuration = (Math.random() * 2 + 3) + 's';
            rain.style.animationDelay = Math.random() * 5 + 's';
            rain.style.opacity = Math.random() * 0.5 + 0.2;
            bgContainer.appendChild(rain);
        }
    }
}

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const colors = ['#e8b4b8', '#d4c4fb', '#b5e5d5']; // pink, lilac, mint
    const balloonColors = ['#ff9a9e', '#fecfef', '#a1c4fd', '#c2e9fb', '#d4fc79', '#ffecd2']; // brighter, varied

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            // Much slower velocity for a relaxing drift
            const velocity = Math.random() * 1.5 + 0.5;
            this.vx = Math.cos(angle) * velocity;
            this.vy = Math.sin(angle) * velocity;
            this.size = Math.random() * 4 + 2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.life = 1;
            // Lower decay = longer life
            this.decay = Math.random() * 0.006 + 0.004;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
            // Less friction, smooth stop
            this.vx *= 0.98;
            this.vy *= 0.98;
        }
        draw() {
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            // Softer glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
        }
    }

    class Balloon {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            // Slower horizontal initial movement
            this.vx = (Math.random() - 0.5) * 1.5;
            // Float upwards very gently
            this.vy = -Math.random() * 1.5 - 0.5;
            this.size = Math.random() * 25 + 15;
            this.color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
            this.life = 1;
            // Very slow decay for a long-lasting effect
            this.decay = Math.random() * 0.003 + 0.002;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
            // Gentle, subtle wobble
            this.vx += (Math.random() - 0.5) * 0.1;
            if (this.vx > 1) this.vx = 1;
            if (this.vx < -1) this.vx = -1;
        }
        draw() {
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            // Large, soft illumination
            ctx.shadowBlur = 60;
            ctx.shadowColor = this.color;
        }
    }

    let isPointerDown = false;
    let pointerX = 0;
    let pointerY = 0;
    let lastSpawnTime = 0;
    let isNextEffectBalloons = false;

    function animate(time) {
        ctx.clearRect(0, 0, width, height);
        ctx.shadowBlur = 0;

        if (isPointerDown) {
            if (time - lastSpawnTime > 100) {
                if (isNextEffectBalloons) {
                    createBalloons(pointerX, pointerY, true);
                } else {
                    createBurst(pointerX, pointerY, true);
                }
                lastSpawnTime = time;
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    function createBurst(x, y, isContinuous = false) {
        const count = isContinuous ? 3 : 20;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y));
        }
    }

    function createBalloons(x, y, isContinuous = false) {
        const count = isContinuous ? 1 : (Math.floor(Math.random() * 4) + 4);
        for (let i = 0; i < count; i++) {
            particles.push(new Balloon(x, y));
        }
    }

    // Touch / Click event (Zero Latency)
    document.addEventListener('pointerdown', (e) => {
        isPointerDown = true;
        pointerX = e.clientX;
        pointerY = e.clientY;
        lastSpawnTime = performance.now();

        if (isNextEffectBalloons) {
            createBalloons(e.clientX, e.clientY, false);
        } else {
            createBurst(e.clientX, e.clientY, false);
        }
    }, { passive: true });

    document.addEventListener('pointermove', (e) => {
        if (isPointerDown) {
            pointerX = e.clientX;
            pointerY = e.clientY;
        }
    }, { passive: true });

    const handlePointerEnd = () => {
        if (isPointerDown) {
            isNextEffectBalloons = !isNextEffectBalloons;
            isPointerDown = false;
        }
    };
    document.addEventListener('pointerup', handlePointerEnd);
    document.addEventListener('pointercancel', handlePointerEnd);
}

function initGlowEffects() {
    document.addEventListener('pointerdown', (e) => {
        const target = e.target.closest('.glowable');
        if (target) {
            target.classList.add('glow-active');
            setTimeout(() => {
                target.classList.remove('glow-active');
            }, 1000);
        }
    }, { passive: true });
}

function initPhrasesMechanic() {
    const phrases = [
        "Eres la persona más especial que conozco.",
        "Gracias por aparecer y alegrar mis días con tu humor (CUANDO APARECES ;) ).",
        "Te admiro, todo lo que sé de tí me hace tener un gran cariño por tí.",
        "Admiro muchísimo tu fuerza y tu corazón.",
        "Que nunca te falten motivos para seguir sonriendo.",
        "Eres luz en la vida de todos los que te rodean.",
        "No eres lo que yo esperaba, eres mucho más.",
        "Sé que ya pregunté mucho sobre tí, pero aún así, quiero saber más.",
        "Se feliz, sin importar los momentos dificiles, solo sonrie como sabes hacerlo.",
        "Me encanta cómo logras que todo parezca más ligero cuando estás cerca.",
        "Tienes una forma de ver el mundo que me resulta completamente fascinante.",
        "No te lo digo lo suficiente, pero tu sola presencia me cambia el día.",
        "Eres de esas pocas personas que dejan una huella bonita sin siquiera intentarlo.",
        "Me alegra tanto haber coincidido contigo en esta vida (A PESAR DE QUE TE CONOZCA POR POCO TIEMPO).",
        "Tienes un superpoder para hacerme sonreír incluso a la distancia.",
        "Cada conversación contigo me deja con ganas de seguir conociéndote más.",
        "Ojalá supieras lo mucho que vales y el impacto que causas en los demás.",
        "Tu energía es contagiosa, nunca dejes que nadie apague esa chispa.",
        "A veces me encuentro recordando nuestras pláticas y sonrío de la nada.",
        "No sé qué hiciste, pero te ganaste mi cariño en un tiempo récord.",
        "Me gusta la calma que transmites, incluso cuando todo alrededor es un caos.",
        "Siempre encuentro una buena razón para querer hablar contigo un rato más.",
        "Eres un misterio del que nunca me canso de aprender.",
        "Gracias por ser esa persona con la que puedo ser yo mismo sin filtros.",
        "Tu autenticidad es lo que más me atrae de tu forma de ser.",
        "Sé que tienes mil cosas que hacer, pero valoro cada segundo que me dedicas.",
        "Tienes un corazón enorme, por favor asegúrate de cuidarlo tanto como cuidas a los demás.",
        "Me encanta tu risa, es definitivamente mi sonido favorito.",
        "Coincidir contigo es, por mucho, de las mejores cosas que me han pasado.",
        "Eres esa mezcla perfecta entre ternura, fuerza y un poquito de misterio.",
        "No importa qué tan malo sea el día, hablar contigo siempre lo arregla.",
        "Me fascina la locura de tu mente, tienes una inteligencia que atrapa desde el primer momento.",
        "Espero que la vida te devuelva toda la alegría que tú le regalas al mundo.",
        "Me haces querer ser una mejor versión de mí, solo por estar a tu altura.",
        "Contigo el tiempo vuela, y siempre me quedo con la sensación de que faltó más.",
        "Admiro tu resiliencia, eres mucho más fuerte de lo que te das crédito.",
        "No dejes de brillar, el mundo necesita más personas con tu esencia.",
        "Me guardo cada detalle que me cuentas como si fuera un tesoro.",
        "Haces que los días ordinarios se sientan un poquito más extraordinarios.",
        "Quizas no me haz quitado la pañoleta, pero quien quita algún día...",
        "Tienes una mirada que dice muchísimo más que cualquier frase bonita.",
        "Eres el recordatorio de que siempre hay un motivo para sonreír al final del día.",
        "Me gusta el caos que generas en mi mente cada vez que apareces.",
        "Tienes una forma de ser tan magnética que es imposible pasar de largo.",
        "Gracias por ser esa luz que ilumina incluso cuando todo parece un poco oscuro.",
        "Me fascina descubrir detalles nuevos de ti cada vez que platicamos.",
        "Tienes un corazón valiente, de esos que ya casi no se encuentran.",
        "Haces que todo sea un poquito más interesante desde que estás cerca.",
        "Me quedo con las ganas de saber más de ti, siempre dejas el listón muy alto.",
        "Eres esa persona con la que el tiempo nunca se siente como una pérdida.",
        "Admiro tu madurez, pero me encanta cuando dejas salir tu lado más divertido.",
        "Espero estar logrando alegrar tus días al menos un poquito de lo que tú alegras los míos.",
        "Simplemente gracias por ser tú, tal cual eres, sin quitarle ni ponerle nada."
    ];
    let currentPhraseIndex = -1;
    let requiredTaps = getRandomTaps();
    let currentTaps = 0;
    let modalOpenedAt = 0;

    const modal = document.getElementById('message-modal');
    const modalText = document.getElementById('modal-text');
    const closeBtn = document.getElementById('close-modal');
    const modalContent = modal.querySelector('.modal-content');

    function getRandomTaps() {
        return Math.floor(Math.random() * (6 - 3 + 1)) + 3; // 3 to 6
    }

    document.addEventListener('pointerdown', (e) => {
        // Ignore clicks on modal or easter egg
        if (e.target.closest('#message-modal') || e.target.closest('#easter-egg-overlay')) {
            return;
        }

        currentTaps++;
        if (currentTaps >= requiredTaps) {
            showModal();
        }
    });

    function showModal() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * phrases.length);
        } while (newIndex === currentPhraseIndex && phrases.length > 1);

        currentPhraseIndex = newIndex;
        modalText.innerText = phrases[currentPhraseIndex];
        modal.classList.remove('hidden');
        modalOpenedAt = Date.now();

        // Haptic feedback if supported
        if (navigator.vibrate) navigator.vibrate(50);
    }

    const closeAction = () => {
        // Ignora cualquier toque/clic durante los primeros 2 segundos (2000ms)
        if (Date.now() - modalOpenedAt < 2000) return;

        modal.classList.add('hidden');
        currentTaps = 0;
        requiredTaps = getRandomTaps();
    };

    if (closeBtn) closeBtn.addEventListener('click', closeAction);
    if (modalContent) modalContent.addEventListener('click', closeAction); // Close only when tapping the message box
}

function initEasterEgg() {
    const easterEgg = document.getElementById('easter-egg-overlay');
    const btnEnable = document.getElementById('enable-motion');
    const closeEasterBtn = document.getElementById('close-easter-egg');
    const playEasterBtn = document.getElementById('play-easter-audio');
    const easterAudio = document.getElementById('easter-audio');
    const explanationBtn = document.getElementById('explanation-btn');
    const explanationAudio = document.getElementById('explanation-audio');

    let isPlayingEaster = false;
    let isPlayingExplanation = false;
    let lastUpdate = 0;

    if (playEasterBtn && easterAudio) {
        playEasterBtn.addEventListener('click', () => {
            if (isPlayingEaster) {
                easterAudio.pause();
                playEasterBtn.innerText = "🎵";
            } else {
                if (isPlayingExplanation) {
                    explanationAudio.pause();
                    explanationBtn.innerText = "Explicación";
                    isPlayingExplanation = false;
                }
                easterAudio.play().catch(() => { });
                playEasterBtn.innerText = "Pausa ⏸️";
            }
            isPlayingEaster = !isPlayingEaster;
        });
    }

    // Check if permission is needed (iOS 13+)
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        btnEnable.style.display = 'inline-block';
        btnEnable.addEventListener('click', () => {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        btnEnable.style.display = 'none';
                        window.addEventListener('devicemotion', handleMotion);
                    } else {
                        alert('Se requiere permiso para la sorpresa oculta.');
                    }
                })
                .catch(console.error);
        });
    } else {
        // Non-iOS 13+ devices
        window.addEventListener('devicemotion', handleMotion);
    }

    function handleMotion(event) {
        let acc = event.acceleration || event.accelerationIncludingGravity;
        if (!acc || acc.x === null) return;

        let x = acc.x;
        let y = acc.y;
        let z = acc.z;

        // Calculate magnitude
        let acceleration = Math.sqrt(x * x + y * y + z * z);

        // If including gravity, we need a higher threshold because gravity itself is ~9.8
        let threshold = event.acceleration ? 18 : 28;

        if (acceleration > threshold) {
            let now = Date.now();
            if (now - lastUpdate > 3000) { // Prevent multiple rapid triggers
                lastUpdate = now;
                triggerEasterEgg();
            }
        }
    }

    function triggerEasterEgg() {
        easterEgg.classList.remove('hidden');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    }

    if (closeEasterBtn) {
        closeEasterBtn.addEventListener('click', () => {
            easterEgg.classList.add('hidden');
            if (easterAudio) {
                easterAudio.pause();
                easterAudio.currentTime = 0;
            }
            if (explanationAudio) {
                explanationAudio.pause();
                explanationAudio.currentTime = 0;
            }
            if (playEasterBtn) playEasterBtn.innerText = "🎵";
            if (explanationBtn) explanationBtn.innerText = "Explicación";
            isPlayingEaster = false;
            isPlayingExplanation = false;
        });
    }

    if (explanationBtn && explanationAudio) {
        explanationBtn.addEventListener('click', () => {
            if (isPlayingExplanation) {
                explanationAudio.pause();
                explanationBtn.innerText = "Explicación";
            } else {
                if (isPlayingEaster) {
                    easterAudio.pause();
                    playEasterBtn.innerText = "🎵";
                    isPlayingEaster = false;
                }
                explanationAudio.play().catch(() => { });
                explanationBtn.innerText = "Pausa ⏸️";
            }
            isPlayingExplanation = !isPlayingExplanation;
        });
    }
}
