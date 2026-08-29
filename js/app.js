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
    await ProgramsService.init();
    await FavoritesService.init();
    await NotificationsService.init();
  } catch (e) {
    console.error('Service initialization error:', e);
  }

  renderHeader();
  renderBottomNav('home');
  renderHomePage();
  renderProgramsPage();
  renderMorePage();

  if (isAdminDomain() && !window.location.hash) {
    try { history.replaceState(null, '', '#admin/login'); }
    catch (e) { window.location.hash = 'admin/login'; }
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

  AuthService.onChange(async (user) => {
    renderMorePage();
    renderHeader();
    if (user) {
      // Re-sync Supabase data when a user signs in/refreshes session
      try {
        await FavoritesService.syncFromServer();
        await NotificationsService.syncFromServer();
      } catch (e) { console.error('Auth-sync error:', e); }
    }
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
