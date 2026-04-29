/* =============================================================================
   UST FinX Documentation Portal — Shared JavaScript
   ---------------------------------------------------------------------------
   All interactivity for the mockup lives here. Imported by every HTML page.
   See SPEC.md §8 for interaction specifications.

   Implements:
     1. Smooth scroll for in-page anchor links (homepage)
     2. Tab switcher for the Products section (Glue / Glass)
     3. Sign-in modal open/close (footer "UST staff sign in" link)
     4. Password validation against 'finx2026' → sessionStorage
        key 'finx-internal-unlocked' = '1' → navigate to /internal/
     5. Internal-page gate: redirect to homepage with ?signin=1 if locked
     6. ESC closes modal
     7. Click outside the modal closes the modal
     8. Sign-out clears sessionStorage and returns to the homepage
     9. State indicator reflects current sign-in state
    10. ?signin=1 query param on the homepage auto-opens the modal

   Pure vanilla JS. No framework. No external dependencies.
   ============================================================================= */
(function () {
  'use strict';

  // -- Constants -------------------------------------------------------------
  var STORAGE_KEY = 'finx-internal-unlocked';
  var DEMO_PASSWORD = 'finx2026';

  // -- Path helpers ----------------------------------------------------------
  // Compute a relative path to the project root from the current page so the
  // same script works whether we are at /index.html, /glue/foo.html, or
  // /internal/bar.html.
  function rootPrefix() {
    var path = window.location.pathname.replace(/\\/g, '/');
    // Count directories below the project root. If the URL ends in "/", treat
    // it as an index page in that directory.
    var parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return '';
    // Last segment is the file (or empty). Drop it.
    if (path.charAt(path.length - 1) !== '/') parts.pop();
    return parts.length === 0 ? '' : new Array(parts.length + 1).join('../');
  }

  function isInternalPage() {
    return /\/internal\//.test(window.location.pathname);
  }

  function isUnlocked() {
    try { return sessionStorage.getItem(STORAGE_KEY) === '1'; }
    catch (e) { return false; }
  }

  function setUnlocked(v) {
    try {
      if (v) sessionStorage.setItem(STORAGE_KEY, '1');
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* private mode etc. */ }
  }

  // -- 5. Internal-page gate (must run before paint) -------------------------
  // Inline <head> scripts on internal pages also enforce this; this is a
  // belt-and-braces check in case the inline guard is removed.
  if (isInternalPage() && !isUnlocked()) {
    window.location.replace(rootPrefix() + 'index.html?signin=1');
    return;
  }

  // -- DOM ready -------------------------------------------------------------
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initSmoothScroll();
    initTabSwitcher();
    initSignInModal();
    initSignOut();
    initStateIndicator();
  });

  // -- 1. Smooth scroll ------------------------------------------------------
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    Array.prototype.forEach.call(links, function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      a.addEventListener('click', function (e) {
        var id = href.slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without a jump.
        if (history.pushState) history.pushState(null, '', '#' + id);
      });
    });
  }

  // -- 2. Tab switcher (Products section) ------------------------------------
  function initTabSwitcher() {
    var tabs = document.querySelectorAll('.product-tab');
    if (!tabs.length) return;
    var panels = document.querySelectorAll('.product-panel');

    Array.prototype.forEach.call(tabs, function (tab) {
      if (tab.dataset.finxBound === '1') return;
      tab.dataset.finxBound = '1';
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-tab');
        Array.prototype.forEach.call(tabs, function (t) {
          var on = t === tab;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        Array.prototype.forEach.call(panels, function (p) {
          var on = p.id === 'panel-' + key;
          p.classList.toggle('active', on);
          if (on) p.removeAttribute('hidden');
          else p.setAttribute('hidden', '');
        });
      });
    });
  }

  // -- 3, 4, 6, 7, 10. Sign-in modal ----------------------------------------
  function initSignInModal() {
    var modal = document.getElementById('signin-modal');
    if (!modal) return;

    var openLinks = document.querySelectorAll('#staff-signin-link, [data-signin-open]');
    var closeBtn = modal.querySelector('.modal-close');
    var form = modal.querySelector('#signin-form') || modal.querySelector('form');
    var pwInput = modal.querySelector('#signin-password');
    var errEl = modal.querySelector('#signin-error') || modal.querySelector('.modal-error');

    function open(e) {
      if (e) e.preventDefault();
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      if (pwInput) setTimeout(function () { pwInput.focus(); }, 50);
    }
    function close() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      if (errEl) errEl.textContent = '';
    }

    Array.prototype.forEach.call(openLinks, function (link) {
      if (link.dataset.finxBound === '1') return;
      link.dataset.finxBound = '1';
      link.addEventListener('click', open);
    });

    if (closeBtn && closeBtn.dataset.finxBound !== '1') {
      closeBtn.dataset.finxBound = '1';
      closeBtn.addEventListener('click', close);
    }

    // Click outside modal closes it.
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });

    // ESC closes modal.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) close();
    });

    // Password validation.
    if (form && form.dataset.finxBound !== '1') {
      form.dataset.finxBound = '1';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var value = pwInput ? pwInput.value : '';
        if (value === DEMO_PASSWORD) {
          setUnlocked(true);
          window.location.href = rootPrefix() + 'internal/index.html';
        } else if (errEl) {
          errEl.textContent = 'Invalid credentials. Try the demo password shown below.';
        }
      });
    }

    // Auto-open if redirected here from a gated page.
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('signin') === '1') open();
    } catch (e) { /* IE — ignore */ }
  }

  // -- 8. Sign-out -----------------------------------------------------------
  function initSignOut() {
    var triggers = document.querySelectorAll(
      '#signout-btn, #footer-signout, [data-signout]'
    );
    if (!triggers.length) return;
    Array.prototype.forEach.call(triggers, function (el) {
      if (el.dataset.finxBound === '1') return;
      el.dataset.finxBound = '1';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        setUnlocked(false);
        window.location.href = rootPrefix() + 'index.html';
      });
    });
  }

  // -- 9. State indicator ----------------------------------------------------
  function initStateIndicator() {
    var ind = document.getElementById('state-indicator');
    if (!ind) return;
    var label = ind.querySelector('.state-label');
    if (isUnlocked()) {
      ind.classList.add('signed-in');
      if (label) label.textContent = 'Signed in as UST staff';
    } else {
      ind.classList.remove('signed-in');
      if (label) label.textContent = 'Public view (no sign-in)';
    }
  }
})();
