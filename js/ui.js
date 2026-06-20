/**
 * ui.js
 * UIインタラクション・フィットスコア計算・ROIシミュレーター
 * ヒアリングシート ↔ フィットスコア 自動連携を含む
 */

(function () {
  'use strict';

  // ─── ページ切替時フック ───────────────────────────────────
  function onPageChange(pageId) {
    switch (pageId) {
      case 'hearing':        initHearing(); break;
      case 'fit-score':      initFitScore(); break;
      case 'plan-compare':   initPlanCompare(); break;
      case 'roi-simulator':  initROI(); break;
      case 'scenarios':      initScenarios(); break;
      case 'cross-sell':     initCrossSell(); break;
      case 'objections':     initObjections(); break;
      case 'email-templates': initEmailTemplates(); break;
    }
    initScrollTop();
  }

  // ─── 共有ステート管理 ────────────────────────────────────
  function setChecked(id, value) {
    if (!window.BOWNOW_STATE) return;
    window.BOWNOW_STATE.checkedItems[id] = value;
  }

  function isChecked(id) {
    if (!window.BOWNOW_STATE) return false;
    return !!window.BOWNOW_STATE.checkedItems[id];
  }

  // カテゴリ別スコアを計算
  function calcCategoryScores() {
    var CFG = window.BOWNOW_CONFIG;
    if (!CFG) return {};
    var result = {};
    CFG.scoring.categories.forEach(function (cat) {
      var score = 0;
      cat.questions.forEach(function (q) {
        if (isChecked(q.id)) score += q.score;
      });
      result[cat.id] = score;
    });
    return result;
  }

  function calcTotalScore() {
    var scores = calcCategoryScores();
    return Object.values(scores).reduce(function (a, b) { return a + b; }, 0);
  }

  function getTier(total) {
    var CFG = window.BOWNOW_CONFIG;
    if (!CFG) return null;
    return CFG.scoring.tiers.find(function (t) { return total >= t.min && total <= t.max; });
  }

  // ─── ヒアリングシート ─────────────────────────────────────
  function initHearing() {
    var container = document.getElementById('hearing-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    var C = window.BOWNOW_CONTENT;
    var CFG = window.BOWNOW_CONFIG;
    if (!C || !CFG) return;

    var html = '';

    // 顧客基本情報
    html += '<div class="card">';
    html += '<h3 class="card-title"><svg class="card-title-icon lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>顧客基本情報</h3>';
    html += '<div class="form-grid">';
    C.hearing.companyFields.forEach(function (f) {
      html += '<div class="form-group">';
      html += '<label class="form-label" for="hf-' + f.id + '">' + f.label + '</label>';
      if (f.type === 'select') {
        html += '<select class="form-select" id="hf-' + f.id + '">';
        html += '<option value="">選択してください</option>';
        f.options.forEach(function (o) { html += '<option>' + escapeHtml(o) + '</option>'; });
        html += '</select>';
      } else {
        html += '<input class="form-input" type="text" id="hf-' + f.id + '" placeholder="' + escapeHtml(f.placeholder || '') + '">';
      }
      html += '</div>';
    });
    html += '</div></div>';

    // スコアリングセクション（ヒアリングシートとフィットスコアの連携部分）
    C.hearing.scoredSections.forEach(function (sec) {
      var catCfg = CFG.scoring.categories.find(function (c) { return c.id === sec.categoryId; });
      html += '<div class="hearing-section" id="hs-' + sec.categoryId + '">';
      html += '<div class="hearing-section-header" style="background:' + sec.colorBg + '; border-color:' + sec.color + '22;">';
      html += '<div class="hearing-section-badge" style="background:' + sec.color + '18; color:' + sec.color + ';">';
      html += iconSvg(sec.icon);
      html += '</div>';
      html += '<div class="hearing-section-title" style="color:' + sec.color + ';">' + escapeHtml(sec.categoryName) + '</div>';
      html += '<div class="hearing-section-intro">' + escapeHtml(sec.intro) + '</div>';
      html += '<div class="hearing-section-score" id="hs-score-' + sec.categoryId + '" style="background:' + sec.colorBg + '; color:' + sec.color + ';">0 / 20点</div>';
      html += '</div>';
      html += '<div class="hearing-section-body">';
      html += '<div class="checklist">';
      sec.questions.forEach(function (q) {
        var checked = isChecked(q.id);
        html += '<label class="check-item' + (checked ? ' is-checked' : '') + '" id="hitem-' + q.id + '">';
        html += '<input type="checkbox" class="check-box hearing-check" data-id="' + q.id + '" data-cat="' + sec.categoryId + '" data-score="5"' + (checked ? ' checked' : '') + '>';
        html += '<span class="check-text">' + escapeHtml(q.text);
        if (q.note) html += '<span class="check-note">' + escapeHtml(q.note) + '</span>';
        html += '</span></label>';
      });
      html += '</div></div></div>';
    });

    // メモ欄
    html += '<div class="card">';
    html += '<h3 class="card-title"><svg class="card-title-icon lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>ヒアリングメモ</h3>';
    html += '<textarea class="form-textarea" id="hearing-memo" placeholder="商談中に気になったことや顧客の発言をメモしてください..."></textarea>';
    html += '</div>';

    // スコアサマリー（フィットスコアへのリンク）
    html += '<div class="hearing-score-summary" id="hearing-score-summary">';
    html += '<div><div class="hearing-score-total" id="hs-total">0</div><div class="hearing-score-label">/ 100点</div></div>';
    html += '<div class="hearing-score-bars" id="hs-bars"></div>';
    html += '<div class="hearing-score-action">';
    html += '<div class="hearing-score-tier" id="hs-tier-badge"></div>';
    html += '<button class="hearing-goto-btn" onclick="window.Core && window.Core.goTo(2)">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:14px;height:14px;display:inline;margin-right:4px;vertical-align:-2px;"><path d="m9 18 6-6-6-6"/></svg>フィットスコアを確認</button>';
    html += '</div></div>';

    container.innerHTML = html;

    // ヒアリングチェック変更イベント
    container.querySelectorAll('.hearing-check').forEach(function (cb) {
      cb.addEventListener('change', function () {
        setChecked(this.dataset.id, this.checked);
        var label = this.closest('.check-item');
        if (label) label.classList.toggle('is-checked', this.checked);
        updateHearingScoreSummary();
        // フィットスコアページが開いていれば更新
        syncFitScoreIfVisible();
      });
    });

    // メモ保存
    var memoEl = document.getElementById('hearing-memo');
    if (memoEl && window.BOWNOW_STATE) {
      memoEl.value = window.BOWNOW_STATE.hearingNotes || '';
      memoEl.addEventListener('input', function () {
        window.BOWNOW_STATE.hearingNotes = this.value;
      });
    }

    updateHearingScoreSummary();
    lucideInit();
  }

  function updateHearingScoreSummary() {
    var CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    var scores = calcCategoryScores();
    var total = Object.values(scores).reduce(function (a, b) { return a + b; }, 0);

    // カテゴリ別スコアバッジ更新
    CFG.scoring.categories.forEach(function (cat) {
      var badge = document.getElementById('hs-score-' + cat.id);
      if (badge) badge.textContent = (scores[cat.id] || 0) + ' / 20点';
    });

    // サマリー更新
    var totalEl = document.getElementById('hs-total');
    if (totalEl) totalEl.textContent = total;

    var barsEl = document.getElementById('hs-bars');
    if (barsEl) {
      barsEl.innerHTML = CFG.scoring.categories.map(function (cat) {
        var s = scores[cat.id] || 0;
        return '<div class="hearing-score-bar-row">' +
          '<div class="hearing-score-bar-label">' + cat.name + '</div>' +
          '<div class="hearing-score-bar-track"><div class="hearing-score-bar-fill" style="width:' + (s / 20 * 100) + '%; background:' + cat.color + ';"></div></div>' +
          '<div class="hearing-score-bar-pts" style="color:' + cat.color + ';">' + s + '</div>' +
          '</div>';
      }).join('');
    }

    var tier = getTier(total);
    var tierEl = document.getElementById('hs-tier-badge');
    if (tierEl && tier) {
      tierEl.textContent = tier.label;
      tierEl.style.color = tier.color;
    }
  }

  function syncFitScoreIfVisible() {
    var fitPage = document.getElementById('page-fit-score');
    if (fitPage && fitPage.classList.contains('active')) {
      updateFitScoreDisplay();
    }
  }

  // ─── フィットスコア診断 ───────────────────────────────────
  function initFitScore() {
    var container = document.getElementById('fit-score-dynamic');
    var CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    // 既にビルト済みでも同期は毎回行う
    if (!container.dataset.built) {
      container.dataset.built = '1';
      buildFitScoreHTML(container, CFG);
    }

    // ヒアリングの状態を同期
    container.querySelectorAll('.score-check').forEach(function (cb) {
      cb.checked = isChecked(cb.dataset.id);
    });

    updateFitScoreDisplay();
    lucideInit();
  }

  function buildFitScoreHTML(container, CFG) {
    var html = '';

    CFG.scoring.categories.forEach(function (cat) {
      html += '<div class="score-category-card" id="cat-' + cat.id + '" style="border-color:' + cat.color + '30;">';
      html += '<div class="score-cat-header" style="background:' + cat.colorBg + '; border-color:' + cat.color + '22;">';
      html += '<div class="score-cat-icon-wrap" style="background:' + cat.color + '18; color:' + cat.color + ';">' + iconSvg(cat.icon) + '</div>';
      html += '<div class="score-cat-name" style="color:' + cat.color + ';">' + escapeHtml(cat.name) + '</div>';
      html += '<div class="score-cat-badge" id="fcat-score-' + cat.id + '" style="background:' + cat.colorBg + '; color:' + cat.color + ';">0 / 20点</div>';
      html += '</div>';
      html += '<div class="score-cat-body">';
      html += '<div class="checklist">';
      cat.questions.forEach(function (q) {
        html += '<label class="check-item">';
        html += '<input type="checkbox" class="check-box score-check" data-id="' + q.id + '" data-cat="' + cat.id + '" data-score="' + q.score + '">';
        html += '<span class="check-text">' + escapeHtml(q.text) + '<span class="score-pts">（+' + q.score + '点）</span></span>';
        html += '</label>';
      });
      html += '</div></div></div>';
    });

    // スコア結果
    html += '<div class="score-result-card" id="score-result">';
    html += '<div class="score-gauge-row"><div class="score-number" id="score-total">0</div><div class="score-max">/ 100点</div></div>';
    html += '<div style="text-align:center;"><div class="score-tier-badge" id="score-tier">チェックを入れるとスコアが表示されます</div></div>';
    html += '<div class="score-bar-track"><div class="score-bar-fill" id="score-bar" style="width:0%"></div></div>';

    // カテゴリ別内訳
    html += '<div class="score-category-breakdown" id="score-breakdown">';
    CFG.scoring.categories.forEach(function (cat) {
      html += '<div class="score-breakdown-item">';
      html += '<div class="score-breakdown-label">' + escapeHtml(cat.name) + '</div>';
      html += '<div class="score-breakdown-value" id="bd-' + cat.id + '" style="color:' + cat.color + ';">0</div>';
      html += '</div>';
    });
    html += '</div>';

    html += '<div class="score-next-action" id="score-next-action"></div>';
    html += '<div class="score-recommend" id="score-recommend"></div>';
    html += '</div>';

    container.innerHTML = html;

    // イベントバインド（フィットスコア側のチェック変更）
    container.querySelectorAll('.score-check').forEach(function (cb) {
      cb.addEventListener('change', function () {
        setChecked(this.dataset.id, this.checked);
        // ヒアリングページのチェックも同期
        var hcb = document.querySelector('.hearing-check[data-id="' + this.dataset.id + '"]');
        if (hcb) {
          hcb.checked = this.checked;
          var label = hcb.closest('.check-item');
          if (label) label.classList.toggle('is-checked', this.checked);
          updateHearingScoreSummary();
        }
        updateFitScoreDisplay();
      });
    });
  }

  function updateFitScoreDisplay() {
    var CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    var scores = calcCategoryScores();
    var total = Object.values(scores).reduce(function (a, b) { return a + b; }, 0);

    // フィットスコアページのチェックボックスを同期
    document.querySelectorAll('.score-check').forEach(function (cb) {
      cb.checked = isChecked(cb.dataset.id);
    });

    // カテゴリバッジ
    CFG.scoring.categories.forEach(function (cat) {
      var badge = document.getElementById('fcat-score-' + cat.id);
      if (badge) badge.textContent = (scores[cat.id] || 0) + ' / 20点';
      var bdVal = document.getElementById('bd-' + cat.id);
      if (bdVal) bdVal.textContent = scores[cat.id] || 0;
    });

    // トータル
    var totalEl = document.getElementById('score-total');
    if (totalEl) totalEl.textContent = total;

    // バー
    var bar = document.getElementById('score-bar');
    if (bar) bar.style.width = total + '%';

    var tier = getTier(total);
    if (!tier) return;

    // ティアバッジ
    var tierEl = document.getElementById('score-tier');
    if (tierEl) {
      tierEl.textContent = tier.emoji + ' ' + tier.label;
      tierEl.style.color = tier.color;
      tierEl.style.background = tier.bg;
      tierEl.style.border = '1px solid ' + tier.border;
    }

    var nextEl = document.getElementById('score-next-action');
    if (nextEl) nextEl.innerHTML = '<strong>推奨アクション：</strong><br>' + escapeHtml(tier.nextAction);

    var recEl = document.getElementById('score-recommend');
    if (recEl) recEl.innerHTML = '推奨プラン：<strong>' + escapeHtml(tier.planRecommend) + '</strong>';
  }

  // ─── プラン比較 ───────────────────────────────────────────
  function initPlanCompare() {
    var container = document.getElementById('plan-compare-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    var CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    var plans = CFG.plans;

    // 料金カード
    var html = '<div class="plan-cards">';
    plans.forEach(function (p) {
      var hl = p.highlight ? ' plan-card--highlight' : '';
      html += '<div class="plan-card' + hl + '">';
      if (p.tag) html += '<div class="plan-tag">' + escapeHtml(p.tag) + '</div>';
      html += '<div class="plan-name">' + escapeHtml(p.name) + '</div>';
      html += '<div class="plan-price">';
      if (p.monthly === 0) {
        html += '<span class="plan-price-num">無料</span>';
      } else {
        html += '<span class="plan-price-num">¥' + p.monthly.toLocaleString() + '</span><span class="plan-price-unit">/月（税抜）</span>';
      }
      html += '</div>';
      html += '<div class="plan-initial">' + (p.initial === 0 ? '初期費用：無料' : '初期費用：¥' + p.initial.toLocaleString()) + '</div>';
      html += '<ul class="plan-specs">';
      html += '<li>' + iconSvg('users', 13) + 'リード上限：' + p.leadsLimit.toLocaleString() + '件</li>';
      html += '<li>' + iconSvg('monitor', 13) + 'PV：' + p.pvLimit.toLocaleString() + ' ' + p.pvNote + '</li>';
      html += '<li>' + iconSvg('clock', 13) + 'ログ保有：' + p.logRetention + '</li>';
      html += '<li>' + iconSvg('calendar', 13) + '最低利用：' + p.minTerm + '</li>';
      html += '</ul></div>';
    });
    html += '</div>';

    // 機能比較表
    var featureRows = [
      { key: 'emailDelivery',       label: 'メール配信' },
      { key: 'emailOpenRate',       label: '開封率・クリック率取得',    bool: true },
      { key: 'emailScheduled',      label: '日時指定配信',              bool: true },
      { key: 'emailTemplate',       label: 'HTMLテンプレート' },
      { key: 'unlimitedSites',      label: '接続サイト数無制限',        bool: true },
      { key: 'formStepMail',        label: 'フォームステップメール',    bool: true },
      { key: 'scenario',            label: '簡易シナリオ（条件トリガー）', bool: true },
      { key: 'customField',         label: 'カスタム項目',              bool: true },
      { key: 'apiIntegration',      label: 'API連携',                   bool: true },
      { key: 'crossDomainTracking', label: 'クロスドメイントラッキング', bool: true },
      { key: 'highTouchSupport',    label: 'ハイタッチサポート' },
    ];

    html += '<div class="section-title">' + iconSvg('table') + '機能比較表</div>';
    html += '<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>機能</th>';
    plans.forEach(function (p) { html += '<th>' + escapeHtml(p.name) + '</th>'; });
    html += '</tr></thead><tbody>';
    featureRows.forEach(function (row) {
      html += '<tr><td class="feature-name">' + escapeHtml(row.label) + '</td>';
      plans.forEach(function (p) {
        var val = p.features[row.key];
        var cell = row.bool
          ? (val ? '<span class="feat-yes">✓</span>' : '<span class="feat-no">—</span>')
          : (val ? escapeHtml(String(val)) : '<span class="feat-no">—</span>');
        html += '<td>' + cell + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    // 注記
    html += '<div class="card notes-card"><h3 class="card-title">' + iconSvg('info', 16) + '共通の注意事項</h3><ul class="notes-list">';
    CFG.planNotes.forEach(function (note) { html += '<li>' + escapeHtml(note) + '</li>'; });
    html += '</ul></div>';

    // 他社比較
    html += '<div class="section-title">' + iconSvg('bar-chart-2') + '他社MAツールとの比較（参考）</div>';
    html += '<div class="compare-table-wrap"><table class="compare-table competitor-table"><thead><tr><th>ツール</th><th>月額（税抜・概算）</th><th>初期費用</th><th>主な強み</th><th>ターゲット</th></tr></thead><tbody>';
    CFG.competitors.forEach(function (c) {
      var rowCls = c.isBownow ? ' class="bownow-row"' : (c.isNoTool ? ' class="no-tool-row"' : '');
      var monthly = c.monthly === 0 ? (c.isNoTool ? '0円（人件費は発生）' : '無料') : '¥' + c.monthly.toLocaleString() + '〜';
      var initial = c.initial === 0 ? '0円' : '¥' + c.initial.toLocaleString() + '〜';
      html += '<tr' + rowCls + '><td><strong>' + escapeHtml(c.name) + '</strong>' + (c.isBownow ? ' <span class="our-badge">自社</span>' : '') + '</td>';
      html += '<td>' + monthly + '</td><td>' + initial + '</td><td>' + escapeHtml(c.strength) + '</td><td>' + escapeHtml(c.target) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    html += '<p class="table-note">※ 競合他社の料金は各社公開情報をもとにした参考値です（税抜・概算）。最新情報は各社サイトにてご確認ください。</p>';

    container.innerHTML = html;
    lucideInit();
  }

  // ─── ROIシミュレーター ────────────────────────────────────
  function initROI() {
    var container = document.getElementById('roi-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    var CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    var D = CFG.roi.defaults;

    var inputs = [
      { id: 'roi_pv',    label: '月間サイトPV数（千PV）',        min: 1,    max: 1000,  step: 1,    val: D.monthlyPvk,         unit: '千PV' },
      { id: 'roi_leads', label: '月間新規リード数（現状）',       min: 0,    max: 500,   step: 1,    val: D.currentLeads,       unit: '件' },
      { id: 'roi_staff', label: 'リードフォロー担当者数',         min: 1,    max: 20,    step: 1,    val: D.staffCount,         unit: '名' },
      { id: 'roi_hours', label: '1人あたり月間フォロー工数',      min: 0,    max: 200,   step: 1,    val: D.staffHoursPerMonth, unit: '時間' },
      { id: 'roi_rate',  label: '担当者の時給換算',               min: 1000, max: 10000, step: 500,  val: D.staffHourlyRate,    unit: '円' },
      { id: 'roi_email', label: '現在のメール配信ツール月額',     min: 0,    max: 100000,step: 1000, val: D.currentEmailTool,   unit: '円' },
    ];

    var html = '<div class="roi-layout">';
    html += '<div class="card roi-inputs"><h3 class="card-title">' + iconSvg('sliders') + '現状を入力してください</h3>';
    inputs.forEach(function (inp) {
      html += '<div class="roi-input-group"><label class="form-label">' + escapeHtml(inp.label) + '</label>';
      html += '<div class="roi-slider-row">';
      html += '<input type="range" class="roi-slider" id="' + inp.id + '_slider" min="' + inp.min + '" max="' + inp.max + '" step="' + inp.step + '" value="' + inp.val + '">';
      html += '<input type="number" class="roi-number" id="' + inp.id + '_num" min="' + inp.min + '" max="' + inp.max + '" value="' + inp.val + '">';
      html += '<span class="roi-unit">' + escapeHtml(inp.unit) + '</span>';
      html += '</div></div>';
    });
    html += '</div>';

    html += '<div class="roi-results">';
    html += '<div class="card roi-result-card">';
    html += '<div class="roi-result-label">' + iconSvg('minus-circle', 14) + ' 現状維持（年間コスト）</div>';
    html += '<div class="roi-result-value" id="roi-current-val">—</div></div>';

    html += '<div class="card roi-result-card roi-result-card--highlight">';
    html += '<div class="roi-result-label">' + iconSvg('check-circle', 14) + ' BowNow スタンダード（年間コスト）</div>';
    html += '<div class="roi-result-value" id="roi-bownow-val">—</div>';
    html += '<div class="roi-result-sub" id="roi-saving"></div></div>';

    html += '<div class="card roi-result-card roi-result-card--competitor">';
    html += '<div class="roi-result-label">' + iconSvg('bar-chart', 14) + ' 他社MA・SATORI参考（年間コスト）</div>';
    html += '<div class="roi-result-value" id="roi-competitor-val">—</div></div>';

    html += '<div class="card roi-detail">';
    html += '<h4>' + iconSvg('file-text', 15) + '試算の詳細</h4>';
    html += '<div id="roi-detail-text"></div>';
    html += '<div class="roi-recommend" id="roi-plan-recommend"></div></div>';

    html += '<div class="roi-assumptions card"><h4>' + iconSvg('info', 15) + '試算の前提</h4><ul>';
    CFG.roi.assumptions.forEach(function (a) { html += '<li>' + escapeHtml(a) + '</li>'; });
    html += '</ul></div>';

    html += '</div></div>'; // roi-results, roi-layout

    container.innerHTML = html;

    // スライダー同期
    inputs.forEach(function (inp) {
      var slider = document.getElementById(inp.id + '_slider');
      var num    = document.getElementById(inp.id + '_num');
      if (slider && num) {
        slider.addEventListener('input', function () { num.value = this.value; updateSliderFill(this); calcROI(inputs); });
        num.addEventListener('input', function () { slider.value = this.value; updateSliderFill(slider); calcROI(inputs); });
        updateSliderFill(slider);
      }
    });

    calcROI(inputs);
    lucideInit();
  }

  function updateSliderFill(slider) {
    var min = parseFloat(slider.min) || 0;
    var max = parseFloat(slider.max) || 100;
    var val = parseFloat(slider.value) || 0;
    var pct = ((val - min) / (max - min) * 100).toFixed(1);
    slider.style.background = 'linear-gradient(to right, var(--color-primary) ' + pct + '%, var(--color-border) ' + pct + '%)';
  }

  function calcROI(inputs) {
    var CFG = window.BOWNOW_CONFIG;
    if (!CFG) return;

    function getVal(id) {
      var el = document.getElementById(id + '_num');
      return el ? parseFloat(el.value) || 0 : 0;
    }

    var pvk      = getVal('roi_pv');
    var leads    = getVal('roi_leads');
    var staff    = getVal('roi_staff');
    var hours    = getVal('roi_hours');
    var rate     = getVal('roi_rate');
    var emailFee = getVal('roi_email');

    var monthlyLabor = staff * hours * rate;
    var yearCurrentCost = (monthlyLabor + emailFee) * 12;

    var lrr = CFG.roi.laborReductionRate;
    var bownowMonthly = 36000;
    var bownowInitial = 100000;
    var reducedLabor = monthlyLabor * (1 - lrr);
    var yearBownowCost = (bownowMonthly + reducedLabor + emailFee) * 12 + bownowInitial;

    var satori = CFG.roi.competitorMonthly.satori;
    var satoriInitial = 300000;
    var yearSatoriCost = (satori + reducedLabor + emailFee) * 12 + satoriInitial;

    function fmt(n) { return '¥' + Math.round(n).toLocaleString(); }

    var el = function(id) { return document.getElementById(id); };
    if (el('roi-current-val'))    el('roi-current-val').textContent    = fmt(yearCurrentCost);
    if (el('roi-bownow-val'))     el('roi-bownow-val').textContent     = fmt(yearBownowCost);
    if (el('roi-competitor-val')) el('roi-competitor-val').textContent = fmt(yearSatoriCost);

    var saving = yearCurrentCost - yearBownowCost;
    var savingEl = el('roi-saving');
    if (savingEl) {
      if (saving > 0) {
        savingEl.textContent = '現状比 年間 ' + fmt(saving) + ' の削減効果';
        savingEl.style.color = 'var(--color-success)';
      } else {
        savingEl.textContent = '現状比 年間 ' + fmt(Math.abs(saving)) + ' の追加投資';
        savingEl.style.color = 'var(--color-warning)';
      }
    }

    // 推奨プラン
    var recommendPlan = 'フリーから開始';
    if (leads > 5000 || pvk > 300)       recommendPlan = 'プレミアム';
    else if (leads > 2000 || pvk > 100)  recommendPlan = 'ビジネス';
    else if (leads > 100 || pvk > 5)     recommendPlan = 'スタンダード';

    var detailEl = el('roi-detail-text');
    if (detailEl) {
      detailEl.innerHTML =
        '<table class="roi-detail-table">' +
        '<tr><td>現状の月間人件費（リード対応）</td><td>' + fmt(monthlyLabor) + '/月</td></tr>' +
        '<tr><td>現状のメール配信ツール費用</td><td>' + fmt(emailFee) + '/月</td></tr>' +
        '<tr><td>BowNow導入後の人件費（' + (lrr*100) + '%削減試算）</td><td>' + fmt(reducedLabor) + '/月</td></tr>' +
        '<tr><td>BowNow スタンダード月額</td><td>¥36,000/月</td></tr>' +
        '<tr><td>BowNow 初期費用（12ヶ月均し）</td><td>' + fmt(bownowInitial/12) + '/月</td></tr>' +
        '</table>';
    }

    var recEl = el('roi-plan-recommend');
    if (recEl) recEl.innerHTML = iconSvg('award', 15) + ' 入力値からの推奨プラン：<strong>' + escapeHtml(recommendPlan) + '</strong>';
  }

  // ─── 活用シナリオ ─────────────────────────────────────────
  function initScenarios() {
    var container = document.getElementById('scenarios-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    var C = window.BOWNOW_CONTENT;
    if (!C) return;

    var html = '<div class="scenario-tabs">';
    C.scenarios.forEach(function (s, i) {
      html += '<button class="scenario-tab' + (i === 0 ? ' active' : '') + '" data-scenario="' + s.id + '">';
      html += iconSvg(s.icon, 14) + escapeHtml(s.title) + '</button>';
    });
    html += '</div>';

    C.scenarios.forEach(function (s, i) {
      html += '<div class="scenario-panel' + (i === 0 ? ' active' : '') + '" id="scenario-' + s.id + '">';
      html += '<div class="card">';
      html += '<div class="scenario-tag" style="background:' + escapeHtml(s.tagColor) + ';">' + escapeHtml(s.tag) + '</div>';
      html += '<div class="scenario-title">' + escapeHtml(s.title) + '</div>';
      html += '<div class="scenario-desc">' + escapeHtml(s.description) + '</div>';
      html += '<div class="scenario-situation"><strong>想定状況</strong><p>' + escapeHtml(s.situation) + '</p></div>';
      html += '<div class="scenario-two-col">';
      html += '<div><strong>BowNowがフィットする理由</strong><ul>';
      s.bownowFit.forEach(function (f) { html += '<li>' + escapeHtml(f) + '</li>'; });
      html += '</ul></div>';
      html += '<div><strong>導入の流れ</strong><ol>';
      s.flow.forEach(function (f) { html += '<li>' + escapeHtml(f) + '</li>'; });
      html += '</ol></div>';
      html += '</div>';
      html += '<div class="scenario-recommend">' + iconSvg('star', 14) + '推奨プラン：<strong>' + escapeHtml(s.recommendPlan) + '</strong></div>';
      html += '</div></div>';
    });

    container.innerHTML = html;

    container.querySelectorAll('.scenario-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.dataset.scenario;
        container.querySelectorAll('.scenario-tab').forEach(function (b) { b.classList.remove('active'); });
        container.querySelectorAll('.scenario-panel').forEach(function (p) { p.classList.remove('active'); });
        this.classList.add('active');
        var panel = document.getElementById('scenario-' + id);
        if (panel) panel.classList.add('active');
      });
    });

    lucideInit();
  }

  // ─── 横展開トーク ─────────────────────────────────────────
  function initCrossSell() {
    var container = document.getElementById('cross-sell-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    var C = window.BOWNOW_CONTENT;
    if (!C) return;

    var talks = [C.crossSell.bluemonkey, C.crossSell.circusAds];
    var html = '';

    talks.forEach(function (t) {
      html += '<div class="card talk-card">';
      html += '<h3 class="card-title">' + iconSvg('message-circle', 17) + escapeHtml(t.title) + '</h3>';
      html += '<div class="talk-meta">';
      html += '<div class="talk-info-block"><div class="talk-info-label">' + iconSvg('user', 12) + '対象顧客</div><p>' + escapeHtml(t.situation) + '</p></div>';
      html += '<div class="talk-info-block"><div class="talk-info-label">' + iconSvg('alert-circle', 12) + '顧客の課題</div><p>' + escapeHtml(t.pain) + '</p></div>';
      html += '</div>';
      html += '<div class="talk-script-wrap">';
      html += '<div class="talk-script-header">';
      html += '<div class="talk-script-label">' + iconSvg('mic', 14) + 'トークスクリプト</div>';
      html += '<button class="copy-btn" data-copy="' + escapeAttr(t.talkScript) + '">' + iconSvg('copy', 13) + 'コピー</button>';
      html += '</div>';
      html += '<pre class="talk-text">' + escapeHtml(t.talkScript) + '</pre>';
      html += '</div>';
      html += '<div class="talk-benefits"><strong>提案のポイント</strong><ul>';
      t.benefits.forEach(function (b) { html += '<li>' + escapeHtml(b) + '</li>'; });
      html += '</ul></div>';
      html += '<div class="talk-recommend">' + iconSvg('star', 14) + '推奨プラン：<strong>' + escapeHtml(t.recommendPlan) + '</strong></div>';
      html += '</div>';
    });

    container.innerHTML = html;
    initCopyButtons();
    lucideInit();
  }

  // ─── Q&A ─────────────────────────────────────────────────
  function initObjections() {
    var container = document.getElementById('objections-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    var C = window.BOWNOW_CONTENT;
    if (!C) return;

    var html = '';
    C.objections.forEach(function (q) {
      html += '<div class="accordion-item">';
      html += '<button class="accordion-header">';
      html += '<span class="obj-tag" style="background:' + escapeHtml(q.tagColor) + ';">' + escapeHtml(q.tag) + '</span>';
      html += '<span class="obj-question">' + escapeHtml(q.question) + '</span>';
      html += '<span class="accordion-toggle"><svg class="lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg></span>';
      html += '</button>';
      html += '<div class="accordion-body"><div class="obj-answer">' + escapeHtml(q.answer) + '</div></div>';
      html += '</div>';
    });

    container.innerHTML = html;
    initAccordions();
  }

  // ─── メールテンプレート ───────────────────────────────────
  function initEmailTemplates() {
    var container = document.getElementById('email-templates-dynamic');
    if (!container || container.dataset.built) return;
    container.dataset.built = '1';

    var C = window.BOWNOW_CONTENT;
    if (!C) return;

    var html = '';
    C.emailTemplates.forEach(function (t) {
      html += '<div class="card email-card">';
      html += '<div class="email-card-top">';
      html += '<span class="email-tag" style="background:' + escapeHtml(t.tagColor) + ';">' + escapeHtml(t.tag) + '</span>';
      html += '<h3>' + escapeHtml(t.title) + '</h3>';
      html += '</div>';
      html += '<div class="email-subject"><span class="email-subject-label">件名：</span>' + escapeHtml(t.subject) + '</div>';
      html += '<div class="email-body-wrap">';
      html += '<div class="email-body-header"><span>' + iconSvg('mail', 13) + ' 本文</span>';
      html += '<button class="copy-btn" data-copy="件名：' + escapeAttr(t.subject) + '\n\n' + escapeAttr(t.body) + '">' + iconSvg('copy', 13) + '全文コピー</button>';
      html += '</div>';
      html += '<pre class="email-body">' + escapeHtml(t.body) + '</pre>';
      html += '</div></div>';
    });

    container.innerHTML = html;
    initCopyButtons();
    lucideInit();
  }

  // ─── アコーディオン ───────────────────────────────────────
  function initAccordions() {
    document.querySelectorAll('.accordion-item:not([data-accordion-bound])').forEach(function (item) {
      item.dataset.accordionBound = '1';
      var header = item.querySelector('.accordion-header');
      var body   = item.querySelector('.accordion-body');
      if (!header || !body) return;

      header.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        // 同レベルの他を閉じる（同一親要素内）
        var siblings = item.parentElement.querySelectorAll('.accordion-item.open');
        siblings.forEach(function (sib) {
          if (sib !== item) {
            sib.classList.remove('open');
            var sb = sib.querySelector('.accordion-body');
            if (sb) sb.style.maxHeight = null;
          }
        });

        item.classList.toggle('open', !isOpen);
        body.style.maxHeight = isOpen ? null : body.scrollHeight + 'px';
      });
    });
  }

  // ─── コピーボタン ─────────────────────────────────────────
  function initCopyButtons() {
    document.querySelectorAll('.copy-btn:not([data-copy-bound])').forEach(function (btn) {
      btn.dataset.copyBound = '1';
      btn.addEventListener('click', function () {
        var text = this.dataset.copy || '';
        var self = this;
        navigator.clipboard.writeText(text).then(function () {
          showCopied(self);
        }).catch(function () {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showCopied(self);
        });
      });
    });
  }

  function showCopied(btn) {
    var orig = btn.innerHTML;
    btn.innerHTML = iconSvg('check', 13) + 'コピーしました';
    btn.style.background = 'var(--color-success)';
    btn.style.borderColor = 'var(--color-success)';
    btn.style.color = '#fff';
    setTimeout(function () {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2000);
  }

  // ─── スクロールトップ ─────────────────────────────────────
  function initScrollTop() {
    var btn  = document.getElementById('scroll-top-btn');
    var main = document.getElementById('main-content');
    if (!btn || !main || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () { main.scrollTo({ top: 0, behavior: 'smooth' }); });
    main.addEventListener('scroll', function () {
      var show = main.scrollTop > 300;
      btn.style.opacity = show ? '1' : '0';
      btn.style.pointerEvents = show ? 'auto' : 'none';
    });
  }

  // ─── Lucide初期化 ─────────────────────────────────────────
  function lucideInit() {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  // ─── インラインSVGアイコン生成 ────────────────────────────
  // Lucideアイコンのパスを直接埋め込む（CDN読み込み前でも動くよう対応）
  var ICONS = {
    'target':            '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'globe':             '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    'users':             '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'circle-dollar-sign':'<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
    'flame':             '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    'settings':          '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'clipboard-list':    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    'layout-list':       '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M14 4h7"/><path d="M14 9h7"/><path d="M14 15h7"/><path d="M14 20h7"/>',
    'rocket':            '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    'trending-up':       '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    'calendar':          '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
    'phone':             '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    'refresh-cw':        '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    'link':              '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    'zap':               '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'user':              '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'bar-chart-2':       '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>',
    'table':             '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M8 21V8h13"/><path d="M3 8h5"/><path d="M3 13h5"/><path d="M3 18h5"/><path d="M8 8v13"/>',
    'info':              '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'sliders':           '<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',
    'minus-circle':      '<circle cx="12" cy="12" r="10"/><line x1="8" x2="16" y1="12" y2="12"/>',
    'check-circle':      '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'bar-chart':         '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
    'file-text':         '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>',
    'award':             '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    'star':              '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'message-circle':    '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'mic':               '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    'copy':              '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'check':             '<path d="M20 6 9 17l-5-5"/>',
    'mail':              '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'alert-circle':      '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    'monitor':           '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    'clock':             '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'search':            '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'chevron-right':     '<path d="m9 18 6-6-6-6"/>',
    'arrow-up':          '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'x':                 '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'menu':              '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  };

  function iconSvg(name, size) {
    var sz = size || 16;
    var d = ICONS[name] || '';
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">' + d + '</svg>';
  }

  // ─── ユーティリティ ───────────────────────────────────────
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function escapeAttr(str) { return String(str).replace(/"/g, '&quot;'); }

  // ─── 公開 ─────────────────────────────────────────────────
  window.UI = {
    onPageChange: onPageChange,
    iconSvg: iconSvg,
  };

})();
