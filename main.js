/* ═══════════════════════════════════════════════════════
   SANCHAYAN — Ultra-Premium Portfolio Engine
   Three.js · GSAP · Lenis · Motion System
   ═══════════════════════════════════════════════════════ */

import './style.css';
import * as THREE from 'three';
import Lenis from 'lenis';

// ─── Wait for DOM + Libraries ───
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
});

/* ═══════════════════ PRELOADER ═══════════════════ */
function initPreloader() {
  const bar = document.getElementById('preloader-bar');
  const percent = document.getElementById('preloader-percent');
  const preloader = document.getElementById('preloader');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      bar.style.width = '100%';
      percent.textContent = '100%';

      setTimeout(() => {
        gsap.to(preloader, {
          yPercent: -100,
          duration: 1,
          ease: 'power4.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            initApp();
          }
        });
      }, 400);
    } else {
      bar.style.width = progress + '%';
      percent.textContent = Math.floor(progress) + '%';
    }
  }, 100);
}

/* ═══════════════════ MAIN APP ═══════════════════ */
function initApp() {
  initLenis();
  initThreeScene();
  initCustomCursor();
  initNavbar();
  initGSAPAnimations();
  initSkillRings();
  initCounters();
  initContactForm();
  initMagneticButtons();
}

/* ═══════════════════ LENIS SMOOTH SCROLL ═══════════════════ */
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

/* ═══════════════════ THREE.JS ROBOTIC ENGINE ═══════════════════ */
function initThreeScene() {
  const container = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 60;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // ── Core Group ──
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  // 1. Refined Minimalist Core (Holographic Point Sphere)
  const coreGeometry = new THREE.SphereGeometry(6, 64, 64);
  const coreMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  const pointSphere = new THREE.Points(coreGeometry, coreMaterial);
  coreGroup.add(pointSphere);

  const outerFrame = new THREE.Mesh(
    new THREE.IcosahedronGeometry(10, 1),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.05 })
  );
  coreGroup.add(outerFrame);

  // 2. HUD Rings (Minimalist)
  const createRing = (radius, color, opacity, rotationSpeed) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.02, 16, 100),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
    );
    ring.userData.rotationSpeed = rotationSpeed;
    coreGroup.add(ring);
    return ring;
  };

  const r1 = createRing(14, 0x00f0ff, 0.15, 0.002);
  const r2 = createRing(16, 0x8b5cf6, 0.1, -0.003);
  r1.rotation.x = Math.PI / 2;
  r2.rotation.y = Math.PI / 4;

  // 3. Circuit Mesh (Minimalist Points)
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  const spread = 150;

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.15,
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // ── Widgets Parallax Logic ──
  const widgets = document.querySelectorAll('.floating-widget');
  
  function updateWidgets() {
    widgets.forEach(widget => {
      const depth = parseFloat(widget.dataset.parallax) || 0.05;
      const moveX = mouse.x * depth * 50;
      const moveY = mouse.y * depth * 50;
      widget.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }

  // ── Motion Tracking ──
  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animate ──
  let frame = 0;
  const tickerLeft = document.getElementById('ticker-left');
  const tickerRight = document.getElementById('ticker-right');

  function updateHUD() {
    if (frame % 30 === 0) {
      const hex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase();
      tickerLeft.textContent = `SYSTEM: ONLINE // ADDR: 0x${hex}`;
      tickerRight.textContent = `SYNC: ${90 + Math.floor(Math.random() * 10)}% // CORE: ${Math.floor(Math.random() * 100)}%`;
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    frame++;

    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Core Animations
    coreGroup.rotation.y += 0.002;
    pointSphere.rotation.z += 0.005;
    outerFrame.rotation.x += 0.001;
    
    r1.rotation.z += r1.userData.rotationSpeed;
    r2.rotation.z += r2.userData.rotationSpeed;
    
    // Core Pulse
    const pulse = 1 + Math.sin(frame * 0.03) * 0.05;
    pointSphere.scale.set(pulse, pulse, pulse);
    
    // Parallax
    coreGroup.position.x = mouse.x * 3;
    coreGroup.position.y = mouse.y * 3;
    particles.rotation.y = mouse.x * 0.05;

    updateHUD();
    updateWidgets(); // Apply parallax to HTML items
    renderer.render(scene, camera);
  }

  // Staggered boot-up
  gsap.from(coreGroup.scale, { x: 0, y: 0, z: 0, duration: 2, ease: 'expo.out' });
  animate();
}

/* ═══════════════════ CUSTOM CURSOR ═══════════════════ */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let cx = 0, cy = 0;
  let rx = 0, ry = 0;

  window.addEventListener('mousemove', (e) => {
    cx = e.clientX;
    cy = e.clientY;
    dot.style.left = cx + 'px';
    dot.style.top = cy + 'px';
  });

  function animateRing() {
    rx += (cx - rx) * 0.15;
    ry += (cy - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effects
  const interactives = document.querySelectorAll('a, button, [data-magnetic], [data-tilt], input, textarea');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('active');
      ring.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('active');
      ring.classList.remove('active');
    });
  });
}

/* ═══════════════════ NAVBAR ═══════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');

  // Scroll detection
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile toggle
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  // Close mobile menu on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target && lenis) {
        lenis.scrollTo(target, { offset: -60 });
      }
    });
  });
}

/* ═══════════════════ GSAP ANIMATIONS ═══════════════════ */
function initGSAPAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // ── Hero entrance ──
  const heroTL = gsap.timeline({ delay: 0.2 });

  heroTL.from('.hero__badge', {
    y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
  })
  .from('.hero__name', {
    y: 80, opacity: 0, duration: 1, ease: 'power3.out',
    onComplete: () => applyTextSplit('.hero__name')
  }, '-=0.4')
  .from('.hero__tagline', {
    y: 40, opacity: 0, duration: 0.8, ease: 'power3.out'
  }, '-=0.5')
  .from('.hero__sub-tagline', {
    y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
  }, '-=0.5')
  .from('.hero__cta .btn', {
    y: 30, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out'
  }, '-=0.4')
  .from('.hero__stat', {
    y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out'
  }, '-=0.3')
  .from('.hero__stat-divider', {
    scaleY: 0, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out'
  }, '-=0.5')
  .from('.hero__scroll-indicator', {
    y: 20, opacity: 0, duration: 0.6, ease: 'power3.out'
  }, '-=0.3');

  // ── Section title reveals ──
  document.querySelectorAll('.section__title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      onComplete: () => applyTextSplit(title)
    });
  });

  document.querySelectorAll('.section__tag').forEach(tag => {
    gsap.from(tag, {
      scrollTrigger: {
        trigger: tag,
        start: 'top 85%',
      },
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });
  });

  document.querySelectorAll('.section__line').forEach(line => {
    gsap.from(line, {
      scrollTrigger: {
        trigger: line,
        start: 'top 85%',
      },
      scaleX: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // ── About cards ──
  gsap.utils.toArray('.about__card').forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power3.out'
    });
  });

  // ── Skill cards ──
  gsap.utils.toArray('.skill-card').forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
      },
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 0.7,
      delay: (i % 6) * 0.08,
      ease: 'power3.out'
    });
  });

  // ── Project cards ──
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay: i * 0.12,
      ease: 'power3.out'
    });
  });

  // ── Timeline items ──
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
      },
      x: 0,
      opacity: 1,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power3.out'
    });
  });

  // ── Contact section ──
  gsap.from('.contact__info', {
    scrollTrigger: {
      trigger: '.contact__grid',
      start: 'top 80%',
    },
    x: -40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.contact__form', {
    scrollTrigger: {
      trigger: '.contact__grid',
      start: 'top 80%',
    },
    x: 40,
    opacity: 0,
    duration: 0.8,
    delay: 0.15,
    ease: 'power3.out'
  });

  // ── Marquee parallax ──
  gsap.to('.marquee-track', {
    scrollTrigger: {
      trigger: '.marquee-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
    x: -100,
    ease: 'none'
  });
}

/* ═══════════════════ TEXT SPLIT ANIMATION ═══════════════════ */
function applyTextSplit(target) {
  if (typeof SplitType === 'undefined') return;

  try {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el || el.dataset.split === 'done') return;

    const split = new SplitType(el, { types: 'chars' });
    el.dataset.split = 'done';

    gsap.from(split.chars, {
      opacity: 0,
      y: 20,
      rotateX: -40,
      filter: 'blur(6px)',
      duration: 0.6,
      stagger: 0.03,
      ease: 'power3.out',
    });
  } catch (e) {
    // SplitType fallback — just show text
  }
}

/* ═══════════════════ SKILL RINGS ═══════════════════ */
function initSkillRings() {
  // Add SVG gradient definition to body
  const svgDefs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgDefs.setAttribute("width", "0");
  svgDefs.setAttribute("height", "0");
  svgDefs.style.position = "absolute";
  svgDefs.innerHTML = `
    <defs>
      <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#00f0ff" />
        <stop offset="100%" style="stop-color:#8b5cf6" />
      </linearGradient>
    </defs>
  `;
  document.body.appendChild(svgDefs);

  // Animate rings on scroll
  const circumference = 2 * Math.PI * 54; // r=54

  document.querySelectorAll('.ring-fill').forEach(ring => {
    const percent = parseInt(ring.dataset.percent) || 0;
    const offset = circumference - (percent / 100) * circumference;

    // Use GSAP setAttribute since stroke-dashoffset is a presentational attribute
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;
    ring.style.stroke = 'url(#ringGradient)';

    ScrollTrigger.create({
      trigger: ring.closest('.skill-card'),
      start: 'top 90%',
      onEnter: () => {
        gsap.to(ring, {
          strokeDashoffset: offset,
          duration: 1.5,
          ease: 'power3.out',
        });
      },
      once: true,
    });
  });
}

/* ═══════════════════ COUNTER ANIMATION ═══════════════════ */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power3.out',
          onUpdate: function() {
            const currentVal = this.targets()[0].val;
            el.textContent = target % 1 === 0 ? Math.floor(currentVal) : currentVal.toFixed(1);
          }
        });
      },
      once: true,
    });
  });
}

/* ═══════════════════ MAGNETIC BUTTONS ═══════════════════ */
function initMagneticButtons() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
      });
    });
  });
}

/* ═══════════════════ TILT CARDS ═══════════════════ */
document.addEventListener('mousemove', (e) => {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const rotX = ((y / rect.height) - 0.5) * -8;
      const rotY = ((x / rect.width) - 0.5) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    } else {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    }
  });
});

/* ═══════════════════ CONTACT FORM ═══════════════════ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<span>Message Sent! ✓</span>';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}
