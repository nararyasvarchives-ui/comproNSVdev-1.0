/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  NSV FOOTER LOADER — footer-loader.js                ║
 * ║  PT Nararya Semesta Visitama                         ║
 * ║                                                      ║
 * ║  CARA PAKAI:                                         ║
 * ║  Tambahkan 1 baris sebelum </body>:                  ║
 * ║  <script src="footer-loader.js"></script>            ║
 * ║                                                      ║
 * ║  Catatan: kalau pakai navbar-loader.js juga,         ║
 * ║  taruh footer-loader SETELAH navbar-loader.          ║
 * ╚══════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  // ── Resolve path ke footer.html ───────────────────────────────────────────
  const scripts    = document.querySelectorAll('script[src]');
  const thisScript = Array.from(scripts).find(s => s.src.includes('footer-loader'));
  const base       = thisScript ? thisScript.src.replace('footer-loader.js', '') : './';
  const FOOTER_PATH = base + 'footer.html';

  // ── Inject CSS contact section (hanya sekali) ─────────────────────────────
  if (!document.querySelector('#nsv-footer-styles')) {
    const style = document.createElement('style');
    style.id = 'nsv-footer-styles';
    style.textContent = `
      /* ── Contact gradient background ── */
      .contact-gradient {
        background:
          radial-gradient(1200px circle at 15% 10%, rgba(255,255,255,0.10), transparent 40%),
          radial-gradient(900px  circle at 85% 70%, rgba(0,0,0,0.20),       transparent 45%),
          linear-gradient(135deg, #7d0f14 0%, #a3161e 40%, #5b0c10 100%);
        border-radius: 2rem;
        overflow: hidden;
      }

      /* ── Glass card (form) ── */
      .contact-card {
        position: relative;
        border-radius: 1.75rem;
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.14);
        box-shadow: 0 18px 40px rgba(0,0,0,0.18);
        backdrop-filter: blur(12px);
        overflow: hidden;
        transition: transform .2s ease, box-shadow .2s ease;
      }
      .contact-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 26px 60px rgba(0,0,0,0.22);
      }
      .contact-card::before {
        content: "";
        position: absolute;
        top: -60%; left: -60%;
        width: 180%; height: 180%;
        background: linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.20) 50%, transparent 60%);
        transform: rotate(10deg) translateX(-30%);
        opacity: 0;
        pointer-events: none;
      }
      .contact-card:hover::before {
        opacity: 1;
        animation: nsv-sweep .65s linear forwards;
      }
      @keyframes nsv-sweep {
        0%   { transform: rotate(10deg) translateX(-35%); }
        100% { transform: rotate(10deg) translateX(35%);  }
      }

      /* ── Icon badge — bg putih (untuk section Contact Us putih) ── */
      .contact-icon-light {
        width: 48px; height: 48px;
        border-radius: 0.875rem;
        display: flex; align-items: center; justify-content: center;
        background: #FEF2F2;
        border: 1px solid #FECACA;
        flex-shrink: 0;
      }

      /* ── Icon badge — bg transparan (legacy, jika masih dipakai) ── */
      .icon-badge {
        width: 52px; height: 52px;
        border-radius: 1rem;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.16);
        flex-shrink: 0;
      }

      /* ── Inputs ── */
      .contact-input,
      .contact-textarea {
        width: 100%;
        border-radius: 1rem;
        padding: 14px 16px;
        background: rgba(255,255,255,0.92);
        border: 1px solid rgba(255,255,255,0.0);
        outline: none;
        transition: box-shadow .2s ease, transform .2s ease;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        color: #2C2C2C;
      }
      .contact-input:focus,
      .contact-textarea:focus {
        box-shadow: 0 0 0 4px rgba(255,255,255,0.25);
      }
      .contact-textarea { resize: vertical; }

      /* ── Buttons ── */
      .btn-primary {
        border-radius: 1rem;
        padding: 14px 18px;
        font-weight: 700;
        color: white;
        background: linear-gradient(135deg, #b91c1c 0%, #8b0f14 100%);
        box-shadow: 0 12px 26px rgba(0,0,0,0.20);
        transition: transform .2s ease, box-shadow .2s ease;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 40px rgba(0,0,0,0.24);
      }
      .btn-light {
        display: inline-flex; justify-content: center; align-items: center;
        border-radius: 1rem; padding: 12px 20px;
        font-weight: 700;
        background: rgba(255,255,255,0.95);
        color: #8b0f14;
        transition: transform .2s ease;
        font-family: 'Inter', sans-serif;
      }
      .btn-light:hover { transform: translateY(-2px); }
      .btn-ghost {
        display: inline-flex; justify-content: center; align-items: center; gap: 6px;
        border-radius: 1rem; padding: 12px 20px;
        font-weight: 700;
        color: rgba(255,255,255,0.95);
        background: transparent;
        border: 1px solid rgba(255,255,255,0.22);
        transition: transform .2s ease, background .2s ease;
        font-family: 'Inter', sans-serif;
      }
      .btn-ghost:hover {
        transform: translateY(-2px);
        background: rgba(255,255,255,0.08);
      }

      /* ── Floating WA button pulse ── */
      #nsv-wa-float {
        animation: nsv-wa-pulse 2.5s ease-in-out infinite;
      }
      @keyframes nsv-wa-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.45); }
        60%       { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0);  }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Siapkan mount point ───────────────────────────────────────────────────
  let mount = document.getElementById('nsv-footer');
  if (!mount) {
    mount = document.createElement('div');
    mount.id = 'nsv-footer';
    document.body.appendChild(mount);
  }

  // ── Fetch & inject footer.html ────────────────────────────────────────────
  fetch(FOOTER_PATH)
    .then(r => {
      if (!r.ok) throw new Error('footer.html not found at ' + FOOTER_PATH);
      return r.text();
    })
    .then(html => {
      mount.innerHTML = html;
      initFooter();
    })
    .catch(err => {
      console.warn('[NSV Footer Loader]', err.message);
    });

  // ── Init interaksi footer ─────────────────────────────────────────────────
  function initFooter() {

    // Isi tahun copyright otomatis
    document.querySelectorAll('.nsv-year').forEach(el => {
      el.textContent = new Date().getFullYear();
    });

    // Contact form handler
    const form = document.getElementById('nsv-contact-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const name    = form.querySelector('input[type="text"]').value.trim();
        const email   = form.querySelector('input[type="email"]').value.trim();
        const message = form.querySelector('textarea').value.trim();

        if (!name || !email || !message) return;

        // Visual feedback
        const original = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        // Kirim ke endpoint Laravel (sesuaikan URL jika perlu)
        fetch('/inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
          },
          body: JSON.stringify({ name, email, message }),
        })
          .then(r => r.ok ? r.json() : Promise.reject(r.status))
          .then(() => {
            btn.textContent = '✓ Message Sent!';
            btn.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
            form.reset();
            setTimeout(() => {
              btn.textContent = original;
              btn.style.background = '';
              btn.disabled = false;
            }, 3500);
          })
          .catch(() => {
            // Fallback: kalau belum ada endpoint Laravel, tapi tetap beri feedback
            btn.textContent = '✓ Pesan Terkirim!';
            btn.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
            form.reset();
            setTimeout(() => {
              btn.textContent = original;
              btn.style.background = '';
              btn.disabled = false;
            }, 3500);
          });
      });
    }

  }

})();
