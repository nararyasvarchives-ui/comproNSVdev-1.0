/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  NSV INQUIRY — inquiry.js                            ║
 * ║  PT Nararya Semesta Visitama                         ║
 * ╚══════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  const FRAPPE      = 'http://91.108.104.170:3333';
  const INQUIRY_API = `${FRAPPE}/api/method/nsv_compro.api.endpoints.submit_inquiry`;
  const PACKAGES_API= `${FRAPPE}/api/method/nsv_compro.api.endpoints.get_packages`;
  const SERVICES_API= `${FRAPPE}/api/method/nsv_compro.api.endpoints.get_services`;
  const PRODUCTS_API= `${FRAPPE}/api/method/nsv_compro.api.endpoints.get_products`;

  // ── CSS ────────────────────────────────────────────────────────────────────
  const CSS = `
    #nsv-inquiry-overlay {
      position:fixed;inset:0;z-index:9999;
      background:rgba(0,0,0,.55);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;
      opacity:0;visibility:hidden;padding:16px;
      transition:opacity .25s,visibility .25s;
    }
    #nsv-inquiry-overlay.open{opacity:1;visibility:visible;}
    #nsv-inquiry-modal{
      background:#fff;border-radius:1.5rem;
      width:100%;max-width:480px;padding:36px;
      box-shadow:0 24px 60px rgba(0,0,0,.18);
      transform:translateY(20px) scale(.97);
      transition:transform .3s cubic-bezier(.34,1.56,.64,1);
      position:relative;font-family:'Inter',sans-serif;
    }
    #nsv-inquiry-overlay.open #nsv-inquiry-modal{transform:translateY(0) scale(1);}
    #nsv-inquiry-close{
      position:absolute;top:16px;right:16px;
      width:32px;height:32px;border:none;background:#f3f4f6;
      border-radius:50%;cursor:pointer;display:flex;
      align-items:center;justify-content:center;
      transition:background .2s;font-size:18px;color:#6b7280;
    }
    #nsv-inquiry-close:hover{background:#fee2e2;color:#A11E21;}
    .nsv-inq-context{
      background:#fef2f2;border:1px solid #fecaca;
      border-radius:.75rem;padding:10px 14px;margin-bottom:20px;
      font-size:.8rem;color:#A11E21;
    }
    .nsv-inq-context span{font-weight:600;}
    .nsv-inq-label{display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:6px;}
    .nsv-inq-label .req{color:#A11E21;margin-left:2px;}
    .nsv-inq-input,.nsv-inq-select,.nsv-inq-textarea{
      width:100%;border:1.5px solid #e5e7eb;border-radius:.75rem;
      padding:11px 14px;font-size:.9rem;font-family:'Inter',sans-serif;
      color:#1f2937;background:#fff;outline:none;box-sizing:border-box;
      transition:border-color .2s,box-shadow .2s;
    }
    .nsv-inq-input:focus,.nsv-inq-select:focus,.nsv-inq-textarea:focus{
      border-color:#A11E21;box-shadow:0 0 0 3px rgba(161,30,33,.1);
    }
    .nsv-inq-input.error{border-color:#ef4444;}
    .nsv-inq-input[readonly]{background:#f9fafb;color:#6b7280;cursor:not-allowed;}
    .nsv-inq-select{
      appearance:none;cursor:pointer;padding-right:40px;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 256 256'%3E%3Cpath d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'/%3E%3C/svg%3E");
      background-repeat:no-repeat;background-position:right 14px center;
    }
    .nsv-inq-textarea{min-height:100px;resize:vertical;}
    .nsv-inq-field{margin-bottom:16px;}
    .nsv-inq-hint{font-size:.75rem;color:#ef4444;margin-top:4px;display:none;}
    .nsv-inq-hint.show{display:block;}
    .nsv-inq-submit{
      width:100%;padding:13px;background:#A11E21;color:#fff;
      border:none;border-radius:.875rem;font-size:.95rem;font-weight:700;
      cursor:pointer;transition:background .2s,transform .15s;
      font-family:'Inter',sans-serif;
    }
    .nsv-inq-submit:hover{background:#831618;}
    .nsv-inq-submit:active{transform:scale(.98);}
    .nsv-inq-submit:disabled{background:#9ca3af;cursor:not-allowed;}
    #nsv-inq-success{text-align:center;padding:20px 0;display:none;}
    #nsv-inq-success .check{
      width:56px;height:56px;background:#d1fae5;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      margin:0 auto 16px;font-size:28px;
    }
    #nsv-inq-success h4{font-size:1.1rem;font-weight:700;color:#111827;margin:0 0 8px;}
    #nsv-inq-success p{font-size:.875rem;color:#6b7280;margin:0;}
    .nsv-full-inq-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    .nsv-full-inq-grid .span-2{grid-column:span 2;}
    @media(max-width:640px){
      .nsv-full-inq-grid{grid-template-columns:1fr;}
      .nsv-full-inq-grid .span-2{grid-column:span 1;}
    }
    #nsv-inq-toast{
      position:fixed;bottom:24px;left:50%;
      transform:translateX(-50%) translateY(60px);
      background:#111827;color:#fff;
      padding:12px 24px;border-radius:999px;
      font-size:.875rem;font-family:'Inter',sans-serif;
      z-index:99999;transition:transform .3s;white-space:nowrap;
    }
    #nsv-inq-toast.show{transform:translateX(-50%) translateY(0);}
    #nsv-inq-toast.error{background:#dc2626;}
    #nsv-inq-toast.success{background:#16a34a;}
  `;

  function injectStyles() {
    if (document.getElementById('nsv-inquiry-styles')) return;
    const s = document.createElement('style');
    s.id = 'nsv-inquiry-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── Inject Popup HTML ──────────────────────────────────────────────────────
  function injectPopup() {
    if (document.getElementById('nsv-inquiry-overlay')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div id="nsv-inquiry-overlay">
        <div id="nsv-inquiry-modal" role="dialog" aria-modal="true" aria-labelledby="nsv-inq-title">
          <button id="nsv-inquiry-close" aria-label="Close">✕</button>
          <div id="nsv-inq-success">
            <div class="check">✓</div>
            <h4>Inquiry Sent Successfully!</h4>
            <p>Our team will get back to you within 1×24 business hours.</p>
          </div>
          <div id="nsv-inq-form-wrap">
            <h3 id="nsv-inq-title" style="font-size:1.2rem;font-weight:700;color:#111827;margin:0 0 4px;">Request Information</h3>
            <p style="font-size:.85rem;color:#6b7280;margin:0 0 20px;">Fill in your details and we'll reach out shortly.</p>
            <div class="nsv-inq-context" id="nsv-inq-context-box" style="display:none;">
              <div>Service / Product: <span id="nsv-inq-ctx-service">—</span></div>
              <div style="margin-top:4px">Package: <span id="nsv-inq-ctx-package">—</span></div>
            </div>
            <form id="nsv-inq-popup-form" novalidate autocomplete="off">
              <div class="nsv-inq-field">
                <label class="nsv-inq-label" for="inq-name">Full Name <span class="req">*</span></label>
                <input id="inq-name" type="text" class="nsv-inq-input" placeholder="e.g. John Doe" required>
                <div class="nsv-inq-hint" id="hint-name">Please enter your name.</div>
              </div>
              <div class="nsv-inq-field">
                <label class="nsv-inq-label" for="inq-wa">WhatsApp Number</label>
                <input id="inq-wa" type="tel" class="nsv-inq-input" placeholder="e.g. +62 812-3456-7890">
              </div>
              <div class="nsv-inq-field">
                <label class="nsv-inq-label" for="inq-email">Email Address</label>
                <input id="inq-email" type="email" class="nsv-inq-input" placeholder="e.g. john@company.com">
                <div class="nsv-inq-hint" id="hint-email">Please enter a valid email address.</div>
              </div>
              <input type="hidden" id="inq-ref-type">
              <input type="hidden" id="inq-ref-name">
              <input type="hidden" id="inq-pkg-name">
              <button type="submit" class="nsv-inq-submit" id="nsv-inq-popup-btn">Send Inquiry</button>
            </form>
          </div>
        </div>
      </div>
      <div id="nsv-inq-toast"></div>
    `);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function showToast(msg, type = '') {
    const t = document.getElementById('nsv-inq-toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `show ${type}`;
    setTimeout(() => { t.className = ''; }, 3500);
  }

  async function submitToFrappe(payload) {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => { if (v != null && v !== '') params.append(k, v); });
    const resp = await fetch(INQUIRY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.exc) throw new Error(data.exc);
    return data;
  }

  // ── Open / Close Popup ─────────────────────────────────────────────────────
  function openPopup(ctx = {}) {
    const overlay = document.getElementById('nsv-inquiry-overlay');
    if (!overlay) return;

    document.getElementById('nsv-inq-popup-form')?.reset();
    document.getElementById('nsv-inq-success').style.display = 'none';
    document.getElementById('nsv-inq-form-wrap').style.display = 'block';
    document.querySelectorAll('.nsv-inq-hint').forEach(h => h.classList.remove('show'));
    document.querySelectorAll('.nsv-inq-input').forEach(i => i.classList.remove('error'));

    const btn = document.getElementById('nsv-inq-popup-btn');
    if (btn) { btn.disabled = false; btn.textContent = 'Send Inquiry'; }

    const svcLabel = ctx.service || ctx.product || '';
    document.getElementById('nsv-inq-ctx-service').textContent = svcLabel || '—';
    document.getElementById('nsv-inq-ctx-package').textContent = ctx.package || '—';
    document.getElementById('inq-ref-type').value = ctx.service ? 'NSV Service' : (ctx.product ? 'NSV Product' : '');
    document.getElementById('inq-ref-name').value = svcLabel;
    document.getElementById('inq-pkg-name').value  = ctx.package || '';

    const ctxBox = document.getElementById('nsv-inq-context-box');
    if (ctxBox) ctxBox.style.display = svcLabel ? 'block' : 'none';

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('inq-name')?.focus(), 300);
  }

  function closePopup() {
    document.getElementById('nsv-inquiry-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── Popup Form Submit ──────────────────────────────────────────────────────
  function initPopupSubmit() {
    document.addEventListener('submit', async (e) => {
      if (e.target.id !== 'nsv-inq-popup-form') return;
      e.preventDefault();

      const name  = document.getElementById('inq-name')?.value.trim();
      const wa    = document.getElementById('inq-wa')?.value.trim();
      const email = document.getElementById('inq-email')?.value.trim();
      let valid = true;

      if (!name) {
        document.getElementById('inq-name')?.classList.add('error');
        document.getElementById('hint-name')?.classList.add('show');
        valid = false;
      } else {
        document.getElementById('inq-name')?.classList.remove('error');
        document.getElementById('hint-name')?.classList.remove('show');
      }

      if (email && !isValidEmail(email)) {
        document.getElementById('inq-email')?.classList.add('error');
        document.getElementById('hint-email')?.classList.add('show');
        valid = false;
      } else {
        document.getElementById('inq-email')?.classList.remove('error');
        document.getElementById('hint-email')?.classList.remove('show');
      }

      if (!valid) return;

      const btn = document.getElementById('nsv-inq-popup-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

      const refType = document.getElementById('inq-ref-type')?.value;
      const refName = document.getElementById('inq-ref-name')?.value;
      const pkgName = document.getElementById('inq-pkg-name')?.value;
      const builtMsg = pkgName
        ? `Inquiry for package "${pkgName}" from ${refName}`
        : `Inquiry for ${refName || 'general information'}`;

      try {
        await submitToFrappe({ full_name: name, email, phone: wa, whatsapp: wa,
          message: builtMsg, source: 'popup',
          ref_doctype: refType, ref_name: refName, package_name: pkgName });

        document.getElementById('nsv-inq-form-wrap').style.display = 'none';
        document.getElementById('nsv-inq-success').style.display = 'block';
        setTimeout(closePopup, 3000);
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = 'Send Inquiry'; }
        showToast('Failed to send. Please try again.', 'error');
      }
    });
  }

  // ── Trigger Buttons & Close Events ────────────────────────────────────────
  function initEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.nsv-inquire-btn, [data-nsv-inquire]');
      if (btn) { e.preventDefault(); openPopup({ service: btn.dataset.service, product: btn.dataset.product, package: btn.dataset.package }); }
      if (e.target.id === 'nsv-inquiry-overlay' || e.target.id === 'nsv-inquiry-close') closePopup();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });
  }

  // ── Full Inquiry Form ──────────────────────────────────────────────────────
  async function initFullForm() {
    const wrap = document.getElementById('nsv-full-inquiry-form-wrap');
    if (!wrap) return;

    let services = [], products = [];
    try {
      const [sr, pr] = await Promise.all([
        fetch(SERVICES_API).then(r => r.json()),
        fetch(PRODUCTS_API).then(r => r.json()),
      ]);
      services = sr.message || [];
      products = pr.message || [];
    } catch (e) { console.warn('[NSV Inquiry] Could not load dropdowns'); }

    wrap.innerHTML = `
      <form id="nsv-full-inq-form" novalidate autocomplete="off">
        <div class="nsv-full-inq-grid">
          <div class="nsv-inq-field">
            <label class="nsv-inq-label" for="fi-fname">First Name <span class="req">*</span></label>
            <input id="fi-fname" type="text" class="nsv-inq-input" placeholder="First name" required>
            <div class="nsv-inq-hint" id="fi-hint-fname">First name is required.</div>
          </div>
          <div class="nsv-inq-field">
            <label class="nsv-inq-label" for="fi-lname">Last Name</label>
            <input id="fi-lname" type="text" class="nsv-inq-input" placeholder="Last name">
          </div>
          <div class="nsv-inq-field">
            <label class="nsv-inq-label" for="fi-email">Email Address</label>
            <input id="fi-email" type="email" class="nsv-inq-input" placeholder="email@company.com">
            <div class="nsv-inq-hint" id="fi-hint-email">Please enter a valid email address.</div>
          </div>
          <div class="nsv-inq-field">
            <label class="nsv-inq-label" for="fi-wa">WhatsApp</label>
            <input id="fi-wa" type="tel" class="nsv-inq-input" placeholder="+62 812-3456-7890">
          </div>
          <div class="nsv-inq-field">
            <label class="nsv-inq-label" for="fi-phone">Phone</label>
            <input id="fi-phone" type="tel" class="nsv-inq-input" placeholder="Office number">
          </div>
          <div class="nsv-inq-field">
            <label class="nsv-inq-label" for="fi-job">Job Title</label>
            <input id="fi-job" type="text" class="nsv-inq-input" placeholder="e.g. Finance Manager">
          </div>
          <div class="nsv-inq-field">
            <label class="nsv-inq-label" for="fi-company">Company / Organization</label>
            <input id="fi-company" type="text" class="nsv-inq-input" placeholder="Company name">
          </div>
          <div class="nsv-inq-field">
            <label class="nsv-inq-label" for="fi-reqtype">Request Type</label>
            <select id="fi-reqtype" class="nsv-inq-select">
              <option value="">— Select request type —</option>
              <option value="Product Enquiry">Product Enquiry</option>
              <option value="Request for Information">Request for Information</option>
              <option value="Suggestions">Suggestions</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="nsv-inq-field">
            <label class="nsv-inq-label" for="fi-ref">Service / Product</label>
            <select id="fi-ref" class="nsv-inq-select">
              <option value="">— Select service or product —</option>
              <optgroup label="Services">
                ${services.map(s => `<option value="${s.name}" data-type="service">${s.service_name}</option>`).join('')}
              </optgroup>
              <optgroup label="Products">
                ${products.map(p => `<option value="${p.name}" data-type="product">${p.product_name}</option>`).join('')}
              </optgroup>
            </select>
          </div>
          <div class="nsv-inq-field">
            <label class="nsv-inq-label" for="fi-pkg">Package</label>
            <select id="fi-pkg" class="nsv-inq-select">
              <option value="">— Select service/product first —</option>
            </select>
          </div>
          <div class="nsv-inq-field span-2">
            <label class="nsv-inq-label" for="fi-msg">Message / Notes</label>
            <textarea id="fi-msg" class="nsv-inq-textarea" placeholder="Describe your needs or questions..."></textarea>
          </div>
        </div>
        <div style="margin-top:24px">
          <button type="submit" class="nsv-inq-submit" id="fi-submit-btn">Submit Inquiry</button>
        </div>
      </form>
    `;

    // Dynamic package loading
    document.getElementById('fi-ref')?.addEventListener('change', async function () {
      const val = this.value;
      const pkgSel = document.getElementById('fi-pkg');
      if (!val) { pkgSel.innerHTML = '<option value="">— Select service/product first —</option>'; return; }
      pkgSel.innerHTML = '<option value="">Loading...</option>';
      try {
        const res = await fetch(`${PACKAGES_API}?ref_name=${encodeURIComponent(val)}`);
        const data = await res.json();
        const pkgs = data.message || [];
        pkgSel.innerHTML = pkgs.length
          ? '<option value="">— Select package —</option>' + pkgs.map(p => `<option value="${p.package_name}">${p.package_name}</option>`).join('')
          : '<option value="">— No packages available —</option>';
      } catch { pkgSel.innerHTML = '<option value="">— Could not load —</option>'; }
    });

    // Full form submit
    document.getElementById('nsv-full-inq-form')?.addEventListener('submit', async function (e) {
      e.preventDefault();
      let valid = true;

      const fname  = document.getElementById('fi-fname')?.value.trim();
      const lname  = document.getElementById('fi-lname')?.value.trim();
      const email  = document.getElementById('fi-email')?.value.trim();
      const wa     = document.getElementById('fi-wa')?.value.trim();
      const phone  = document.getElementById('fi-phone')?.value.trim();
      const job    = document.getElementById('fi-job')?.value.trim();
      const comp   = document.getElementById('fi-company')?.value.trim();
      const reqT   = document.getElementById('fi-reqtype')?.value;
      const refVal = document.getElementById('fi-ref')?.value;
      const refOpt = document.querySelector('#fi-ref option:checked');
      const pkg    = document.getElementById('fi-pkg')?.value;
      const msg    = document.getElementById('fi-msg')?.value.trim();

      if (!fname) {
        document.getElementById('fi-fname')?.classList.add('error');
        document.getElementById('fi-hint-fname')?.classList.add('show');
        valid = false;
      } else {
        document.getElementById('fi-fname')?.classList.remove('error');
        document.getElementById('fi-hint-fname')?.classList.remove('show');
      }
      if (email && !isValidEmail(email)) {
        document.getElementById('fi-email')?.classList.add('error');
        document.getElementById('fi-hint-email')?.classList.add('show');
        valid = false;
      } else {
        document.getElementById('fi-email')?.classList.remove('error');
        document.getElementById('fi-hint-email')?.classList.remove('show');
      }
      if (!valid) return;

      const btn = document.getElementById('fi-submit-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

      const fullName = lname ? `${fname} ${lname}` : fname;
      const refType  = refOpt?.dataset?.type === 'product' ? 'NSV Product' : 'NSV Service';
      const builtMsg = [
        refVal  ? `Regarding: ${refOpt?.textContent || refVal}` : '',
        pkg     ? `Package: ${pkg}` : '',
        reqT    ? `Request type: ${reqT}` : '',
        msg     ? `Notes: ${msg}` : '',
      ].filter(Boolean).join(' | ') || 'No additional notes.';

      try {
        await submitToFrappe({ full_name: fullName, email, phone, whatsapp: wa,
          job_title: job, company: comp, message: builtMsg, source: 'full_form',
          ref_doctype: refVal ? refType : null, ref_name: refVal || null,
          package_name: pkg || null, request_type: reqT || null });

        showToast('✓ Inquiry submitted successfully!', 'success');
        this.reset();
        document.getElementById('fi-pkg').innerHTML = '<option value="">— Select service/product first —</option>';
      } catch (err) {
        showToast('Failed to submit. Please try again.', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Submit Inquiry'; }
      }
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    injectStyles();
    injectPopup();
    initEvents();
    initPopupSubmit();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFullForm);
    } else {
      setTimeout(initFullForm, 0);
    }
  }

  window.NSVInquiry = { open: openPopup, close: closePopup };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
