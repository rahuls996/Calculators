/* seo-script.js — SEO page: ToC active state + embedded health calculator */

(function () {
  'use strict';

  // ── Shared helpers (from main script) ──────────────────────────────────────

  function formatINR(amount) {
    if (amount >= 100000) {
      const lakhs = (amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1);
      return '₹ ' + lakhs + ' L';
    }
    return '₹ ' + amount.toLocaleString('en-IN');
  }

  function updateSliderProgress(input) {
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const val = parseFloat(input.value);
    const pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty('--progress', pct + '%');
  }

  function animateAmount(el, newVal) {
    if (!el) return;
    el.textContent = newVal;
  }

  // ── Searchable select (city dropdown) ──────────────────────────────────────

  function initSearchableSelect(container) {
    const trigger = container.querySelector('.searchable-select-trigger');
    const display = container.querySelector('.searchable-select-display');
    const dropdown = container.querySelector('.searchable-select-dropdown');
    const search = container.querySelector('.searchable-select-search');
    const list = container.querySelector('.searchable-select-list');
    const noResults = container.querySelector('.searchable-select-no-results');

    trigger.addEventListener('click', () => {
      const open = container.classList.toggle('open');
      if (open && search) { search.value = ''; filterList(''); search.focus(); }
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) container.classList.remove('open');
    });

    if (search) {
      search.addEventListener('input', () => filterList(search.value));
    }

    list.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        container.dataset.value = li.dataset.value;
        if (display) display.textContent = li.textContent;
        container.classList.remove('open');
        container.dispatchEvent(new CustomEvent('change', { detail: { value: li.dataset.value } }));
      });
    });

    function filterList(q) {
      const term = q.toLowerCase();
      let any = false;
      list.querySelectorAll('li').forEach(li => {
        const show = li.textContent.toLowerCase().includes(term);
        li.style.display = show ? '' : 'none';
        if (show) any = true;
      });
      if (noResults) noResults.style.display = any ? 'none' : '';
    }
  }

  // ── Stepper helper ─────────────────────────────────────────────────────────

  function initStepper(decId, incId, valId, state, key, min, max, onChange) {
    document.getElementById(decId).addEventListener('click', () => {
      if (state[key] > min) {
        state[key]--;
        const el = document.getElementById(valId);
        el.textContent = state[key];
        el.dataset.zero = state[key] === 0 ? 'true' : 'false';
        updateStepperBtns();
        onChange && onChange();
      }
    });
    document.getElementById(incId).addEventListener('click', () => {
      if (state[key] < max) {
        state[key]++;
        const el = document.getElementById(valId);
        el.textContent = state[key];
        el.dataset.zero = state[key] === 0 ? 'true' : 'false';
        updateStepperBtns();
        onChange && onChange();
      }
    });

    function updateStepperBtns() {
      document.getElementById(decId).disabled = state[key] <= min;
      document.getElementById(incId).disabled = state[key] >= max;
    }
    updateStepperBtns();
  }

  // ── UI state helpers ───────────────────────────────────────────────────────

  const CALC_ID = 'sc1';

  function setLoadingState(isLoading) {
    const skeleton = document.getElementById(CALC_ID + '-skeleton');
    const resultEl = document.getElementById(CALC_ID + '-result');
    const emptyEl  = document.getElementById(CALC_ID + '-empty');
    const btn      = document.querySelector('.cta-button[data-calc="' + CALC_ID + '"]');

    if (isLoading) {
      if (emptyEl)  emptyEl.hidden  = true;
      if (resultEl) resultEl.hidden = true;
      if (skeleton) skeleton.hidden = false;
      if (btn) {
        btn.disabled = true;
        btn.classList.add('cta-loading');
        btn.dataset.originalText = btn.textContent.trim();
        btn.innerHTML = '<span class="cta-spinner"></span>Getting your price…';
      }
    } else {
      if (skeleton) skeleton.hidden = true;
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('cta-loading');
        if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
      }
    }
  }

  function showResult(result) {
    const resultEl = document.getElementById(CALC_ID + '-result');
    const emptyEl  = document.getElementById(CALC_ID + '-empty');
    const plansEl  = document.getElementById(CALC_ID + '-plans');
    const shieldEl = document.getElementById(CALC_ID + '-shield');
    if (emptyEl)  emptyEl.hidden  = true;
    if (shieldEl) shieldEl.hidden = false;
    if (resultEl) resultEl.hidden = false;
    if (plansEl)  plansEl.hidden  = false;
    clearStale();

    animateAmount(document.getElementById(CALC_ID + '-premiumAmount'), formatINR(result.price));
    const plansText = document.getElementById(CALC_ID + '-plansText');
    if (plansText) plansText.textContent = result.coverText || '';
    const perday = document.getElementById(CALC_ID + '-perDay');
    if (perday) perday.textContent = result.daily ? '₹' + result.daily + '/day. Less than your morning chai.' : '';

    const plansBtn = document.getElementById(CALC_ID + '-plansBtn');
    if (plansBtn) {
      const params = new URLSearchParams({ utm_source: 'calculator', utm_medium: 'seo', age: state.age });
      plansBtn.href = 'https://www.acko.com/health-insurance/buy?' + params.toString();
    }
  }

  function markStale() {
    const resultEl = document.getElementById(CALC_ID + '-result');
    if (!resultEl || resultEl.hidden) return;
    [CALC_ID + '-result', CALC_ID + '-plans', CALC_ID + '-shield'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('result-stale');
    });
    const btn = document.querySelector('.cta-button[data-calc="' + CALC_ID + '"]');
    if (btn) {
      btn.classList.remove('cta-nudge');
      void btn.offsetWidth;
      btn.classList.add('cta-nudge');
    }
  }

  function clearStale() {
    [CALC_ID + '-result', CALC_ID + '-plans', CALC_ID + '-shield'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('result-stale');
    });
    const btn = document.querySelector('.cta-button[data-calc="' + CALC_ID + '"]');
    if (btn) btn.classList.remove('cta-nudge');
  }

  // ── Calculator state ───────────────────────────────────────────────────────

  const coverLabels = ['₹10 L', '₹25 L', '₹50 L', '₹1 Cr'];
  const state = { age: 30, coverIndex: 0, adults: 1, children: 0, parents: 0, city: 'bengaluru' };

  // ── Init sliders ───────────────────────────────────────────────────────────

  const ageSlider = document.getElementById('sc1-ageSlider');
  const coverSlider = document.getElementById('sc1-coverSlider');

  ageSlider.addEventListener('input', (e) => {
    state.age = parseInt(e.target.value);
    document.getElementById('sc1-ageValue').textContent = state.age;
    updateSliderProgress(e.target);
    markStale();
  });

  coverSlider.addEventListener('input', (e) => {
    state.coverIndex = parseInt(e.target.value);
    document.getElementById('sc1-coverValue').textContent = coverLabels[state.coverIndex];
    updateSliderProgress(e.target);
    markStale();
  });

  updateSliderProgress(ageSlider);
  updateSliderProgress(coverSlider);

  // ── Steppers ───────────────────────────────────────────────────────────────

  initStepper('sc1-adults-dec', 'sc1-adults-inc', 'sc1-adults-val', state, 'adults', 1, 4, markStale);
  initStepper('sc1-children-dec', 'sc1-children-inc', 'sc1-children-val', state, 'children', 0, 4, markStale);
  initStepper('sc1-parents-dec', 'sc1-parents-inc', 'sc1-parents-val', state, 'parents', 0, 2, markStale);

  // ── City select ────────────────────────────────────────────────────────────

  const citySelect = document.getElementById('sc1-citySelect');
  initSearchableSelect(citySelect);
  citySelect.addEventListener('change', (e) => {
    state.city = e.detail.value;
    markStale();
  });

  // ── CTA ────────────────────────────────────────────────────────────────────

  document.querySelector('.cta-button[data-calc="sc1"]').addEventListener('click', async () => {
    setLoadingState(true);
    try {
      const result = await fetchPrice('c1', { ...state });
      setLoadingState(false);
      showResult(result);
    } catch (e) {
      setLoadingState(false);
    }
  });

  // ── ToC: active section tracking ──────────────────────────────────────────

  const tocItems = document.querySelectorAll('.seo-toc-item');
  const sections = document.querySelectorAll('.seo-section[id]');
  const activeBar = document.querySelector('.seo-toc-active-bar');

  function updateToc() {
    let current = sections[0];
    sections.forEach(s => {
      if (s.getBoundingClientRect().top <= 100) current = s;
    });

    tocItems.forEach((item, i) => {
      const active = item.getAttribute('href') === '#' + current.id;
      item.classList.toggle('active', active);
      if (active && activeBar) {
        activeBar.style.top = (i * 36) + 'px';
      }
    });
  }

  window.addEventListener('scroll', updateToc, { passive: true });
  updateToc();

})();
