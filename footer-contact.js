/**
 * NSV Footer Contact Form — footer-contact.js
 * Handles Send Message form submission to Frappe API.
 * Uses event delegation so it works regardless of when footer is injected.
 */
(function () {
  'use strict';

  const SUB_API = window.location.origin + '/api/method/nsv_compro.api.endpoints.submit_inquiry';

  const STATIC_PACKAGES = {
    'Business Development': ['UMKM Growth Starter','Medium Enterprise Accelerator','Advanced Strategic Expansion','Market Research','Value Proposition Analysis','Sales & Marketing Strategy','PT (Ltd) Establishment','CV (Partnership) Establishment','Business Plan (Standard)','Business Plan (Investor)'],
    'Business Strategy': ['Business Foundation Package','Growth Acceleration Package','Strategic Transformation Package','Performance Evaluation','Business Monitoring (Retainer)','Business Ecosystem Analysis'],
    'Accounting, Tax & Legal': ['Financial Planning & Analysis','Cost Reduction Strategy','Financial Risk Management','Monthly Tax Package','Annual Tax Package','Tax Training Brevet A&B'],
    'Business Certification': ['Basic Awareness Consulting','ISO Preparation Consulting','Initial Certification Consulting','Surveillance Audit Consulting','Certification Renewal Consulting','ISO SOP Templates'],
    'Human Resources': ['Course Pre-made','Custom Course'],
    'IT Consulting': ['ECOHUB LMS Platform','APJII Class LMS Platform','ERP Implementation Consulting','Resource Sharing Platform'],
    'NSV Academy': ['LMS ECOHUB Standard','LMS Kelas APJII','Custom LMS Enterprise'],
    'SOP Templates': ['Business Foundation Package','ISO SOP Templates','Full Management System'],
  };

  // ── Topic → Package dropdown ────────────────────────────────────────────
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'fc-topic') return;
    const val     = e.target.value;
    const pkgWrap = document.getElementById('fc-pkg-wrap');
    const pkgSel  = document.getElementById('fc-pkg');
    if (!pkgWrap || !pkgSel) return;

    if (!val || val.startsWith('others')) {
      pkgWrap.style.display = 'none';
      pkgSel.innerHTML = '<option value="">— Select package —</option>';
      return;
    }

    const name = val.split('|')[0];
    pkgWrap.style.display = 'block';
    const pkgs = STATIC_PACKAGES[name] || [];
    pkgSel.innerHTML =
      '<option value="">— Select package (optional) —</option>' +
      pkgs.map(p => `<option value="${p}">${p}</option>`).join('');
  });

  // ── Form submit ─────────────────────────────────────────────────────────
  document.addEventListener('submit', async function (e) {
    if (e.target.id !== 'footer-contact-form') return;
    e.preventDefault();

    const name  = document.getElementById('fc-name')?.value.trim();
    const wa    = document.getElementById('fc-wa')?.value.trim();
    const email = document.getElementById('fc-email')?.value.trim();
    const topic = document.getElementById('fc-topic')?.value;
    const pkg   = document.getElementById('fc-pkg')?.value;
    const msg   = document.getElementById('fc-msg')?.value.trim();
    const fb    = document.getElementById('fc-feedback');
    const btn   = document.getElementById('fc-submit');

    if (!name) {
      if (fb) {
        fb.style.display = 'block';
        fb.style.background = 'rgba(239,68,68,.15)';
        fb.style.color = '#fca5a5';
        fb.textContent = 'Please enter your full name.';
      }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    if (fb)  { fb.style.display = 'none'; }

    const topicName = topic ? topic.split('|')[0] : '';
    const builtMsg  = [
      topicName && topicName !== 'others' ? `Topic: ${topicName}` : '',
      pkg   ? `Package: ${pkg}` : '',
      msg   ? `Message: ${msg}` : '',
    ].filter(Boolean).join(' | ') || 'General inquiry from website contact form.';

    try {
      const url = new URL(SUB_API);
      url.searchParams.set('full_name', name);
      if (email) url.searchParams.set('email', email);
      if (wa)    url.searchParams.set('phone', wa);
      url.searchParams.set('message', builtMsg);
      url.searchParams.set('source', 'form');
      if (topicName && topicName !== 'others') url.searchParams.set('ref_name', topicName);
      if (pkg) url.searchParams.set('package_name', pkg);

      const resp = await fetch(url.toString());
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.exc) throw new Error(data.exc);

      if (fb) {
        fb.style.display = 'block';
        fb.style.background = 'rgba(34,197,94,.15)';
        fb.style.color = '#86efac';
        fb.textContent = '✓ Message sent! Our team will get back to you shortly.';
      }
      e.target.reset();
      const pkgWrap = document.getElementById('fc-pkg-wrap');
      if (pkgWrap) pkgWrap.style.display = 'none';
    } catch (err) {
      if (fb) {
        fb.style.display = 'block';
        fb.style.background = 'rgba(239,68,68,.15)';
        fb.style.color = '#fca5a5';
        fb.textContent = 'Failed to send. Please try again or contact us directly.';
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
    }
  });

})();
