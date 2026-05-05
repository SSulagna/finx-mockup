/* =============================================================================
   UST FinX Documentation Portal — Shared JavaScript
   ---------------------------------------------------------------------------
   Single-file hash-based router + shared interactivity for the mockup.

   Routes are declared inline in index.html via <section class="view"
   data-route="/path">. The router shows one matching view at a time,
   updates document.title, marks the active nav link, and handles browser
   back/forward via the hashchange event.

   Also handles:
     - Sign-in modal (open/close, ESC, click-outside, password check)
     - Internal-route gate (sessionStorage 'finx-internal-unlocked')
     - Sign-out (clears storage, returns to homepage)
     - Product tab switcher (data-tab / data-tab-group)
     - State indicator (bottom-right) reflecting current sign-in state

   See SPEC.md §8 for interaction specifications.
   ========================================================================== */

(function () {
  'use strict';

  // ---------- Constants ----------
  var DEMO_PASSWORD   = 'finx2026';
  var STORAGE_KEY     = 'finx-internal-unlocked';
  var THEME_KEY       = 'finx-theme';
  var DEFAULT_ROUTE   = '/';
  var SIGNIN_HASH_RE  = /^#\/?signin$/i;

  // ---------- Helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function isUnlocked() { try { return sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (_) { return false; } }

  // ---------- Theme toggle ----------
  function currentTheme() { return document.documentElement.getAttribute('data-theme') || 'dark'; }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    var label = $('#mobile-theme-label');
    if (label) label.textContent = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  }

  function toggleTheme() { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }

  // ---------- Mobile menu ----------
  function closeMobileMenu() {
    var m = $('#mobile-menu'), h = $('#nav-hamburger');
    if (m) { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); }
    if (h) { h.classList.remove('is-open'); h.setAttribute('aria-expanded', 'false'); }
  }

  function openMobileMenu() {
    var m = $('#mobile-menu'), h = $('#nav-hamburger');
    if (m) { m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); }
    if (h) { h.classList.add('is-open'); h.setAttribute('aria-expanded', 'true'); }
  }

  function toggleMobileMenu() {
    var m = $('#mobile-menu');
    if (!m) return;
    if (m.classList.contains('is-open')) closeMobileMenu(); else openMobileMenu();
  }

  // ---------- Routing ----------
  function parseHash() {
    var raw = (location.hash || '').replace(/^#/, '');
    if (raw === '' || raw === '/') return { route: DEFAULT_ROUTE, signin: false };
    if (SIGNIN_HASH_RE.test('#' + raw)) return { route: getCurrentRoute() || DEFAULT_ROUTE, signin: true };
    if (raw.charAt(0) !== '/') raw = '/' + raw;
    return { route: raw, signin: false };
  }

  function getCurrentRoute() {
    var v = $('.view.is-active');
    return v ? v.getAttribute('data-route') : null;
  }

  function findView(route) {
    var views = $$('.view');
    for (var i = 0; i < views.length; i++) {
      if (views[i].getAttribute('data-route') === route) return views[i];
    }
    // 404 fallback
    for (var j = 0; j < views.length; j++) {
      if (views[j].getAttribute('data-route') === '*') return views[j];
    }
    return views[0] || null;
  }

  function navigate(route) {
    var view = findView(route);
    if (!view) return;

    // Gate check for internal routes: keep the URL on the gated route
    // but render the homepage underneath while the sign-in modal is open.
    if (view.getAttribute('data-gated') === 'true' && !isUnlocked()) {
      var home = findView(DEFAULT_ROUTE);
      if (home) showView(home);
      setTimeout(openModal, 30);
      return;
    }

    showView(view);
  }

  function showView(view) {
    $$('.view').forEach(function (v) { v.classList.remove('is-active'); });
    view.classList.add('is-active');

    var title = view.getAttribute('data-title') || 'UST FinX';
    document.title = title;

    var route = view.getAttribute('data-route');
    updateActiveNav(route);

    // Close mobile menu on navigation
    closeMobileMenu();

    // Scroll to top
    window.scrollTo(0, 0);

    // Update body palette modifier (for internal purple)
    document.body.setAttribute('data-route-palette', view.getAttribute('data-palette') || '');

    // Hook for per-view JS (e.g. tab init for newly-shown content)
    document.dispatchEvent(new CustomEvent('view:enter', { detail: { route: route, view: view } }));
  }

  function updateActiveNav(route) {
    $$('.nav-link, [data-nav-route]').forEach(function (a) {
      var target = a.getAttribute('data-nav-route') || (a.getAttribute('href') || '').replace(/^#/, '');
      if (!target) return;
      var match = target === route ||
                  (target !== '/' && route.indexOf(target) === 0 &&
                   (route.length === target.length || route.charAt(target.length) === '/'));
      a.classList.toggle('is-active', !!match);
    });
  }

  function handleHashChange() {
    var parsed = parseHash();
    if (parsed.route !== getCurrentRoute()) navigate(parsed.route);
    if (parsed.signin) openModal();
  }

  // ---------- Sign-in modal ----------
  function modalEl() { return $('#signin-modal'); }

  function openModal() {
    var m = modalEl(); if (!m) return;
    m.classList.add('active');
    m.setAttribute('aria-hidden', 'false');
    var pw = $('input[type="password"]', m);
    if (pw) setTimeout(function () { pw.focus(); }, 40);
  }

  function closeModal() {
    var m = modalEl(); if (!m) return;
    m.classList.remove('active');
    m.setAttribute('aria-hidden', 'true');
    var err = $('.modal-error', m); if (err) err.textContent = '';
    if (SIGNIN_HASH_RE.test(location.hash)) {
      var current = getCurrentRoute() || DEFAULT_ROUTE;
      if (history && history.replaceState) {
        history.replaceState(null, '', '#' + current);
      } else {
        location.hash = '#' + current;
      }
    }
  }

  function trySignIn(password) {
    var m = modalEl(); if (!m) return;
    var err = $('.modal-error', m);
    if (password === DEMO_PASSWORD) {
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
      closeModal();
      updateStateIndicator();
      updateStaffLinks();
      // If the URL already targets a gated route, render it now.
      // Otherwise, send the user into the internal hub.
      var parsed = parseHash();
      var target = findView(parsed.route);
      if (target && target.getAttribute('data-gated') === 'true') {
        showView(target);
      } else {
        location.hash = '#/internal';
      }
    } else if (err) {
      err.textContent = 'Incorrect password. Try the demo password shown below.';
    }
  }

  function signOut() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
    updateStateIndicator();
    updateStaffLinks();
    location.hash = '#/';
  }

  // ---------- Staff-link state (top nav + footer + mobile) ----------
  function updateStaffLinks() {
    var unlocked = isUnlocked();
    $$('.nav-staff-link, .mobile-staff-link').forEach(function (a) {
      a.classList.toggle('is-unlocked', unlocked);
      a.textContent = unlocked ? 'UST Internal \u2713' : 'UST staff \u2197';
      a.setAttribute('title', unlocked
        ? 'Signed in. Open the Internal Hub.'
        : 'UST employees: access internal playbooks, sales enablement, and architecture references');
    });
  }

  // ---------- State indicator ----------
  function updateStateIndicator() {
    var el = $('#state-indicator'); if (!el) return;
    var unlocked = isUnlocked();
    el.classList.toggle('signed-in', unlocked);
    var label = $('.state-label', el);
    if (label) label.textContent = unlocked ? 'Signed in: UST Internal' : 'Public view';
  }

  // ---------- Tab switcher (homepage Products section) ----------
  function bindTabs() {
    var tabs = $$('.product-tab');
    var panels = $$('.product-panel');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var key = t.getAttribute('data-tab');
        tabs.forEach(function (x) {
          var on = x === t;
          x.classList.toggle('active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          var on = p.id === 'panel-' + key;
          p.classList.toggle('active', on);
          if (on) { p.removeAttribute('hidden'); } else { p.setAttribute('hidden', ''); }
        });
      });
    });
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', function () {
    // Demo-mode helper for screenshot/walkthrough capture: ?demo-unlock=1
    // unlocks the internal tier without going through the modal. The demo
    // password is already publicly visible in the sign-in modal, so this
    // changes nothing about real security posture.
    try {
      if (/[?&]demo-unlock=1\b/.test(location.search)) {
        sessionStorage.setItem(STORAGE_KEY, '1');
      }
    } catch (_) {}

    // Modal wiring
    var m = modalEl();
    if (m) {
      var closeBtn = $('.modal-close', m);
      var form     = $('form', m) || $('.modal-body', m);
      var pwInput  = $('input[type="password"]', m);
      var submit   = $('.modal-btn', m);

      m.addEventListener('click', function (e) { if (e.target === m) closeModal(); });
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (form && form.tagName === 'FORM') {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          trySignIn(pwInput ? pwInput.value : '');
        });
      } else if (submit) {
        submit.addEventListener('click', function (e) {
          e.preventDefault();
          trySignIn(pwInput ? pwInput.value : '');
        });
      }
      if (pwInput) {
        pwInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); trySignIn(pwInput.value); }
        });
      }
    }

    // Global ESC closes modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && m && m.classList.contains('active')) closeModal();
    });

    // Sign-in / sign-out triggers
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-action]');
      if (!t) return;
      var action = t.getAttribute('data-action');
      if (action === 'signin') {
        e.preventDefault();
        // If the user is already unlocked and clicked the staff link,
        // jump straight to the internal hub instead of reopening the modal.
        if (isUnlocked() && t.classList && t.classList.contains('nav-staff-link')) {
          if (location.hash !== '#/internal') location.hash = '#/internal';
          else navigate('/internal');
          return;
        }
        openModal();
      }
      else if (action === 'signout') { e.preventDefault(); signOut(); }
    });

    // TOC anchor links: smooth-scroll within the active view without
    // touching location.hash (which would trigger the router).
    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('.toc-link');
      if (!link) return;
      e.preventDefault();
      var href = link.getAttribute('href') || '';
      var view = link.closest('.view') || document;
      var target = null;
      if (href && href.length > 1 && href.charAt(0) === '#') {
        var id = href.slice(1);
        if (id) target = view.querySelector('#' + CSS.escape(id));
      }
      if (!target) {
        // Match by visible text: find a heading whose text starts with the link text.
        var label = (link.textContent || '').trim().toLowerCase();
        var headings = view.querySelectorAll('h2, h3');
        for (var i = 0; i < headings.length; i++) {
          var ht = (headings[i].textContent || '').trim().toLowerCase();
          if (ht.indexOf(label) === 0) { target = headings[i]; break; }
        }
      }
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        var main = view.querySelector('.docs-main') || view;
        if (main && main.scrollIntoView) main.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Tabs
    bindTabs();

    // Theme: restore saved preference
    try {
      var savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
      applyTheme(savedTheme);
    } catch (_) { applyTheme('dark'); }

    // Theme toggle buttons (desktop + mobile)
    $$('#theme-toggle, #theme-toggle-mobile').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });

    // Hamburger / mobile menu
    var hamburger = $('#nav-hamburger');
    if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking a link inside it
    var mobileMenuEl = $('#mobile-menu');
    if (mobileMenuEl) {
      mobileMenuEl.addEventListener('click', function (e) {
        var link = e.target.closest('a[href]');
        if (link && link.getAttribute('href') !== 'javascript:void(0)') {
          closeMobileMenu();
        }
      });
    }

    // ESC closes mobile menu too
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileMenu();
    });

    // Initial state
    updateStateIndicator();
    updateStaffLinks();
    handleHashChange();
  });

  window.addEventListener('hashchange', handleHashChange);
})();
