// Hash-based router with correct back/forward behaviour.
//
// - Every in-app navigation goes through Router.go(), which tracks the
//   in-app route stack so the browser/phone Back key always walks through
//   real pages (home → programs → detail → back → previous page).
// - Pages opened directly on a deep link (WhatsApp, external share, address
//   bar) get a "#home" entry inserted BEHIND them once, so pressing Back
//   returns to the home page instead of a blank page or leaving the app.
// - Auth-guard redirects use Router.replace() (no history entry), so they
//   can never create redirect loops or duplicate history entries.

const Router = {
  currentPage: 'home',
  currentDetailId: null,
  subPages: ['login', 'register', 'profile', 'orders', 'notifications', 'favorites', 'forgot-password', 'admin/login', 'booking-detail', 'ticket'],
  authRequired: ['profile', 'orders', 'notifications', 'favorites', 'booking-detail'],

  _stack: [],
  _forward: false,
  _lastRoute: null,

  _route() {
    const hash = window.location.hash || '#home';
    return hash.slice(1) || 'home';
  },

  _push(route) {
    if (this._stack[this._stack.length - 1] !== route) this._stack.push(route);
    if (this._stack.length > 60) this._stack.shift();
  },

  // Back/forward traversal: keep only the routes up to the current one.
  _sync(route) {
    const i = this._stack.indexOf(route);
    if (i >= 0) this._stack.length = i + 1;
    else this._stack = [];
  },

  // ── Public navigation API ────────────────────────────────────

  // Navigate forward (adds a history entry). Prefer this over setting
  // window.location.hash directly everywhere in the app.
  go(route) {
    route = String(route || '').replace(/^#/, '');
    if (!route) route = 'home';
    const current = this._route();
    if (route === current) {
      // Same page: just re-render in place, never duplicate a history entry.
      this.handleHashChange();
      return;
    }
    this._forward = true;
    window.location.hash = route;
  },

  // Switch page WITHOUT a history entry (auth guards, "go home" fallbacks).
  replace(route) {
    route = String(route || '').replace(/^#/, '');
    if (!route) route = 'home';
    const current = this._route();
    this._forward = false;
    if (route === current) {
      this.handleHashChange();
      return;
    }
    try {
      if (window.history && history.replaceState) {
        history.replaceState(null, '', '#' + route);
      } else {
        location.replace('#' + route);
        return;
      }
    } catch (e) {
      return;
    }
    // replaceState does not fire hashchange — render the new route manually.
    if (this._route() === route) this.handleHashChange();
  },

  // Smart "back" for in-app back buttons (hero arrows etc.).
  back() {
    if (this._stack.length > 0) {
      history.back();
    } else {
      // No in-app previous page (opened directly on a program link):
      // silently switch to the home page instead of leaving or blanking.
      this.replace('home');
    }
  },

  // ── Lifecycle ────────────────────────────────────────────────

  init() {
    this._ensureBaseEntry();
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();
  },

  // If the app was opened directly on a deep link, insert a "#home" entry
  // BEHIND the current route so the Back key returns to the home page.
  _ensureBaseEntry() {
    const route = this._route();
    if (route === 'home') return;
    try {
      if (window.history && history.replaceState) {
        history.replaceState(null, '', '#home');
        history.pushState(null, '', '#' + route);
      }
    } catch (e) {}
    this._stack = [route];
    this._forward = false;
  },

  handleHashChange() {
    const route = this._route();
    const wasForward = this._forward;
    this._forward = false;

    // Cleanup page-level realtime subscriptions when leaving a page, so old
    // listeners never refresh a hidden DOM or keep a tab busy (freezes).
    const last = this._lastRoute || '';
    if ((route.startsWith('admin') && route !== last) || (last.startsWith('admin') && !route.startsWith('admin'))) {
      if (window.adminCleanupSubscriptions) window.adminCleanupSubscriptions();
    }

    const hash = route;
    const parts = hash.split('/');
    const page = parts[0];

    if (page === 'admin' && parts[1]) {
      const adminSub = parts[1];
      if (adminSub === 'login') {
        this.navigateToSub('admin/login');
      } else if (!AuthService.isLoggedIn) {
        // Logged-out visitors must not see the dashboard shell.
        this.replace('admin/login');
        return;
      } else if (adminSub === 'dashboard') {
        this._ensureAdminShell();
      } else {
        this._ensureAdminShell();
        if (adminSub === 'bookings') {
          showAdminBookings();
        } else if (adminSub === 'booking' && parts[2]) {
          showAdminBookingDetail(parts[2]);
        } else if (adminSub === 'settings') {
          showAdminSettings();
        } else if (adminSub === 'gallery') {
          showAdminGallery();
        } else {
          this.replace('admin/dashboard');
          return;
        }
      }
    } else if (page === 'detail' && parts[1]) {
      this.navigateTo('detail', decodeURIComponent(parts[1]));
    } else if (page === 'booking' && parts[1]) {
      // Booking is now WhatsApp-only: old "#booking/<id>" deep links
      // (bookmarked or shared) open the program page directly.
      this.replace('detail/' + decodeURIComponent(parts[1]));
    } else if (page === 'booking-success' && parts[1]) {
      this.replace(AuthService.isLoggedIn ? 'orders' : 'home');
    } else if (page === 'booking-detail' && parts[1]) {
      if (!AuthService.isLoggedIn) { this.replace('login'); return; }
      this.navigateToSub('booking-detail', parts[1]);
    } else if (page === 'chat' && parts[1]) {
      // In-app chat has been removed; go back to the orders list.
      this.replace(AuthService.isLoggedIn ? 'orders' : 'home');
    } else if (this.subPages.includes(page)) {
      if (this.authRequired.includes(page) && !AuthService.isLoggedIn) {
        this.replace('login');
        return;
      }
      this.navigateToSub(page);
    } else if (['home', 'programs', 'more', 'tickets'].includes(page)) {
      this.navigateTo(page);
    } else {
      // Unknown hashes (placeholder anchors like #terms/#privacy, #home/#more
      // taps) are ignored silently: keep the current page and its state intact.
      const prev = this._lastRoute || 'home';
      try { history.replaceState(null, '', '#' + prev); } catch (e) {}
      this._lastRoute = prev;
      return;
    }

    if (wasForward) this._push(route);
    else this._sync(route);
    this._lastRoute = route;
  },

  _ensureAdminShell() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById('page-admin-dashboard');
    if (targetPage) targetPage.classList.add('active');

    const bottomNav = document.getElementById('bottom-nav');
    const header = document.getElementById('app-header');
    const main = document.querySelector('.app__main');
    if (bottomNav) bottomNav.style.display = 'none';
    if (header) header.style.display = 'none';
    if (main) { main.style.marginTop = '0'; main.style.paddingBottom = '0'; }

    const dash = document.getElementById('admin-dashboard-content');
    if (!dash || !dash.querySelector('#admin-main-content')) {
      renderAdminDashboard();
    }
  },

  navigateTo(page, detailId) {
    this.currentPage = page;
    this.currentDetailId = detailId || null;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    const bottomNav = document.getElementById('bottom-nav');
    const header = document.getElementById('app-header');
    const main = document.querySelector('.app__main');
    main.style.marginTop = '';
    main.style.paddingBottom = '';
    renderBottomNav(page === 'detail' ? 'home' : page);
    setupBottomNavListeners();

    if (page === 'detail' && detailId) {
      bottomNav.style.display = 'none';
      header.style.display = 'none';
    } else {
      bottomNav.style.display = '';
      header.style.display = '';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'programs') {
      renderProgramsPage();
    } else if (page === 'detail' && detailId) {
      renderDetailPage(detailId);
    } else if (page === 'more') {
      renderMorePage();
    } else if (page === 'tickets') {
      renderTicketsPage();
    }
  },

  navigateToSub(page, param) {
    this.currentPage = page;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));

    const elementId = page === 'admin/login' ? 'page-admin-login' : `page-${page}`;
    const targetPage = document.getElementById(elementId);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    const bottomNav = document.getElementById('bottom-nav');
    const header = document.getElementById('app-header');
    const main = document.querySelector('.app__main');
    bottomNav.style.display = 'none';
    header.style.display = 'none';

    if (page.startsWith('admin')) {
      main.style.marginTop = '0';
      main.style.paddingBottom = '0';
    } else {
      main.style.marginTop = '';
      main.style.paddingBottom = '';
    }

    renderBottomNav(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch(page) {
      case 'login': renderLoginPage(); break;
      case 'register': renderRegisterPage(); break;
      case 'forgot-password': renderForgotPasswordPage(); break;
      case 'profile': renderProfilePage(); break;
      case 'orders': renderOrdersPage(); break;
      case 'notifications': renderNotificationsPage(); break;
      case 'favorites': renderFavoritesPage(); break;
      case 'admin/login': renderAdminLoginPage(); break;
      case 'booking-detail': renderBookingDetailPage(param); break;
      case 'ticket': renderTicketPage(); break;
    }
  },

  navigateToAdmin(page) {
    this.currentPage = 'admin';

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById('page-admin-dashboard');
    if (targetPage) {
      targetPage.classList.add('active');
    }

    const bottomNav = document.getElementById('bottom-nav');
    const header = document.getElementById('app-header');
    const main = document.querySelector('.app__main');
    bottomNav.style.display = 'none';
    header.style.display = 'none';
    main.style.marginTop = '0';
    main.style.paddingBottom = '0';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderAdminDashboard();
  }
};

function navigateToPage(page) {
  Router.go(page);
}

function navigateToDetail(programId) {
  Router.go(`detail/${programId}`);
}

function navigateToPrograms(destination) {
  Router.go('programs');
  clearTimeout(Router._programFilterTimer);
  Router._programFilterTimer = setTimeout(() => {
    if (typeof filterByDestination === 'function' && destination) {
      filterByDestination(destination);
    }
  }, 120);
}

// Expose for inline handlers on dynamically injected HTML.
window.Router = Router;