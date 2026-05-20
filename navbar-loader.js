/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  NSV NAVBAR LOADER - navbar-loader.js                ║
 * ║  PT Nararya Semesta Visitama                         ║
 * ║                                                      ║
 * ║  CARA PAKAI:                                         ║
 * ║  Tambahkan 1 baris ini sebelum </body> di setiap     ║
 * ║  halaman HTML yang ingin pakai navbar NSV:           ║
 * ║                                                      ║
 * ║  <script src="navbar-loader.js"></script>            ║
 * ║                                                      ║
 * ║  Script ini akan otomatis:                           ║
 * ║  1. Inject <div id="nsv-navbar"> kalau belum ada     ║
 * ║  2. Load navbar.html via fetch                       ║
 * ║  3. Inject Tailwind + fonts + icons jika belum ada   ║
 * ║  4. Aktifkan semua interaksi (mobile menu,           ║
 * ║     dropdown, scroll shadow, active link)            ║
 * ╚══════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  // ── 1. Resolve path ke navbar.html (relatif ke lokasi script ini) ──────────
  const scripts   = document.querySelectorAll('script[src]');
  const thisScript = Array.from(scripts).find(s => s.src.includes('navbar-loader'));
  const base       = thisScript
    ? thisScript.src.replace('navbar-loader.js', '')
    : './';

  const NAVBAR_PATH = base + 'navbar.html';

  // ── 2. Inject dependencies jika belum ada ──────────────────────────────────
  function injectDep(tag, attrs) {
    const selector = Object.entries(attrs)
      .filter(([k]) => k !== 'text')
      .map(([k, v]) => `[${k}="${v}"]`).join('');
    if (selector && document.querySelector(selector)) return; // sudah ada

    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    });
    document.head.appendChild(el);
  }

  // Tailwind CDN
  if (!window.tailwind) {
    injectDep('script', { src: 'https://cdn.tailwindcss.com' });
  }

  // Tailwind config (primary color)
  if (!document.querySelector('#nsv-tw-config')) {
    const cfg = document.createElement('script');
    cfg.id = 'nsv-tw-config';
    cfg.textContent = `
      if (window.tailwind) {
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                primary: '#A11E21',
                'primary-dark': '#831618',
                secondary: '#7F7F7F',
              },
              fontFamily: { sans: ['Inter', 'sans-serif'] },
            }
          }
        };
      }
    `;
    document.head.appendChild(cfg);
  }

  // Google Fonts: Inter
  injectDep('link', {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  });

  // Phosphor Icons
  if (!document.querySelector('script[src*="phosphor-icons"]')) {
    injectDep('script', { src: 'https://unpkg.com/@phosphor-icons/web' });
  }

  // Navbar base styles
  if (!document.querySelector('#nsv-navbar-styles')) {
    const style = document.createElement('style');
    style.id = 'nsv-navbar-styles';
    style.textContent = `
      body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
      /* push konten halaman agar tidak tertutup navbar fixed h-20 */
      body.nsv-navbar-loaded { padding-top: 80px; }
      /* active link indicator */
      .nsv-nav-link.active { color: #A11E21; font-weight: 600; }
      /* services dropdown transition */
      #services-dropdown.show,
      #products-dropdown.show {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) translateX(-50%) !important;
      }
      /* mobile services accordion transition */
      #mobile-services-panel {
        overflow: hidden;
        transition: max-height 0.25s ease;
        max-height: 0;
      }
      #mobile-services-panel.open {
        max-height: 400px;
      }
      #mobile-services-panel:not(.hidden) {
        display: block !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ── 3. Siapkan mount point ─────────────────────────────────────────────────
  let mount = document.getElementById('nsv-navbar');
  if (!mount) {
    mount = document.createElement('div');
    mount.id = 'nsv-navbar';
    document.body.insertBefore(mount, document.body.firstChild);
  }

  // ── 4. Fetch & inject navbar.html ──────────────────────────────────────────
  fetch(NAVBAR_PATH)
    .then(r => {
      if (!r.ok) throw new Error('navbar.html not found at ' + NAVBAR_PATH);
      return r.text();
    })
    .then(html => {
      mount.innerHTML = html;
      document.body.classList.add('nsv-navbar-loaded');
      initNavbar();
    })
    .catch(err => {
      console.warn('[NSV Navbar Loader]', err.message);
    });

  // ── 5. Init semua interaksi ────────────────────────────────────────────────
  function initNavbar() {

    // ── Mobile menu toggle ─────────────────────────────────────────────────
    const mobileBtn  = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileBtn && mobileMenu) {
      const mobileIcon = mobileBtn.querySelector('i');

      mobileBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.toggle('hidden');
        if (mobileIcon) {
          mobileIcon.classList.toggle('ph-list', isHidden);
          mobileIcon.classList.toggle('ph-x', !isHidden);
        }
      });

      // Tutup mobile menu saat klik link
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
          if (mobileIcon) {
            mobileIcon.classList.add('ph-list');
            mobileIcon.classList.remove('ph-x');
          }
        });
      });
    }

    // ── Desktop Services Dropdown ──────────────────────────────────────────
    const servicesBtn      = document.getElementById('services-dropdown-btn');
    const servicesDropdown = document.getElementById('services-dropdown');
    const servicesCaret    = document.getElementById('services-caret');
    const servicesWrapper  = document.getElementById('services-dropdown-wrapper');

    if (servicesBtn && servicesDropdown) {
      let closeTimeout;

      function openDropdown() {
        clearTimeout(closeTimeout);
        servicesDropdown.classList.add('show');
        if (servicesCaret) servicesCaret.style.transform = 'rotate(180deg)';
      }
      function closeDropdown() {
        closeTimeout = setTimeout(() => {
          servicesDropdown.classList.remove('show');
          if (servicesCaret) servicesCaret.style.transform = 'rotate(0deg)';
        }, 120);
      }

      servicesWrapper.addEventListener('mouseenter', openDropdown);
      servicesWrapper.addEventListener('mouseleave', closeDropdown);
      servicesBtn.addEventListener('click', () => {
        servicesDropdown.classList.contains('show') ? closeDropdown() : openDropdown();
      });

      // Tutup saat klik di luar
      document.addEventListener('click', e => {
        if (!servicesWrapper.contains(e.target)) closeDropdown();
      });
    }
    
    // ── Desktop Products Dropdown ──────────────────────────────────────────
      const productsBtn      = document.getElementById('products-dropdown-btn');
      const productsDropdown = document.getElementById('products-dropdown');
      const productsCaret    = document.getElementById('products-caret');
      const productsWrapper  = document.getElementById('products-dropdown-wrapper');

      if (productsBtn && productsDropdown) {
        let closeProductsTimeout;

        function openProductsDropdown() {
          clearTimeout(closeProductsTimeout);
          productsDropdown.classList.add('show');
          if (productsCaret) productsCaret.style.transform = 'rotate(180deg)';
        }
        function closeProductsDropdown() {
          closeProductsTimeout = setTimeout(() => {
            productsDropdown.classList.remove('show');
            if (productsCaret) productsCaret.style.transform = 'rotate(0deg)';
          }, 120);
        }

        productsWrapper.addEventListener('mouseenter', openProductsDropdown);
        productsWrapper.addEventListener('mouseleave', closeProductsDropdown);
        productsBtn.addEventListener('click', () => {
          productsDropdown.classList.contains('show') ? closeProductsDropdown() : openProductsDropdown();
        });

        document.addEventListener('click', e => {
          if (!productsWrapper.contains(e.target)) closeProductsDropdown();
        });
      }

    // ── Mobile Services Accordion ──────────────────────────────────────────
    const mobileServicesBtn   = document.getElementById('mobile-services-btn');
    const mobileServicesPanel = document.getElementById('mobile-services-panel');
    const mobileServicesCaret = document.getElementById('mobile-services-caret');

    if (mobileServicesBtn && mobileServicesPanel) {
      mobileServicesPanel.classList.remove('hidden');

      mobileServicesBtn.addEventListener('click', () => {
        const isOpen = mobileServicesPanel.classList.toggle('open');
        if (mobileServicesCaret) {
          mobileServicesCaret.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      });

      // Tutup accordion saat salah satu link diklik
      mobileServicesPanel.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobileServicesPanel.classList.remove('open');
          if (mobileServicesCaret) mobileServicesCaret.style.transform = 'rotate(0deg)';
          if (mobileMenu) mobileMenu.classList.add('hidden');
        });
      });
    }

    // ── Navbar shadow on scroll ────────────────────────────────────────────
    const navbar = document.getElementById('navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
          navbar.classList.add('shadow-md');
          navbar.classList.remove('shadow-sm');
        } else {
          navbar.classList.add('shadow-sm');
          navbar.classList.remove('shadow-md');
        }
      }, { passive: true });
    }

    // ── Active link highlight (berdasarkan hash atau pathname) ────────────
    function setActiveLink() {
      const path = window.location.pathname.split('/').pop() || 'index.html';
      const hash = window.location.hash;

      document.querySelectorAll('.nsv-nav-link').forEach(link => {
        const href     = link.getAttribute('href') || '';
        const linkFile = href.split('#')[0].split('/').pop() || 'index.html';
        const linkHash = '#' + href.split('#')[1];

        link.classList.remove('active');

        // Match exact pathname + hash
        if (linkFile === path && (!href.includes('#') || linkHash === hash)) {
          link.classList.add('active');
        }
        // Halaman non-index: cukup cocokkan filename
        if (path !== 'index.html' && linkFile === path && !href.includes('#')) {
          link.classList.add('active');
        }
        // Jangan aktifkan link halaman lain saat di index
        if (path === 'index.html' && !href.includes('#')) {
          link.classList.remove('active');
        }
      });
    }

    setActiveLink();
    window.addEventListener('hashchange', setActiveLink);

    // ── Smooth scroll untuk link anchor di halaman yang sama ──────────────
    document.querySelectorAll('a[href^="#"], a[href*="index.html#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href   = this.getAttribute('href');
        const isLocal = href.startsWith('#') || href.startsWith('index.html#');
        const onIndex = window.location.pathname.endsWith('index.html') ||
                        window.location.pathname === '/' ||
                        window.location.pathname.endsWith('/');

        if (isLocal && onIndex) {
          e.preventDefault();
          const id     = '#' + href.split('#')[1];
          const target = document.querySelector(id);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', id);
            setActiveLink();
          }
        }
        // Kalau bukan di index.html, biarkan browser navigasi normal ke index.html#section
      });
    });
  }

})();
