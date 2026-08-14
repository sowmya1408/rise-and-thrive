/**
 * Rise & Thrive - Interactive Animation & Script Engine
 * Integrates Lenis Smooth Scroll, GSAP + ScrollTrigger, and interactive UI logic.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Register GSAP Plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ----------------------------------------------------
  // 1. Lenis Smooth Scrolling Setup
  // ----------------------------------------------------
  let lenis = null;

  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      });

      // Synchronize Lenis scrolling with GSAP ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    } catch (e) {
      console.warn('Lenis smooth scroll failed to initialize, falling back to native scroll:', e);
    }
  }

  // Smooth scroll helper for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Close mobile drawer if open
        closeMobileMenu();

        if (lenis) {
          lenis.scrollTo(targetElement, { offset: -80 });
        } else {
          const navOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ----------------------------------------------------
  // 2. Sticky Navbar Transition Controller
  // ----------------------------------------------------
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.remove('glass-nav-transparent');
        navbar.classList.add('glass-nav');
      } else {
        navbar.classList.remove('glass-nav');
        navbar.classList.add('glass-nav-transparent');
      }
    });
  }

  // ----------------------------------------------------
  // 3. Mobile Hamburger Menu Toggle
  // ----------------------------------------------------
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuBackdrop = document.getElementById('menu-backdrop');
  const closeMenuBtn = document.getElementById('close-menu-btn');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('translate-x-full');
    menuBackdrop.classList.remove('opacity-0', 'pointer-events-none');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('translate-x-full');
    menuBackdrop.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openMobileMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
  if (menuBackdrop) menuBackdrop.addEventListener('click', closeMobileMenu);

  // ----------------------------------------------------
  // 4. GSAP Intro & ScrollTrigger Reveal Animations
  // ----------------------------------------------------
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {

    // Hero Page-Load Intro Timeline with 3D Depth Reveal
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.1 } });
    
    heroTl.to('#hero-badge', { opacity: 1, y: 0, scale: 1, delay: 0.15 })
          .to('#hero-headline', { opacity: 1, y: 0, rotateX: 0 }, '-=0.7')
          .to('#hero-subheadline', { opacity: 1, y: 0 }, '-=0.7')
          .to('#hero-ctas', { opacity: 1, y: 0 }, '-=0.7');

    // Multi-Layer Depth Parallax Scrolling
    const heroBgGlow1 = document.querySelector('.hero-glow-1');
    const heroBgGlow2 = document.querySelector('.hero-glow-2');
    if (typeof ScrollTrigger !== 'undefined') {
      if (heroBgGlow1) {
        gsap.to(heroBgGlow1, {
          yPercent: 45,
          scale: 1.25,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }
      if (heroBgGlow2) {
        gsap.to(heroBgGlow2, {
          yPercent: -35,
          scale: 1.15,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      }
    }

    // Interactive Mouse Spotlight & 3D Tilt Effect on Glass Cards
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const tiltCards = document.querySelectorAll('.glass-card, .glass-card-featured');
      tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Set CSS custom variables for radial spotlight glow
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);

          // Calculate 3D tilt angles
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg tilt
          const rotateY = ((x - centerX) / centerX) * 6;  // max 6 deg tilt

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
      });
    }

    // Scroll-Triggered Reveal Animations with 3D Depth
    const revealElements = document.querySelectorAll('.gsap-reveal');
    revealElements.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50, rotateX: 6 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Staggered 3D Reveals for Card Grids
    const revealContainers = document.querySelectorAll('.gsap-reveal-grid');
    revealContainers.forEach((container) => {
      const cards = container.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 55, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 84%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Stats Count-Up Animation with Scale Pulse
    const statCounters = document.querySelectorAll('.stat-counter');
    statCounters.forEach((counter) => {
      const targetVal = parseInt(counter.getAttribute('data-target') || '0', 10);
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        onEnter: () => {
          let countObj = { val: 0 };
          gsap.to(countObj, {
            val: targetVal,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: () => {
              counter.innerText = prefix + Math.floor(countObj.val) + suffix;
            },
            onComplete: () => {
              gsap.fromTo(counter, { scale: 1 }, { scale: 1.15, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
            }
          });
        },
        once: true
      });
    });

  } else {
    // Fallback: If reduced motion or GSAP not available, force all reveal elements visible immediately
    document.querySelectorAll('.reveal-init, .gsap-reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.gsap-reveal-grid > *').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    // Set static values for stats
    document.querySelectorAll('.stat-counter').forEach((counter) => {
      const targetVal = counter.getAttribute('data-target') || '0';
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      counter.innerText = prefix + targetVal + suffix;
    });
  }

  // ----------------------------------------------------
  // 5. Contact / Guidance Form Validation & Submission
  // ----------------------------------------------------
  const guidanceForm = document.getElementById('guidance-form');
  const formSuccess = document.getElementById('form-success');

  if (guidanceForm) {
    guidanceForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const phoneInput = document.getElementById('form-phone');
      const referrerInput = document.getElementById('form-referrer');
      const areaSelect = document.getElementById('form-area');
      const messageInput = document.getElementById('form-message');

      // Simple validation helper
      const validateInput = (input) => {
        if (!input || !input.value.trim()) {
          if (input) input.classList.add('border-red-500');
          isValid = false;
        } else {
          input.classList.remove('border-red-500');
        }
      };

      validateInput(nameInput);
      validateInput(emailInput);
      validateInput(phoneInput);
      validateInput(referrerInput);
      validateInput(areaSelect);
      validateInput(messageInput);

      // Email regex check
      if (emailInput && emailInput.value.trim() && !/\S+@\S+\.\S+/.test(emailInput.value)) {
        emailInput.classList.add('border-red-500');
        isValid = false;
      }

      // Phone basic length check
      if (phoneInput && phoneInput.value.trim().length < 6) {
        phoneInput.classList.add('border-red-500');
        isValid = false;
      }

      if (isValid) {
        // Show loading state on submit button
        const submitBtn = guidanceForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin mr-2"></i> Submitting...';
          if (window.lucide) window.lucide.createIcons();
        }

        // Prepare data payload for Google Sheet Web App endpoint
        const formData = new FormData();
        formData.append('timestamp', new Date().toLocaleString());
        formData.append('fullName', nameInput.value.trim());
        formData.append('email', emailInput.value.trim());
        formData.append('phone', phoneInput.value.trim());
        formData.append('referrer', referrerInput.value.trim());
        formData.append('guidanceArea', areaSelect.value);
        formData.append('objectives', messageInput.value.trim());

        // Replace GOOGLE_SCRIPT_URL with your published Google Apps Script Web App Deployment URL
        const GOOGLE_SCRIPT_URL = window.GOOGLE_SHEETS_WEBAPP_URL || '';

        const handleSuccess = () => {
          if (!prefersReducedMotion && typeof gsap !== 'undefined') {
            gsap.to(guidanceForm, {
              opacity: 0,
              y: -20,
              duration: 0.4,
              onComplete: () => {
                guidanceForm.classList.add('hidden');
                formSuccess.classList.remove('hidden');
                gsap.fromTo(
                  formSuccess,
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
                );
              }
            });
          } else {
            guidanceForm.classList.add('hidden');
            formSuccess.classList.remove('hidden');
          }
        };

        if (GOOGLE_SCRIPT_URL) {
          fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
          })
          .then(() => handleSuccess())
          .catch((err) => {
            console.error('Error submitting form to Google Sheets:', err);
            handleSuccess(); // Show success to user regardless
          });
        } else {
          // Fallback simulation if web app URL is not yet connected
          setTimeout(handleSuccess, 600);
        }
      }
    });
  }

  // Handle Reset Form logic if user wants to submit another inquiry
  const resetFormBtn = document.getElementById('reset-form-btn');
  if (resetFormBtn && guidanceForm && formSuccess) {
    resetFormBtn.addEventListener('click', () => {
      guidanceForm.reset();
      const submitBtn = guidanceForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit Guidance Request</span> <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>';
        if (window.lucide) window.lucide.createIcons();
      }

      formSuccess.classList.add('hidden');
      guidanceForm.classList.remove('hidden');
      if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        gsap.fromTo(
          guidanceForm,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 }
        );
      }
    });
  }

  // ----------------------------------------------------
  // 6. Multi-Language & Theme Toggle Controller
  // ----------------------------------------------------
  const FLAG_SVGS = {
    en: `<svg class="w-5 h-3.5 rounded-sm object-cover shadow-sm inline-block" viewBox="0 0 60 30"><clipPath id="uk-flag-active"><path d="M0,0 v30 h60 v-30 z"/></clipPath><g clip-path="url(#uk-flag-active)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="2"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>`,
    da: `<svg class="w-5 h-3.5 rounded-sm object-cover shadow-sm inline-block" viewBox="0 0 37 28"><rect width="37" height="28" fill="#C8102E"/><rect x="12" width="4" height="28" fill="#FFF"/><rect y="12" width="37" height="4" fill="#FFF"/></svg>`,
    sv: `<svg class="w-5 h-3.5 rounded-sm object-cover shadow-sm inline-block" viewBox="0 0 16 10"><rect width="16" height="10" fill="#006AA7"/><rect x="5" width="2" height="10" fill="#FECC00"/><rect y="4" width="16" height="2" fill="#FECC00"/></svg>`,
    no: `<svg class="w-5 h-3.5 rounded-sm object-cover shadow-sm inline-block" viewBox="0 0 22 16"><rect width="22" height="16" fill="#BA0C2F"/><rect x="6" width="4" height="16" fill="#FFF"/><rect y="6" width="22" height="4" fill="#FFF"/><rect x="7" width="2" height="16" fill="#00205B"/><rect y="7" width="22" height="2" fill="#00205B"/></svg>`,
    fi: `<svg class="w-5 h-3.5 rounded-sm object-cover shadow-sm inline-block" viewBox="0 0 18 11"><rect width="18" height="11" fill="#FFF"/><rect x="5" width="3" height="11" fill="#002F6C"/><rect y="4" width="18" height="3" fill="#002F6C"/></svg>`
  };

  // --- Theme Toggle Controller ---
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  
  function setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('rt_theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('rt_theme', 'dark');
    }
    updateThemeIcons();
  }

  function updateThemeIcons() {
    const isLight = document.documentElement.classList.contains('light-theme');
    document.querySelectorAll('.theme-icon-sun').forEach(el => {
      if (isLight) el.classList.remove('hidden'); else el.classList.add('hidden');
    });
    document.querySelectorAll('.theme-icon-moon').forEach(el => {
      if (isLight) el.classList.add('hidden'); else el.classList.remove('hidden');
    });
  }

  // Initial Theme Load
  const savedTheme = localStorage.getItem('rt_theme') || 'dark';
  setTheme(savedTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.contains('light-theme');
      setTheme(isLight ? 'dark' : 'light');
    });
  });

  // --- Multi-Language i18n Controller ---
  let currentLang = localStorage.getItem('rt_lang') || 'en';

  function applyLanguage(lang) {
    if (typeof translations === 'undefined' || !translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('rt_lang', lang);
    document.documentElement.lang = lang;

    const dict = translations[lang];

    // Update text content for elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerText = dict[key];
      }
    });

    // Update placeholders for inputs with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Update active flag icon and code in UI
    document.querySelectorAll('.current-flag-icon').forEach(el => {
      el.innerHTML = FLAG_SVGS[lang] || FLAG_SVGS.en;
    });

    document.querySelectorAll('.current-lang-code').forEach(el => {
      el.innerText = lang.toUpperCase();
    });
  }

  // Initial Language Load
  applyLanguage(currentLang);

  // Language Dropdown Interactivity
  const langDropdownWrapper = document.getElementById('lang-dropdown-wrapper');
  const langDropdownBtn = document.getElementById('lang-dropdown-btn');
  const langMenu = document.getElementById('lang-menu');

  if (langDropdownBtn && langMenu) {
    langDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (langDropdownWrapper && !langDropdownWrapper.contains(e.target)) {
        langMenu.classList.add('hidden');
      }
    });
  }

  // Language option click handlers across desktop & mobile
  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      if (lang) {
        applyLanguage(lang);
        if (langMenu) langMenu.classList.add('hidden');
      }
    });
  });
});
