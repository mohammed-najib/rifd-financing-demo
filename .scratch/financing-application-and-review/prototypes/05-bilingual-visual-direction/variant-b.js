window.VARIANTS = window.VARIANTS || {};

window.VARIANTS.B = (function () {
  const P = window.PROTO;

  const ST = {
    draft: ['st-draft', 'stDraft'],
    submitted: ['st-submitted', 'stSubmitted'],
    review: ['st-review', 'stReview'],
    corrections: ['st-corrections', 'stCorrections'],
    approved: ['st-approved', 'stApproved'],
    rejected: ['st-rejected', 'stRejected']
  };
  const DS = {
    missing: ['d-missing', 'dMissing'],
    awaiting: ['d-awaiting', 'dAwaiting'],
    accepted: ['d-accepted', 'dAccepted'],
    replace: ['d-replace', 'dReplace']
  };
  const CS = {
    unchecked: ['c-unchecked', 'cUnchecked'],
    passed: ['c-passed', 'cPassed'],
    failed: ['c-failed', 'cFailed']
  };
  const ICON = {
    submitted: '↑',
    review: '◐',
    corrections: '↻',
    approved: '✓',
    rejected: '×',
    draft: '✎',
    missing: '!',
    awaiting: '◔',
    accepted: '✓',
    replace: '↻',
    unchecked: '○',
    passed: '✓',
    failed: '×'
  };

  function m(ctx, x) {
    return `<span class="num">${ctx.n(x)}</span><span class="cur">${ctx.money(x).currency}</span>`;
  }
  function chip(ctx, map, key) {
    const [cls, label] = map[key];
    return `<span class="chip ${cls}"><span class="chip-ic" aria-hidden="true">${ICON[key]}</span>${ctx.t(label)}</span>`;
  }
  const st = (ctx, k) => chip(ctx, ST, k);
  const doc = (ctx, k) => chip(ctx, DS, k);
  const chk = (ctx, k) => chip(ctx, CS, k);

  function topbar(ctx, identity) {
    const name = identity ? ctx.L(P.PEOPLE[identity]) : ctx.lang === 'ar' ? 'زائر' : 'Guest';
    const initials = identity ? (ctx.lang === 'ar' ? name.slice(0, 2) : name.split(' ').map((w) => w[0]).join('')) : '—';
    return `<header class="b-top">
      <a class="b-brand" href="?variant=B&screen=products&lang=${ctx.lang}">
        <span class="b-mark" aria-hidden="true">م</span>
        <span class="b-name">${ctx.t('appTitle')}<em>${ctx.lang === 'ar' ? 'تمويل' : 'finance'}</em></span>
      </a>
      <div class="b-top-acts">
        <button class="b-pill" type="button" data-toggle="#b-id-dlg"><span class="b-avatar">${initials}</span><span class="b-who">${name}</span></button>
        <button class="b-pill b-lang" type="button">${ctx.t('switchLang')}</button>
      </div>
    </header>
    <div class="b-demo">
      <span class="b-demo-ic" aria-hidden="true">◈</span>
      <span class="b-demo-tx">${ctx.t('appTag')}</span>
      <button class="b-demo-btn" type="button" data-toggle="#b-reset-dlg">${ctx.t('navReset')}</button>
    </div>`;
  }

  function tabbar(ctx, role, active) {
    const items =
      role === 'staff'
        ? [
            ['queue', 'navQueue', '≡'],
            ['review', 'navReview', '▤'],
            ['decisions', 'navDecisions', '◈'],
            ['products', 'navGallery', '⌘']
          ]
        : [
            ['products', 'navProducts', '◇'],
            ['form', 'navApply', '✎'],
            ['applications', 'navApplications', '≡'],
            ['documents', 'navDocs', '▣'],
            ['repayment', 'navRepayment', '◷']
          ];
    return `<nav class="b-tabs" aria-label="main">${items
      .map(
        ([k, l, ic]) =>
          `<a class="b-tab${active === k ? ' is-active' : ''}" href="?variant=B&screen=${k}&lang=${ctx.lang}"><span class="b-tab-ic" aria-hidden="true">${ic}</span><span class="b-tab-l">${ctx.t(l)}</span></a>`
      )
      .join('')}</nav>`;
  }

  function shell(ctx, opts, body, sticky) {
    return `<div class="vb">
      ${topbar(ctx, opts.identity)}
      <main class="b-main" id="main">
        <div class="b-head">
          <h1 class="b-title">${opts.title}</h1>
          ${opts.lede ? `<p class="b-lede">${opts.lede}</p>` : ''}
        </div>
        ${body}
      </main>
      ${sticky ? `<div class="b-sticky">${sticky}</div>` : ''}
      ${tabbar(ctx, opts.role, opts.active)}
    </div>`;
  }

  function sheet(ctx, id, title, body, actions) {
    return `<div class="b-sheet" id="${id}" hidden role="dialog" aria-modal="true" aria-label="${title}">
      <div class="b-sheet-in">
        <span class="b-grip" aria-hidden="true"></span>
        <h2 class="b-sheet-t">${title}</h2>
        <div class="b-sheet-b">${body}</div>
        <div class="b-sheet-a">${actions}</div>
      </div>
    </div>`;
  }

  function field(ctx, f) {
    const id = `b-${f.key}`;
    const value = typeof f.value === 'object' ? ctx.L(f.value) : f.value;
    const display = f.money ? ctx.n(value) : value;
    const bad = f.error ? ' is-bad' : '';
    const control = f.textarea
      ? `<textarea id="${id}" class="b-inp${bad}" rows="3" placeholder="${ctx.L(f.placeholder)}" aria-invalid="${!!f.error}">${display}</textarea>`
      : f.choices
        ? `<div class="b-choice" role="radiogroup" aria-label="${ctx.L(f.label)}">${f.choices
            .map((c, i) => `<button class="b-pick${i === 0 ? ' is-on' : ''}" type="button" role="radio" aria-checked="${i === 0}">${ctx.L(c)}</button>`)
            .join('')}</div>`
        : `<input id="${id}" class="b-inp${bad}${f.ltr || f.money ? ' num ltr' : ''}" value="${display}" ${f.ltr || f.money ? 'dir="ltr"' : ''} aria-invalid="${!!f.error}" />`;
    return `<div class="b-fld${bad}">
      <label class="b-lbl" for="${id}">${ctx.L(f.label)}${f.optional ? `<span class="b-opt">${ctx.t('optional')}</span>` : ''}</label>
      ${control}
      ${f.error ? `<p class="b-err" role="alert"><span aria-hidden="true">!</span>${ctx.t(f.error)}</p>` : ''}
      ${f.hint ? `<p class="b-hint">${ctx.L(f.hint)}</p>` : ''}
      ${f.hintKey ? `<p class="b-hint">${ctx.t(f.hintKey)}</p>` : ''}
    </div>`;
  }

  const screens = {
    products(ctx) {
      const cards = P.PRODUCTS.map(
        (p, i) => `<article class="b-prod${i === 0 ? ' is-on' : ''}">
        ${i === 0 ? `<span class="b-ribbon">${ctx.t('selected')}</span>` : ''}
        <h2 class="b-prod-n">${ctx.L(p.name)}</h2>
        <p class="b-prod-p">${ctx.L(p.purpose)}</p>
        <div class="b-hero"><span class="b-hero-k">${ctx.t('amountRange')}</span><span class="b-hero-v num">${ctx.n(p.min)}–${ctx.n(p.max)}</span><span class="b-hero-c">${ctx.money(0).currency}</span></div>
        <div class="b-termpills">${p.terms.map((t) => `<span class="b-tp"><span class="num">${t}</span> ${ctx.t('month')}</span>`).join('')}</div>
        <div class="b-prod-row"><span class="b-k">${ctx.t('markup')}</span><span class="b-v num">${p.markup}%</span></div>
        <div class="b-docs"><span class="b-k">${ctx.t('requiredDocs')}</span>
          <ul class="b-docl">${[...P.SHARED_DOCS, p.fourth].map((d) => `<li><span aria-hidden="true">▣</span>${ctx.t(d)}</li>`).join('')}</ul>
        </div>
        <button class="b-cta${i === 0 ? ' b-cta-on' : ''}" type="button">${ctx.t('choose')}</button>
      </article>`
      ).join('');
      return shell(
        ctx,
        { role: 'applicant', active: 'products', title: ctx.t('screenProducts'), lede: ctx.t('compare') },
        `<div class="b-prods">${cards}</div><p class="b-fine">${ctx.t('fixedAfterSubmit')} ${ctx.t('wholeRial')}</p>`
      );
    },

    form(ctx) {
      const steps = ['stepPersonal', 'stepBusiness', 'stepFinancing', 'stepDocs', 'stepReview'];
      const segs = steps.map((s, i) => `<li class="b-seg${i === 2 ? ' is-now' : ''}${i < 2 ? ' is-done' : ''}" title="${ctx.t(s)}"><span class="b-seg-n num">${i + 1}</span><span class="b-seg-l">${ctx.t(s)}</span></li>`).join('');
      const personal = P.FIELDS.filter((f) => f.group === 'stepPersonal');
      const business = P.FIELDS.filter((f) => f.group === 'stepBusiness');
      const financing = P.FIELDS.filter((f) => f.group === 'stepFinancing');
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'form',
          identity: 'Mariam',
          title: ctx.t('screenForm'),
          lede: `${ctx.L(P.PRODUCTS[1].name)} · <span class="num">MSR-26-100</span> · ${st(ctx, 'draft')}`
        },
        `<ol class="b-segs">${segs}</ol>
        <div class="b-alert b-alert-warn"><span aria-hidden="true">↻</span><div><b>${ctx.t('switchedProduct')}</b></div></div>
        <div class="b-alert b-alert-err"><span aria-hidden="true">!</span><div><b>${ctx.t('errSummary')}</b></div></div>
        <section class="b-card"><h2 class="b-card-t">${ctx.t('stepPersonal')}</h2>${personal.map((f) => field(ctx, f)).join('')}</section>
        <section class="b-card"><h2 class="b-card-t">${ctx.t('stepBusiness')}</h2>${business.map((f) => field(ctx, f)).join('')}<p class="b-hint">${ctx.t('financialWindow')}</p></section>
        <section class="b-card is-open"><h2 class="b-card-t">${ctx.t('stepFinancing')}</h2>${financing.map((f) => field(ctx, f)).join('')}</section>
        <div class="b-savefb"><span class="b-dot-ok" aria-hidden="true"></span>${ctx.t('savedAt')} <span class="num">2026-10-14 09:12</span></div>
        <div class="b-inline-acts"><button class="b-ghost" type="button" data-focus="#b-amount">${ctx.t('focusFirstField')}</button></div>`,
        `<button class="b-ghost" type="button">${ctx.t('saveDraft')}</button><button class="b-cta b-cta-off" type="button" disabled aria-disabled="true">${ctx.t('submit')}</button>`
      );
    },

    documents(ctx) {
      const rec = P.RECORDS[2];
      const cards = P.DOC_SET.map((d) => {
        const requested = d.status === 'replace';
        const pct = requested ? 62 : 100;
        return `<article class="b-doc${requested ? ' is-bad' : ''}">
        <div class="b-ring" style="--pct:${pct}" aria-hidden="true"><span>${requested ? '↻' : '✓'}</span></div>
        <div class="b-doc-main">
          <h3 class="b-doc-n">${ctx.t(d.slot)}</h3>
          ${requested ? `<span class="b-flag">${ctx.t('outstanding')}</span>` : ''}
          <p class="b-doc-f"><span class="ltr">${d.file}</span> <span class="num b-mut">${d.size}${d.pages ? ` · ${d.pages}p` : ''}</span></p>
          <p class="b-doc-s">${requested ? ctx.t('dReplace') : ctx.lang === 'ar' ? 'مُرفق · التقييم داخلي' : 'Supplied · assessment internal'}</p>
          ${requested ? `<p class="b-why"><b>${ctx.t('reason')}:</b> ${ctx.L(d.reason)}</p>` : ''}
        </div>
        <div class="b-doc-acts"><button class="b-btn" type="button">${ctx.t('preview')}</button><button class="b-btn b-btn-main" type="button">${requested ? ctx.t('replace') : ctx.t('replace')}</button></div>
        ${
          requested
            ? `<div class="b-upl b-upl-bad"><span aria-hidden="true">!</span><div><b>${ctx.t('uploadFailed')}</b> <span class="ltr">${d.replacement}</span><p>${ctx.t('uploadFailedWhy')}</p></div><button class="b-btn b-btn-main" type="button">${ctx.t('retry')}</button></div>
            <div class="b-upl"><span aria-hidden="true">◍</span><div>${ctx.t('savedNotPublished')} · ${ctx.t('maxFile')}</div></div>`
            : ''
        }
      </article>`;
      }).join('');
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'documents',
          identity: 'Huda',
          title: ctx.t('screenDocs'),
          lede: `<span class="num">${rec.ref}</span> · ${ctx.L(rec.business)} · ${st(ctx, 'corrections')}`
        },
        `<div class="b-docs-list">${cards}</div>`,
        `<button class="b-ghost" type="button">${ctx.t('saveProgress')}</button><button class="b-cta" type="button">${ctx.t('resubmit')}</button>`
      );
    },

    applications(ctx) {
      const mine = P.RECORDS.filter((r) => r.applicant === 'Huda');
      const cards = mine
        .map(
          (r) => `<article class="b-app${r.status === 'corrections' ? ' is-action' : ''}">
          <div class="b-app-top">${st(ctx, r.status)}<span class="b-ref num">${r.ref}</span></div>
          <h3 class="b-app-n">${ctx.L(r.business)}</h3>
          <p class="b-app-m">${ctx.L(P.PRODUCTS.find((p) => p.id === r.product).name)} · ${ctx.L(P.ACTIVITIES[r.activity])}</p>
          <div class="b-app-figs"><span class="b-fig"><span class="b-fig-k">${ctx.t('amount')}</span><span class="b-fig-v">${m(ctx, r.amount)}</span></span><span class="b-fig"><span class="b-fig-k">${ctx.t('term')}</span><span class="b-fig-v num">${r.term}</span></span><span class="b-fig"><span class="b-fig-k">${ctx.t('submittedOn')}</span><span class="b-fig-v num">${ctx.date(r.submitted)}</span></span></div>
          ${r.status === 'corrections' ? `<div class="b-todo"><span aria-hidden="true">↻</span>${ctx.t('outstanding')} · ${ctx.t('historyRequest')} <span class="num">${ctx.date(r.requested)}</span></div>` : ''}
          <div class="b-app-acts"><button class="b-btn ${r.status === 'corrections' ? 'b-btn-main' : ''}" type="button">${ctx.t('openApplication')}</button><button class="b-btn" type="button">${ctx.t('viewHistory')}</button><button class="b-btn" type="button">${ctx.t('printSummary')}</button></div>
        </article>`
        )
        .join('');
      const notes = P.NOTIFICATIONS.filter((x) => ['MSR-26-103', 'MSR-26-111'].includes(x.ref))
        .map(
          (x) => `<article class="b-note${x.unread ? ' is-unread' : ''}">
          <span class="b-note-k">${ctx.t(x.kind)}</span>
          <p class="b-note-b">${ctx.L(x.body)}</p>
          <div class="b-note-f"><span class="num">${ctx.date(x.at)}</span><span class="b-ref num">${x.ref}</span>${x.unread ? `<span class="b-unread">${ctx.t('unread')}</span>` : ''}</div>
          <div class="b-app-acts"><button class="b-btn b-btn-main" type="button">${ctx.t('openApplication')}</button>${x.unread ? `<button class="b-btn" type="button">${ctx.t('markRead')}</button>` : ''}</div>
        </article>`
        )
        .join('');
      return shell(
        ctx,
        { role: 'applicant', active: 'applications', identity: 'Huda', title: ctx.t('screenApplications') },
        `<section class="b-sec"><h2 class="b-sec-t">${ctx.t('navNotifications')}<span class="b-count num">2</span></h2><div class="b-list">${notes}</div></section>
        <section class="b-sec"><h2 class="b-sec-t">${ctx.t('navApplications')}<span class="b-count num">${mine.length}</span></h2><div class="b-list">${cards}</div></section>
        <section class="b-sec"><h2 class="b-sec-t">${ctx.t('viewHistory')} · <span class="num">MSR-26-103</span></h2>
          <ol class="b-tl">${P.HISTORY.map((h) => `<li><span class="b-tl-d num">${ctx.date(h.at)}</span><span class="b-tl-t">${ctx.t(h.key)}</span><span class="b-tl-x">${ctx.L(h.detail)}</span></li>`).join('')}</ol>
        </section>`
      );
    },

    correction(ctx) {
      const rec = P.RECORDS[2];
      const cards = P.CORRECTION_TARGETS.map(
        (t) => `<article class="b-tgt">
        <div class="b-tgt-h"><span class="b-tgt-k">${t.kind === 'field' ? ctx.t('stepFinancing') : ctx.t('navDocs')}</span><h3 class="b-tgt-n">${ctx.L(t.label)}</h3>${chip(ctx, DS, 'awaiting')}</div>
        <p class="b-why"><b>${ctx.t('reason')}:</b> ${ctx.t(t.reason)}</p>
        <div class="b-diff">
          <div class="b-diff-c"><span class="b-diff-k">${ctx.t('baseline')}</span><span class="b-diff-v num ${t.money ? '' : 'ltr'}">${t.money ? ctx.n(t.baseline) : t.baselineFile}</span></div>
          <span class="b-diff-a" aria-hidden="true">→</span>
          <div class="b-diff-c is-new"><span class="b-diff-k">${ctx.t('yourResponse')}</span><span class="b-diff-v num ${t.money ? '' : 'ltr'}">${t.money ? ctx.n(t.response) : t.responseFile}</span><span class="b-new">${ctx.t('changed')}</span></div>
        </div>
        <p class="b-hint">${ctx.t('pendingVerify')} · ${ctx.lang === 'ar' ? 'يُنشر عند إعادة التقديم' : 'publishes on resubmission'}</p>
      </article>`
      ).join('');
      const locked = [
        [ctx.t('product'), ctx.L(P.PRODUCTS[0].name)],
        [ctx.L(P.FIELDS[8].label), ctx.n(rec.revenue)],
        [ctx.L(P.FIELDS[9].label), ctx.n(rec.expenses)],
        [ctx.L(P.FIELDS[12].label), ctx.n(rec.budget)]
      ];
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'correction',
          identity: 'Huda',
          title: ctx.t('screenCorrection'),
          lede: `<span class="num">${rec.ref}</span> · ${ctx.t('historyRequest')} <span class="num">${ctx.date(rec.requested)}</span> · ${st(ctx, 'corrections')}`
        },
        `<div class="b-list">${cards}</div>
        <div class="b-alert"><span aria-hidden="true">◈</span><div>${ctx.t('lockedFields')}</div></div>
        <section class="b-card"><h2 class="b-card-t">${ctx.t('locked')}</h2>
          <ul class="b-lockl">${locked.map(([k, v]) => `<li><span class="b-k">${k}</span><span class="b-v num">${v}</span><span class="b-lock">${ctx.t('locked')}</span></li>`).join('')}</ul>
        </section>
        <p class="b-fine">${ctx.t('resubmitRules')}</p>`,
        `<button class="b-ghost" type="button">${ctx.t('saveProgress')}</button><button class="b-cta" type="button">${ctx.t('resubmit')}</button>`
      );
    },

    repayment(ctx) {
      const r = P.REPAYMENT;
      const pct = Math.round((r.completedCount / r.count) * 100);
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'repayment',
          identity: 'Mariam',
          title: ctx.t('screenRepayment'),
          lede: `<span class="num">MSR-26-101</span> · ${st(ctx, 'approved')} · ${ctx.t('approvedOn')} <span class="num">${ctx.date(r.approvedOn)}</span>`
        },
        `<section class="b-hero-card">
          <span class="b-hero-k">${ctx.t('repaymentTotal')}</span>
          <span class="b-hero-big">${m(ctx, r.total)}</span>
          <div class="b-bar"><span class="b-bar-in" style="--pct:${pct}"></span></div>
          <p class="b-bar-l"><span class="num">${r.completedCount}/${r.count}</span> ${ctx.t('completed')} · ${m(ctx, r.completedAmount)}</p>
        </section>
        <section class="b-card">
          <ul class="b-sums">
            <li><span class="b-k">${ctx.t('financingAmount')}</span><span class="b-v">${m(ctx, r.amount)}</span></li>
            <li><span class="b-k">${ctx.t('illustrativeMarkup')} <span class="num b-mut">8%</span></span><span class="b-v">${m(ctx, r.markup)}</span></li>
            <li><span class="b-k">${ctx.t('remainingAmount')}</span><span class="b-v">${m(ctx, r.remainingAmount)}</span></li>
          </ul>
        </section>
        <section class="b-sec"><h2 class="b-sec-t">${ctx.t('dueDate')}</h2>
          <ul class="b-insts">${r.entries
            .map(
              (e, i) => `<li class="b-inst ${e.state}${e.next ? ' is-next' : ''}">
              <span class="b-inst-n num">${i + 1}</span>
              <span class="b-inst-d num">${ctx.date(e.at)}</span>
              <span class="b-inst-a">${m(ctx, r.installment)}</span>
              <span class="b-inst-s">${e.state === 'completed' ? ctx.t('completed') : ctx.t('upcoming')}${e.next ? ` · ${ctx.lang === 'ar' ? 'التالي' : 'next'}` : ''}</span>
            </li>`
            )
            .join('')}</ul>
          <button class="b-btn" type="button">${ctx.t('showRemaining')} · <span class="num">12</span></button>
        </section>
        <p class="b-fine">${ctx.t('readOnlyNote')}</p>`
      );
    },

    queue(ctx) {
      const sorted = [...P.RECORDS].sort((a, b) => (a.submitted === b.submitted ? a.ref.localeCompare(b.ref) : b.submitted.localeCompare(a.submitted)));
      const filters = ['allStatuses', 'stSubmitted', 'stReview', 'stCorrections', 'stApproved', 'stRejected'];
      const cards = sorted
        .map(
          (r, i) => `<article class="b-row${!r.assignee && r.status === 'submitted' ? ' is-claim' : ''}" data-pagenum="${Math.floor(i / 5) + 1}"${i < 5 ? '' : ' hidden'}>
          <div class="b-row-top">${st(ctx, r.status)}<span class="b-ref num">${r.ref}</span><span class="b-when num">${ctx.date(r.submitted)}</span></div>
          <h3 class="b-row-n">${ctx.L(r.business)}</h3>
          <p class="b-row-m">${ctx.L(P.PEOPLE[r.applicant])} · ${ctx.L(P.ACTIVITIES[r.activity])} · ${ctx.L(P.PRODUCTS.find((p) => p.id === r.product).name)}</p>
          <div class="b-row-figs">
            <span class="b-fig"><span class="b-fig-k">${ctx.t('amount')}</span><span class="b-fig-v">${m(ctx, r.amount)}</span></span>
            <span class="b-fig"><span class="b-fig-k">${ctx.t('term')}</span><span class="b-fig-v num">${r.term}</span></span>
            <span class="b-fig"><span class="b-fig-k">${ctx.t('assignedTo')}</span><span class="b-fig-v">${r.assignee ? (r.assignee === 'R' ? ctx.t('assignedYou') : ctx.L(P.PEOPLE.K)) : ctx.t('unassigned')}</span></span>
          </div>
          <div class="b-app-acts">
            ${!r.assignee && r.status === 'submitted' ? `<button class="b-btn b-btn-main" type="button">${ctx.t('claim')}</button>` : ''}
            ${r.status === 'submitted' && r.assignee === 'R' ? `<button class="b-btn b-btn-main" type="button">${ctx.t('startReview')}</button>` : ''}
            <button class="b-btn" type="button">${ctx.t('openFile')}</button>
            <button class="b-btn" type="button">${ctx.t('transfer')}</button>
          </div>
        </article>`
        )
        .join('');
      return shell(
        ctx,
        {
          role: 'staff',
          active: 'queue',
          identity: 'R',
          title: ctx.t('screenQueue'),
          lede: `<span class="num">12</span> ${ctx.t('queueCount')} · ${ctx.t('savedPrefs')}`
        },
        `<div class="b-filters">
          <div class="b-search"><span aria-hidden="true">⌕</span><input class="b-inp" type="search" placeholder="${ctx.t('search')}" /></div>
          <div class="b-chips">${filters.map((f, i) => `<button class="b-fchip${i === 0 ? ' is-on' : ''}" type="button">${ctx.t(f)}</button>`).join('')}</div>
          <div class="b-sorts"><span class="b-mut">${ctx.t('sortBy')}</span><button class="b-fchip is-on" type="button">${ctx.t('sortSubmitted')} ▼</button><button class="b-fchip" type="button">${ctx.t('sortAmount')}</button><button class="b-fchip" type="button">${ctx.t('sortStatus')}</button></div>
        </div>
        <div class="b-rows">${cards}</div>
        <div class="b-pager"><span class="num">1–5 / 12</span><button class="b-pg" type="button" data-page="1" aria-pressed="true">1</button><button class="b-pg" type="button" data-page="2">2</button><button class="b-pg" type="button" data-page="3">3</button></div>`
      );
    },

    review(ctx) {
      const rec = P.RECORDS[2];
      const tabs = [
        ['info', ctx.t('applicantInfo')],
        ['docs', ctx.t('documents')],
        ['checks', ctx.t('reviewChecks')],
        ['targets', ctx.t('correctionTargets')],
        ['notes', ctx.t('internalNotes')],
        ['act', ctx.t('activity')]
      ];
      const info = [
        ['fullName', ctx.L(P.PEOPLE.Huda)],
        ['mobile', `<span class="num ltr">+000000000002</span>`],
        ['businessName', ctx.L(rec.business)],
        ['activity', ctx.L(P.ACTIVITIES[rec.activity])],
        ['since', `<span class="num">${rec.since}</span>`],
        ['revenue', m(ctx, rec.revenue)],
        ['expenses', m(ctx, rec.expenses)],
        ['amount', m(ctx, rec.amount)],
        ['term', `<span class="num">${rec.term}</span> ${ctx.t('months')}`],
        ['budget', m(ctx, rec.budget)]
      ];
      const labelFor = (k) => ctx.L(P.FIELDS.find((f) => f.key === k).label);
      const panels = {
        info: `<div class="b-figs b-figs-grid">${info.map(([k, v]) => `<span class="b-fig${k === 'amount' ? ' is-chg' : ''}"><span class="b-fig-k">${labelFor(k)}</span><span class="b-fig-v">${v}${k === 'amount' ? ` <s class="num b-mut">${ctx.n(rec.baselineAmount)}</s>` : ''}</span></span>`).join('')}</div>
          <p class="b-hint">${ctx.t('financialWindow')}</p>
          <div class="b-quote"><span class="b-quote-k">${ctx.L(P.FIELDS[13].label)}</span><p>${ctx.lang === 'ar' ? 'شراء مخزون من المستلزمات المنزلية لتجديد البضائع في المتجر.' : 'Purchase household-goods stock to replenish the shop.'}</p></div>
          <p class="b-hint">${ctx.t('snapshotNote')}</p>`,
        docs: `<div class="b-docs-list">${P.DOC_SET.map(
          (d) => `<article class="b-doc${d.status === 'replace' ? ' is-bad' : ''}">
            <div class="b-ring" style="--pct:${d.status === 'replace' ? 40 : 100}" aria-hidden="true"><span>${ICON[d.status]}</span></div>
            <div class="b-doc-main"><h3 class="b-doc-n">${ctx.t(d.slot)}</h3><p class="b-doc-f"><span class="ltr">${d.file}</span> <span class="num b-mut">${d.size}${d.pages ? ` · ${d.pages}p` : ''}</span></p><p class="b-doc-s">${doc(ctx, d.status)}</p>${d.reason ? `<p class="b-why"><b>${ctx.t('reason')}:</b> ${ctx.L(d.reason)}</p>` : ''}</div>
            <div class="b-doc-acts"><button class="b-btn" type="button">${ctx.t('preview')}</button><button class="b-btn b-btn-main" type="button">${ctx.t('accept')}</button><button class="b-btn b-btn-warn" type="button">${ctx.t('needReplace')}</button></div>
          </article>`
        ).join('')}</div>`,
        checks: `<p class="b-hint">${ctx.t('criteriaNote')}</p><div class="b-checks">${P.CHECKS.map(
          (c) => `<article class="b-check is-${c.state}">
            <div class="b-check-h"><h3>${ctx.L(c.label)}</h3>${chk(ctx, c.state)}</div>
            <p class="b-check-d"><b>${ctx.t('dependsOn')}:</b> ${ctx.L(c.deps)}</p>
            ${c.detail ? `<p class="b-check-x num-mix">${ctx.L(c.detail)}</p>` : ''}
            ${c.note ? `<p class="b-check-n">${ctx.L(c.note)}</p>` : ''}
            ${c.previous ? `<p class="b-check-p">${ctx.L(c.previous)}</p>` : ''}
            <div class="b-check-a"><button class="b-btn b-btn-ok" type="button">✓ ${ctx.t('cPassed')}</button><button class="b-btn b-btn-warn" type="button">× ${ctx.t('cFailed')}</button></div>
          </article>`
        ).join('')}</div>`,
        targets: `<div class="b-list">${P.CORRECTION_TARGETS.map(
          (t) => `<article class="b-tgt">
            <div class="b-tgt-h"><span class="b-tgt-k">${t.kind === 'field' ? ctx.t('stepFinancing') : ctx.t('navDocs')}</span><h3 class="b-tgt-n">${ctx.L(t.label)}</h3>${chip(ctx, DS, 'awaiting')}</div>
            <div class="b-diff"><div class="b-diff-c"><span class="b-diff-k">${ctx.t('baseline')}</span><span class="b-diff-v num ${t.money ? '' : 'ltr'}">${t.money ? ctx.n(t.baseline) : t.baselineFile}</span></div><span class="b-diff-a" aria-hidden="true">→</span><div class="b-diff-c is-new"><span class="b-diff-k">${ctx.t('yourResponse')}</span><span class="b-diff-v num ${t.money ? '' : 'ltr'}">${t.money ? ctx.n(t.response) : t.responseFile}</span></div></div>
            <div class="b-app-acts"><button class="b-btn b-btn-main" type="button">${ctx.t('verified')}</button><button class="b-btn" type="button">${ctx.t('preview')}</button></div>
          </article>`
        ).join('')}</div>`,
        notes: `<div class="b-note is-internal"><span class="b-note-k">${ctx.L(P.PEOPLE.R)} · <span class="num">2026-10-06</span></span><p class="b-note-b">${ctx.L(P.INTERNAL_ACTIVITY[4].detail)}</p></div>
          <div class="b-fld"><label class="b-lbl" for="b-note">${ctx.t('addNote')}</label><textarea class="b-inp" id="b-note" rows="3" placeholder="${ctx.t('notePlaceholder')}"></textarea><p class="b-hint">${ctx.t('internalOnly')}</p></div>
          <button class="b-btn b-btn-main" type="button">${ctx.t('addNote')}</button>`,
        act: `<ol class="b-tl b-tl-dense">${P.INTERNAL_ACTIVITY.map((a) => `<li class="${a.internal ? 'is-internal' : ''}"><span class="b-tl-d num">${ctx.date(a.at)}</span><span class="b-tl-t">${ctx.t(a.key)}</span><span class="b-tl-x">${ctx.L(a.detail)}${a.internal ? ` · ${ctx.t('internalOnly')}` : ''}</span></li>`).join('')}</ol>`
      };
      const tabBtns = tabs
        .map(([k, l], i) => `<button class="b-wtab${i === 0 ? ' is-on' : ''}" type="button" data-btab="${k}" aria-pressed="${i === 0}">${l}</button>`)
        .join('');
      const panelHtml = tabs
        .map(([k], i) => `<section class="b-wpanel" data-bpanel="${k}"${i === 0 ? '' : ' hidden'}>${panels[k]}</section>`)
        .join('');
      return shell(
        ctx,
        {
          role: 'staff',
          active: 'review',
          identity: 'R',
          title: `${ctx.L(rec.business)}`,
          lede: `<span class="num">${rec.ref}</span> · ${st(ctx, rec.status)} · ${ctx.t('assignedYou')} · ${ctx.t('historyResubmit')} <span class="num">${ctx.date(rec.resubmitted)}</span>`
        },
        `<div class="b-wtabs">${tabBtns}</div>${panelHtml}
        ${sheet(ctx, 'b-req', ctx.t('requestCorrections'), `<p class="b-hint">${ctx.t('dialogTargets')}</p>${P.CORRECTION_TARGETS.map((t) => `<div class="b-fld"><label class="b-lbl">${ctx.L(t.label)}</label><textarea class="b-inp" rows="2">${ctx.t(t.reason)}</textarea><p class="b-hint">${ctx.t('reasonRequired')}</p></div>`).join('')}<button class="b-btn" type="button">+ ${ctx.t('addTarget')}</button>`, `<button class="b-ghost" type="button" data-close=".b-sheet">${ctx.t('cancel')}</button><button class="b-cta" type="button">${ctx.t('requestCorrections')}</button>`)}
        ${sheet(ctx, 'b-appr', ctx.t('confirmApprove'), `<p class="b-alert b-alert-warn"><span aria-hidden="true">!</span><div>${ctx.t('approveBlocked')}</div></p><div class="b-fld"><label class="b-lbl" for="b-appr-r">${ctx.t('decisionReason')}</label><textarea class="b-inp" id="b-appr-r" rows="4">${ctx.t('approveReasonSample')}</textarea><p class="b-hint">${ctx.t('confirmRequired')}</p></div>`, `<button class="b-ghost" type="button" data-close=".b-sheet">${ctx.t('cancel')}</button><button class="b-cta" type="button">${ctx.t('approve')}</button>`)}
        ${sheet(ctx, 'b-rej', ctx.t('confirmReject'), `<p class="b-hint">${ctx.t('rejectNeedsCriterion')}</p><div class="b-fld"><label class="b-lbl" for="b-rej-r">${ctx.t('decisionReason')}</label><textarea class="b-inp" id="b-rej-r" rows="4">${ctx.t('rejectReasonSample')}</textarea></div>`, `<button class="b-ghost" type="button" data-close=".b-sheet">${ctx.t('cancel')}</button><button class="b-cta b-cta-warn" type="button">${ctx.t('reject')}</button>`)}`,
        `<button class="b-ghost" type="button" data-toggle="#b-req">${ctx.t('requestCorrections')}</button><button class="b-cta" type="button" data-toggle="#b-appr">${ctx.t('approve')}</button><button class="b-cta b-cta-warn" type="button" data-toggle="#b-rej">${ctx.t('reject')}</button>`
      );
    },

    decisions(ctx) {
      return shell(
        ctx,
        {
          role: 'staff',
          active: 'decisions',
          identity: 'R',
          title: ctx.t('screenDecisions'),
          lede: ctx.lang === 'ar' ? 'التعارض والقرار وأدوات المراجعة المقفلة.' : 'Conflict, decision, and locked review controls.'
        },
        `<div class="b-stale" role="alert"><span class="b-stale-ic" aria-hidden="true">!</span>
          <div><b>${ctx.t('staleConflict')}</b><p>${ctx.t('readOnlyLostAssignment')}</p></div>
          <div class="b-app-acts"><button class="b-btn b-btn-main" type="button">${ctx.t('loadLatest')}</button><button class="b-btn" type="button">${ctx.t('reclaim')}</button></div>
        </div>
        <div class="b-two">
          <section class="b-card"><h2 class="b-card-t">${ctx.t('confirmApprove')}</h2>
            <p class="b-alert b-alert-warn"><span aria-hidden="true">!</span><div>${ctx.t('approveBlocked')}</div></p>
            <ul class="b-prog"><li><span class="b-k">${ctx.t('documents')}</span><span class="b-v num">3/4</span></li><li><span class="b-k">${ctx.t('reviewChecks')}</span><span class="b-v num">1/5</span></li><li><span class="b-k">${ctx.t('verifyTarget')}</span><span class="b-v num">0/2</span></li></ul>
            <div class="b-fld"><label class="b-lbl" for="b-d-appr">${ctx.t('decisionReason')}</label><textarea class="b-inp" id="b-d-appr" rows="4">${ctx.t('approveReasonSample')}</textarea></div>
            <div class="b-app-acts"><button class="b-ghost" type="button">${ctx.t('cancel')}</button><button class="b-cta b-cta-off" type="button" disabled aria-disabled="true">${ctx.t('approve')}</button></div>
          </section>
          <section class="b-card"><h2 class="b-card-t">${ctx.t('confirmReject')}</h2>
            <p class="b-hint">${ctx.t('rejectNeedsCriterion')}</p>
            <div class="b-fld"><label class="b-lbl" for="b-d-rej">${ctx.t('decisionReason')}</label><textarea class="b-inp" id="b-d-rej" rows="4">${ctx.t('rejectReasonSample')}</textarea></div>
            <div class="b-app-acts"><button class="b-ghost" type="button">${ctx.t('cancel')}</button><button class="b-cta b-cta-warn" type="button">${ctx.t('reject')}</button></div>
          </section>
        </div>
        <section class="b-card"><h2 class="b-card-t">${ctx.t('expireSession')}</h2>
          <p class="b-hint">${ctx.lang === 'ar' ? 'تُغطى المحتوى المحمي ويتطلب دخولًا محاكيًا من جديد؛ العمل المحفوظ يبقى والمدخلات غير المكتملة تبقى في هذا التبويب.' : 'Protected content is covered and simulated sign-in is required again; saved work stays and unfinished input remains in this tab.'}</p>
          <div class="b-app-acts"><button class="b-btn" type="button">${ctx.t('expireSession')}</button><button class="b-btn b-btn-main" type="button" data-toggle="#b-id-dlg">${ctx.t('signInAs')}</button></div>
        </section>
        ${sheet(ctx, 'b-id-dlg', ctx.t('signInAs'), `<p class="b-hint">${ctx.t('demoBadge')}</p><div class="b-ids">${['Mariam', 'Huda', 'Omar'].map((k, i) => `<button class="b-id${i === 0 ? ' is-on' : ''}" type="button"><span class="b-avatar">${ctx.L(P.PEOPLE[k]).slice(0, 2)}</span><span>${ctx.L(P.PEOPLE[k])}</span><em>${ctx.t('roleApplicant')}</em></button>`).join('')}<button class="b-id" type="button"><span class="b-avatar">${ctx.L(P.PEOPLE.R).slice(0, 2)}</span><span>${ctx.L(P.PEOPLE.R)}</span><em>${ctx.t('roleReviewer')}</em></button></div>`, `<button class="b-cta" type="button" data-close=".b-sheet">${ctx.t('openApplication')}</button>`)}
        ${sheet(ctx, 'b-reset-dlg', ctx.t('navReset'), `<p class="b-hint">${ctx.lang === 'ar' ? 'يحذف كل ما حُفظ في هذا المتصفح ويعيد البيانات الأولية، بما فيها العمل غير المكتمل.' : 'Clears everything saved in this browser and restores the seed data, including unfinished work.'}</p>`, `<button class="b-ghost" type="button" data-close=".b-sheet">${ctx.t('cancel')}</button><button class="b-cta b-cta-warn" type="button">${ctx.t('navReset')}</button>`)}`
      );
    }
  };

  return {
    key: 'B',
    name: { ar: 'البطاقات — جوال لامع', en: 'Cards — bold mobile' },
    theme: 'light-stage',
    render(ctx) {
      return screens[ctx.screen] ? screens[ctx.screen](ctx) : screens.products(ctx);
    }
  };
})();
