/* ======= MENÚ  ======= */
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('show');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click', ()=> links.classList.remove('show'));
});

/* ======= Carrusel ======= */
class SimpleCarousel{
  constructor(root){
    this.root = root;
    this.track = root.querySelector('.carousel-track');
    this.slides = [...root.querySelectorAll('.slide')];
    this.prevBtn = root.querySelector('.carousel-prev');
    this.nextBtn = root.querySelector('.carousel-next');
    this.dotsWrap = root.querySelector('.carousel-dots');
    this.index = 0;
    this.autoplay = root.dataset.autoplay === 'true';
    this.interval = parseInt(root.dataset.interval || '4500',10);
    this.timer = null;

    this.dots = this.slides.map((_,i)=>{
      const b=document.createElement('button');
      b.addEventListener('click',()=>this.go(i));
      this.dotsWrap.appendChild(b);
      return b;
    });

    this.prevBtn.addEventListener('click',()=>this.prev());
    this.nextBtn.addEventListener('click',()=>this.next());
    this.root.addEventListener('mouseenter',()=>this.pause());
    this.root.addEventListener('mouseleave',()=>this.play());
    window.addEventListener('resize',()=>this.update());

    this.update(); this.play();
  }
  update(){
    const offset=-this.index*this.root.clientWidth;
    this.track.style.transform=`translateX(${offset}px)`;
    this.dots.forEach((d,i)=>d.classList.toggle('active',i===this.index));
  }
  go(i){this.index=(i+this.slides.length)%this.slides.length;this.update();}
  next(){this.go(this.index+1);}
  prev(){this.go(this.index-1);}
  play(){if(!this.autoplay)return;this.pause();this.timer=setInterval(()=>this.next(),this.interval);}
  pause(){if(this.timer)clearInterval(this.timer);}
}
document.querySelectorAll('.carousel').forEach(c=>new SimpleCarousel(c));

/* ======= PARALLAX SUAVE DEL HERO ======= */
(function(){
  const hero=document.getElementById('hero');
  const bg=hero?hero.querySelector('.hero-bg'):null;
  if(!hero||!bg)return;

  let ticking=false;
  const maxShift=40;   // px
  const maxZoom=0.06;  // 6%

  function onScroll(){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(update);
  }

  function update(){
    const rect=hero.getBoundingClientRect();
    const winH=window.innerHeight;
    const visible=Math.max(0,Math.min(1,1-(rect.top/winH)));
    const shift=visible*maxShift;
    const scale=1+(visible*maxZoom);
    bg.style.transform=`translateY(${shift}px) scale(${scale})`;
    ticking=false;
  }

  update();
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
})();
/* === MINI CARRUSEL AUTOMÁTICO === */
document.querySelectorAll('.mini-carousel').forEach(carousel=>{
  const track = carousel.querySelector('.mini-track');
  const slides = [...carousel.querySelectorAll('.mini-slide')];
  const interval = parseInt(carousel.dataset.interval || '3000',10);
  let index = 0;

  function move(){
    index = (index + 1) % slides.length;
    track.style.transform = `translateX(${-index * 100}%)`;
  }

  let timer = setInterval(move, interval);

  carousel.addEventListener('mouseenter', ()=>clearInterval(timer));
  carousel.addEventListener('mouseleave', ()=>timer = setInterval(move, interval));
});
/* ===== Carrusel infinito para la seccion de logos ===== */ 
document.querySelectorAll('.logo-carousel').forEach(carousel=>{
  const viewport = carousel.querySelector('.logo-viewport');
  const track = carousel.querySelector('.logo-track');
  const prev = carousel.querySelector('.logo-btn.prev');
  const next = carousel.querySelector('.logo-btn.next');

  if(!viewport || !track) return;

  // Se duplican los logos para efecto "infinito"
  const original = track.innerHTML;
  track.innerHTML = original + original;

  let x = 0;
  let raf = null;
  let isPaused = false;

  const speed = parseFloat(carousel.dataset.speed || "1.0");  
  const step = 0.6 * speed; 
  function loop(){
    if(!isPaused){
      x -= step;
       const half = track.scrollWidth / 2;
      if(Math.abs(x) >= half) x = 0;
      track.style.transform = `translateX(${x}px)`;
    }
    raf = requestAnimationFrame(loop);
  }

  function moveBy(px){
    x += px;
    track.style.transform = `translateX(${x}px)`;
  }

  // Botones
  prev?.addEventListener('click', ()=> moveBy(220));
  next?.addEventListener('click', ()=> moveBy(-220));

  // Pausa al pasar el mouse
  carousel.addEventListener('mouseenter', ()=> isPaused = true);
  carousel.addEventListener('mouseleave', ()=> isPaused = false);

  // Iniciar
  loop();
});
