/**
 * ui.js
 * UIインタラクション・フィットスコア計算・ROIシミュレーター
 */

(function () {
  'use strict';

  // ─── ページ切替時フック ───────────────────────────────────
  function onPageChange(pageId) {
    switch (pageId) {
      case 'hearing':       initHearing(); break;
      case 'fit-score':     initFitScore(); break;
      case 'plan-compare':  initPlanCompare(); break;
      case 'roi-simulator': initROI(); break;
      case 'scenarios':     initScenarios(); break;
      case 'cross-sell':    initCrossSell(); break;
      case 'objections':    initObjections(); break;
      case 'email-templates': initEmailTemplates(); break;
    }
    initAccordions();
    initCopyButtons();
    initScrollTop();
  }

  // ─── ヒアリングシート ─────────────────────────────────────
  function initHearing() {
    const container = document.getElementById('hearing-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    const C = window.BOWNOW_CONTENT;
    if (!C) return;

    // 顧客基本情報フォーム
    let html = '<div class="card">';
    html += '<h3 class="card-title">顧客基本情報</h3>';
    html += '<div class="form-grid">';
    C.hearing.companyFields.forEach(function (f) {
      html += '<div class="form-group">';
      html += '<label class="form-label">' + f.label + '</label>';
      if (f.type === 'select') {
        html += '<select class="form-select" id="hf-' + f.id + '">';
        html += '<option value="">選択してください</option>';
        f.options.forEach(function (o) {
          html += '<option>' + o + '</option>';
        });
        html += '</select>';
      } else {
        html += '<input class="form-input" type="text" id="hf-' + f.id + '" placeholder="' + (f.placeholder || '') + '">';
      }
      html += '</div>';
    });
    html += '</div></div>';

    // 課題チェック
    html += '<div class="card">';
    html += '<h3 class="card-title">課題ヒアリング <span class="card-subtitle">（当てはまるものをチェック）</span></h3>';
    html += '<div class="checklist">';
    C.hearing.painChecks.forEach(function (item) {
      html += '<label class="check-item">';
      html += '<input type="checkbox" class="check-box" value="' + item.id + '">';
      html += '<span class="check-text">' + item.text + '</span>';
      html += '</label>';
    });
    html += '</div></div>';

    // 現状確認
    html += '<div class="card">';
    html += '<h3 class="card-title">現状確認</h3>';
    html += '<div class="checklist">';
    C.hearing.statusChecks.forEach(function (item) {
      const cls = item.type === 'positive' ? 'positive' : 'neutral';
      html += '<label class="check-item check-' + cls + '">';
      html += '<input type="checkbox" class="check-box">';
      html += '<span class="check-text">' + item.text + (item.note ? ' <em class="check-note">→ ' + item.note + '</em>' : '') + '</span>';
      html += '</label>';
    });
    html += '</div></div>';

    // メモ欄
    html += '<div class="card">';
    html += '<h3 class="card-title">ヒアリングメモ</h3>';
    html += '<textarea class="form-textarea" placeholder="商談中に気になったことや顧客の発言をメモしてください..."></textarea>';
    html += '</div>';

    container.innerHTML = html;
  }

  // ─── フィットスコア診断 ───────────────────────────────────
  function initFitScore() {
    const container = document.getElementById('fit-score-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    const CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    let html = '';
    CFG.scoring.categories.forEach(function (cat) {
      html += '<div class="card score-category" id="cat-' + cat.id + '">';
      html += '<h3 class="card-title">' + cat.name + ' <span class="cat-score-badge" id="cat-score-' + cat.id + '">0 / 20点</span></h3>';
      html += '<div class="checklist">';
      cat.questions.forEach(function (q) {
        html += '<label class="check-item">';
        html += '<input type="checkbox" class="score-check" data-cat="' + cat.id + '" data-score="' + q.score + '" id="' + q.id + '">';
        html += '<span class="check-text">' + q.text + ' <span class="score-pts">（+' + q.score + '点）</span></span>';
        html += '</label>';
      });
      html += '</div></div>';
    });

    // スコア結果表示エリア
    html += '<div class="score-result-card" id="score-result">';
    html += '<div class="score-gauge-wrap"><div class="score-number" id="score-total">0</div>';
    html += '<div class="score-max">/ 100点</div></div>';
    html += '<div class="score-tier" id="score-tier">チェックを入れるとスコアが表示されます</div>';
    html += '<div class="score-bar-wrap"><div class="score-bar" id="score-bar" style="width:0%"></div></div>';
    html += '<div class="score-next-action" id="score-next-action"></div>';
    html += '<div class="score-recommend" id="score-recommend"></div>';
    html += '</div>';

    container.innerHTML = html;

    // イベントバインド
    container.querySelectorAll('.score-check').forEach(function (cb) {
      cb.addEventListener('change', calcScore);
    });

    calcScore();
  }

  function calcScore() {
    const CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    let total = 0;
    CFG.scoring.categories.forEach(function (cat) {
      let catScore = 0;
      document.querySelectorAll('.score-check[data-cat="' + cat.id + '"]:checked').forEach(function (cb) {
        catScore += parseInt(cb.dataset.score);
      });
      total += catScore;
      const badge = document.getElementById('cat-score-' + cat.id);
      if (badge) badge.textContent = catScore + ' / 20点';
    });

    const totalEl = document.getElementById('score-total');
    if (totalEl) totalEl.textContent = total;

    const bar = document.getElementById('score-bar');
    if (bar) bar.style.width = total + '%';

    const tier = CFG.scoring.tiers.find(function (t) { return total >= t.min && total <= t.max; });
    if (!tier) return;

    const tierEl = document.getElementById('score-tier');
    if (tierEl) {
      tierEl.textContent = tier.label;
      tierEl.style.color = tier.color;
      tierEl.style.backgroundColor = tier.bg;
    }

    const nextEl = document.getElementById('score-next-action');
    if (nextEl) nextEl.textContent = '推奨アクション：' + tier.nextAction;

    const recEl = document.getElementById('score-recommend');
    if (recEl) recEl.textContent = '推奨プラン：' + tier.planRecommend;
  }

  // ─── プラン比較 ───────────────────────────────────────────
  function initPlanCompare() {
    const container = document.getElementById('plan-compare-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    const CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    const plans = CFG.plans;

    // 料金カードグリッド
    let html = '<div class="plan-cards">';
    plans.forEach(function (p) {
      const highlight = p.highlight ? ' plan-card--highlight' : '';
      html += '<div class="plan-card' + highlight + '">';
      if (p.tag) html += '<div class="plan-tag">' + p.tag + '</div>';
      html += '<div class="plan-name">' + p.name + '</div>';
      html += '<div class="plan-price">';
      if (p.monthly === 0) {
        html += '<span class="plan-price-num">無料</span>';
      } else {
        html += '<span class="plan-price-num">¥' + p.monthly.toLocaleString() + '</span><span class="plan-price-unit">/月（税抜）</span>';
      }
      html += '</div>';
      html += '<div class="plan-initial">';
      html += p.initial === 0 ? '初期費用：無料' : '初期費用：¥' + p.initial.toLocaleString() + '（税抜）';
      html += '</div>';
      html += '<ul class="plan-specs">';
      html += '<li>リード上限：' + p.leadsLimit.toLocaleString() + '件</li>';
      html += '<li>PV上限：' + p.pvLimit.toLocaleString() + ' ' + p.pvNote + '</li>';
      html += '<li>ログ保有：' + p.logRetention + '</li>';
      html += '<li>最低利用：' + p.minTerm + '</li>';
      html += '</ul>';
      html += '</div>';
    });
    html += '</div>';

    // 機能比較表
    const featureRows = [
      { key: 'emailDelivery',        label: 'メール配信' },
      { key: 'emailOpenRate',        label: '開封率・クリック率取得', bool: true },
      { key: 'emailScheduled',       label: '日時指定配信', bool: true },
      { key: 'emailTemplate',        label: 'HTMLテンプレート' },
      { key: 'unlimitedSites',       label: '接続サイト数無制限', bool: true },
      { key: 'formStepMail',         label: 'フォームステップメール', bool: true },
      { key: 'scenario',             label: '簡易シナリオ（条件トリガー）', bool: true },
      { key: 'customField',          label: 'カスタム項目', bool: true },
      { key: 'apiIntegration',       label: 'API連携', bool: true },
      { key: 'crossDomainTracking',  label: 'クロスドメイントラッキング', bool: true },
      { key: 'highTouchSupport',     label: 'ハイタッチサポート' },
    ];

    html += '<div class="section-title">機能比較表</div>';
    html += '<div class="compare-table-wrap"><table class="compare-table">';
    html += '<thead><tr><th>機能</th>';
    plans.forEach(function (p) { html += '<th>' + p.name + '</th>'; });
    html += '</tr></thead><tbody>';

    featureRows.forEach(function (row) {
      html += '<tr><td class="feature-name">' + row.label + '</td>';
      plans.forEach(function (p) {
        const val = p.features[row.key];
        let cell = '';
        if (row.bool) {
          cell = val ? '<span class="feat-yes">✓</span>' : '<span class="feat-no">—</span>';
        } else {
          cell = val || '<span class="feat-no">—</span>';
        }
        html += '<td>' + cell + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    // 共通注記
    html += '<div class="card notes-card"><h3 class="card-title">共通の注意事項</h3><ul class="notes-list">';
    CFG.planNotes.forEach(function (note) {
      html += '<li>' + note + '</li>';
    });
    html += '</ul></div>';

    // 他社比較
    html += '<div class="section-title">他社MAツールとの比較（参考）</div>';
    html += '<div class="compare-table-wrap"><table class="compare-table competitor-table">';
    html += '<thead><tr><th>ツール</th><th>月額（概算・税抜）</th><th>初期費用</th><th>主な強み</th><th>ターゲット</th></tr></thead><tbody>';
    CFG.competitors.forEach(function (c) {
      const rowCls = c.isBownow ? ' class="bownow-row"' : (c.isNoTool ? ' class="no-tool-row"' : '');
      const monthly = c.monthly === 0 ? (c.isNoTool ? '0円' : '無料') : '¥' + c.monthly.toLocaleString() + '〜';
      const initial = c.initial === 0 ? '0円' : '¥' + c.initial.toLocaleString() + '〜';
      html += '<tr' + rowCls + '>';
      html += '<td><strong>' + c.name + '</strong>' + (c.isBownow ? ' <span class="our-badge">自社</span>' : '') + '</td>';
      html += '<td>' + monthly + '</td>';
      html += '<td>' + initial + '</td>';
      html += '<td>' + c.strength + '</td>';
      html += '<td>' + c.target + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    html += '<p class="table-note">※ 競合他社の料金は各社公開情報をもとにした参考値です（税抜・概算）。最新情報は各社にご確認ください。</p>';

    container.innerHTML = html;
  }

  // ─── ROIシミュレーター ────────────────────────────────────
  function initROI() {
    const container = document.getElementById('roi-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    const CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    const D = CFG.roi.defaults;

    let html = '<div class="roi-layout">';

    // 入力パネル
    html += '<div class="roi-inputs card">';
    html += '<h3 class="card-title">現状の入力</h3>';

    const inputs = [
      { id: 'roi_pv',       label: '月間サイトPV数（千PV）', min: 1, max: 1000, step: 1,    val: D.monthlyPvk,       unit: '千PV' },
      { id: 'roi_leads',    label: '月間新規リード数（現状）', min: 0, max: 500,  step: 1,    val: D.currentLeads,     unit: '件' },
      { id: 'roi_staff',    label: 'リードフォロー担当者数',  min: 1, max: 20,   step: 1,    val: D.staffCount,       unit: '名' },
      { id: 'roi_hours',    label: '1人あたり月間フォロー工数', min: 0, max: 200, step: 1,   val: D.staffHoursPerMonth, unit: '時間' },
      { id: 'roi_rate',     label: '担当者の時給換算',        min: 1000, max: 10000, step: 500, val: D.staffHourlyRate, unit: '円' },
      { id: 'roi_email',    label: '現在のメール配信ツール月額', min: 0, max: 100000, step: 1000, val: D.currentEmailTool, unit: '円' },
    ];

    inputs.forEach(function (inp) {
      html += '<div class="roi-input-group">';
      html += '<label class="form-label">' + inp.label + '</label>';
      html += '<div class="roi-slider-row">';
      html += '<input type="range" class="roi-slider" id="' + inp.id + '_slider" min="' + inp.min + '" max="' + inp.max + '" step="' + inp.step + '" value="' + inp.val + '">';
      html += '<input type="number" class="roi-number" id="' + inp.id + '_num" min="' + inp.min + '" max="' + inp.max + '" value="' + inp.val + '">';
      html += '<span class="roi-unit">' + inp.unit + '</span>';
      html += '</div></div>';
    });

    html += '</div>';

    // 結果パネル
    html += '<div class="roi-results">';
    html += '<div class="card roi-result-card" id="roi-result-current">';
    html += '<div class="roi-result-label">現状維持（年間コスト）</div>';
    html += '<div class="roi-result-value" id="roi-current-val">—</div>';
    html += '</div>';
    html += '<div class="card roi-result-card roi-result-card--highlight" id="roi-result-bownow">';
    html += '<div class="roi-result-label">BowNow スタンダード（年間コスト）</div>';
    html += '<div class="roi-result-value" id="roi-bownow-val">—</div>';
    html += '<div class="roi-result-sub" id="roi-saving">—</div>';
    html += '</div>';
    html += '<div class="card roi-result-card roi-result-card--competitor">';
    html += '<div class="roi-result-label">他社MA（SATORI参考・年間コスト）</div>';
    html += '<div class="roi-result-value" id="roi-competitor-val">—</div>';
    html += '</div>';

    html += '<div class="card roi-detail">';
    html += '<h4>試算の詳細</h4>';
    html += '<div id="roi-detail-text"></div>';
    html += '<div class="roi-recommend" id="roi-plan-recommend"></div>';
    html += '</div>';

    // 前提注記
    html += '<div class="roi-assumptions">';
    html += '<h4>試算の前提</h4><ul>';
    CFG.roi.assumptions.forEach(function (a) {
      html += '<li>' + a + '</li>';
    });
    html += '</ul></div>';

    html += '</div>'; // roi-results
    html += '</div>'; // roi-layout

    container.innerHTML = html;

    // スライダー同期 + 計算
    inputs.forEach(function (inp) {
      const slider = document.getElementById(inp.id + '_slider');
      const num = document.getElementById(inp.id + '_num');
      if (slider && num) {
        slider.addEventListener('input', function () { num.value = this.value; calcROI(inputs); });
        num.addEventListener('input', function () { slider.value = this.value; calcROI(inputs); });
      }
    });

    calcROI(inputs);
  }

  function calcROI(inputs) {
    const CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    function getVal(id) {
      const el = document.getElementById(id + '_num');
      return el ? parseFloat(el.value) || 0 : 0;
    }

    const pvk      = getVal('roi_pv');
    const leads    = getVal('roi_leads');
    const staff    = getVal('roi_staff');
    const hours    = getVal('roi_hours');
    const rate     = getVal('roi_rate');
    const emailFee = getVal('roi_email');

    // 現状維持コスト（年間）
    const monthlyLabor = staff * hours * rate;
    const monthlyCurrentTotal = monthlyLabor + emailFee;
    const yearCurrentCost = monthlyCurrentTotal * 12;

    // BowNow スタンダード（年間）
    const bownowMonthly = 36000;
    const bownowInitial = 100000;
    const laborReductionRate = 0.4; // 40%削減（工数削減実績をベースに試算）
    const reducedLabor = monthlyLabor * (1 - laborReductionRate);
    const yearBownowCost = (bownowMonthly + reducedLabor) * 12 + bownowInitial;

    // 競合（SATORI参考）
    const satori = CFG.roi.competitorMonthly.satori;
    const satoriInitial = 300000;
    const yearSatoriCost = (satori + reducedLabor) * 12 + satoriInitial;

    // 表示
    function fmt(n) { return '¥' + Math.round(n).toLocaleString(); }

    const currentEl = document.getElementById('roi-current-val');
    const bownowEl  = document.getElementById('roi-bownow-val');
    const compEl    = document.getElementById('roi-competitor-val');
    const savingEl  = document.getElementById('roi-saving');
    const detailEl  = document.getElementById('roi-detail-text');
    const recEl     = document.getElementById('roi-plan-recommend');

    if (currentEl) currentEl.textContent = fmt(yearCurrentCost);
    if (bownowEl)  bownowEl.textContent  = fmt(yearBownowCost);
    if (compEl)    compEl.textContent    = fmt(yearSatoriCost);

    const saving = yearCurrentCost - yearBownowCost;
    if (savingEl) {
      if (saving > 0) {
        savingEl.textContent = '現状比 年間 ' + fmt(saving) + ' の削減効果';
        savingEl.style.color = '#16a34a';
      } else {
        savingEl.textContent = '現状比 年間 ' + fmt(Math.abs(saving)) + ' の追加投資';
        savingEl.style.color = '#d97706';
      }
    }

    // 推奨プラン判定（リード数・PV数から）
    let recommendPlan = 'フリー → スタンダード';
    if (leads > 5000 || pvk > 300) recommendPlan = 'プレミアム';
    else if (leads > 2000 || pvk > 100) recommendPlan = 'ビジネス';
    else if (leads > 100 || pvk > 5) recommendPlan = 'スタンダード';
    else recommendPlan = 'フリーから開始';

    if (detailEl) {
      detailEl.innerHTML =
        '<table class="roi-detail-table">' +
        '<tr><td>現状の月間人件費（リード対応）</td><td>' + fmt(monthlyLabor) + '</td></tr>' +
        '<tr><td>現状のメール配信ツール費用</td><td>' + fmt(emailFee) + '</td></tr>' +
        '<tr><td>BowNow導入後の人件費（40%削減試算）</td><td>' + fmt(reducedLabor) + '/月</td></tr>' +
        '<tr><td>BowNow スタンダード月額</td><td>¥36,000</td></tr>' +
        '<tr><td>BowNow スタンダード初期費用（12ヶ月均し）</td><td>' + fmt(100000 / 12) + '/月</td></tr>' +
        '</table>';
    }

    if (recEl) {
      recEl.textContent = '入力値からの推奨プラン：' + recommendPlan;
    }
  }

  // ─── 活用シナリオ ─────────────────────────────────────────
  function initScenarios() {
    const container = document.getElementById('scenarios-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    const C = window.BOWNOW_CONTENT;
    if (!C) return;

    let html = '<div class="scenario-tabs">';
    C.scenarios.forEach(function (s, i) {
      html += '<button class="scenario-tab' + (i === 0 ? ' active' : '') + '" data-scenario="' + s.id + '">' +
        s.icon + ' ' + s.title + '</button>';
    });
    html += '</div>';

    C.scenarios.forEach(function (s, i) {
      html += '<div class="scenario-panel' + (i === 0 ? ' active' : '') + '" id="scenario-' + s.id + '">';
      html += '<div class="card">';
      html += '<div class="scenario-tag">' + s.tag + '</div>';
      html += '<h3>' + s.icon + ' ' + s.title + '</h3>';
      html += '<p class="scenario-description">' + s.description + '</p>';
      html += '<div class="scenario-situation"><strong>想定状況</strong><p>' + s.situation + '</p></div>';
      html += '<div class="scenario-two-col">';
      html += '<div><strong>BowNowがフィットする理由</strong><ul>';
      s.bownowFit.forEach(function (f) { html += '<li>' + f + '</li>'; });
      html += '</ul></div>';
      html += '<div><strong>導入の流れ</strong><ol>';
      s.flow.forEach(function (f) { html += '<li>' + f + '</li>'; });
      html += '</ol></div>';
      html += '</div>';
      html += '<div class="scenario-recommend">推奨プラン：<strong>' + s.recommendPlan + '</strong></div>';
      html += '</div></div>';
    });

    container.innerHTML = html;

    // タブ切替
    container.querySelectorAll('.scenario-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = this.dataset.scenario;
        container.querySelectorAll('.scenario-tab').forEach(function (b) { b.classList.remove('active'); });
        container.querySelectorAll('.scenario-panel').forEach(function (p) { p.classList.remove('active'); });
        this.classList.add('active');
        const panel = document.getElementById('scenario-' + id);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ─── 横展開トーク ─────────────────────────────────────────
  function initCrossSell() {
    const container = document.getElementById('cross-sell-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    const C = window.BOWNOW_CONTENT;
    if (!C) return;

    const talks = [C.crossSell.bluemonkey, C.crossSell.circusAds];
    let html = '';

    talks.forEach(function (t) {
      html += '<div class="card talk-card">';
      html += '<h3 class="card-title">' + t.title + '</h3>';
      html += '<div class="talk-meta">';
      html += '<div class="talk-situation"><strong>対象顧客</strong><p>' + t.situation + '</p></div>';
      html += '<div class="talk-pain"><strong>顧客の課題</strong><p>' + t.pain + '</p></div>';
      html += '</div>';
      html += '<div class="talk-script">';
      html += '<div class="talk-script-header"><strong>トークスクリプト</strong>';
      html += '<button class="copy-btn" data-copy="' + escapeAttr(t.talkScript) + '">📋 コピー</button>';
      html += '</div>';
      html += '<pre class="talk-text">' + escapeHtml(t.talkScript) + '</pre>';
      html += '</div>';
      html += '<div class="talk-benefits"><strong>提案のポイント</strong><ul>';
      t.benefits.forEach(function (b) { html += '<li>' + b + '</li>'; });
      html += '</ul></div>';
      html += '<div class="talk-recommend">推奨プラン：<strong>' + t.recommendPlan + '</strong></div>';
      html += '</div>';
    });

    container.innerHTML = html;
    initCopyButtons();
  }

  // ─── 懸念・反論Q&A ───────────────────────────────────────
  function initObjections() {
    const container = document.getElementById('objections-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    const C = window.BOWNOW_CONTENT;
    if (!C) return;

    let html = '';
    C.objections.forEach(function (q) {
      html += '<div class="accordion-item" id="obj-' + q.id + '">';
      html += '<button class="accordion-header">';
      html += '<span class="obj-tag">' + q.tag + '</span>';
      html += '<span class="obj-question">' + q.question + '</span>';
      html += '<span class="accordion-icon">＋</span>';
      html += '</button>';
      html += '<div class="accordion-body">';
      html += '<div class="obj-answer">' + q.answer.replace(/\n/g, '<br>') + '</div>';
      html += '</div></div>';
    });

    container.innerHTML = html;
    initAccordions();
  }

  // ─── フォローメールテンプレート ───────────────────────────
  function initEmailTemplates() {
    const container = document.getElementById('email-templates-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    const C = window.BOWNOW_CONTENT;
    if (!C) return;

    let html = '';
    C.emailTemplates.forEach(function (t) {
      html += '<div class="card email-card">';
      html += '<div class="email-card-header">';
      html += '<div><span class="email-tag">' + t.tag + '</span><h3>' + t.title + '</h3></div>';
      html += '</div>';
      html += '<div class="email-subject"><strong>件名：</strong>' + escapeHtml(t.subject) + '</div>';
      html += '<div class="email-body-wrap">';
      html += '<div class="email-body-header"><span>本文</span>';
      html += '<button class="copy-btn" data-copy="件名：' + escapeAttr(t.subject) + '\n\n' + escapeAttr(t.body) + '">📋 全文コピー</button>';
      html += '</div>';
      html += '<pre class="email-body">' + escapeHtml(t.body) + '</pre>';
      html += '</div></div>';
    });

    container.innerHTML = html;
    initCopyButtons();
  }

  // ─── アコーディオン ───────────────────────────────────────
  function initAccordions() {
    document.querySelectorAll('.accordion-item:not([data-accordion-bound])').forEach(function (item) {
      item.dataset.accordionBound = '1';
      const header = item.querySelector('.accordion-header');
      const body = item.querySelector('.accordion-body');
      const icon = item.querySelector('.accordion-icon');
      if (!header || !body) return;

      header.addEventListener('click', function () {
        const isOpen = item.classList.contains('open');
        item.classList.toggle('open', !isOpen);
        if (icon) icon.textContent = isOpen ? '＋' : '－';
        body.style.maxHeight = isOpen ? null : body.scrollHeight + 'px';
      });
    });
  }

  // ─── コピーボタン ─────────────────────────────────────────
  function initCopyButtons() {
    document.querySelectorAll('.copy-btn:not([data-copy-bound])').forEach(function (btn) {
      btn.dataset.copyBound = '1';
      btn.addEventListener('click', function () {
        const text = this.dataset.copy || '';
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = '✅ コピーしました';
          setTimeout(function () { btn.textContent = '📋 コピー'; }, 2000);
        }).catch(function () {
          // fallback
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.textContent = '✅ コピーしました';
          setTimeout(function () { btn.textContent = '📋 コピー'; }, 2000);
        });
      });
    });
  }

  // ─── スクロールトップボタン ───────────────────────────────
  function initScrollTop() {
    const btn = document.getElementById('scroll-top-btn');
    const main = document.getElementById('main-content');
    if (!btn || !main) return;

    if (!btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        main.scrollTo({ top: 0, behavior: 'smooth' });
      });
      main.addEventListener('scroll', function () {
        btn.style.opacity = main.scrollTop > 300 ? '1' : '0';
        btn.style.pointerEvents = main.scrollTop > 300 ? 'auto' : 'none';
      });
    }
  }

  // ─── ユーティリティ ───────────────────────────────────────
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  // ─── 公開 ──────────────────────────────────────────────────
  window.UI = {
    onPageChange: onPageChange,
    calcScore: calcScore,
    calcROI: calcROI,
  };

})();
