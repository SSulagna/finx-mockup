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
     - Docs + internal gate (sessionStorage 'finx-internal-unlocked' now gates
       any route whose hash path starts with /docs/ or /internal/)
     - Sign-out (clears storage, returns to homepage)
     - Product tab switcher (data-tab / data-tab-group)
     - State indicator (bottom-right) reflecting sign-in + View-as state
     - View-as toggle (External / Internal) for simulating dual-SSO in v1
     - View mode toggle (Demo / Planning / Comment, persisted via sessionStorage)

   See SPEC.md §8 for interaction specifications.
   ========================================================================== */

(function () {
  'use strict';

  // ---------- Constants ----------
  var DEMO_PASSWORD   = 'finx2026';
  // Single sessionStorage flag. Despite the legacy name, this now unlocks
  // every gated route (/docs/* and /internal/*), not just the internal hub.
  var STORAGE_KEY     = 'finx-internal-unlocked';
  var THEME_KEY       = 'finx-theme';
  var MODE_KEY        = 'finx-view-mode';
  var TIER_KEY        = 'finx-view-as';
  var DEFAULT_ROUTE   = '/';
  var SIGNIN_HASH_RE  = /^#\/?signin$/i;
  var GATED_PREFIXES  = ['/docs/', '/internal/', '/internal'];
  var VALID_TIERS     = ['external', 'internal'];
  var VALID_MODES     = ['demo', 'planning', 'comment'];
  var TIER_LABELS     = {
    external: 'External',
    internal: 'Internal'
  };

  // ---------- View-as tier + view mode state ----------
  var currentTier = 'external';
  var currentMode = 'demo';

  // ---------- Helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function isUnlocked() { try { return sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (_) { return false; } }

  function parseQueryString(qs) {
    var result = {};
    if (!qs) return result;
    var parts = qs.split('&');
    for (var i = 0; i < parts.length; i++) {
      var eq = parts[i].indexOf('=');
      if (eq < 0) continue;
      var k = decodeURIComponent(parts[i].slice(0, eq));
      var v = decodeURIComponent(parts[i].slice(eq + 1));
      result[k] = v;
    }
    return result;
  }

  function buildHash(path, params) {
    var h = '#' + path;
    var parts = [];
    for (var k in params) {
      if (params.hasOwnProperty(k) && params[k]) {
        parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
      }
    }
    if (parts.length) h += '?' + parts.join('&');
    return h;
  }

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
    // Split path from inline query string within the hash fragment
    var qIdx = raw.indexOf('?');
    var pathPart = qIdx >= 0 ? raw.slice(0, qIdx) : raw;
    var params   = qIdx >= 0 ? parseQueryString(raw.slice(qIdx + 1)) : {};

    // Support bare-params hash like #tier=internal (no route, just key=value)
    // Treat as params for the default route (e.g., deep-linking /#tier=internal).
    if (pathPart !== '' && pathPart !== '/' && pathPart.charAt(0) !== '/' && pathPart.indexOf('=') >= 0) {
      params = parseQueryString(pathPart);
      pathPart = DEFAULT_ROUTE;
    }

    if (pathPart === '' || pathPart === '/') return { route: DEFAULT_ROUTE, signin: false, params: params };
    if (SIGNIN_HASH_RE.test('#' + pathPart)) return { route: getCurrentRoute() || DEFAULT_ROUTE, signin: true, params: params };
    // Bare in-page anchor like #letter-a or #section-id: leave the current
    // route untouched so the browser scrolls without re-rendering the view.
    if (pathPart.charAt(0) !== '/') {
      return { route: getCurrentRoute() || DEFAULT_ROUTE, signin: false, params: params };
    }
    return { route: pathPart, signin: false, params: params };
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

  // A route is gated if its path starts with /docs/ or is /internal[/...].
  // Implicit on every matching view; per-view data-gated="true" still honoured.
  function isGatedRoute(route) {
    if (!route) return false;
    for (var i = 0; i < GATED_PREFIXES.length; i++) {
      var p = GATED_PREFIXES[i];
      if (route === p) return true;
      if (route.indexOf(p) === 0) return true;
    }
    return false;
  }

  function navigate(route) {
    var view = findView(route);
    if (!view) return;

    // Gate check: keep the URL on the gated route but render the homepage
    // underneath while the sign-in modal is open.
    var gated = view.getAttribute('data-gated') === 'true' || isGatedRoute(route);
    if (gated && !isUnlocked()) {
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

    // Apply tier filter and mode for newly visible view
    applyTierFilter();
    applyMode();

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

    // Sync tier: URL param takes precedence; fall back to sessionStorage.
    // This ensures the selection persists when navigating via sidebar links
    // that do not carry the ?tier= param in their href.
    var tierFromUrl = parsed.params && parsed.params['tier'];
    var resolvedTier = 'external';
    if (tierFromUrl && VALID_TIERS.indexOf(tierFromUrl) >= 0) {
      resolvedTier = tierFromUrl;
    } else {
      try {
        var stored = sessionStorage.getItem(TIER_KEY);
        if (stored && VALID_TIERS.indexOf(stored) >= 0) resolvedTier = stored;
      } catch (_) {}
    }
    currentTier = resolvedTier;
    updateTierChips();
    updateStateIndicator();
    updateStaffLinks();

    if (parsed.route !== getCurrentRoute()) navigate(parsed.route);
    else applyTierFilter(); // route unchanged but params may have changed

    if (parsed.signin) openModal();

    // When tier comes from sessionStorage (not URL), add it to the URL so
    // the deep-link remains canonical. Skip when on the default external view.
    if (!tierFromUrl && currentTier !== 'external') {
      var route = getCurrentRoute() || DEFAULT_ROUTE;
      var h = buildHash(route, { tier: currentTier });
      if (history && history.replaceState) history.replaceState(null, '', h);
    }
  }

  // ---------- View-as tier filter ----------
  function setTier(value) {
    currentTier = (VALID_TIERS.indexOf(value) >= 0) ? value : 'external';
    try { sessionStorage.setItem(TIER_KEY, currentTier); } catch (_) {}
    updateTierChips();
    applyTierFilter();
    updateStateIndicator();
    updateStaffLinks();
    // If we just switched to External while sitting on an internal route,
    // bounce to the homepage so the user is not staring at a hidden view.
    var route = getCurrentRoute() || DEFAULT_ROUTE;
    if (currentTier === 'external' && route.indexOf('/internal') === 0) {
      location.hash = '#/';
      return;
    }
    // Reflect in URL (replaceState does not fire hashchange)
    var h = buildHash(route, currentTier !== 'external' ? { tier: currentTier } : {});
    if (history && history.replaceState) history.replaceState(null, '', h);
  }

  function updateTierChips() {
    $$('[data-tier-select]').forEach(function (chip) {
      chip.classList.toggle('is-active', chip.getAttribute('data-tier-select') === currentTier);
    });
  }

  // Derive a view's trust tier: explicit data-tier, or inferred from route prefix.
  function viewTier(view) {
    if (!view) return 'external';
    var t = view.getAttribute('data-tier');
    if (t === 'internal') return 'internal';
    if (t === 'external') return 'external';
    var route = view.getAttribute('data-route') || '';
    if (route === '/internal' || route.indexOf('/internal/') === 0) return 'internal';
    return 'external';
  }

  function applyTierFilter() {
    // Hide entire views that are internal-tier when View-as is External.
    $$('.view').forEach(function (v) {
      var t = viewTier(v);
      var hide = currentTier === 'external' && t === 'internal';
      v.classList.toggle('tier-hidden-view', hide);
    });

    var view = $('.view.is-active');
    var hiddenCount = 0;

    if (view) {
      // Sidebar/inline items flagged data-tier="internal" hide in External view.
      var items = $$('[data-tier="internal"]', view);
      for (var i = 0; i < items.length; i++) {
        var shouldHide = currentTier === 'external';
        items[i].classList.toggle('tier-hidden', shouldHide);
        if (shouldHide) hiddenCount++;
      }
    }

    var banner     = $('#tier-banner');
    var labelEl    = $('#tier-banner-label');
    var countEl    = $('#tier-banner-count');
    if (banner) {
      if (currentTier === 'external' && hiddenCount > 0) {
        if (labelEl) labelEl.textContent = TIER_LABELS[currentTier] || currentTier;
        if (countEl) countEl.textContent = hiddenCount;
        banner.removeAttribute('hidden');
      } else {
        banner.setAttribute('hidden', '');
      }
    }
  }

  // ---------- View mode (Demo / Planning / Comment) ----------
  function setMode(value) {
    currentMode = (VALID_MODES.indexOf(value) >= 0) ? value : 'demo';
    try { sessionStorage.setItem(MODE_KEY, currentMode); } catch (_) {}
    updateModeChips();
    applyMode();
  }

  function updateModeChips() {
    $$('[data-mode-select]').forEach(function (chip) {
      chip.classList.toggle('is-active', chip.getAttribute('data-mode-select') === currentMode);
    });
  }

  function applyMode() {
    var planningMeta = $('#planning-meta');
    var isPlanning = currentMode === 'planning';

    if (planningMeta) {
      if (isPlanning) {
        var view = $('.view.is-active');
        var tier = viewTier(view);
        var trustTierEl = $('#pm-trust-tier');
        if (trustTierEl) trustTierEl.textContent = TIER_LABELS[tier] || tier;
        planningMeta.removeAttribute('hidden');
      } else {
        planningMeta.setAttribute('hidden', '');
      }
    }
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
    // Clean up #/signin hash, preserving any tier query param
    var parsed = parseHash();
    if (parsed.signin) {
      var current = getCurrentRoute() || DEFAULT_ROUTE;
      var newHash = parsed.params && parsed.params['tier']
        ? buildHash(current, { tier: parsed.params['tier'] })
        : '#' + current;
      if (history && history.replaceState) {
        history.replaceState(null, '', newHash);
      } else {
        location.hash = newHash;
      }
    }
  }

  function trySignIn(password) {
    var m = modalEl(); if (!m) return;
    var err = $('.modal-error', m);
    if (password === DEMO_PASSWORD) {
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
      // Default View-as is External after a successful unlock.
      currentTier = 'external';
      try { sessionStorage.setItem(TIER_KEY, 'external'); } catch (_) {}
      updateTierChips();
      closeModal();
      updateStateIndicator();
      updateStaffLinks();
      // If the URL already targets a gated route, render it now.
      // Otherwise, send the user into the Glue developer hub.
      var parsed = parseHash();
      var target = findView(parsed.route);
      var gated = target && (target.getAttribute('data-gated') === 'true' || isGatedRoute(parsed.route));
      if (target && gated) {
        showView(target);
      } else {
        location.hash = '#/docs/glue';
      }
    } else if (err) {
      err.textContent = 'Incorrect password. Try the demo password shown below.';
    }
  }

  function signOut() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(TIER_KEY);
    } catch (_) {}
    currentTier = 'external';
    updateTierChips();
    updateStateIndicator();
    updateStaffLinks();
    location.hash = '#/';
  }

  // ---------- Staff-link state (top nav + footer + mobile) ----------
  function updateStaffLinks() {
    var unlocked = isUnlocked();
    var tierLabel = TIER_LABELS[currentTier] || 'External';
    $$('.nav-staff-link, .mobile-staff-link').forEach(function (a) {
      a.classList.toggle('is-unlocked', unlocked);
      if (unlocked) {
        a.innerHTML = 'Signed in &middot; ' + tierLabel +
          ' <span class="signout-x" data-action="signout" title="Sign out" aria-label="Sign out" role="button">&times;</span>';
        a.setAttribute('title', 'Signed in. Open the Internal Hub. Click \u00D7 to sign out.');
      } else {
        a.textContent = 'UST staff \u00B7 Sign in';
        a.setAttribute('title', 'UST employees: sign in to access internal engagement playbooks, sales enablement, and architecture references');
      }
    });
  }

  // ---------- State indicator ----------
  function updateStateIndicator() {
    document.body.classList.toggle('tier-internal', currentTier === 'internal');
    var el = $('#state-indicator'); if (!el) return;
    var unlocked = isUnlocked();
    el.classList.toggle('signed-in', unlocked);
    var label = $('.state-label', el);
    if (label) {
      if (!unlocked) label.textContent = 'Public view';
      else label.textContent = 'Signed in: ' + (TIER_LABELS[currentTier] || 'External');
    }
    updateAssistantScope();
  }

  // ---------- Floating answer assistant ----------
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function tokenize(value) {
    var cleaned = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ');
    var raw = cleaned.split(/\s+/);
    var stop = {
      a: true, an: true, and: true, are: true, as: true, at: true, be: true,
      by: true, for: true, from: true, how: true, in: true, into: true,
      is: true, it: true, of: true, on: true, or: true, that: true, the: true,
      this: true, to: true, what: true, when: true, where: true, which: true,
      with: true, you: true, your: true
    };
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      if (raw[i].length > 2 && !stop[raw[i]]) out.push(raw[i]);
    }
    return out;
  }

  function compactText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function routeLabel(view) {
    var h = view.querySelector('h1, .docs-title, .page-title, .hero-title');
    var title = h ? compactText(h.textContent) : '';
    if (!title) title = (view.getAttribute('data-title') || 'UST FinX').split('·')[0].trim();
    return title || 'UST FinX';
  }

  function readableClone(view) {
    var clone = view.cloneNode(true);
    var remove = clone.querySelectorAll('script, style, nav, footer, aside, .docs-sidebar, .docs-toc, .docs-aside, .search-overlay, .modal-overlay, .finx-assistant, .state-indicator, .tier-banner, .planning-meta');
    for (var i = 0; i < remove.length; i++) remove[i].parentNode.removeChild(remove[i]);
    return clone;
  }

  function splitSentences(text) {
    var normalized = compactText(text);
    if (!normalized) return [];
    var parts = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var item = compactText(parts[i]);
      if (item.length >= 45) out.push(item);
    }
    return out;
  }

  function buildAssistantIndex() {
    var unlocked = isUnlocked();
    var entries = [];
    $$('.view[data-route]').forEach(function (view) {
      var route = view.getAttribute('data-route') || '';
      if (!route || route === '*') return;
      var gated = view.getAttribute('data-gated') === 'true' || isGatedRoute(route);
      var internal = viewTier(view) === 'internal';
      if ((gated || internal) && !unlocked) return;

      var clone = readableClone(view);
      var label = routeLabel(view);
      var title = view.getAttribute('data-title') || label;
      var text = compactText(clone.textContent);
      var sentences = splitSentences(text);
      if (!sentences.length && text) sentences = [text.slice(0, 280)];
      entries.push({
        route: route,
        label: label,
        title: title,
        text: text,
        sentences: sentences,
        tokens: tokenize(label + ' ' + title + ' ' + text),
        gated: gated,
        internal: internal
      });
    });
    return entries;
  }

  function scoreEntry(entry, queryTokens) {
    var score = 0;
    if (!queryTokens.length) return 0;
    var text = ' ' + entry.tokens.join(' ') + ' ';
    var title = (entry.label + ' ' + entry.title).toLowerCase();
    for (var i = 0; i < queryTokens.length; i++) {
      var token = queryTokens[i];
      if (title.indexOf(token) >= 0) score += 6;
      var idx = text.indexOf(' ' + token + ' ');
      while (idx >= 0) {
        score += 1;
        idx = text.indexOf(' ' + token + ' ', idx + token.length + 2);
      }
    }
    if (entry.internal) score += 1;
    return score;
  }

  function bestSentences(entry, queryTokens) {
    var ranked = entry.sentences.map(function (sentence) {
      var lower = sentence.toLowerCase();
      var score = 0;
      for (var i = 0; i < queryTokens.length; i++) {
        if (lower.indexOf(queryTokens[i]) >= 0) score += 1;
      }
      return { sentence: sentence, score: score };
    }).sort(function (a, b) { return b.score - a.score; });
    var picked = [];
    for (var j = 0; j < ranked.length && picked.length < 2; j++) {
      if (ranked[j].score > 0 || picked.length === 0) picked.push(ranked[j].sentence);
    }
    return picked;
  }

  function answerAssistant(query) {
    var tokens = tokenize(query);
    var index = buildAssistantIndex();
    var locked = !isUnlocked();
    var authTerms = /\b(internal|staff|sales|enablement|playbook|confidential|architecture references|product requirements)\b/i;

    if (!tokens.length) {
      return 'Ask a specific question, for example: <strong>How does FinX Glue support coexistence?</strong>';
    }

    var ranked = index.map(function (entry) {
      return { entry: entry, score: scoreEntry(entry, tokens) };
    }).filter(function (item) {
      return item.score > 0;
    }).sort(function (a, b) {
      return b.score - a.score;
    }).slice(0, 4);

    if (!ranked.length) {
      if (locked && authTerms.test(query)) {
        return 'I cannot use gated UST content while you are signed out. Sign in with the UST staff option, then ask again so the local index can include internal pages and protected documentation.';
      }
      return 'I could not find a strong match in the accessible portal content. Try a FinX term such as Glue, Glass, BIAN, coexistence, modernization, KYC, or API reference.';
    }

    var scopeNote = locked
      ? 'Answering from public pages available in the current session.'
      : 'Answering from pages available after sign-in, including gated portal content.';
    var html = '<p><strong>' + scopeNote + '</strong></p><ol>';
    for (var i = 0; i < ranked.length; i++) {
      var item = ranked[i].entry;
      var snippets = bestSentences(item, tokens);
      html += '<li><a href="#' + escapeHtml(item.route) + '">' + escapeHtml(item.label) + '</a>: ' +
        escapeHtml(snippets.join(' ')).slice(0, 360) + '</li>';
    }
    html += '</ol>';
    if (locked && authTerms.test(query)) {
      html += '<p>Some internal answers may be hidden until UST staff sign-in is complete.</p>';
    }
    return html;
  }

  function addAssistantMessage(kind, html) {
    var log = $('#finx-assistant-messages');
    if (!log) return;
    var msg = document.createElement('div');
    msg.className = 'finx-assistant-msg finx-assistant-msg--' + kind;
    msg.innerHTML = html;
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
  }

  function updateAssistantScope() {
    var scope = $('#finx-assistant-scope');
    if (!scope) return;
    var unlocked = isUnlocked();
    scope.classList.toggle('is-internal', unlocked);
    scope.textContent = unlocked
      ? 'Signed in scope: public pages, protected documentation, and UST internal content'
      : 'Public scope: gated content is excluded until UST staff sign-in';
  }

  function openAssistant() {
    var panel = $('#finx-assistant-panel');
    var toggle = $('#finx-assistant-toggle');
    var input = $('#finx-assistant-input');
    if (!panel) return;
    panel.removeAttribute('hidden');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    updateAssistantScope();
    if (input) setTimeout(function () { input.focus(); }, 30);
  }

  function closeAssistant() {
    var panel = $('#finx-assistant-panel');
    var toggle = $('#finx-assistant-toggle');
    if (!panel) return;
    panel.setAttribute('hidden', '');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function bindAssistant() {
    var toggle = $('#finx-assistant-toggle');
    var close = $('.finx-assistant-close');
    var form = $('#finx-assistant-form');
    var input = $('#finx-assistant-input');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var panel = $('#finx-assistant-panel');
        if (panel && panel.hasAttribute('hidden')) openAssistant();
        else closeAssistant();
      });
    }
    if (close) close.addEventListener('click', closeAssistant);
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var query = compactText(input ? input.value : '');
        if (!query) return;
        addAssistantMessage('user', escapeHtml(query));
        addAssistantMessage('bot', answerAssistant(query));
        if (input) input.value = '';
      });
    }
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest && e.target.closest('[data-action="open-finx-chat"]');
      if (trigger) {
        e.preventDefault();
        openAssistant();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAssistant();
    });
    updateAssistantScope();
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

    // Restore view mode from sessionStorage before initial render
    try {
      var savedMode = sessionStorage.getItem(MODE_KEY);
      if (savedMode && VALID_MODES.indexOf(savedMode) >= 0) currentMode = savedMode;
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

    // Tier-filter chip clicks (data-tier-select) and mode chip clicks (data-mode-select)
    document.addEventListener('click', function (e) {
      var tierChip = e.target.closest('[data-tier-select]');
      if (tierChip) { setTier(tierChip.getAttribute('data-tier-select')); return; }
      var modeChip = e.target.closest('[data-mode-select]');
      if (modeChip) { setMode(modeChip.getAttribute('data-mode-select')); }
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
    bindAssistant();

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
    updateModeChips();
    handleHashChange(); // sets tier from URL/sessionStorage, navigates, applies filter + mode
  });

  window.addEventListener('hashchange', handleHashChange);
})();

// ---------------------------------------------------------------------------
// API Explorer: render Redoc lazily for routes under /docs/glue/api-explorer,
// and inject a CTA onto each matching API Reference SD page.
// ---------------------------------------------------------------------------
(function () {
  var REDOC_SRC = 'https://cdn.jsdelivr.net/npm/redoc@2.4.0/bundles/redoc.standalone.js';
  var EXPLORER_SLUG_BY_REF_ROUTE = {
    '/docs/glue/api-reference': 'api-reference',
    '/docs/glue/api-reference/current-account': 'current-account',
    '/docs/glue/api-reference/party-reference-data': 'party-reference-data',
    '/docs/glue/api-reference/savings-account': 'savings-account',
    '/docs/glue/api-reference/position-keeping': 'position-keeping',
    '/docs/glue/api-reference/payment-order-initiation': 'payment-order-initiation',
    '/docs/glue/api-reference/document-directory': 'document-directory',
    '/docs/glue/api-reference/product-directory': 'product-directory',
    '/docs/glue/api-reference/customer-product-service-directory': 'customer-product-service-directory',
    '/docs/glue/api-reference/customer-offer': 'customer-offer',
    '/docs/glue/api-reference/customer-agreement': 'customer-agreement'
  };

  var redocPromise = null;
  var rendered = {};

  function loadRedoc() {
    if (window.Redoc) return Promise.resolve();
    if (redocPromise) return redocPromise;
    redocPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = REDOC_SRC;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () {
        redocPromise = null;
        reject(new Error('Could not load Redoc from CDN.'));
      };
      document.head.appendChild(s);
    });
    return redocPromise;
  }

  function renderForRoute(route) {
    if (!route || route.indexOf('/docs/glue/api-explorer/') !== 0) return;
    var view = document.querySelector('.view[data-route="' + route + '"]');
    if (!view) return;
    var host = view.querySelector('.redoc-host');
    if (!host || rendered[route]) return;
    var spec = host.getAttribute('data-spec');
    if (!spec) return;

    loadRedoc().then(function () {
      try {
        host.innerHTML = '';
        window.Redoc.init(spec, {
          theme: {
            colors: { primary: { main: '#00D4D4' } },
            typography: {
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              headings: { fontFamily: 'Inter, system-ui, sans-serif', fontWeight: '600' },
              code: { fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }
            },
            sidebar: { backgroundColor: '#f3f4f6', textColor: '#062229', activeTextColor: '#00D4D4' },
            rightPanel: { backgroundColor: '#062229', textColor: '#E8F4F6' }
          },
          scrollYOffset: 0,
          hideDownloadButton: true,
          expandResponses: '200,201',
          jsonSampleExpandLevel: 2,
          nativeScrollbars: false
        }, host);
        rendered[route] = true;
      } catch (e) {
        host.innerHTML = '<div class="loading-spec">Failed to render spec: ' + (e && e.message ? e.message : e) + '</div>';
      }
    }).catch(function (e) {
      host.innerHTML = '<div class="loading-spec">' + e.message + '</div>';
    });
  }

  function injectExplorerCtas() {
    var views = document.querySelectorAll('.view[data-route^="/docs/glue/api-reference"]');
    for (var i = 0; i < views.length; i++) {
      var view = views[i];
      if (view.querySelector('.api-explorer-cta')) continue;
      var lead = view.querySelector('.page-lead');
      if (!lead) continue;
      var route = view.getAttribute('data-route');
      var slug = EXPLORER_SLUG_BY_REF_ROUTE[route];
      var cta;
      if (slug) {
        cta = document.createElement('a');
        cta.className = 'api-explorer-cta';
        cta.href = '#/docs/glue/api-explorer/' + slug;
        cta.innerHTML = 'Open interactive API explorer <span aria-hidden="true">→</span>';
      } else if (route === '/docs/glue/api-reference/term-deposit') {
        cta = document.createElement('span');
        cta.className = 'api-explorer-cta is-planned';
        cta.setAttribute('title', 'Planned: OpenAPI spec for Term Deposit service is not yet published');
        cta.textContent = 'Interactive API explorer · planned';
      } else {
        continue;
      }
      lead.parentNode.insertBefore(cta, lead.nextSibling);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectExplorerCtas);
  } else {
    injectExplorerCtas();
  }
  document.addEventListener('view:enter', function (ev) {
    renderForRoute(ev.detail && ev.detail.route);
  });
})();
