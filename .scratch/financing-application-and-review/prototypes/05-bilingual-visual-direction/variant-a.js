window.VARIANTS = window.VARIANTS || {};

window.VARIANTS.A = (function () {
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
    return `<span class="num">${ctx.n(x)}</span><span class="cur">${ctx.money(x).currency}</span>`;
  }

  function st(ctx, key) {
    const [cls, label] = ST[key];
    return `<span class="st ${cls}"><i aria-hidden="true"></i>${ctx.t(label)}</span>`;
  }

  function doc(ctx, key) {
    const [cls, label] = DS[key];
    return `<span class="st ${cls}"><i aria-hidden="true"></i>${ctx.t(label)}</span>`;
  }

  function chk(ctx, key) {
    const [cls, label] = CS[key];
    return `<span class="st ${cls}"><i aria-hidden="true"></i>${ctx.t(label)}</span>`;
  }

  function ribbon(ctx, identity) {
    const who = identity ? `<span class="ribbon-id">${ctx.t('signInAs')}: <b>${ctx.L(P.PEOPLE[identity])}</b></span>` : `<span class="ribbon-id">${ctx.t('navProducts')} · ${ctx.lang === 'ar' ? 'بلا دخول' : 'public'}</span>`;
    return `<div class="ribbon">
      <span class="ribbon-demo">DEMO / تجريبي</span>
      <span class="ribbon-text">${ctx.t('appTag')}</span>
      ${who}
      <a class="ribbon-link" href="#" data-toggle="#reset-dlg">${ctx.t('navReset')}</a>
      <a class="ribbon-link" href="#" data-toggle="#expire-dlg">${ctx.t('expireSession')}</a>
    </div>`;
  }

  function masthead(ctx, identity, tabs) {
    return `${ribbon(ctx, identity)}
    <header class="masthead">
      <div class="wordmark">
        <span class="wm-name">${ctx.t('appTitle')}</span>
        <span class="wm-sub">${ctx.lang === 'ar' ? 'تمويل الأنشطة الصغيرة · عرض حقائبي' : 'Small-business financing · portfolio demo'}</span>
      </div>
      <nav class="mastnav" aria-label="main">${tabs}</nav>
    </header>`;
  }

  function tab(ctx, key, screen, labelKey) {
    return `<a class="tab${screen === key ? ' is-active' : ''}" href="?variant=A&screen=${key}&lang=${ctx.lang}">${ctx.t(labelKey)}</a>`;
  }

  function applicantTabs(ctx, screen) {
    return [
      ['products', 'navProducts'],
      ['form', 'navApply'],
      ['documents', 'navDocs'],
      ['applications', 'navApplications'],
      ['correction', 'navApply'],
      ['repayment', 'navRepayment']
    ]
      .map(([k, l]) => tab(ctx, k, screen, l))
      .join('');
  }

  function staffTabs(ctx, screen) {
    return [
      ['queue', 'navQueue'],
      ['review', 'navReview'],
      ['decisions', 'navDecisions'],
      ['products', 'navGallery']
    ]
      .map(([k, l]) => tab(ctx, k, screen, l))
      .join('');
  }

  function shell(ctx, opts, body) {
    const tabs = opts.role === 'staff' ? staffTabs(ctx, opts.active) : applicantTabs(ctx, opts.active);
    return `<div class="va">
      ${masthead(ctx, opts.identity, tabs)}
      <main class="page" id="main"><a class="skip" href="#main-content">${ctx.t('skipToContent')}</a>
        <h1 class="page-title" id="main-content">${opts.title}</h1>
        ${opts.lede ? `<p class="lede">${opts.lede}</p>` : ''}
        ${body}
      </main>
      <footer class="colophon">
        <span>${ctx.t('demoBadge')}</span>
        <span class="colophon-keys">${ctx.t('keyboardHint')}</span>
      </footer>
    </div>`;
  }

  function table(ctx, head, rows, cls) {
    return `<table class="ledger ${cls || ''}">
      <thead><tr>${head.map((h) => `<th${h.sort ? ' class="is-sortable"' : ''}${h.num ? ' class="th-num"' : ''}>${h.sort ? `<span class="sortmark">${h.dir === 'desc' ? '▼' : h.dir === 'asc' ? '▲' : '◇'}</span>` : ''}${h.label}</th>`).join('')}</tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>`;
  }

  function field(ctx, f) {
    const id = `a-${f.key}`;
    const value = typeof f.value === 'object' ? ctx.L(f.value) : f.value;
    const display = f.money ? ctx.n(value) : value;
    const invalid = f.error ? ' is-invalid' : '';
    const input = f.textarea
      ? `<textarea id="${id}" name="${f.key}" rows="3" class="inp${invalid}" placeholder="${ctx.L(f.placeholder)}" aria-invalid="${f.error ? 'true' : 'false'}" ${f.error ? `aria-describedby="${id}-err"` : ''}>${display}</textarea>`
      : f.choices
        ? `<select id="${id}" name="${f.key}" class="inp${invalid}">${f.choices
            .map((c) => `<option${ctx.L(c) === display ? ' selected' : ''}>${ctx.L(c)}</option>`)
            .join('')}</select>`
        : `<input id="${id}" name="${f.key}" class="inp${invalid}${f.ltr ? ' ltr' : ''}${f.money ? ' num' : ''}" value="${display}" ${f.ltr || f.money ? 'dir="ltr"' : ''} aria-invalid="${f.error ? 'true' : 'false'}" ${f.error ? `aria-describedby="${id}-err"` : ''} />`;
    return `<div class="fld${invalid}">
      <label class="lbl" for="${id}">${ctx.L(f.label)}${f.optional ? ` <span class="opt">(${ctx.t('optional')})</span>` : ''}</label>
      ${input}
      ${f.hint ? `<p class="hint">${ctx.L(f.hint)}</p>` : ''}
      ${f.hintKey ? `<p class="hint">${ctx.t(f.hintKey)}</p>` : ''}
      ${f.error ? `<p class="err" id="${id}-err" role="alert"><span class="err-mark">!</span>${ctx.t(f.error)}</p>` : ''}
    </div>`;
  }

  function group(ctx, title, keys) {
    const fields = P.FIELDS.filter((f) => keys.includes(f.key));
    return `<section class="grp"><h2 class="grp-title">${ctx.t(title)}</h2>${fields.map((f) => field(ctx, f)).join('')}</section>`;
  }

  function dlg(ctx, id, title, body, actions) {
    return `<div class="dlg" id="${id}" hidden role="dialog" aria-modal="true" aria-label="${title}">
      <div class="dlg-paper">
        <h2 class="dlg-title">${title}</h2>
        <div class="dlg-body">${body}</div>
        <div class="dlg-actions">${actions}</div>
        <button class="dlg-x" type="button" data-close=".dlg" aria-label="${ctx.t('close')}">×</button>
      </div>
    </div>`;
  }

  const screens = {
    products(ctx) {
      const cards = P.PRODUCTS.map(
        (p, i) => `<article class="prod${i === 0 ? ' is-chosen' : ''}">
        <h2 class="prod-name">${ctx.L(p.name)}${i === 0 ? `<span class="prod-flag">${ctx.t('selected')}</span>` : ''}</h2>
        <p class="prod-purpose">${ctx.L(p.purpose)}</p>
        <dl class="prod-spec">
          <div><dt>${ctx.t('amountRange')}</dt><dd><span class="num">${ctx.n(p.min)}</span>–<span class="num">${ctx.n(p.max)}</span> <span class="cur">${ctx.money(0).currency}</span></dd></div>
          <div><dt>${ctx.t('terms')}</dt><dd>${p.terms.map((t) => `<span class="num">${t}</span>`).join(' · ')} ${ctx.t('months')}</dd></div>
          <div><dt>${ctx.t('markup')}</dt><dd><span class="num">${p.markup}%</span></dd></div>
          <div><dt>${ctx.t('requiredDocs')}</dt><dd><ul class="prodl">${[...P.SHARED_DOCS, p.fourth].map((d) => `<li>${ctx.t(d)}</li>`).join('')}</ul></dd></div>
        </dl>
        <p class="prod-note">${ctx.t('wholeRial')}</p>
        <button class="btn${i === 0 ? ' btn-primary' : ''}" type="button">${ctx.t('choose')}</button>
      </article>`
      ).join('');
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'products',
          title: ctx.t('screenProducts'),
          lede: ctx.t('compare')
        },
        `<div class="prods">${cards}</div>
        <p class="fineprint">${ctx.t('fixedAfterSubmit')}</p>`
      );
    },

    form(ctx) {
      const steps = ['stepPersonal', 'stepBusiness', 'stepFinancing', 'stepDocs', 'stepReview'];
      const stepper = steps
        .map((s, i) => `<li class="stp${i === 2 ? ' is-now' : ''}${i < 2 ? ' is-done' : ''}"><span class="stp-n num">${i + 1}</span><span class="stp-l">${ctx.t(s)}</span></li>`)
        .join('');
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'form',
          identity: 'Mariam',
          title: ctx.t('screenForm'),
          lede: `<span class="refline">${ctx.lang === 'ar' ? 'مسودة' : 'Draft'} · <span class="num">MSR-26-100</span> · ${ctx.L(P.PRODUCTS[1].name)}</span>`
        },
        `<ol class="stepper">${stepper}</ol>
        <div class="notice notice-warn"><b>${ctx.t('switchedProduct')}</b></div>
        <div class="errors-summary" id="err-summary"><span class="err-mark">!</span>${ctx.t('errSummary')}</div>
        <form class="form" novalidate>
          ${group(ctx, 'stepPersonal', ['fullName', 'mobile', 'city', 'email'])}
          ${group(ctx, 'stepBusiness', ['businessName', 'activity', 'address', 'since', 'revenue', 'expenses'])}
          <p class="hint blockhint">${ctx.t('financialWindow')}</p>
          ${group(ctx, 'stepFinancing', ['amount', 'term', 'budget', 'explanation'])}
          <div class="formbar">
            <button class="btn" type="button" data-focus="#a-amount">${ctx.t('focusFirstField')}</button>
            <button class="btn" type="button">${ctx.t('saveDraft')}</button>
            <button class="btn btn-primary" type="button" disabled aria-disabled="true">${ctx.t('submit')}</button>
          </div>
          <p class="savefb">${ctx.t('savedAt')} <span class="num">2026-10-14 09:12</span> · ${ctx.lang === 'ar' ? 'نجاح' : 'succeeded'}</p>
        </form>`
      );
    },

    documents(ctx) {
      const rows = P.DOC_SET.map((d) => {
        const requested = d.status === 'replace';
        return `<tr class="${requested ? 'is-requested' : ''}">
        <th scope="row" class="doc-name">${ctx.t(d.slot)}${requested ? `<span class="doc-flag">${ctx.t('outstanding')}</span>` : ''}</th>
        <td class="doc-file">${d.file ? `<span class="fname ltr">${d.file}</span><span class="fmeta num">${d.size}${d.pages ? ` · ${d.pages}p` : ''}</span>` : `<span class="fnone">${ctx.t('dMissing')}</span>`}</td>
        <td class="doc-state">${requested ? `<span class="st d-replace"><i></i>${ctx.t('dReplace')}</span>` : `<span class="st d-supplied"><i></i>${ctx.lang === 'ar' ? 'مُرفق' : 'Supplied'}</span>`}</td>
        <td class="doc-acts"><a href="#" class="lnk">${ctx.t('preview')}</a><span class="dot">·</span><a href="#" class="lnk">${ctx.t('replace')}</a></td>
      </tr>${
        requested
          ? `<tr class="doc-reason"><td colspan="4">
            <p class="reason"><b>${ctx.t('reason')}:</b> ${ctx.L(d.reason)}</p>
            <p class="upl upl-failed"><span class="upl-mark">!</span>${ctx.t('uploadFailed')}: <span class="fname ltr">${d.replacement}</span> — ${ctx.t('uploadFailedWhy')} <a href="#" class="lnk">${ctx.t('retry')}</a></p>
            <p class="upl upl-private">${ctx.t('savedNotPublished')} · ${ctx.t('maxFile')}</p>
          </td></tr>`
          : ''
      }`;
      });
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'documents',
          identity: 'Huda',
          title: ctx.t('screenDocs'),
          lede: `<span class="refline"><span class="num">MSR-26-103</span> · ${ctx.L(P.RECORDS[2].business)} · ${st(ctx, 'corrections')}</span>`
        },
        `${table(ctx, [{ label: ctx.t('requiredDocs') }, { label: ctx.t('preview') }, { label: ctx.t('status') }, { label: '' }], rows, 'doc-table')}
        <p class="fineprint">${ctx.lang === 'ar' ? 'حالة تقييم المستندات داخلية ولا تظهر للمتقدم؛ يظهر سبب الاستبدال عبر طلب التصحيح.' : 'Document assessment is internal; a replacement reason reaches the applicant through the correction request.'}</p>
        <div class="formbar"><button class="btn" type="button">${ctx.t('saveProgress')}</button><button class="btn btn-primary" type="button">${ctx.t('resubmit')}</button></div>`
      );
    },

    applications(ctx) {
      const mine = P.RECORDS.filter((r) => r.applicant === 'Huda');
      const rows = mine
        .map(
          (r) => `<tr>
        <th scope="row"><span class="num ref">${r.ref}</span><span class="rlabel">${ctx.L(r.label)}</span></th>
        <td>${ctx.L(r.business)}<span class="fmeta">${ctx.L(P.ACTIVITIES[r.activity])} · ${ctx.L(P.PRODUCTS.find((p) => p.id === r.product).name)}</span></td>
        <td class="td-num">${m(ctx, r.amount)}<span class="fmeta"><span class="num">${r.term}</span> ${ctx.t('months')}</span></td>
        <td>${st(ctx, r.status)}</td>
        <td class="num">${ctx.date(r.submitted)}</td>
        <td class="doc-acts">${r.status === 'corrections' ? `<a href="#" class="lnk lnk-strong">${ctx.t('openApplication')}</a>` : `<a href="#" class="lnk">${ctx.t('openApplication')}</a>`}<span class="dot">·</span><a href="#" class="lnk">${ctx.t('printSummary')}</a></td>
      </tr>`
        );
      const notes = P.NOTIFICATIONS.filter((x) => x.ref.startsWith('MSR-26-1') && ['MSR-26-103', 'MSR-26-111'].includes(x.ref))
        .map(
          (x) => `<li class="note${x.unread ? ' is-unread' : ''}">
          <span class="note-when num">${ctx.date(x.at)}</span>
          <span class="note-body"><b>${ctx.t(x.kind)}</b> — ${ctx.L(x.body)}</span>
          <span class="note-acts"><a href="#" class="lnk">${ctx.t('openApplication')}</a>${x.unread ? `<span class="dot">·</span><a href="#" class="lnk">${ctx.t('markRead')}</a>` : ''}</span>
          ${x.unread ? `<span class="note-unread">${ctx.t('unread')}</span>` : ''}
        </li>`
        );
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'applications',
          identity: 'Huda',
          title: ctx.t('screenApplications')
        },
        `<section class="sec"><h2 class="sec-title">${ctx.t('navNotifications')}</h2><ul class="notes">${notes}</ul></section>
        <section class="sec"><h2 class="sec-title">${ctx.t('navApplications')} <span class="count num">${mine.length}</span></h2>
        ${table(ctx, [{ label: ctx.t('reference') }, { label: ctx.t('business') }, { label: ctx.t('amount'), num: true }, { label: ctx.t('status') }, { label: ctx.t('submittedOn') }, { label: '' }], rows)}
        </section>
        <section class="sec"><h2 class="sec-title">${ctx.t('viewHistory')} · <span class="num">MSR-26-103</span></h2>
        <ol class="timeline">${P.HISTORY.map((h) => `<li><span class="tl-when num">${ctx.date(h.at)}</span><span class="tl-what">${ctx.t(h.key)}</span><span class="tl-detail">${ctx.L(h.detail)}</span></li>`).join('')}</ol>
        </section>`
      );
    },

    correction(ctx) {
      const rec = P.RECORDS[2];
      const targets = P.CORRECTION_TARGETS.map(
        (t) => `<li class="tgt">
        <div class="tgt-head"><span class="tgt-kind">${t.kind === 'field' ? ctx.t('stepFinancing') : ctx.t('navDocs')}</span><h3 class="tgt-name">${ctx.L(t.label)}</h3><span class="st d-replace"><i></i>${ctx.t('pendingVerify')}</span></div>
        <p class="tgt-reason"><b>${ctx.t('reason')}:</b> ${ctx.t(t.reason)}</p>
        <div class="tgt-diff">
          <div class="diff-col"><span class="diff-k">${ctx.t('baseline')}</span><span class="diff-v num ${t.money ? '' : 'ltr'}">${t.money ? ctx.n(t.baseline) : t.baselineFile}</span></div>
          <span class="diff-arrow" aria-hidden="true">←</span>
          <div class="diff-col is-changed"><span class="diff-k">${ctx.t('yourResponse')}</span><span class="diff-v num ${t.money ? '' : 'ltr'}">${t.money ? ctx.n(t.response) : t.responseFile}</span><span class="diff-flag">${ctx.t('changed')}</span></div>
        </div>
      </li>`
      ).join('');
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'correction',
          identity: 'Huda',
          title: ctx.t('screenCorrection'),
          lede: `<span class="refline"><span class="num">${rec.ref}</span> · ${ctx.L(rec.business)} · ${ctx.t('historyRequest')} <span class="num">${ctx.date(rec.requested)}</span></span>`
        },
        `<ul class="tgts">${targets}</ul>
        <div class="notice">${ctx.t('lockedFields')}</div>
        <section class="grp"><h2 class="grp-title">${ctx.t('locked')}</h2>
          <dl class="locklist">
            <div><dt>${ctx.t('product')}</dt><dd>${ctx.L(P.PRODUCTS[0].name)} <span class="lock-chip">${ctx.t('locked')}</span></dd></div>
            <div><dt>${ctx.L(P.FIELDS[8].label)}</dt><dd class="num">${ctx.n(rec.revenue)} <span class="lock-chip">${ctx.t('locked')}</span></dd></div>
            <div><dt>${ctx.L(P.FIELDS[9].label)}</dt><dd class="num">${ctx.n(rec.expenses)} <span class="lock-chip">${ctx.t('locked')}</span></dd></div>
          </dl>
        </section>
        <p class="fineprint">${ctx.t('resubmitRules')}</p>
        <div class="formbar"><button class="btn" type="button">${ctx.t('saveProgress')}</button><button class="btn btn-primary" type="button">${ctx.t('resubmit')}</button></div>`
      );
    },

    repayment(ctx) {
      const r = P.REPAYMENT;
      const rows = r.entries
        .map(
          (e, i) => `<tr class="${e.state === 'completed' ? 'is-completed' : ''}${e.next ? ' is-next' : ''}">
          <td class="num">${i + 1}</td>
          <td class="num">${ctx.date(e.at)}</td>
          <td class="td-num">${m(ctx, r.installment)}</td>
          <td><span class="st ${e.state === 'completed' ? 'd-accepted' : 'd-awaiting'}"><i></i>${e.state === 'completed' ? ctx.t('completed') : ctx.t('upcoming')}</span>${e.next ? `<span class="next-flag">${ctx.lang === 'ar' ? 'القسط التالي' : 'Next'}</span>` : ''}</td>
        </tr>`
        );
      return shell(
        ctx,
        {
          role: 'applicant',
          active: 'repayment',
          identity: 'Mariam',
          title: ctx.t('screenRepayment'),
          lede: `<span class="refline"><span class="num">MSR-26-101</span> · ${st(ctx, 'approved')} · ${ctx.t('approvedOn')} <span class="num">${ctx.date(r.approvedOn)}</span></span>`
        },
        `<dl class="sums">
          <div><dt>${ctx.t('financingAmount')}</dt><dd>${m(ctx, r.amount)}</dd></div>
          <div><dt>${ctx.t('illustrativeMarkup')} <span class="pct num">8%</span></dt><dd>${m(ctx, r.markup)}</dd></div>
          <div class="is-total"><dt>${ctx.t('repaymentTotal')}</dt><dd>${m(ctx, r.total)}</dd></div>
          <div><dt>${ctx.t('completedAmount')}</dt><dd>${m(ctx, r.completedAmount)} <span class="fmeta num">${r.completedCount}/${r.count}</span></dd></div>
          <div><dt>${ctx.t('remainingAmount')}</dt><dd>${m(ctx, r.remainingAmount)}</dd></div>
        </dl>
        ${table(ctx, [{ label: '#' }, { label: ctx.t('dueDate') }, { label: ctx.t('installment'), num: true }, { label: ctx.t('status') }], rows)}
        <p class="fineprint">${ctx.t('readOnlyNote')} ${ctx.lang === 'ar' ? `آخر قسط <span class="num">${ctx.date(r.lastEntry)}</span>.` : `Final installment <span class="num">${ctx.date(r.lastEntry)}</span>.`}</p>
        <button class="btn" type="button">${ctx.t('showRemaining')}</button>`
      );
    },

    queue(ctx) {
      const pages = [[], [], []];
      const sorted = [...P.RECORDS].sort((a, b) => (a.submitted === b.submitted ? a.ref.localeCompare(b.ref) : b.submitted.localeCompare(a.submitted)));
      sorted.forEach((r, i) => pages[Math.floor(i / 5)].push(r));
      const rowOf = (r) => `<tr>
        <td><span class="num ref">${r.ref}</span></td>
        <td>${ctx.L(r.business)}<span class="fmeta">${ctx.L(P.ACTIVITIES[r.activity])}</span></td>
        <td>${ctx.L(P.PEOPLE[r.applicant])}</td>
        <td>${ctx.L(P.PRODUCTS.find((p) => p.id === r.product).name)}</td>
        <td class="td-num">${m(ctx, r.amount)}</td>
        <td class="td-num"><span class="num">${r.term}</span></td>
        <td>${st(ctx, r.status)}</td>
        <td>${r.assignee ? (r.assignee === 'R' ? `<span class="asg is-you">${ctx.t('assignedYou')}</span>` : ctx.L(P.PEOPLE.K)) : `<span class="asg is-none">${ctx.t('unassigned')}</span>`}</td>
        <td class="num">${ctx.date(r.submitted)}</td>
        <td class="doc-acts">${!r.assignee && r.status === 'submitted' ? `<a href="#" class="lnk lnk-strong">${ctx.t('claim')}</a><span class="dot">·</span>` : ''}<a href="#" class="lnk">${ctx.t('openFile')}</a></td>
      </tr>`;
      const head = [
        { label: ctx.t('reference'), sort: true, dir: 'asc' },
        { label: ctx.t('business') },
        { label: ctx.t('applicant') },
        { label: ctx.t('product') },
        { label: ctx.t('amount'), num: true },
        { label: ctx.t('term'), num: true },
        { label: ctx.t('status'), sort: true },
        { label: ctx.t('assignedTo') },
        { label: ctx.t('submittedOn'), sort: true, dir: 'desc' },
        { label: '' }
      ];
      return shell(
        ctx,
        {
          role: 'staff',
          active: 'queue',
          identity: 'R',
          title: ctx.t('screenQueue'),
          lede: `<span class="refline"><span class="num">12</span> ${ctx.t('queueCount')} · ${ctx.t('perPage')} · ${ctx.t('savedPrefs')}</span>`
        },
        `<div class="toolbar">
          <label class="tb"><span class="tb-k">${ctx.t('search')}</span><input class="inp inp-sm" type="search" value="" placeholder="MSR-26-" dir="ltr" /></label>
          <label class="tb"><span class="tb-k">${ctx.t('filterStatus')}</span><select class="inp inp-sm"><option>${ctx.t('allStatuses')}</option><option>${ctx.t('stSubmitted')}</option><option>${ctx.t('stReview')}</option><option>${ctx.t('stCorrections')}</option><option>${ctx.t('stApproved')}</option><option>${ctx.t('stRejected')}</option></select></label>
          <label class="tb"><span class="tb-k">${ctx.t('sortBy')}</span><select class="inp inp-sm"><option>${ctx.t('sortSubmitted')}</option><option>${ctx.t('sortAmount')}</option><option>${ctx.t('sortStatus')}</option></select></label>
          <button class="btn btn-sm" type="button">${ctx.t('descending')}</button>
        </div>
        ${pages
          .map(
            (rows, i) =>
              `<div data-pagenum="${i + 1}"${i === 0 ? '' : ' hidden'}><div class="a-scroll">${table(ctx, head, rows.map(rowOf))}</div></div>`
          )
          .join('')}
        <div class="pager">
          <span class="pager-count num">1–5 / 12</span>
          <button class="pg" type="button" data-page="1" aria-pressed="true">1</button>
          <button class="pg" type="button" data-page="2">2</button>
          <button class="pg" type="button" data-page="3">3</button>
        </div>`
      );
    },

    review(ctx) {
      const rec = P.RECORDS[2];
      const docs = P.DOC_SET.map(
        (d) => `<tr class="${d.status === 'replace' ? 'is-requested' : ''}">
        <th scope="row">${ctx.t(d.slot)}</th>
        <td class="doc-file"><span class="fname ltr">${d.file}</span><span class="fmeta num">${d.size}${d.pages ? ` · ${d.pages}p` : ''}</span></td>
        <td>${doc(ctx, d.status)}</td>
        <td class="doc-acts"><a href="#" class="lnk">${ctx.t('preview')}</a><span class="dot">·</span><a href="#" class="lnk">${ctx.t('accept')}</a><span class="dot">·</span><a href="#" class="lnk lnk-warn">${ctx.t('needReplace')}</a></td>
      </tr>${d.reason ? `<tr class="doc-reason"><td colspan="4"><b>${ctx.t('reason')}:</b> ${ctx.L(d.reason)}</td></tr>` : ''}`
      );
      const checks = P.CHECKS.map(
        (c) => `<li class="ck ck-${c.state}">
        <div class="ck-top"><h3 class="ck-name">${ctx.L(c.label)}</h3>${chk(ctx, c.state)}</div>
        <p class="ck-deps"><b>${ctx.t('dependsOn')}:</b> ${ctx.L(c.deps)}</p>
        ${c.detail ? `<p class="ck-detail num-mix">${ctx.L(c.detail)}</p>` : ''}
        ${c.previous ? `<p class="ck-prev">${ctx.L(c.previous)}</p>` : ''}
        ${c.note ? `<p class="ck-note">${ctx.L(c.note)}</p>` : ''}
        <div class="ck-acts"><button class="btn btn-sm" type="button">${ctx.t('cPassed')}</button><button class="btn btn-sm btn-warn" type="button">${ctx.t('cFailed')}</button></div>
      </li>`
      ).join('');
      const info = [
        ['fullName', ctx.L(P.PEOPLE.Huda)],
        ['mobile', '<span class="num ltr">+000000000002</span>'],
        ['businessName', ctx.L(rec.business)],
        ['activity', ctx.L(P.ACTIVITIES[rec.activity])],
        ['since', `<span class="num">${rec.since}</span> · ${ctx.monthName(rec.since)}`],
        ['revenue', m(ctx, rec.revenue)],
        ['expenses', m(ctx, rec.expenses)],
        ['amount', `${m(ctx, rec.amount)} <span class="chg-flag">${ctx.t('changedSinceBaseline')}</span> <s class="num base">${ctx.n(rec.baselineAmount)}</s>`],
        ['term', `<span class="num">${rec.term}</span> ${ctx.t('months')}`],
        ['budget', m(ctx, rec.budget)]
      ];
      const labelFor = (k) => ctx.L(P.FIELDS.find((f) => f.key === k).label);
      const activity = P.INTERNAL_ACTIVITY.map(
        (a) => `<li class="${a.internal ? 'is-internal' : ''}"><span class="tl-when num">${ctx.date(a.at)}</span><span class="tl-what">${ctx.t(a.key)}</span><span class="tl-detail">${ctx.L(a.detail)}</span>${a.internal ? `<span class="int-flag">${ctx.t('internalOnly')}</span>` : ''}</li>`
      ).join('');
      return shell(
        ctx,
        {
          role: 'staff',
          active: 'review',
          identity: 'R',
          title: `${ctx.t('screenReview')} · <span class="num">${rec.ref}</span>`,
          lede: `<span class="refline">${ctx.L(rec.business)} · ${st(ctx, rec.status)} · ${ctx.t('assignedYou')} · ${ctx.t('historyResubmit')} <span class="num">${ctx.date(rec.resubmitted)}</span></span>`
        },
        `<div class="wsbar">
          <button class="btn btn-sm" type="button">${ctx.t('startReview')}</button>
          <button class="btn btn-sm" type="button" data-toggle="#req-dlg">${ctx.t('requestCorrections')}</button>
          <button class="btn btn-sm btn-primary" type="button" data-toggle="#appr-dlg">${ctx.t('approve')}</button>
          <button class="btn btn-sm btn-warn" type="button" data-toggle="#rej-dlg">${ctx.t('reject')}</button>
          <button class="btn btn-sm" type="button">${ctx.t('transfer')}</button>
          <button class="btn btn-sm" type="button">${ctx.t('printSummary')}</button>
          <span class="wsbar-note">${ctx.t('snapshotNote')}</span>
        </div>
        <div class="ws">
          <div class="ws-main">
            <section class="sec"><h2 class="sec-title">${ctx.t('applicantInfo')}</h2>
              <dl class="info">${info.map(([k, v]) => `<div class="${k === 'amount' ? 'is-changed' : ''}"><dt>${labelFor(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>
              <p class="hint">${ctx.t('financialWindow')}</p>
              <p class="expl">${ctx.lang === 'ar' ? 'شراء مخزون من المستلزمات المنزلية لتجديد البضائع في المتجر.' : 'Purchase household-goods stock to replenish the shop.'}</p>
            </section>
            <section class="sec"><h2 class="sec-title">${ctx.t('documents')}</h2>${table(ctx, [{ label: ctx.t('requiredDocs') }, { label: ctx.t('preview') }, { label: ctx.t('status') }, { label: '' }], docs, 'doc-table')}</section>
            <section class="sec"><h2 class="sec-title">${ctx.t('correctionTargets')} · ${ctx.t('verifyTarget')}</h2>
              <ul class="vlist">${P.CORRECTION_TARGETS.map((t) => `<li><span class="v-name">${ctx.L(t.label)}</span><span class="v-val num">${t.money ? `${ctx.n(t.baseline)} ← ${ctx.n(t.response)}` : t.responseFile}</span><span class="st d-awaiting"><i></i>${ctx.t('pendingVerify')}</span><button class="btn btn-sm" type="button">${ctx.t('verified')}</button></li>`).join('')}</ul>
            </section>
          </div>
          <aside class="ws-side">
            <section class="sec"><h2 class="sec-title">${ctx.t('reviewChecks')}</h2><p class="hint">${ctx.t('criteriaNote')}</p><ul class="checks">${checks}</ul></section>
            <section class="sec"><h2 class="sec-title">${ctx.t('internalNotes')}</h2>
              <p class="note-line"><span class="note-who">${ctx.L(P.PEOPLE.R)}</span> <span class="num">2026-10-06</span> — ${ctx.L(P.INTERNAL_ACTIVITY[4].detail)}</p>
              <textarea class="inp" rows="3" placeholder="${ctx.t('notePlaceholder')}"></textarea>
              <div class="formbar formbar-tight"><button class="btn btn-sm" type="button">${ctx.t('addNote')}</button><span class="int-flag">${ctx.t('internalOnly')}</span></div>
            </section>
            <section class="sec"><h2 class="sec-title">${ctx.t('activity')}</h2><ol class="timeline timeline-dense">${activity}</ol></section>
          </aside>
        </div>
        ${dlg(ctx, 'req-dlg', ctx.t('requestCorrections'), `<p class="dlg-lede">${ctx.t('dialogTargets')}</p>
          <ul class="dlgl">${P.CORRECTION_TARGETS.map((t) => `<li><span class="dlg-k">${ctx.L(t.label)}</span><textarea class="inp" rows="2">${ctx.t(t.reason)}</textarea></li>`).join('')}</ul>
          <button class="btn btn-sm" type="button">${ctx.t('addTarget')}</button>`, `<button class="btn" type="button" data-close=".dlg">${ctx.t('cancel')}</button><button class="btn btn-primary" type="button">${ctx.t('requestCorrections')}</button>`)}
        ${dlg(ctx, 'appr-dlg', ctx.t('confirmApprove'), `<p class="dlg-warn">${ctx.t('approveBlocked')}</p><label class="lbl" for="appr-reason">${ctx.t('decisionReason')}</label><textarea class="inp" id="appr-reason" rows="4">${ctx.t('approveReasonSample')}</textarea><p class="hint">${ctx.t('confirmRequired')}</p>`, `<button class="btn" type="button" data-close=".dlg">${ctx.t('cancel')}</button><button class="btn btn-primary" type="button">${ctx.t('approve')}</button>`)}
        ${dlg(ctx, 'rej-dlg', ctx.t('confirmReject'), `<p class="dlg-lede">${ctx.t('rejectNeedsCriterion')}</p><label class="lbl" for="rej-reason">${ctx.t('decisionReason')}</label><textarea class="inp" id="rej-reason" rows="4">${ctx.t('rejectReasonSample')}</textarea>`, `<button class="btn" type="button" data-close=".dlg">${ctx.t('cancel')}</button><button class="btn btn-warn" type="button">${ctx.t('reject')}</button>`)}
        ${dlg(ctx, 'reset-dlg', ctx.t('navReset'), `<p>${ctx.lang === 'ar' ? 'يحذف كل ما حُفظ في هذا المتصفح ويعيد البيانات الأولية، بما فيها العمل غير المكتمل.' : 'Clears everything saved in this browser and restores the seed data, including unfinished work.'}</p>`, `<button class="btn" type="button" data-close=".dlg">${ctx.t('cancel')}</button><button class="btn btn-warn" type="button">${ctx.t('navReset')}</button>`)}
        ${dlg(ctx, 'expire-dlg', ctx.t('expireSession'), `<p>${ctx.lang === 'ar' ? 'تُغطى المحتوى المحمي ويتطلب دخولًا محاكيًا من جديد. العمل المحفوظ يبقى، والمدخلات غير المكتملة تبقى في هذا التبويب.' : 'Protected content is covered and simulated sign-in is required again. Saved work stays; unfinished input remains in this tab.'}</p>`, `<button class="btn btn-primary" type="button" data-close=".dlg">${ctx.t('signInAs')}</button>`)}`
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
          lede: ctx.lang === 'ar' ? 'حالات الطلب والقرار والتعارض، بأدوات مراجعة مقفلة.' : 'Request, decision, and conflict states with review controls locked.'
        },
        `<div class="stale" role="alert"><span class="stale-mark">!</span><div><b>${ctx.t('staleConflict')}.</b> ${ctx.t('readOnlyLostAssignment')}</div><div class="stale-acts"><button class="btn btn-sm btn-primary" type="button">${ctx.t('loadLatest')}</button><button class="btn btn-sm" type="button">${ctx.t('reclaim')}</button></div></div>
        <section class="sec"><h2 class="sec-title">${ctx.t('requestCorrections')}</h2>
          <div class="paper">
            <p class="dlg-lede">${ctx.t('dialogTargets')}</p>
            <ul class="dlgl">${P.CORRECTION_TARGETS.map((t) => `<li><span class="dlg-k">${ctx.L(t.label)} <span class="dlg-kind">${t.kind === 'field' ? ctx.t('stepFinancing') : ctx.t('navDocs')}</span></span><textarea class="inp" rows="2">${ctx.t(t.reason)}</textarea><p class="hint">${ctx.t('reasonRequired')}</p></li>`).join('')}</ul>
            <div class="formbar formbar-tight"><button class="btn btn-sm" type="button">${ctx.t('addTarget')}</button><button class="btn btn-sm" type="button">${ctx.t('cancel')}</button><button class="btn btn-sm btn-primary" type="button">${ctx.t('requestCorrections')}</button></div>
          </div>
        </section>
        <div class="twocol">
          <section class="sec"><h2 class="sec-title">${ctx.t('confirmApprove')}</h2>
            <div class="paper">
              <p class="dlg-warn">${ctx.t('approveBlocked')}</p>
              <label class="lbl" for="d-appr">${ctx.t('decisionReason')}</label>
              <textarea class="inp" id="d-appr" rows="4">${ctx.t('approveReasonSample')}</textarea>
              <ul class="reqs"><li>${ctx.t('documents')} · 3/4</li><li>${ctx.t('reviewChecks')} · 1/5</li><li>${ctx.t('verifyTarget')} · 0/2</li></ul>
              <div class="formbar formbar-tight"><button class="btn btn-sm" type="button">${ctx.t('cancel')}</button><button class="btn btn-sm btn-primary" type="button" disabled aria-disabled="true">${ctx.t('approve')}</button></div>
              <p class="hint">${ctx.t('confirmRequired')}</p>
            </div>
          </section>
          <section class="sec"><h2 class="sec-title">${ctx.t('confirmReject')}</h2>
            <div class="paper">
              <p class="dlg-lede">${ctx.t('rejectNeedsCriterion')}</p>
              <label class="lbl" for="d-rej">${ctx.t('decisionReason')}</label>
              <textarea class="inp" id="d-rej" rows="4">${ctx.t('rejectReasonSample')}</textarea>
              <div class="formbar formbar-tight"><button class="btn btn-sm" type="button">${ctx.t('cancel')}</button><button class="btn btn-sm btn-warn" type="button">${ctx.t('reject')}</button></div>
            </div>
          </section>
        </div>`
      );
    }
  };

  return {
    key: 'A',
    name: { ar: 'السجلّ — وثيقة هادئة', en: 'Ledger — calm document' },
    theme: 'light-stage',
    render(ctx) {
      return screens[ctx.screen] ? screens[ctx.screen](ctx) : screens.products(ctx);
    }
  };
})();
