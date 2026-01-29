/* Oscar Alexander Vilchis Soto Desarrollo Web para Servicio Social 2025 Vía Recreativa Querétaro --*/

/* ======= MENÚ  ======= */
// Elementos del menú (botón hamburguesa y links)
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

// Abrir/cerrar menú en móvil
if (toggle) {
  toggle.addEventListener('click', () => {
    // Alterna la clase "show" para mostrar/ocultar el menú
    const open = links.classList.toggle('show');

    // Accesibilidad: indica si está abierto o cerrado
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Cierra el menú cuando el usuario da clic en cualquier link 
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => links.classList.remove('show'));
});


/* ======= Carrusel ======= */
// Carrusel reutilizable para cualquier <div class="carousel"> del sitio
class SimpleCarousel {
  constructor(root) {
    // Contenedor principal del carrusel
    this.root = root;

    // Elementos internos del carrusel
    this.track = root.querySelector('.carousel-track');
    this.slides = [...root.querySelectorAll('.slide')];
    this.prevBtn = root.querySelector('.carousel-prev');
    this.nextBtn = root.querySelector('.carousel-next');
    this.dotsWrap = root.querySelector('.carousel-dots');

    // Estado del carrusel
    this.index = 0;

    // Configuración desde el HTML con data-autoplay y data-interval
    this.autoplay = root.dataset.autoplay === 'true';
    this.interval = parseInt(root.dataset.interval || '4500', 10);

    // Timer para autoplay
    this.timer = null;

    // Crear los "puntitos" (dots) según la cantidad de slides
    this.dots = this.slides.map((_, i) => {
      const b = document.createElement('button');
      b.addEventListener('click', () => this.go(i));
      this.dotsWrap.appendChild(b);
      return b;
    });

    // Eventos de navegación
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());

    // Pausa autoplay cuando pasas el mouse encima
    this.root.addEventListener('mouseenter', () => this.pause());
    this.root.addEventListener('mouseleave', () => this.play());

    // Al cambiar el tamaño de pantalla recalcula el desplazamiento
    window.addEventListener('resize', () => this.update());

    // Inicializar
    this.update();
    this.play();
  }

  // Actualiza posición del carrusel y el estado de los dots
  update() {
    // Mueve el track según el ancho del contenedor (1 slide por pantalla)
    const offset = -this.index * this.root.clientWidth;
    this.track.style.transform = `translateX(${offset}px)`;

    // Marca el dot activo
    this.dots.forEach((d, i) => d.classList.toggle('active', i === this.index));
  }

  // Ir a un slide específico (con wrap-around)
  go(i) {
    this.index = (i + this.slides.length) % this.slides.length;
    this.update();
  }

  // Siguiente / anterior
  next() { this.go(this.index + 1); }
  prev() { this.go(this.index - 1); }

  // Inicia autoplay si está activado
  play() {
    if (!this.autoplay) return;
    this.pause(); // evita que se creen varios timers
    this.timer = setInterval(() => this.next(), this.interval);
  }

  // Detiene autoplay
  pause() {
    if (this.timer) clearInterval(this.timer);
  }
}

// Activa el carrusel en todos los elementos con clase .carousel
document.querySelectorAll('.carousel').forEach(c => new SimpleCarousel(c));


/* ======= PARALLAX SUAVE DEL HERO ======= */
// Efecto parallax leve para la imagen del hero
(function () {
  const hero = document.getElementById('hero');
  const bg = hero ? hero.querySelector('.hero-bg') : null;

  // Si no existe hero, no hacemos nada
  if (!hero || !bg) return;

  let ticking = false;

  // Ajustes del efecto
  const maxShift = 40;   // desplazamiento vertical máximo (px)
  const maxZoom = 0.06;  // zoom máximo (0.06 = 6%)

  // Se ejecuta en scroll pero usando requestAnimationFrame para que sea más suave
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  // Calcula cuánto se ve el hero y aplica el transform
  function update() {
    const rect = hero.getBoundingClientRect();
    const winH = window.innerHeight;

    // "visible" va de 0 a 1 según qué tanto está el hero en pantalla
    const visible = Math.max(0, Math.min(1, 1 - (rect.top / winH)));

    const shift = visible * maxShift;
    const scale = 1 + (visible * maxZoom);

    // Aplica el efecto (mueve un poco y hace zoom leve)
    bg.style.transform = `translateY(${shift}px) scale(${scale})`;

    ticking = false;
  }

  // Primera actualización al cargar
  update();

  // Eventos
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();


/* === MINI CARRUSEL AUTOMÁTICO === */
// Mini carrusel para la página "Acerca" y cualquier otro que use .mini-carousel
document.querySelectorAll('.mini-carousel').forEach(carousel => {
  const track = carousel.querySelector('.mini-track');
  const slides = [...carousel.querySelectorAll('.mini-slide')];

  // Intervalo configurable desde el HTML con data-interval
  const interval = parseInt(carousel.dataset.interval || '3000', 10);

  let index = 0;

  // Cambia de imagen moviendo el track por porcentajes (100% = 1 slide)
  function move() {
    index = (index + 1) % slides.length;
    track.style.transform = `translateX(${-index * 100}%)`;
  }

  // Inicia el autoplay
  let timer = setInterval(move, interval);

  // Pausa al pasar el mouse (para que se pueda ver la foto con calma)
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', () => timer = setInterval(move, interval));
});


/* ===== Carrusel infinito para la seccion de logos ===== */
// Carrusel horizontal "infinito" para aliados / logos (Actividades)
document.querySelectorAll('.logo-carousel').forEach(carousel => {
  const viewport = carousel.querySelector('.logo-viewport');
  const track = carousel.querySelector('.logo-track');
  const prev = carousel.querySelector('.logo-btn.prev');
  const next = carousel.querySelector('.logo-btn.next');

  // Si falta algo, no corre (evita errores)
  if (!viewport || !track) return;

  // Se duplican los logos para lograr el efecto infinito
  const original = track.innerHTML;
  track.innerHTML = original + original;

  // Posición horizontal del track
  let x = 0;

  // Control del loop infinito
  let raf = null;
  let isPaused = false;

  // Velocidad configurable desde HTML con data-speed
  const speed = parseFloat(carousel.dataset.speed || "1.0");
  const step = 0.6 * speed;

  // Animación continua con requestAnimationFrame
  function loop() {
    if (!isPaused) {
      x -= step;

      // La mitad equivale al tamaño del contenido original (antes de duplicar)
      const half = track.scrollWidth / 2;

      // Cuando se llega al final regresa al inicio 
      if (Math.abs(x) >= half) x = 0;

      track.style.transform = `translateX(${x}px)`;
    }

    raf = requestAnimationFrame(loop);
  }

  // Mover manualmente con botones  
  function moveBy(px) {
    x += px;
    track.style.transform = `translateX(${x}px)`;
  }

  // Botones 
  prev?.addEventListener('click', () => moveBy(220));
  next?.addEventListener('click', () => moveBy(-220));

  // Pausa cuando pasas el mouse encima
  carousel.addEventListener('mouseenter', () => isPaused = true);
  carousel.addEventListener('mouseleave', () => isPaused = false);

  // Iniciar carrusel infinito
  loop();
});
