document.addEventListener('DOMContentLoaded', () => {

  // =============================================
  // Shared Utilities
  // =============================================

  function formatINR(amount) {
    const rounded = Math.round(amount / 100) * 100;
    return '₹ ' + rounded.toLocaleString('en-IN');
  }

  function formatLakhsWithRupee(val) {
    if (val >= 100) {
      const cr = val / 100;
      const t = Number.isInteger(cr) ? String(cr) : String(Math.round(cr * 10) / 10);
      return '₹' + t + ' Cr';
    }
    if (val === 0) return '₹0';
    return '₹' + val + ' L';
  }

  /** Absolute rupees → compact hero (e.g. ₹ 1 Cr) for HLV result line */
  function formatCoverHeroINR(rupees) {
    const r = Math.round(Number(rupees) || 0);
    if (r >= 10000000) {
      const cr = r / 10000000;
      const t = Number.isInteger(cr) ? String(cr) : String(Math.round(cr * 10) / 10);
      return '₹ ' + t + ' Cr';
    }
    if (r >= 100000) {
      const L = r / 100000;
      const t = Number.isInteger(L) ? String(L) : String(Math.round(L * 10) / 10);
      return '₹ ' + t + ' L';
    }
    if (r <= 0) return '₹ 0';
    return '₹ ' + r.toLocaleString('en-IN');
  }

  function isTermFigma() {
    const el = document.getElementById('calc6');
    return !!(el && el.classList.contains('term-calculator--figma'));
  }

  function updateSliderProgress(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-progress', pct + '%');
  }

  const rollState = new WeakMap();

  function parseNumber(text) {
    const digits = text.replace(/[^0-9]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  function animateAmount(el, text) {
    const currentText = el.dataset.currentText || el.textContent.trim();
    if (currentText === text) return;

    const prev = rollState.get(el);
    if (prev) cancelAnimationFrame(prev.raf);

    const fromVal = parseNumber(currentText);
    const toVal = parseNumber(text);
    const prefix = text.match(/^[^0-9]*/)[0];
    const isYears = /years?$/i.test(text);

    el.dataset.currentText = text;

    if (fromVal === toVal) { el.textContent = text; return; }

    const duration = 350;
    const start = performance.now();
    const diff = toVal - fromVal;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      let current = Math.round(fromVal + diff * eased);

      if (isYears) {
        el.textContent = current + ' years';
      } else {
        current = Math.round(current / 100) * 100;
        el.textContent = prefix + current.toLocaleString('en-IN');
      }

      if (progress < 1) {
        const state = { raf: requestAnimationFrame(tick) };
        rollState.set(el, state);
      } else {
        el.textContent = text;
        rollState.delete(el);
      }
    }

    rollState.set(el, { raf: requestAnimationFrame(tick) });
  }

  function initAllSliders() {
    document.querySelectorAll('.custom-slider').forEach(updateSliderProgress);
  }

  function initSearchableSelects() {
    document.querySelectorAll('.searchable-select').forEach(select => {
      const trigger = select.querySelector('.searchable-select-trigger');
      const textEl = select.querySelector('.searchable-select-text');
      const input = select.querySelector('.searchable-select-input');
      const options = select.querySelectorAll('.searchable-select-options li');

      const currentValue = select.dataset.value;
      options.forEach(opt => {
        if (opt.dataset.value === currentValue) opt.classList.add('selected');
      });

      trigger.addEventListener('click', () => {
        const wasOpen = select.classList.contains('open');
        document.querySelectorAll('.searchable-select.open').forEach(s => s.classList.remove('open'));
        if (!wasOpen) {
          select.classList.add('open');
          input.value = '';
          options.forEach(opt => opt.classList.remove('hidden'));
          setTimeout(() => input.focus(), 50);
        }
      });

      const noResults = select.querySelector('.searchable-select-no-results');

      input.addEventListener('input', () => {
        const query = input.value.toLowerCase();
        let visibleCount = 0;
        options.forEach(opt => {
          const match = opt.textContent.toLowerCase().includes(query);
          opt.classList.toggle('hidden', !match);
          if (match) visibleCount++;
        });
        if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      });

      input.addEventListener('click', (e) => e.stopPropagation());

      options.forEach(opt => {
        opt.addEventListener('click', () => {
          const value = opt.dataset.value;
          const label = opt.textContent;
          select.dataset.value = value;
          textEl.textContent = label;
          options.forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          select.classList.remove('open');
          select.dispatchEvent(new CustomEvent('change', { detail: { value } }));
        });
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.searchable-select')) {
        document.querySelectorAll('.searchable-select.open').forEach(s => s.classList.remove('open'));
      }
    });
  }

  // =============================================
  // Loading / Error / Result state helpers
  // =============================================

  const calcSectionIds = { c1: 'calc1', c5: 'calc5', c6: 'calc6' };

  function getResultsPanel(calcId) {
    const live = document.getElementById(calcId + '-live');
    if (live) return live.closest('.results-panel');
    const sid = calcSectionIds[calcId];
    if (sid) {
      const section = document.getElementById(sid);
      const panel = section && section.querySelector('.results-panel');
      if (panel) return panel;
    }
    const emptyEl = document.getElementById(calcId + '-empty');
    return emptyEl ? emptyEl.closest('.results-panel') : null;
  }

  function healthHospitalisationBullet(coverIndex) {
    const steps = [10, 25, 50, 100];
    const v = steps[Math.min(coverIndex | 0, steps.length - 1)];
    if (v >= 100) return '₹1Cr hospitalisation cover';
    return '₹' + v + 'L hospitalisation cover';
  }

  /** After the first Calculate tap, results stay visible and update on every input change. */
  const resultsRevealed = { c1: false, c5: false, c6: false };

  function applyEmptyResultsState(calcId) {
    const panel = getResultsPanel(calcId);
    if (panel) panel.classList.add('results-empty');
    const emptyEl = document.getElementById(calcId + '-empty');
    if (emptyEl) emptyEl.hidden = false;
    const skeleton = document.getElementById(calcId + '-skeleton');
    if (skeleton) skeleton.hidden = true;
    const liveEl = document.getElementById(calcId + '-live');
    const resultEl = document.getElementById(calcId + '-result');
    if (liveEl) liveEl.hidden = true;
    if (resultEl) resultEl.hidden = true;
    const plansEl = document.getElementById(calcId + '-plans');
    if (plansEl) plansEl.hidden = true;
    const shieldEl = document.getElementById(calcId + '-shield');
    if (shieldEl) shieldEl.hidden = true;
  }

  function liveUpdate(calcId) {
    if (!resultsRevealed[calcId]) return;
    const calcObj = { c1, c5, c6 }[calcId];
    if (!calcObj || typeof computePrice !== 'function') return;
    let result;
    try {
      result = computePrice(calcId, calcObj.getParams());
    } catch (e) {
      return;
    }
    showLiveResult(calcId, result);
  }

  function showLiveResult(calcId, result) {
    const panel = getResultsPanel(calcId);
    if (panel) panel.classList.remove('results-empty');
    const emptyEl = document.getElementById(calcId + '-empty');
    if (emptyEl) emptyEl.hidden = true;
    const skeleton = document.getElementById(calcId + '-skeleton');
    if (skeleton) skeleton.hidden = true;
    const liveEl = document.getElementById(calcId + '-live');
    const resultEl = document.getElementById(calcId + '-result');
    if (liveEl) liveEl.hidden = false;
    if (resultEl) resultEl.hidden = false;
    const plansEl = document.getElementById(calcId + '-plans');
    if (plansEl) plansEl.hidden = false;
    const shieldEl = document.getElementById(calcId + '-shield');
    if (shieldEl) shieldEl.hidden = true;
    clearStale(calcId);
    renderResult(calcId, result);
  }

  function setLoadingState(calcId, isLoading) {
    const skeleton  = document.getElementById(calcId + '-skeleton');
    const resultEl  = document.getElementById(calcId + '-result');
    const emptyEl   = document.getElementById(calcId + '-empty');
    const panel     = getResultsPanel(calcId);
    const btn       = document.querySelector('.cta-button[data-calc="' + calcId + '"]');

    if (isLoading) {
      if (panel)    panel.classList.remove('results-empty');
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

  function markStale(calcId) {
    const resultEl = document.getElementById(calcId + '-result');
    const plansEl  = document.getElementById(calcId + '-plans');
    const shieldEl = document.getElementById(calcId + '-shield');
    const btn      = document.querySelector('.cta-button[data-calc="' + calcId + '"]');

    // Only act if a result is currently visible
    if (!resultEl || resultEl.hidden) return;

    if (resultEl) resultEl.classList.add('result-stale');
    if (plansEl)  plansEl.classList.add('result-stale');
    if (shieldEl) shieldEl.classList.add('result-stale');
    if (btn && !btn.classList.contains('cta-stale')) {
      btn.dataset.originalText = btn.dataset.originalText || btn.textContent.trim();
      if (calcId === 'c6' && isTermFigma()) {
        btn.classList.add('cta-stale');
      } else {
        btn.innerHTML = '<span class="cta-refresh-icon">↻</span> Update my price';
        btn.classList.add('cta-stale');
      }
    }
  }

  function clearStale(calcId) {
    const resultEl = document.getElementById(calcId + '-result');
    const plansEl  = document.getElementById(calcId + '-plans');
    const shieldEl = document.getElementById(calcId + '-shield');
    const liveEl   = document.getElementById(calcId + '-live');
    const btn      = document.querySelector('.cta-button[data-calc="' + calcId + '"]');
    if (resultEl) resultEl.classList.remove('result-stale');
    if (plansEl)  plansEl.classList.remove('result-stale');
    if (shieldEl) shieldEl.classList.remove('result-stale');
    if (liveEl)   liveEl.classList.remove('result-stale');
    if (calcId === 'c6') {
      document.querySelectorAll('#calc6 .term-figma-different-card').forEach(el => {
        el.classList.remove('result-stale');
      });
    }
    if (calcId === 'c5') {
      document.querySelectorAll('#calc5 .term-figma-different-card').forEach(el => {
        el.classList.remove('result-stale');
      });
    }
    if (btn && btn.classList.contains('cta-stale')) {
      btn.classList.remove('cta-stale');
      if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
    }
  }

  function showResult(calcId, result) {
    const resultEl  = document.getElementById(calcId + '-result');
    const emptyEl   = document.getElementById(calcId + '-empty');
    const plansEl   = document.getElementById(calcId + '-plans');
    const shieldEl  = document.getElementById(calcId + '-shield');
    const panel     = getResultsPanel(calcId);
    if (panel)    panel.classList.remove('results-empty');
    if (emptyEl)  emptyEl.hidden  = true;
    if (shieldEl) shieldEl.hidden = false;
    if (resultEl) resultEl.hidden = false;
    if (plansEl)  plansEl.hidden  = false;
    clearStale(calcId);
    renderResult(calcId, result);
  }

  function renderResult(calcId, result) {
    if (calcId === 'c1') {
      const pa = document.getElementById('c1-premiumAmount');
      if (pa) animateAmount(pa, '₹ ' + result.monthly.toLocaleString('en-IN'));
      const bulletEl = document.getElementById('c1-bulletCover');
      if (bulletEl) bulletEl.textContent = healthHospitalisationBullet(c1.state.coverIndex);
      const perdayEl = document.getElementById('c1-perDay');
      if (perdayEl) {
        perdayEl.textContent = result.daily
          ? '₹' + result.daily + '/day. Less than your morning breakfast.'
          : '';
      }
    } else if (calcId === 'c5') {
      const coverHero = document.getElementById('c5-coverHero');
      if (coverHero) coverHero.textContent = formatCoverHeroINR(result.price);
      const monthlyHero = document.getElementById('c5-monthlyHero');
      if (monthlyHero && result.monthly != null) {
        animateAmount(monthlyHero, '₹ ' + result.monthly.toLocaleString('en-IN'));
      }
      const perDayEl = document.getElementById('c5-hlvPerDay');
      if (perDayEl) {
        perDayEl.textContent = result.daily
          ? '₹' + result.daily + '/day. Less than your morning breakfast.'
          : '';
      }
    } else if (calcId === 'c6') {
      if (isTermFigma()) {
        const monthlyEl = document.getElementById('c6-monthlyAmount');
        if (monthlyEl) animateAmount(monthlyEl, '₹ ' + result.monthly.toLocaleString('en-IN'));
      } else {
        animateAmount(document.getElementById('c6-premiumAmount'), '₹ ' + result.monthly.toLocaleString('en-IN'));
        const plansEl = document.getElementById('c6-plansText');
        if (plansEl) plansEl.textContent = result.coverText;
        const perdayEl = document.getElementById('c6-perDay');
        if (perdayEl) perdayEl.textContent = result.daily ? '₹' + result.daily + '/day to make sure they never struggle' : '';
      }
    }
    updateBuyCtaUrls();
  }

  // =============================================
  // Main fetch trigger — called by CTA
  // =============================================

  function triggerFetch(calcId) {
    resultsRevealed[calcId] = true;
    liveUpdate(calcId);
    if (window.innerWidth <= 1024) {
      const sid = calcSectionIds[calcId];
      const section = sid ? document.getElementById(sid) : null;
      const skipScroll =
        section &&
        section.classList.contains('calculator-section') &&
        !section.classList.contains('active');
      if (!skipScroll) {
        const pnl = section?.querySelector('.results-panel');
        if (pnl) pnl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // =============================================
  // CALCULATOR 1: Health Insurance Calculator
  // =============================================

  const c1 = {
    coverSteps: [10, 25, 50, 100],
    coverLabels: ['₹10 L', '₹25 L', '₹50 L', '₹1 Cr'],

    state: { age: 30, coverIndex: 0, adults: 1, children: 1 },

    getParams() {
      return {
        age: this.state.age,
        coverIndex: this.state.coverIndex,
        adults: this.state.adults,
        children: this.state.children
      };
    },

    updateStepperButtons() {
      document.getElementById('c1-adults-dec').disabled  = this.state.adults <= 1;
      document.getElementById('c1-adults-inc').disabled  = this.state.adults >= 4;
      document.getElementById('c1-children-dec').disabled = this.state.children <= 0;
      document.getElementById('c1-children-inc').disabled = this.state.children >= 4;
    },

    initStepper(decId, incId, valId, stateKey, min, max) {
      document.getElementById(decId).addEventListener('click', () => {
        if (this.state[stateKey] > min) {
          this.state[stateKey]--;
          const el = document.getElementById(valId);
          el.textContent = this.state[stateKey];
          el.dataset.zero = this.state[stateKey] === 0 ? 'true' : 'false';
          this.updateStepperButtons();
          liveUpdate('c1');
        }
      });
      document.getElementById(incId).addEventListener('click', () => {
        if (this.state[stateKey] < max) {
          this.state[stateKey]++;
          const el = document.getElementById(valId);
          el.textContent = this.state[stateKey];
          el.dataset.zero = this.state[stateKey] === 0 ? 'true' : 'false';
          this.updateStepperButtons();
          liveUpdate('c1');
        }
      });
    },

    init() {
      document.getElementById('c1-ageSlider').addEventListener('input', (e) => {
        this.state.age = parseInt(e.target.value);
        document.getElementById('c1-ageValue').textContent = this.state.age;
        updateSliderProgress(e.target);
        liveUpdate('c1');
      });

      document.getElementById('c1-coverSlider').addEventListener('input', (e) => {
        this.state.coverIndex = parseInt(e.target.value);
        document.getElementById('c1-coverValue').textContent = this.coverLabels[this.state.coverIndex];
        updateSliderProgress(e.target);
        liveUpdate('c1');
      });

      this.initStepper('c1-adults-dec', 'c1-adults-inc', 'c1-adults-val', 'adults', 1, 4);
      this.initStepper('c1-children-dec', 'c1-children-inc', 'c1-children-val', 'children', 0, 4);
      this.updateStepperButtons();
    }
  };

  // =============================================
  // CALCULATOR 5: HLV (Human Life Value) Calculator
  // =============================================

  const c5 = {
    state: {
      age: 30,
      income: 10,
      retireAge: 60,
      savings: 0,
      loans: 0,
      existingCover: 0
    },

    getParams() {
      return {
        age: this.state.age,
        retireAge: this.state.retireAge,
        income: this.state.income,
        expenses: Math.max(1, Math.round(this.state.income * 0.35)),
        savings: this.state.savings,
        loans: this.state.loans,
        existingCover: this.state.existingCover
      };
    },

    syncRetireBounds() {
      const age = this.state.age;
      const el = document.getElementById('c5-retireSlider');
      if (!el) return;
      const maxR = 70;
      let minR = Math.max(40, age + 1);
      if (minR > maxR) minR = maxR;
      el.min = String(minR);
      el.max = String(maxR);
      let rv = parseInt(el.value, 10);
      if (rv < minR) {
        rv = minR;
        el.value = String(rv);
      }
      if (rv > maxR) {
        rv = maxR;
        el.value = String(rv);
      }
      this.state.retireAge = rv;
      document.getElementById('c5-retireValue').textContent = rv + ' yrs';
      const left = document.getElementById('c5-retireMinLabel');
      if (left) left.textContent = minR + ' yrs';
      updateSliderProgress(el);
    },

    syncAccSlidersFromState() {
      const set = (id, val, labelId, fmt) => {
        const s = document.getElementById(id);
        const lab = document.getElementById(labelId);
        if (s) {
          s.value = String(val);
          updateSliderProgress(s);
        }
        if (lab) lab.textContent = fmt(val);
      };
      set('c5-accSavingsSlider', this.state.savings, 'c5-accSavingsValue', formatLakhsWithRupee);
      set('c5-accLoansSlider', this.state.loans, 'c5-accLoansValue', formatLakhsWithRupee);
      set('c5-accExistingSlider', this.state.existingCover, 'c5-accExistingValue', formatLakhsWithRupee);
    },

    refinePanelOpen() {
      const wrap = document.getElementById('c5-refineAccordion');
      return !!(wrap && wrap.classList.contains('is-open'));
    },

    setRefinePanelOpen(open) {
      const wrap = document.getElementById('c5-refineAccordion');
      const panel = document.getElementById('c5-accordionPanel');
      const desk = document.getElementById('c5-refineOpen');
      const mob = document.getElementById('c5-accordionToggle');
      if (!wrap || !panel) return;
      wrap.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (desk) {
        desk.setAttribute('aria-expanded', open ? 'true' : 'false');
        desk.classList.toggle('is-open', open);
      }
      if (mob) {
        mob.setAttribute('aria-expanded', open ? 'true' : 'false');
        mob.classList.toggle('is-open', open);
      }
    },

    toggleRefinePanel() {
      this.setRefinePanelOpen(!this.refinePanelOpen());
    },

    init() {
      const self = this;

      document.getElementById('c5-ageSlider').addEventListener('input', (e) => {
        self.state.age = parseInt(e.target.value, 10);
        document.getElementById('c5-ageValue').textContent = self.state.age;
        updateSliderProgress(e.target);
        self.syncRetireBounds();
        liveUpdate('c5');
      });

      document.getElementById('c5-incomeSlider').addEventListener('input', (e) => {
        self.state.income = parseInt(e.target.value, 10);
        document.getElementById('c5-incomeValue').textContent = formatLakhsWithRupee(self.state.income);
        updateSliderProgress(e.target);
        liveUpdate('c5');
      });

      document.getElementById('c5-retireSlider').addEventListener('input', (e) => {
        self.state.retireAge = parseInt(e.target.value, 10);
        document.getElementById('c5-retireValue').textContent = self.state.retireAge + ' yrs';
        updateSliderProgress(e.target);
        liveUpdate('c5');
      });

      function bindMoneySlider(sliderId, labelId, stateKey) {
        const sl = document.getElementById(sliderId);
        if (!sl) return;
        sl.addEventListener('input', (e) => {
          const v = parseInt(e.target.value, 10) || 0;
          self.state[stateKey] = v;
          document.getElementById(labelId).textContent = formatLakhsWithRupee(v);
          updateSliderProgress(e.target);
          liveUpdate('c5');
        });
      }

      bindMoneySlider('c5-accSavingsSlider', 'c5-accSavingsValue', 'savings');
      bindMoneySlider('c5-accLoansSlider', 'c5-accLoansValue', 'loans');
      bindMoneySlider('c5-accExistingSlider', 'c5-accExistingValue', 'existingCover');

      const openBtn = document.getElementById('c5-refineOpen');
      if (openBtn) openBtn.addEventListener('click', () => self.toggleRefinePanel());

      const accBtn = document.getElementById('c5-accordionToggle');
      if (accBtn) accBtn.addEventListener('click', () => self.toggleRefinePanel());

      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (self.refinePanelOpen()) self.setRefinePanelOpen(false);
      });

      self.syncRetireBounds();
      self.syncAccSlidersFromState();
    }
  };

  // =============================================
  // CALCULATOR 6: Term Insurance Calculator
  // =============================================

  const c6 = {
    coverSteps: [2500000, 5000000, 7500000, 10000000, 20000000],
    coverLabels: ['₹25 L', '₹50 L', '₹75 L', '₹1 Cr', '₹2 Cr'],

    state: { age: 30, coverIndex: 1, term: 20, income: 10 },

    getParams() {
      if (isTermFigma()) {
        return {
          age: this.state.age,
          coverIndex: this.state.coverIndex,
          term: 60,
          coverVariant: '4',
          income: this.state.income
        };
      }
      return { ...this.state };
    },

    init() {
      if (isTermFigma()) {
        this.state = { age: 30, coverIndex: 0, term: 60, income: 50 };
        this.coverLabels = ['₹25 L', '₹50 L', '₹1 Cr', '₹2 Cr'];
        const cv = document.getElementById('c6-coverValue');
        if (cv) cv.textContent = this.coverLabels[this.state.coverIndex];
        const incomeVal = document.getElementById('c6-incomeValue');
        if (incomeVal) incomeVal.textContent = formatLakhsWithRupee(this.state.income);
      }

      document.getElementById('c6-ageSlider').addEventListener('input', (e) => {
        this.state.age = parseInt(e.target.value, 10);
        document.getElementById('c6-ageValue').textContent = this.state.age;
        updateSliderProgress(e.target);
        liveUpdate('c6');
      });

      document.getElementById('c6-coverSlider').addEventListener('input', (e) => {
        this.state.coverIndex = parseInt(e.target.value, 10);
        document.getElementById('c6-coverValue').textContent = this.coverLabels[this.state.coverIndex];
        updateSliderProgress(e.target);
        liveUpdate('c6');
      });

      const termSlider = document.getElementById('c6-termSlider');
      if (termSlider) {
        termSlider.addEventListener('input', (e) => {
          this.state.term = parseInt(e.target.value, 10);
          document.getElementById('c6-termValue').textContent = this.state.term + ' yrs';
          updateSliderProgress(e.target);
          liveUpdate('c6');
        });
      }

      const incomeSlider = document.getElementById('c6-incomeSlider');
      if (incomeSlider) {
        incomeSlider.addEventListener('input', (e) => {
          this.state.income = parseInt(e.target.value, 10);
          const incomeVal = document.getElementById('c6-incomeValue');
          if (incomeVal) incomeVal.textContent = formatLakhsWithRupee(this.state.income);
          updateSliderProgress(e.target);
          liveUpdate('c6');
        });
      }
    }
  };

  // =============================================
  // Global: Multi-select toggle buttons (Calc 3 goals)
  // =============================================

  document.querySelectorAll('.multi-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const calc = btn.dataset.calc;
      const group = btn.dataset.group;

      const selected = [];
      document.querySelectorAll(`.multi-btn[data-calc="${calc}"][data-group="${group}"].active`).forEach((b) => {
        selected.push(b.dataset.value);
      });

      const calcObj = { c1, c5, c6 }[calc];
      if (calcObj) calcObj.state[group] = selected;
    });
  });

  // =============================================
  // Global: CTA Buttons — trigger API fetch
  // =============================================

  document.querySelectorAll('.calc-cta--first').forEach((btn) => {
    btn.addEventListener('click', () => {
      const calcId = btn.dataset.calc;
      if (calcId) triggerFetch(calcId);
    });
  });

  // =============================================
  // Tab Navigation
  // =============================================

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.calculator-section').forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(targetId).classList.add('active');

      document.querySelectorAll('.searchable-select.open').forEach(s => s.classList.remove('open'));

      const tabToCalc = { calc1: 'c1', calc5: 'c5', calc6: 'c6' };
      const calcKey = tabToCalc[targetId];
      if (calcKey && resultsRevealed[calcKey]) liveUpdate(calcKey);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // =============================================
  // Plans CTA — Dynamic URL with calculator params
  // =============================================

  const plansBaseUrls = {
    c1: 'https://www.acko.com/health-insurance/buy',
    c5: 'https://www.acko.com/term-life-insurance/buy',
    c6: 'https://www.acko.com/term-life-insurance/buy'
  };

  function buildPlansUrl(calcId) {
    const base = plansBaseUrls[calcId] || '#';
    const params = new URLSearchParams();
    params.set('utm_source', 'calculator');
    params.set('utm_medium', 'seo');

    const calcObj = { c1, c5, c6 }[calcId];
    if (!calcObj) return base;

    params.set('age', calcObj.state.age);

    if (calcId === 'c1') {
      const coverSteps = [1000000, 2500000, 5000000, 10000000];
      params.set('cover',    coverSteps[c1.state.coverIndex] + '');
      params.set('adults',   c1.state.adults);
      params.set('children', c1.state.children);
    } else if (calcId === 'c5') {
      params.set('income', c5.state.income);
      params.set('retire_age', String(c5.state.retireAge));
      params.set('savings', String(c5.state.savings));
      params.set('loans', String(c5.state.loans));
      params.set('existing_cover', String(c5.state.existingCover));
    } else if (calcId === 'c6') {
      const coverSteps = isTermFigma()
        ? [2500000, 5000000, 10000000, 20000000]
        : [2500000, 5000000, 7500000, 10000000, 20000000];
      const ci = Math.min(c6.state.coverIndex, coverSteps.length - 1);
      params.set('cover', coverSteps[ci] + '');
      params.set('term', isTermFigma() ? '60' : String(c6.state.term));
      params.set('income', String(c6.state.income));
    }

    return base + '?' + params.toString();
  }

  function updateBuyCtaUrls() {
    ['c1', 'c5', 'c6'].forEach(id => {
      const u = buildPlansUrl(id);
      const plans = document.getElementById(id + '-plansBtn');
      if (plans) plans.href = u;
      const sticky = document.getElementById(id + '-stickyPlans');
      if (sticky) sticky.href = u;
      const primaryBar = document.getElementById(id + '-primaryPlansBar');
      if (primaryBar) primaryBar.href = u;
    });
  }

  // =============================================
  // Initialize
  // =============================================

  initAllSliders();
  initSearchableSelects();
  c1.init();
  c5.init();
  c6.init();
  document.querySelectorAll('#calc5 .custom-slider').forEach(updateSliderProgress);
  updateBuyCtaUrls();

  if (isTermFigma()) {
    document.querySelectorAll('#calc6 .custom-slider').forEach(updateSliderProgress);
  }

  const c5Btn = document.querySelector('.calc-cta--first[data-calc="c5"]');
  if (c5Btn && !c5Btn.dataset.originalText) c5Btn.dataset.originalText = c5Btn.textContent.trim();
  triggerFetch('c1');
  triggerFetch('c5');
  triggerFetch('c6');
});
