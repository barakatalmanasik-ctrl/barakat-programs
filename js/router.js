const Router = {
  currentPage: 'home',
  currentDetailId: null,
  subPages: ['login', 'register', 'profile', 'orders', 'notifications', 'favorites', 'forgot-password', 'admin/login', 'booking', 'booking-success', 'booking-detail', 'chat'],
  authRequired: ['profile', 'orders', 'notifications', 'favorites', 'booking-detail', 'chat'],

  init() {
    this.handleHashChange();
    window.addEventListener('hashchange', () => this.handleHashChange());
  },

  handleHashChange() {
    const hash = window.location.hash.slice(1) || 'home';
    const parts = hash.split('/');
    const page = parts[0];

    if (page === 'admin' && parts[1]) {
      const adminSub = parts[1];
      if (adminSub === 'login') {
        this.navigateToSub('admin/login');
        return;
      }
      if (adminSub === 'dashboard') {
        this.navigateToAdmin('admin/dashboard');
        return;
      }
      if (!AuthService.isLoggedIn) {
        window.location.hash = 'admin/login';
        return;
      }
      // Ensure the admin dashboard shell exists before swapping panels.
      const dash = document.getElementById('admin-dashboard-content');
      if (!dash || !dash.querySelector('#admin-main-content')) {
        renderAdminDashboard();
      }
      if (adminSub === 'conversations') {
        showAdminConversations();
      } else if (adminSub === 'bookings') {
        showAdminBookings();
      } else if (adminSub === 'chat' && parts[2]) {
        showAdminConversationChat(parts[2]);
      } else if (adminSub === 'booking' && parts[2]) {
        showAdminBookingDetail(parts[2]);
      } else {
        this.navigateTo('home');
      }
    } else if (page === 'detail' && parts[1]) {
      this.navigateTo('detail', decodeURIComponent(parts[1]));
    } else if (page === 'booking' && parts[1]) {
      this.navigateToSub('booking', decodeURIComponent(parts[1]));
    } else if (page === 'booking-success' && parts[1]) {
      this.navigateToSub('booking-success', decodeURIComponent(parts[1]));
    } else if (page === 'booking-detail' && parts[1]) {
      if (!AuthService.isLoggedIn) { window.location.hash = 'login'; return; }
      this.navigateToSub('booking-detail', parts[1]);
    } else if (page === 'chat' && parts[1]) {
      if (!AuthService.isLoggedIn) { window.location.hash = 'login'; return; }
      this.navigateToSub('chat', parts[1]);
    } else if (this.subPages.includes(page)) {
      if (this.authRequired.includes(page) && !AuthService.isLoggedIn) {
        window.location.hash = 'login';
        return;
      }
      this.navigateToSub(page);
    } else if (['home', 'programs', 'more'].includes(page)) {
      this.navigateTo(page);
    } else {
      this.navigateTo('home');
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
      case 'booking': renderBookingFormPage(param); break;
      case 'booking-success': renderBookingSuccessPage(param); break;
      case 'booking-detail': renderBookingDetailPage(param); break;
      case 'chat': renderChatPage(param); break;
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
  window.location.hash = page;
}

function navigateToDetail(programId) {
  window.location.hash = `detail/${programId}`;
}

function navigateToPrograms(destination) {
  window.location.hash = 'programs';
  setTimeout(() => {
    if (typeof filterByDestination === 'function' && destination) {
      filterByDestination(destination);
    }
  }, 100);
}
