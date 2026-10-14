(function () {
  const P = window.PROTO;
  const VARIANTS = window.VARIANTS;
  const KEYS = Object.keys(VARIANTS);

  const params = new URLSearchParams(location.search);
  const state = {
    variant: KEYS.includes(params.get('variant')) ? params.get('variant') : KEYS[0],
    screen: params.get('screen') || 'products',
    lang: params.get('lang') === 'en' ? 'en' : 'ar',
    width: params.get('width') || null
  };

  const stage = document.getElementById('stage');
  const screenSelect = document.getElementById('screen');
  const variantName = document.getElementById('variant-name');
  const langButton = document.getElementById('lang');

  function roleOf(screen) {
    const found = P.SCREENS.find((s) => s.key === screen);
    return found ? found.role : 'applicant';
  }

  function effectiveWidth() {
    if (state.width) return state.width;
    return roleOf(state.screen) === 'staff' ? 'desktop' : 'mobile';
  }

  function syncUrl() {
    const q = new URLSearchParams();
    q.set('variant', state.variant);
    q.set('screen', state.screen);
    q.set('lang', state.lang);
    q.set('width', effectiveWidth());
    history.replaceState(null, '', `${location.pathname}?${q.toString()}`);
  }

  function buildScreenOptions() {
    screenSelect.textContent = '';
    ['applicant', 'staff'].forEach((role) => {
      const group = document.createElement('optgroup');
      group.label = P.fmt(state.lang, role === 'applicant' ? 'applicantView' : 'staffView');
      P.SCREENS.filter((s) => s.role === role).forEach((s) => {
        const option = document.createElement('option');
        option.value = s.key;
        option.textContent = P.fmt(state.lang, s.label);
        group.appendChild(option);
      });
      screenSelect.appendChild(group);
    });
    screenSelect.value = state.screen;
  }

  function render() {
    const variant = VARIANTS[state.variant];
    const lang = state.lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.dataset.width = effectiveWidth();
    document.body.dataset.theme = variant.theme || 'light-stage';
    document.body.dataset.variant = state.variant;

    const ctx = {
      lang,
      screen: state.screen,
      role: roleOf(state.screen),
      width: effectiveWidth(),
      t: (key) => P.fmt(lang, key),
      L: (v) => P.label(lang, v),
      n: P.n,
      date: (iso) => P.date(lang, iso),
      monthName: (iso) => P.monthName(lang, iso),
      money: (x) => P.money(lang, x),
      people: P.PEOPLE,
      variant: state.variant
    };

    stage.innerHTML = variant.render(ctx);
    stage.scrollTop = 0;

    variantName.textContent = `${variant.key} — ${variant.name[lang]}`;
    langButton.textContent = P.fmt(lang, 'switchLang');
    buildScreenOptions();
    syncUrl();
  }

  function cycle(list, current, step) {
    const i = list.indexOf(current);
    return list[(i + step + list.length) % list.length];
  }

  function setVariant(next) {
    state.variant = next;
    render();
  }

  function setScreen(next) {
    state.screen = next;
    render();
  }

  document.getElementById('prev').addEventListener('click', () => setVariant(cycle(KEYS, state.variant, -1)));
  document.getElementById('next').addEventListener('click', () => setVariant(cycle(KEYS, state.variant, 1)));
  screenSelect.addEventListener('change', (e) => setScreen(e.target.value));
  langButton.addEventListener('click', () => {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    render();
  });

  document.querySelectorAll('[data-width]').forEach((button) => {
    button.addEventListener('click', () => {
      state.width = button.dataset.width;
      render();
      document.querySelectorAll('[data-width]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    });
    button.setAttribute('aria-pressed', String(button.dataset.width === effectiveWidth()));
  });

  document.addEventListener('keydown', (e) => {
    const target = e.target;
    const typing =
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (typing) return;
    if (e.key === 'Escape') {
      stage.querySelectorAll('[role="dialog"]:not([hidden])').forEach((d) => d.setAttribute('hidden', ''));
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const step = e.key === 'ArrowRight' ? 1 : -1;
      if (e.shiftKey) {
        setScreen(cycle(P.SCREENS.map((s) => s.key), state.screen, step));
      } else {
        setVariant(cycle(KEYS, state.variant, step));
      }
      e.preventDefault();
    }
  });

  stage.addEventListener('click', (e) => {
    if (e.target instanceof HTMLElement && e.target.matches('[role="dialog"]')) {
      e.target.setAttribute('hidden', '');
      return;
    }

    const trigger = e.target.closest('[data-toggle],[data-close],[data-focus],[data-toggle-class],[data-page],[data-btab]');
    if (!trigger) return;

    if (trigger.dataset.btab) {
      stage.querySelectorAll('[data-btab]').forEach((b) => {
        const on = b === trigger;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      stage.querySelectorAll('[data-bpanel]').forEach((p) => {
        p.toggleAttribute('hidden', p.dataset.bpanel !== trigger.dataset.btab);
      });
    }

    if (trigger.dataset.toggleClass) {
      stage.classList.toggle(trigger.dataset.toggleClass);
      const on = stage.classList.contains(trigger.dataset.toggleClass);
      trigger.setAttribute('aria-pressed', String(on));
    }

    if (trigger.dataset.toggle) {
      const panel = stage.querySelector(trigger.dataset.toggle);
      if (panel) {
        const hidden = panel.hasAttribute('hidden');
        if (hidden) {
          panel.removeAttribute('hidden');
          const focusable = panel.querySelector('input,textarea,button,select,[tabindex]');
          if (focusable) focusable.focus();
        } else {
          panel.setAttribute('hidden', '');
        }
      }
    }

    if (trigger.dataset.close) {
      const panel = trigger.closest(trigger.dataset.close);
      if (panel) panel.setAttribute('hidden', '');
    }

    if (trigger.dataset.focus) {
      const node = stage.querySelector(trigger.dataset.focus);
      if (node) {
        node.focus();
        node.classList.add('is-focused');
        setTimeout(() => node.classList.remove('is-focused'), 2600);
      }
    }

    if (trigger.dataset.page) {
      stage.querySelectorAll('[data-pagenum]').forEach((row) => {
        row.toggleAttribute('hidden', row.dataset.pagenum !== trigger.dataset.page);
      });
      stage.querySelectorAll('[data-page]').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === trigger));
      });
    }
  });

  render();
})();
