function renderBottomNav(page) {
  document.getElementById('bottom-nav').innerHTML = BottomNavigation(page || 'home');
}

function isAdminDomain() {
  const host = window.location.hostname;
  return host.startsWith('admin.') || host.includes('admin-');
}

async function initApp() {
  try {
    if (typeof SupabaseClient !== 'undefined') {
      SupabaseClient.init();
    }
    await AuthService.init();
  } catch (e) {
    console.error('Auth initialization error:', e);
  }

  try {
    FavoritesService.init();
    NotificationsService.init();
    OrdersService.init();
  } catch (e) {
    console.error('Service initialization error:', e);
  }

  renderHeader();
  renderBottomNav('home');
  renderHomePage();
  renderProgramsPage();
  renderMorePage();

  if (isAdminDomain() && !window.location.hash) {
    window.location.hash = 'admin/login';
  }

  Router.init();

  setupBottomNavListeners();

  NotificationsService.onChange(() => {
    const badge = document.querySelector('.notifications-page__badge');
    if (badge) {
      const count = NotificationsService.getUnreadCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  });

  AuthService.onChange(() => {
    renderMorePage();
    renderHeader();
  });
}

function setupBottomNavListeners() {
  document.querySelectorAll('.bottom-nav__item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPage(item.dataset.page);
    });
  });
}

document.addEventListener('DOMContentLoaded', initApp);
