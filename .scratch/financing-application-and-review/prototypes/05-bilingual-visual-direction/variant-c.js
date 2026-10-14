window.VARIANTS = window.VARIANTS || {};

window.VARIANTS.C = (function () {
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

  function m(ctx, x) {
    return `<span class="num">${ctx.n(x)}</span> <span class="c-cur">${ctx.money(x).currency}</span>`;
  }
  function tag(ctx, map, key) {
    const [cls, label] = map[key];
    return `<span class="tag ${cls}">${ctx.t(label)}</span>`;
  }
  const st = (ctx, k) => tag(ctx, ST, k);
  const doc = (ctx, k) => tag(ctx, DS, k);
  const chk = (ctx, k) => tag(ctx, CS, k);

  function appbar(ctx, identity, crumbs) {
    const who = identity ? `${ctx.L(P.PEOPLE[identity])}` : ctx.lang === 'ar' ? 'بلا دخول' : 'signed out';
    const role = identity === 'R' ? ctx.t('roleReviewer') : identity ? ctx.t('roleApplicant') : '';
    return `<div class="c-bar">
      <span class="c-token">MSR<span class="c-token-sep">·</span>DEMO</span>
      <span class="c-brand">${ctx.t('appTitle')}<span class="c-brand-sub">${ctx.lang === 'ar' ? 'تمويل' : 'finance'}</span></span>
      <nav class="c-crumbs" aria-label="path">${crumbs}</nav>
      <span class="c-spacer"></span>
      <label class="c-gsearch"><span aria-hidden="true">/</span><input type="search" placeholder="${ctx.t('search')}" dir="ltr" /></label>
      <button class="c-id" type="button" data-toggle="#c-id-dlg"><span class="c-id-n">${who}</span><span class="c-id-r">${role}</span></button>
      <button class="c-lang" type="button">${ctx.t('switchLang')}</button>
    </div>
    <div class="c-strip">
      <span class="c-strip-t">DEMO</span>
      <span class="c-strip-x">${ctx.t('appTag')}</span>
      <button class="c-strip-b" type="button" data-toggle="#c-reset-dlg">${ctx.t('navReset')}</button>
      <button class="c-strip-b" type="button" data-toggle="#c-exp-dlg">${ctx.t('expireSession')}</button>
      <span class="c-strip-k">${ctx.t('keyboardHint')}</span>
    </div>`;
  }

  function crumb(ctx, screen, labelKey, role) {
    const items =
      role === 'staff'
        ? [
            ['queue', 'navQueue'],
            ['review', 'navReview'],
            ['decisions', 'navDecisions']
          ]
        : [
            ['products', 'navProducts'],
            ['form', 'navApply'],
            ['documents', 'navDocs'],
            ['applications', 'navApplications'],
            ['correction', 'navApply'],
            ['repayment', 'navRepayment']
          ];
    return items
      .map(([k, l]) => `<a class="c-crumb${k === screen ? ' is-here' : ''}" href="?variant=C&screen=${k}&lang=${ctx.lang}">${ctx.t(l)}</a>`)
      .join('<span class="c-sep" aria-hidden="true">/</span>');
  }

  function shell(ctx, opts, body) {
    return `<div class="vc">
      ${appbar(ctx, opts.identity, crumb(ctx, opts.active, null, opts.role))}
      <div class="c-body">
        ${opts.rail ? `<aside class="c-rail">${opts.rail}</aside>` : ''}
        <main class="c-main" id="main">
          <div class="c-head">
            <h1 class="c-title">${opts.title}</h1>
            ${opts.meta ? `<div class="c-meta">${opts.meta}</div>` : ''}
            ${opts.acts ? `<div class="c-acts">${opts.acts}</div>` : ''}
          </div>
          ${opts.notice ? `<div class="c-notice">${opts.notice}</div>` : ''}
          ${body}
        </main>
        ${opts.side ? `<aside class="c-side">${opts.side}</aside>` : ''}
      </div>
      ${opts.sticky ? `<div class="c-sticky">${opts.sticky}</div>` : ''}
    </div>`;
  }

  function panel(ctx, id, title, body, actions) {
    return `<div class="c-modal" id="${id}" hidden role="dialog" aria-modal="true" aria-label="${title}">
      <div class="c-modal-in">
        <div class="c-modal-h"><h2>${title}</h2><span class="c-esc">ESC</span><button class="c-x" type="button" data-close=".c-modal" aria-label="${ctx.t('close')}">×</button></div>
        <div class="c-modal-b">${body}</div>
        <div class="c-modal-a">${actions}</div>
      </div>
    </div>`;
  }

  function field(ctx, f) {
    const id = `c-${f.key}`;
    const value = typeof f.value === 'object' ? ctx.L(f.value) : f.value;
    const display = f.money ? ctx.n(value) : value;
    const control = f.textarea
      ? `<textarea id="${id}" class="c-inp${f.error ? ' is-bad' : ''}" rows="2" placeholder="${ctx.L(f.placeholder)}" aria-invalid="${!!f.error}">${display}</textarea>`
      : f.choices
        ? `<select id="${id}" class="c-inp${f.error ? ' is-bad' : ''}">${f.choices.map((c, i) => `<option${i === 0 ? ' selected' : ''}>${ctx.L(c)}</option>`).join('')}</select>`
        : `<input id="${id}" class="c-inp${f.error ? ' is-bad' : ''}${f.ltr || f.money ? ' num ltr' : ''}" value="${display}" ${f.ltr || f.money ? 'dir="ltr"' : ''} aria-invalid="${!!f.error}" />`;
    return `<div class="c-fld${f.error ? ' is-bad' : ''}">
      <label class="c-lbl" for="${id}">${ctx.L(f.label)}${f.optional ? `<span class="c-opt">${ctx.t('optional')}</span>` : ''}</label>
      <div class="c-ctl">${control}${f.error ? `<span class="c-badmark" aria-hidden="true">!</span>` : ''}</div>
      ${f.error ? `<p class="c-err" id="${id}-e" role="alert">${ctx.t(f.error)}</p>` : ''}
      ${f.hint ? `<p class="c-hint">${ctx.L(f.hint)}</p>` : ''}
      ${f.hintKey ? `<p class="c-hint">${ctx.t(f.hintKey)}</p>` : ''}
    </div>`;
  }

  const screens = {
    products(ctx) {
      const props = [
        [ctx.t('purpose'), P.PRODUCTS.map((p) => ctx.L(p.purpose))],
        [
          ctx.t('amountRange'),
          P.PRODUCTS.map((p) => `<span class="num">${ctx.n(p.min)}–${ctx.n(p.max)}</span> <span class="c-cur">${ctx.money(0).currency}</span>`)
        ],
        [ctx.t('terms'), P.PRODUCTS.map((p) => p.terms.map((t) => `<span class="tag t-num num">${t}</span>`).join(' ') + ` <span class="c-mut">${ctx.t('months')}</span>`)],
        [ctx.t('markup'), P.PRODUCTS.map((p) => `<span class="num">${p.markup}%</span>`)],
        [ctx.t('requiredDocs'), P.PRODUCTS.map((p) => `<ul class="c-ul">${[...P.SHARED_DOCS, p.fourth].map((d) => `<li>${ctx.t(d)}</li>`).join('')}</ul>`)],
        [ctx.t('wholeRial'), P.PRODUCTS.map(() => `<span class="c-mut">—</span>`)]
      ];
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'products',
          title: ctx.t('screenProducts'),
          meta: `<span class="c-mut">${ctx.t('compare')}</span>`,
          acts: `<button class="c-btn c-btn-p" type="button">${ctx.t('choose')} · ${ctx.L(P.PRODUCTS[0].name)}</button>`
        },
        `<div class="c-matrix">
          <table class="c-grid">
            <thead><tr><th class="c-rowh"></th>${P.PRODUCTS.map((p, i) => `<th class="${i === 0 ? 'is-on' : ''}"><span class="c-pn">${ctx.L(p.name)}</span><span class="c-pid ltr">${p.id.toUpperCase()}</span></th>`).join('')}</tr></thead>
            <tbody>${props
              .map(
                ([k, vals]) =>
                  `<tr><th class="c-rowh" scope="row">${k}</th>${vals.map((v, i) => `<td class="${i === 0 ? 'is-on' : ''}">${v}</td>`).join('')}</tr>`
              )
              .join('')}</tbody>
          </table>
        </div>
        <p class="c-fine">${ctx.t('fixedAfterSubmit')}</p>`
      );
    },

    form(ctx) {
      const steps = ['stepPersonal', 'stepBusiness', 'stepFinancing', 'stepDocs', 'stepReview'];
      const path = steps
        .map((s, i) => `<li class="c-step${i === 2 ? ' is-now' : ''}${i < 2 ? ' is-done' : ''}"><span class="num">${i + 1}</span>${ctx.t(s)}</li>`)
        .join('<span class="c-sep" aria-hidden="true">/</span>');
      const groups = ['stepPersonal', 'stepBusiness', 'stepFinancing'];
      const body = groups
        .map((g) => {
          const fields = P.FIELDS.filter((f) => f.group === g);
          return `<section class="c-sec"><h2 class="c-sec-t">${ctx.t(g)}<span class="c-sec-n num">${fields.length}</span></h2><div class="c-fgrid">${fields.map((f) => field(ctx, f)).join('')}</div>${g === 'stepBusiness' ? `<p class="c-hint">${ctx.t('financialWindow')}</p>` : ''}</section>`;
        })
        .join('');
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'form',
          identity: 'Mariam',
          title: ctx.t('screenForm'),
          meta: `<span class="tag t-ref ltr">MSR-26-100</span>${st(ctx, 'draft')}<span class="c-mut">${ctx.L(P.PRODUCTS[1].name)}</span>`,
          notice: `<span class="c-notice-k">↻</span><span>${ctx.t('switchedProduct')}</span>`,
          acts: `<button class="c-btn" type="button" data-focus="#c-amount">${ctx.t('focusFirstField')} <kbd>F</kbd></button><button class="c-btn" type="button">${ctx.t('saveDraft')} <kbd>S</kbd></button>`,
          sticky: `<span class="c-errcount" role="status"><b class="num">3</b> ${ctx.t('errSummary')}</span><span class="c-spacer"></span><span class="c-savefb">${ctx.t('savedAt')} <span class="num">2026-10-14 09:12</span></span><button class="c-btn c-btn-p" type="button" disabled aria-disabled="true">${ctx.t('submit')} <kbd>↵</kbd></button>`
        },
        `<ol class="c-steps">${path}</ol>${body}`
      );
    },

    documents(ctx) {
      const rec = P.RECORDS[2];
      const rows = P.DOC_SET.map(
        (d) => `<tr class="${d.status === 'replace' ? 'is-bad' : ''}">
        <td class="c-slot">${ctx.t(d.slot)}${d.status === 'replace' ? `<span class="tag t-flag">${ctx.t('outstanding')}</span>` : ''}</td>
        <td class="c-file"><span class="ltr">${d.file}</span><span class="c-fmeta num">${d.size}${d.pages ? ` · ${d.pages}p` : ''}</span></td>
        <td>${d.status === 'replace' ? `<span class="tag d-replace">${ctx.t('dReplace')}</span>` : `<span class="tag d-supplied">${ctx.lang === 'ar' ? 'مُرفق' : 'Supplied'}</span>`}</td>
        <td class="c-ops"><button class="c-btn c-btn-s" type="button">${ctx.t('preview')} <kbd>P</kbd></button><button class="c-btn c-btn-s" type="button">${ctx.t('replace')} <kbd>R</kbd></button></td>
      </tr>
      ${
        d.status === 'replace'
          ? `<tr class="c-sub"><td colspan="4">
            <p class="c-why"><b>${ctx.t('reason')}:</b> ${ctx.L(d.reason)}</p>
            <div class="c-uplrow"><span class="tag t-bad">${ctx.t('uploadFailed')}</span><span class="ltr">${d.replacement}</span><span class="c-mut">${ctx.t('uploadFailedWhy')}</span><button class="c-btn c-btn-s" type="button">${ctx.t('retry')} <kbd>↵</kbd></button></div>
            <div class="c-uplrow"><span class="tag t-mut">${ctx.t('savedNotPublished')}</span><span class="c-mut">${ctx.t('maxFile')}</span><span class="c-prog" aria-hidden="true"><span style="--pct:62"></span></span><span class="num c-mut">62%</span></div>
          </td></tr>`
          : ''
      }`
      ).join('');
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'documents',
          identity: 'Huda',
          title: ctx.t('screenDocs'),
          meta: `<span class="tag t-ref ltr">${rec.ref}</span><span class="c-mut">${ctx.L(rec.business)}</span>${st(ctx, 'corrections')}`,
          sticky: `<span class="c-mut">${ctx.t('resubmitRules')}</span><span class="c-spacer"></span><button class="c-btn" type="button">${ctx.t('saveProgress')}</button><button class="c-btn c-btn-p" type="button">${ctx.t('resubmit')} <kbd>↵</kbd></button>`
        },
        `<table class="c-grid c-grid-docs"><thead><tr><th>${ctx.t('requiredDocs')}</th><th>${ctx.t('preview')}</th><th>${ctx.t('status')}</th><th class="c-opsh">${ctx.lang === 'ar' ? 'إجراءات' : 'Actions'}</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="c-fine">${ctx.lang === 'ar' ? 'حالة تقييم المستندات داخلية؛ يصل السبب إلى المتقدم عبر طلب التصحيح.' : 'Assessment stays internal; the reason reaches the applicant through the correction request.'}</p>`
      );
    },

    applications(ctx) {
      const mine = P.RECORDS.filter((r) => r.applicant === 'Huda');
      const rows = mine
        .map(
          (r) => `<tr class="c-row-${r.status}">
          <td class="c-ref ltr num">${r.ref}</td>
          <td>${ctx.L(r.business)}<span class="c-fmeta">${ctx.L(P.ACTIVITIES[r.activity])}</span></td>
          <td class="c-num">${m(ctx, r.amount)}</td>
          <td class="c-num"><span class="num">${r.term}</span></td>
          <td>${st(ctx, r.status)}</td>
          <td class="c-num num">${ctx.date(r.submitted)}</td>
          <td class="c-ops"><button class="c-btn c-btn-s" type="button">${ctx.t('openApplication')} <kbd>↵</kbd></button><button class="c-btn c-btn-s" type="button">${ctx.t('printSummary')}</button></td>
        </tr>`
        )
        .join('');
      const notes = P.NOTIFICATIONS.filter((x) => ['MSR-26-103', 'MSR-26-111'].includes(x.ref))
        .map(
          (x) => `<li class="c-note${x.unread ? ' is-new' : ''}">
          <span class="c-note-w num">${ctx.date(x.at)}</span>
          <span class="c-note-r ltr num">${x.ref}</span>
          <span class="c-note-k">${ctx.t(x.kind)}</span>
          <span class="c-note-b">${ctx.L(x.body)}</span>
          ${x.unread ? `<span class="tag t-new">NEW</span>` : ''}
          <span class="c-ops"><button class="c-btn c-btn-s" type="button">${ctx.t('openApplication')}</button>${x.unread ? `<button class="c-btn c-btn-s" type="button">${ctx.t('markRead')}</button>` : ''}</span>
        </li>`
        )
        .join('');
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'applications',
          identity: 'Huda',
          title: ctx.t('screenApplications'),
          meta: `<span class="c-mut num">${mine.length}</span><span class="c-mut">${ctx.lang === 'ar' ? 'طلبًا' : 'applications'}</span>`
        },
        `<section class="c-sec"><h2 class="c-sec-t">${ctx.t('navNotifications')}<span class="c-sec-n num">1</span></h2><ul class="c-notes">${notes}</ul></section>
        <section class="c-sec"><h2 class="c-sec-t">${ctx.t('navApplications')}</h2>
          <table class="c-grid"><thead><tr><th>${ctx.t('reference')}</th><th>${ctx.t('business')}</th><th class="c-num">${ctx.t('amount')}</th><th class="c-num">${ctx.t('term')}</th><th>${ctx.t('status')}</th><th class="c-num">${ctx.t('submittedOn')}</th><th class="c-opsh"></th></tr></thead><tbody>${rows}</tbody></table>
        </section>
        <section class="c-sec"><h2 class="c-sec-t">${ctx.t('viewHistory')}<span class="c-sec-n ltr num">MSR-26-103</span></h2>
          <ul class="c-log">${P.HISTORY.map((h) => `<li><span class="c-log-w num">${ctx.date(h.at)}</span><span class="c-log-k">${ctx.t(h.key)}</span><span class="c-log-x">${ctx.L(h.detail)}</span><span class="c-log-v">${ctx.lang === 'ar' ? 'ظاهر للمتقدم' : 'applicant-visible'}</span></li>`).join('')}</ul>
        </section>`
      );
    },

    correction(ctx) {
      const rec = P.RECORDS[2];
      const rows = P.CORRECTION_TARGETS.map(
        (t) => `<tr>
        <td class="c-slot">${ctx.L(t.label)}<span class="tag t-kind">${t.kind === 'field' ? ctx.t('stepFinancing') : ctx.t('navDocs')}</span></td>
        <td class="c-why">${ctx.t(t.reason)}</td>
        <td class="c-num num ${t.money ? '' : 'ltr'}">${t.money ? ctx.n(t.baseline) : t.baselineFile}</td>
        <td class="c-num num is-chg ${t.money ? '' : 'ltr'}">${t.money ? ctx.n(t.response) : t.responseFile}<span class="tag t-chg">${ctx.t('changed')}</span></td>
        <td>${tag(ctx, DS, 'awaiting')}<span class="c-mut">${ctx.t('pendingVerify')}</span></td>
      </tr>`
      ).join('');
      const locked = [
        [ctx.t('product'), ctx.L(P.PRODUCTS[0].name)],
        [ctx.L(P.FIELDS[8].label), ctx.n(rec.revenue)],
        [ctx.L(P.FIELDS[9].label), ctx.n(rec.expenses)],
        [ctx.L(P.FIELDS[12].label), ctx.n(rec.budget)],
        [ctx.L(P.FIELDS[6].label), ctx.L(rec.business)]
      ];
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'correction',
          identity: 'Huda',
          title: ctx.t('screenCorrection'),
          meta: `<span class="tag t-ref ltr">${rec.ref}</span>${st(ctx, 'corrections')}<span class="c-mut">${ctx.t('historyRequest')} <span class="num">${ctx.date(rec.requested)}</span></span>`,
          notice: `<span class="c-notice-k">◈</span><span>${ctx.t('lockedFields')}</span>`,
          sticky: `<span class="c-mut">${ctx.t('resubmitRules')}</span><span class="c-spacer"></span><button class="c-btn" type="button">${ctx.t('saveProgress')} <kbd>S</kbd></button><button class="c-btn c-btn-p" type="button">${ctx.t('resubmit')} <kbd>↵</kbd></button>`
        },
        `<section class="c-sec"><h2 class="c-sec-t">${ctx.t('correctionTargets')}<span class="c-sec-n num">2</span></h2>
          <table class="c-grid c-grid-diff"><thead><tr><th>${ctx.t('correctionTargets')}</th><th>${ctx.t('reason')}</th><th class="c-num">${ctx.t('baseline')}</th><th class="c-num">${ctx.t('yourResponse')}</th><th>${ctx.t('verifyTarget')}</th></tr></thead><tbody>${rows}</tbody></table>
        </section>
        <section class="c-sec"><h2 class="c-sec-t">${ctx.t('locked')}<span class="c-sec-n num">${locked.length}</span></h2>
          <dl class="c-lock">${locked.map(([k, v]) => `<div><dt>${k}</dt><dd class="num">${v}</dd><span class="c-lockx" aria-hidden="true">▮</span></div>`).join('')}</dl>
        </section>`
      );
    },

    repayment(ctx) {
      const r = P.REPAYMENT;
      const rows = r.entries
        .map(
          (e, i) => `<tr class="${e.state}${e.next ? ' is-next' : ''}">
          <td class="num">${String(i + 1).padStart(2, '0')}</td>
          <td class="num">${ctx.date(e.at)}</td>
          <td class="c-num">${m(ctx, r.installment)}</td>
          <td><span class="tag ${e.state === 'completed' ? 'd-accepted' : 'd-awaiting'}">${e.state === 'completed' ? ctx.t('completed') : ctx.t('upcoming')}</span></td>
        </tr>`
        )
        .join('');
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'repayment',
          identity: 'Mariam',
          title: ctx.t('screenRepayment'),
          meta: `<span class="tag t-ref ltr">MSR-26-101</span>${st(ctx, 'approved')}<span class="c-mut">${ctx.t('approvedOn')} <span class="num">${ctx.date(r.approvedOn)}</span></span>`,
          notice: `<span class="c-notice-k">◈</span><span>${ctx.t('readOnlyNote')}</span>`
        },
        `<div class="c-sums">
          ${[
            [ctx.t('financingAmount'), m(ctx, r.amount)],
            [`${ctx.t('illustrativeMarkup')} <span class="num c-mut">8%</span>`, m(ctx, r.markup)],
            [ctx.t('repaymentTotal'), m(ctx, r.total)],
            [`${ctx.t('completedAmount')} <span class="num c-mut">${r.completedCount}/${r.count}</span>`, m(ctx, r.completedAmount)],
            [ctx.t('remainingAmount'), m(ctx, r.remainingAmount)]
          ]
            .map(([k, v], i) => `<div class="c-sum${i === 2 ? ' is-total' : ''}"><span class="c-sum-k">${k}</span><span class="c-sum-v">${v}</span></div>`)
            .join('')}
        </div>
        <table class="c-grid"><thead><tr><th>#</th><th>${ctx.t('dueDate')}</th><th class="c-num">${ctx.t('installment')}</th><th>${ctx.t('status')}</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="c-more"><button class="c-btn c-btn-s" type="button">${ctx.t('showRemaining')} <span class="num">12</span></button><span class="c-mut">${ctx.lang === 'ar' ? 'آخر قسط' : 'final'} <span class="num">${ctx.date(r.lastEntry)}</span></span></div>`
      );
    },

    queue(ctx) {
      const sorted = [...P.RECORDS].sort((a, b) => (a.submitted === b.submitted ? a.ref.localeCompare(b.ref) : b.submitted.localeCompare(a.submitted)));
      const rail = `<div class="c-rail-t">${ctx.t('filterStatus')}</div>
        ${['allStatuses', 'stSubmitted', 'stReview', 'stCorrections', 'stApproved', 'stRejected']
          .map((f, i) => `<button class="c-railf${i === 0 ? ' is-on' : ''}" type="button">${ctx.t(f)}<span class="num">${[12, 4, 3, 3, 1, 1][i]}</span></button>`)
          .join('')}
        <div class="c-rail-t">${ctx.t('assignedTo')}</div>
        ${[
          [ctx.t('assignedYou'), 7],
          [ctx.L(P.PEOPLE.K), 3],
          [ctx.t('unassigned'), 2]
        ]
          .map(([k, n], i) => `<button class="c-railf${i === 0 ? ' is-on' : ''}" type="button">${k}<span class="num">${n}</span></button>`)
          .join('')}
        <div class="c-rail-t">${ctx.t('sortBy')}</div>
        <button class="c-railf is-on" type="button">${ctx.t('sortSubmitted')} ▼</button>
        <button class="c-railf" type="button">${ctx.t('sortAmount')}</button>
        <button class="c-railf" type="button">${ctx.t('sortStatus')}</button>
        <p class="c-rail-x">${ctx.t('savedPrefs')}</p>`;
      const rows = sorted
        .map(
          (r, i) => `<tr class="c-row-${r.status}${i === 0 ? ' is-sel' : ''}" data-pagenum="${Math.floor(i / 5) + 1}"${i < 5 ? '' : ' hidden'} tabindex="0">
          <td class="c-ref ltr num">${r.ref}</td>
          <td>${ctx.L(r.business)}<span class="c-fmeta">${ctx.L(P.PEOPLE[r.applicant])} · ${ctx.L(P.ACTIVITIES[r.activity])}</span></td>
          <td><span class="tag t-prod">${ctx.L(P.PRODUCTS.find((p) => p.id === r.product).name)}</span></td>
          <td class="c-num">${m(ctx, r.amount)}</td>
          <td class="c-num num">${r.term}</td>
          <td>${st(ctx, r.status)}</td>
          <td>${r.assignee ? (r.assignee === 'R' ? `<span class="c-asg is-you">${ctx.t('assignedYou')}</span>` : `<span class="c-asg">${ctx.L(P.PEOPLE.K)}</span>`) : `<span class="c-asg is-none">${ctx.t('unassigned')}</span>`}</td>
          <td class="c-num num">${ctx.date(r.submitted)}</td>
          <td class="c-ops">${!r.assignee && r.status === 'submitted' ? `<button class="c-btn c-btn-s c-btn-p" type="button">${ctx.t('claim')}</button>` : ''}${r.status === 'submitted' && r.assignee === 'R' ? `<button class="c-btn c-btn-s" type="button">${ctx.t('startReview')}</button>` : ''}<button class="c-btn c-btn-s" type="button">${ctx.t('openFile')} <kbd>↵</kbd></button></td>
        </tr>`
        )
        .join('');
      const detail = P.RECORDS.find((r) => r.ref === 'MSR-26-110');
      const side = `<div class="c-side-h"><span class="ltr num">${detail.ref}</span>${st(ctx, detail.status)}</div>
        <dl class="c-kv">
          <div><dt>${ctx.t('business')}</dt><dd>${ctx.L(detail.business)}</dd></div>
          <div><dt>${ctx.t('applicant')}</dt><dd>${ctx.L(P.PEOPLE[detail.applicant])}</dd></div>
          <div><dt>${ctx.t('product')}</dt><dd>${ctx.L(P.PRODUCTS.find((p) => p.id === detail.product).name)}</dd></div>
          <div><dt>${ctx.t('amount')}</dt><dd class="num">${m(ctx, detail.amount)}</dd></div>
          <div><dt>${ctx.t('term')}</dt><dd class="num">${detail.term} ${ctx.t('months')}</dd></div>
          <div><dt>${ctx.t('assignedTo')}</dt><dd>${ctx.L(P.PEOPLE[detail.assignee])}</dd></div>
          <div><dt>${ctx.t('submittedOn')}</dt><dd class="num">${ctx.date(detail.submitted)}</dd></div>
        </dl>
        <div class="c-side-t">${ctx.t('documents')}</div>
        <ul class="c-mini">${P.DOC_SET.map((d) => `<li>${ctx.t(d.slot)}${doc(ctx, d.status === 'replace' ? 'awaiting' : d.status)}</li>`).join('')}</ul>
        <div class="c-side-a"><button class="c-btn c-btn-s" type="button">${ctx.t('openFile')}</button><button class="c-btn c-btn-s" type="button">${ctx.t('transfer')}</button></div>`;
      return shell(
        ctx,
        {
          role: 'staff',
          active: 'queue',
          identity: 'R',
          title: ctx.t('screenQueue'),
          rail,
          side,
          meta: `<span class="c-mut num">12</span><span class="c-mut">${ctx.t('queueCount')}</span><span class="c-mut">${ctx.t('perPage')}</span>`,
          acts: `<label class="c-gsearch c-gsearch-in"><span aria-hidden="true">/</span><input type="search" placeholder="${ctx.t('search')}" dir="ltr" /></label>`
        },
        `<div class="c-scroll"><table class="c-grid c-grid-q">
          <thead><tr>
            <th class="is-sortable"><span class="c-sort">▲</span>${ctx.t('reference')}</th>
            <th>${ctx.t('business')}</th><th>${ctx.t('product')}</th>
            <th class="c-num is-sortable"><span class="c-sort">◇</span>${ctx.t('amount')}</th>
            <th class="c-num">${ctx.t('term')}</th>
            <th class="is-sortable"><span class="c-sort">◇</span>${ctx.t('status')}</th>
            <th>${ctx.t('assignedTo')}</th>
            <th class="c-num is-sortable"><span class="c-sort">▼</span>${ctx.t('submittedOn')}</th>
            <th class="c-opsh"></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
        <div class="c-pager"><span class="num c-mut">1–5 / 12</span><button class="c-pg" type="button" data-page="1" aria-pressed="true">1</button><button class="c-pg" type="button" data-page="2">2</button><button class="c-pg" type="button" data-page="3">3</button><span class="c-mut c-kbd">j / k ${ctx.lang === 'ar' ? 'للتنقل' : 'to move'}</span></div>`
      );
    },

    review(ctx) {
      const rec = P.RECORDS[2];
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
      const rail = `<div class="c-rail-t">${rec.ref}</div>
        <button class="c-railf is-on" type="button">${ctx.t('applicantInfo')}</button>
        <button class="c-railf" type="button">${ctx.t('documents')}<span class="num">4</span></button>
        <button class="c-railf" type="button">${ctx.t('reviewChecks')}<span class="num">5</span></button>
        <button class="c-railf" type="button">${ctx.t('correctionTargets')}<span class="num">2</span></button>
        <button class="c-railf" type="button">${ctx.t('internalNotes')}</button>
        <button class="c-railf" type="button">${ctx.t('activity')}</button>
        <div class="c-rail-t">${ctx.t('status')}</div>
        <div class="c-rail-st">${st(ctx, rec.status)}</div>
        <p class="c-rail-x">${ctx.t('snapshotNote')}</p>`;
      const side = `<div class="c-side-h">${ctx.t('reviewChecks')}<span class="num c-mut">1/5</span></div>
        <ul class="c-checks">${P.CHECKS.map(
          (c) => `<li class="c-check is-${c.state}">
            <div class="c-check-h"><span class="c-check-n">${ctx.L(c.label)}</span>${chk(ctx, c.state)}</div>
            <p class="c-check-d">${ctx.t('dependsOn')}: ${ctx.L(c.deps)}</p>
            ${c.detail ? `<p class="c-check-x num-mix">${ctx.L(c.detail)}</p>` : ''}
            ${c.previous ? `<p class="c-check-p">${ctx.L(c.previous)}</p>` : ''}
            ${c.note ? `<p class="c-check-n2">${ctx.L(c.note)}</p>` : ''}
            <div class="c-check-a"><button class="c-btn c-btn-s" type="button">✓ ${ctx.t('cPassed')}</button><button class="c-btn c-btn-s c-btn-w" type="button">× ${ctx.t('cFailed')}</button></div>
          </li>`
        ).join('')}</ul>
        <p class="c-rail-x">${ctx.t('criteriaNote')}</p>`;
      const docs = P.DOC_SET.map(
        (d) => `<tr class="${d.status === 'replace' ? 'is-bad' : ''}">
        <td class="c-slot">${ctx.t(d.slot)}</td>
        <td class="c-file"><span class="ltr">${d.file}</span><span class="c-fmeta num">${d.size}${d.pages ? ` · ${d.pages}p` : ''}</span></td>
        <td>${doc(ctx, d.status)}</td>
        <td class="c-why">${d.reason ? ctx.L(d.reason) : `<span class="c-mut">—</span>`}</td>
        <td class="c-ops"><button class="c-btn c-btn-s" type="button">${ctx.t('preview')} <kbd>P</kbd></button><button class="c-btn c-btn-s" type="button">${ctx.t('accept')} <kbd>A</kbd></button><button class="c-btn c-btn-s c-btn-w" type="button">${ctx.t('needReplace')}</button></td>
      </tr>`
      ).join('');
      const targets = P.CORRECTION_TARGETS.map(
        (t) => `<tr><td class="c-slot">${ctx.L(t.label)}</td><td class="c-num num">${t.money ? ctx.n(t.baseline) : t.baselineFile}</td><td class="c-num num is-chg">${t.money ? ctx.n(t.response) : t.responseFile}</td><td>${tag(ctx, DS, 'awaiting')}</td><td class="c-ops"><button class="c-btn c-btn-s" type="button">${ctx.t('verified')} <kbd>V</kbd></button></td></tr>`
      ).join('');
      return shell(
        ctx,
        {
          role: 'staff',
          active: 'review',
          identity: 'R',
          title: `${ctx.L(rec.business)}`,
          rail,
          side,
          meta: `<span class="tag t-ref ltr">${rec.ref}</span>${st(ctx, rec.status)}<span class="c-mut">${ctx.t('assignedYou')}</span><span class="c-mut">${ctx.t('historyResubmit')} <span class="num">${ctx.date(rec.resubmitted)}</span></span>`,
          acts: `<button class="c-btn c-btn-s" type="button">${ctx.t('startReview')}</button><button class="c-btn c-btn-s" type="button" data-toggle="#c-req">${ctx.t('requestCorrections')} <kbd>C</kbd></button><button class="c-btn c-btn-s c-btn-p" type="button" data-toggle="#c-appr">${ctx.t('approve')}</button><button class="c-btn c-btn-s c-btn-w" type="button" data-toggle="#c-rej">${ctx.t('reject')}</button><button class="c-btn c-btn-s" type="button">${ctx.t('transfer')}</button>`,
          notice: `<span class="c-notice-k">◈</span><span>${ctx.t('snapshotNote')}</span>`
        },
        `<section class="c-sec"><h2 class="c-sec-t">${ctx.t('applicantInfo')}</h2>
          <dl class="c-kv c-kv-grid">${info.map(([k, v]) => `<div class="${k === 'amount' ? 'is-chg' : ''}"><dt>${labelFor(k)}</dt><dd>${v}${k === 'amount' ? ` <s class="num c-mut">${ctx.n(rec.baselineAmount)}</s> <span class="tag t-chg">${ctx.t('changedSinceBaseline')}</span>` : ''}</dd></div>`).join('')}</dl>
          <p class="c-hint">${ctx.t('financialWindow')}</p>
          <div class="c-quote"><span class="c-quote-k">${ctx.L(P.FIELDS[13].label)}</span><p>${ctx.lang === 'ar' ? 'شراء مخزون من المستلزمات المنزلية لتجديد البضائع في المتجر.' : 'Purchase household-goods stock to replenish the shop.'}</p></div>
        </section>
        <section class="c-sec"><h2 class="c-sec-t">${ctx.t('documents')}<span class="c-sec-n num">3/4</span></h2>
          <table class="c-grid c-grid-docs"><thead><tr><th>${ctx.t('requiredDocs')}</th><th>${ctx.t('preview')}</th><th>${ctx.t('status')}</th><th>${ctx.t('reason')}</th><th class="c-opsh"></th></tr></thead><tbody>${docs}</tbody></table>
        </section>
        <section class="c-sec"><h2 class="c-sec-t">${ctx.t('correctionTargets')}<span class="c-sec-n num">0/2</span></h2>
          <table class="c-grid c-grid-diff"><thead><tr><th>${ctx.t('correctionTargets')}</th><th class="c-num">${ctx.t('baseline')}</th><th class="c-num">${ctx.t('yourResponse')}</th><th>${ctx.t('status')}</th><th class="c-opsh"></th></tr></thead><tbody>${targets}</tbody></table>
        </section>
        <section class="c-sec"><h2 class="c-sec-t">${ctx.t('internalNotes')}</h2>
          <ul class="c-log">${P.INTERNAL_ACTIVITY.map((a) => `<li class="${a.internal ? 'is-internal' : ''}"><span class="c-log-w num">${ctx.date(a.at)}</span><span class="c-log-k">${ctx.t(a.key)}</span><span class="c-log-x">${ctx.L(a.detail)}</span><span class="c-log-v">${a.internal ? ctx.t('internalOnly') : ctx.t('applicantHistory')}</span></li>`).join('')}</ul>
          <div class="c-compose"><label class="c-lbl" for="c-note">${ctx.t('addNote')}</label><textarea class="c-inp" id="c-note" rows="2" placeholder="${ctx.t('notePlaceholder')}"></textarea><div class="c-compose-a"><span class="c-mut">${ctx.t('internalOnly')}</span><button class="c-btn c-btn-s" type="button">${ctx.t('addNote')} <kbd>↵</kbd></button></div></div>
        </section>
        ${panel(ctx, 'c-req', ctx.t('requestCorrections'), `<p class="c-hint">${ctx.t('dialogTargets')}</p><table class="c-grid"><thead><tr><th>${ctx.t('correctionTargets')}</th><th>${ctx.t('reason')}</th></tr></thead><tbody>${P.CORRECTION_TARGETS.map((t) => `<tr><td class="c-slot">${ctx.L(t.label)}</td><td><textarea class="c-inp" rows="2">${ctx.t(t.reason)}</textarea><p class="c-hint">${ctx.t('reasonRequired')}</p></td></tr>`).join('')}</tbody></table><button class="c-btn c-btn-s" type="button">+ ${ctx.t('addTarget')}</button>`, `<button class="c-btn" type="button" data-close=".c-modal">${ctx.t('cancel')} <kbd>ESC</kbd></button><button class="c-btn c-btn-p" type="button">${ctx.t('requestCorrections')} <kbd>↵</kbd></button>`)}
        ${panel(ctx, 'c-appr', ctx.t('confirmApprove'), `<p class="c-blocked">${ctx.t('approveBlocked')}</p><ul class="c-reqs"><li>${ctx.t('documents')} <span class="num">3/4</span></li><li>${ctx.t('reviewChecks')} <span class="num">1/5</span></li><li>${ctx.t('verifyTarget')} <span class="num">0/2</span></li></ul><label class="c-lbl" for="c-appr-r">${ctx.t('decisionReason')}</label><textarea class="c-inp" id="c-appr-r" rows="4">${ctx.t('approveReasonSample')}</textarea><p class="c-hint">${ctx.t('confirmRequired')}</p>`, `<button class="c-btn" type="button" data-close=".c-modal">${ctx.t('cancel')}</button><button class="c-btn c-btn-p" type="button" disabled aria-disabled="true">${ctx.t('approve')}</button>`)}
        ${panel(ctx, 'c-rej', ctx.t('confirmReject'), `<p class="c-hint">${ctx.t('rejectNeedsCriterion')}</p><label class="c-lbl" for="c-rej-r">${ctx.t('decisionReason')}</label><textarea class="c-inp" id="c-rej-r" rows="4">${ctx.t('rejectReasonSample')}</textarea>`, `<button class="c-btn" type="button" data-close=".c-modal">${ctx.t('cancel')}</button><button class="c-btn c-btn-w" type="button">${ctx.t('reject')} <kbd>↵</kbd></button>`)}
        ${panel(ctx, 'c-id-dlg', ctx.t('signInAs'), `<p class="c-hint">${ctx.t('demoBadge')}</p><ul class="c-ids">${['Mariam', 'Huda', 'Omar'].map((k) => `<li><button class="c-btn c-btn-s" type="button">${ctx.L(P.PEOPLE[k])} · ${ctx.t('roleApplicant')}</button></li>`).join('')}<li><button class="c-btn c-btn-s c-btn-p" type="button">${ctx.L(P.PEOPLE.R)} · ${ctx.t('roleReviewer')}</button></li></ul>`, `<button class="c-btn" type="button" data-close=".c-modal">${ctx.t('cancel')}</button>`)}
        ${panel(ctx, 'c-reset-dlg', ctx.t('navReset'), `<p class="c-hint">${ctx.lang === 'ar' ? 'يحذف كل ما حُفظ في هذا المتصفح ويعيد البيانات الأولية، بما فيها العمل غير المكتمل.' : 'Clears everything saved in this browser and restores the seed data, including unfinished work.'}</p>`, `<button class="c-btn" type="button" data-close=".c-modal">${ctx.t('cancel')}</button><button class="c-btn c-btn-w" type="button">${ctx.t('navReset')}</button>`)}
        ${panel(ctx, 'c-exp-dlg', ctx.t('expireSession'), `<p class="c-hint">${ctx.lang === 'ar' ? 'تُغطى المحتوى المحمي ويتطلب دخولًا محاكيًا من جديد؛ العمل المحفوظ يبقى والمدخلات غير المكتملة تبقى في هذا التبويب.' : 'Protected content is covered and simulated sign-in is required again; saved work stays and unfinished input remains in this tab.'}</p>`, `<button class="c-btn c-btn-p" type="button" data-close=".c-modal">${ctx.t('signInAs')}</button>`)}`
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
          meta: `<span class="tag t-ref ltr">MSR-26-106</span>${st(ctx, 'review')}`,
          notice: `<span class="c-notice-k c-notice-bad">!</span><span><b>${ctx.t('staleConflict')}.</b> ${ctx.t('readOnlyLostAssignment')}</span><span class="c-notice-a"><button class="c-btn c-btn-s c-btn-p" type="button">${ctx.t('loadLatest')} <kbd>L</kbd></button><button class="c-btn c-btn-s" type="button">${ctx.t('reclaim')}</button></span>`
        },
        `<div class="c-cols">
          <section class="c-sec"><h2 class="c-sec-t">${ctx.t('requestCorrections')}</h2>
            <table class="c-grid"><thead><tr><th>${ctx.t('correctionTargets')}</th><th>${ctx.t('reason')}</th></tr></thead>
            <tbody>${P.CORRECTION_TARGETS.map((t) => `<tr><td class="c-slot">${ctx.L(t.label)}<span class="tag t-kind">${t.kind === 'field' ? ctx.t('stepFinancing') : ctx.t('navDocs')}</span></td><td><textarea class="c-inp" rows="2">${ctx.t(t.reason)}</textarea><p class="c-hint">${ctx.t('reasonRequired')}</p></td></tr>`).join('')}</tbody></table>
            <div class="c-compose-a"><button class="c-btn c-btn-s" type="button">+ ${ctx.t('addTarget')}</button><button class="c-btn c-btn-s" type="button">${ctx.t('cancel')}</button><button class="c-btn c-btn-s c-btn-p" type="button">${ctx.t('requestCorrections')} <kbd>↵</kbd></button></div>
          </section>
          <section class="c-sec"><h2 class="c-sec-t">${ctx.t('confirmApprove')}</h2>
            <p class="c-blocked">${ctx.t('approveBlocked')}</p>
            <ul class="c-reqs"><li>${ctx.t('documents')} <span class="num">3/4</span></li><li>${ctx.t('reviewChecks')} <span class="num">1/5</span></li><li>${ctx.t('verifyTarget')} <span class="num">0/2</span></li></ul>
            <label class="c-lbl" for="c-x-appr">${ctx.t('decisionReason')}</label>
            <textarea class="c-inp" id="c-x-appr" rows="4">${ctx.t('approveReasonSample')}</textarea>
            <div class="c-compose-a"><button class="c-btn c-btn-s" type="button">${ctx.t('cancel')}</button><button class="c-btn c-btn-s c-btn-p" type="button" disabled aria-disabled="true">${ctx.t('approve')}</button></div>
          </section>
          <section class="c-sec"><h2 class="c-sec-t">${ctx.t('confirmReject')}</h2>
            <p class="c-hint">${ctx.t('rejectNeedsCriterion')}</p>
            <label class="c-lbl" for="c-x-rej">${ctx.t('decisionReason')}</label>
            <textarea class="c-inp" id="c-x-rej" rows="4">${ctx.t('rejectReasonSample')}</textarea>
            <div class="c-compose-a"><button class="c-btn c-btn-s" type="button">${ctx.t('cancel')}</button><button class="c-btn c-btn-s c-btn-w" type="button">${ctx.t('reject')} <kbd>↵</kbd></button></div>
          </section>
        </div>`
      );
    }
  };

  return {
    key: 'C',
    name: { ar: 'المنصّة — كثيفة للمحترفين', en: 'Console — dense pro tool' },
    theme: 'dark-stage',
    render(ctx) {
      return screens[ctx.screen] ? screens[ctx.screen](ctx) : screens.products(ctx);
    }
  };
})();
