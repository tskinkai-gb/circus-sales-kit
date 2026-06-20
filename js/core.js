/**
 * core.js
 * SPA基盤エンジン
 * ページ切替・ナビ・検索・キーボードショートカット・モバイルメニュー
 */

(function () {
  'use strict';

  // ページ定義
  const PAGES = [
    { id: 'welcome',        label: 'ウェルカム',            icon: '🏠' },
    { id: 'hearing',        label: 'ヒアリングシート',      icon: '📝' },
    { id: 'fit-score',      label: 'フィットスコア診断',    icon: '🎯' },
    { id: 'plan-compare',   label: 'プラン比較・料金表',    icon: '💰' },
    { id: 'roi-simulator',  label: 'ROIシミュレーター',     icon: '📊' },
    { id: 'scenarios',      label: '活用シナリオ集',        icon: '🗂️' },
    { id: 'cross-sell',     label: '横展開トーク',          icon: '🤝' },
    { id: 'objections',     label: '懸念・反論Q&A',         icon: '💬' },
    { id: 'email-templates',label: 'フォローメール',        icon: '✉️' },
  ];

  let currentPage = 0;
  let searchOpen = false;

  // ─── 初期化 ────────────────────────────────────────────────
  function init() {
    buildNav();
    buildPageButtons();
    bindKeyboard();
    bindMobileMenu();
    bindSearch();
    goTo(0);
  }

  // ─── ナビビルド ────────────────────────────────────────────
  function buildNav() {
    const nav = document.getElementById('side-nav-list');
    if (!nav) return;
    nav.innerHTML = '';
    PAGES.forEach(function (p, idx) {
      const li = document.createElement('li');
      li.innerHTML = '<button class="nav-btn" data-page="' + idx + '">' +
        '<span class="nav-icon">' + p.icon + '</span>' +
        '<span class="nav-label">' + p.label + '</span>' +
        '</button>';
      li.querySelector('button').addEventListener('click', function () {
        goTo(idx);
        closeMobileMenu();
      });
      nav.appendChild(li);
    });
  }

  // ─── ページ切替ボタン ──────────────────────────────────────
  function buildPageButtons() {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentPage - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentPage + 1); });
  }

  // ─── ページ移動 ────────────────────────────────────────────
  function goTo(idx) {
    if (idx < 0 || idx >= PAGES.length) return;
    currentPage = idx;
    const pageId = PAGES[idx].id;

    // ページ切替
    document.querySelectorAll('.page-section').forEach(function (el) {
      el.classList.remove('active');
    });
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    // ナビハイライト
    document.querySelectorAll('.nav-btn').forEach(function (btn, i) {
      btn.classList.toggle('active', i === idx);
    });

    // トップバーページ名
    const titleEl = document.getElementById('current-page-title');
    if (titleEl) titleEl.textContent = PAGES[idx].icon + ' ' + PAGES[idx].label;

    // 前後ボタン
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === PAGES.length - 1;

    // ページカウンター
    const counter = document.getElementById('page-counter');
    if (counter) counter.textContent = (idx + 1) + ' / ' + PAGES.length;

    // スクロールトップ
    const main = document.getElementById('main-content');
    if (main) main.scrollTop = 0;

    // ページ固有初期化
    if (window.UI && window.UI.onPageChange) {
      window.UI.onPageChange(pageId);
    }
  }

  // ─── キーボードショートカット ──────────────────────────────
  function bindKeyboard() {
    document.addEventListener('keydown', function (e) {
      const active = document.activeElement;
      const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT');

      if (e.key === 'Escape') {
        if (searchOpen) closeSearch();
        return;
      }

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        openSearch();
        return;
      }

      if (isInput || searchOpen) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goTo(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goTo(currentPage - 1);
      }
    });
  }

  // ─── モバイルメニュー ─────────────────────────────────────
  function bindMobileMenu() {
    const btn = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('mobile-overlay');
    if (btn) btn.addEventListener('click', toggleMobileMenu);
    if (overlay) overlay.addEventListener('click', closeMobileMenu);
  }

  function toggleMobileMenu() {
    document.body.classList.toggle('mobile-menu-open');
  }

  function closeMobileMenu() {
    document.body.classList.remove('mobile-menu-open');
  }

  // ─── 検索 ─────────────────────────────────────────────────
  function bindSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');

    if (searchBtn) searchBtn.addEventListener('click', openSearch);
    if (searchClose) searchClose.addEventListener('click', closeSearch);
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        renderSearchResults(this.value.trim());
      });
    }
  }

  function openSearch() {
    searchOpen = true;
    const overlay = document.getElementById('search-overlay');
    if (overlay) overlay.classList.add('active');
    const input = document.getElementById('search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    renderSearchResults('');
  }

  function closeSearch() {
    searchOpen = false;
    const overlay = document.getElementById('search-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  function renderSearchResults(query) {
    const list = document.getElementById('search-results');
    if (!list) return;

    if (!query) {
      list.innerHTML = '<p class="search-hint">← → でページ移動 ／ Escで閉じる</p>';
      return;
    }

    const q = query.toLowerCase();
    const results = PAGES.filter(function (p) {
      return p.label.toLowerCase().includes(q) || p.id.includes(q);
    });

    if (results.length === 0) {
      list.innerHTML = '<p class="search-no-result">「' + escapeHtml(query) + '」に一致するページが見つかりませんでした</p>';
      return;
    }

    list.innerHTML = results.map(function (p) {
      const idx = PAGES.indexOf(p);
      return '<button class="search-result-item" data-idx="' + idx + '">' +
        '<span class="search-result-icon">' + p.icon + '</span>' +
        '<span>' + p.label + '</span>' +
        '</button>';
    }).join('');

    list.querySelectorAll('.search-result-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.dataset.idx);
        closeSearch();
        goTo(idx);
      });
    });
  }

  // ─── ユーティリティ ───────────────────────────────────────
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // ─── 公開API ──────────────────────────────────────────────
  window.Core = {
    goTo: goTo,
    getCurrentPage: function () { return currentPage; },
    getPages: function () { return PAGES; },
    escapeHtml: escapeHtml,
  };

  // DOM準備後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
