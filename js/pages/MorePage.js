function renderMorePage() {
  const container = document.getElementById('more-content');
  const user = AuthService.currentUser;
  const unreadCount = NotificationsService.getUnreadCount();

  container.innerHTML = `
    <div class="more-page">
      ${user ? `
        <div class="more-page__user-card" onclick="navigateToPage('profile')">
          <div class="more-page__user-avatar">${user.name.charAt(0)}</div>
          <div class="more-page__user-info">
            <div class="more-page__user-name">${user.name}</div>
            <div class="more-page__user-email">${user.email}</div>
          </div>
          <svg class="more-page__menu-arrow" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
      ` : `
        <div class="more-page__auth-card">
          <div class="more-page__auth-icon">👤</div>
          <h2 class="more-page__auth-title">سجل الدخول لمتابعة طلباتك</h2>
          <p class="more-page__auth-text">أدخل حسابك لتجربة أفضل والحصول على عروض حصرية</p>
          <div class="more-page__auth-buttons">
            <button class="more-page__auth-btn more-page__auth-btn--primary" onclick="navigateToPage('login')">تسجيل الدخول</button>
            <button class="more-page__auth-btn more-page__auth-btn--outline" onclick="navigateToPage('register')">إنشاء حساب</button>
          </div>
        </div>
      `}

      <div class="more-page__menu">
        ${MockData.menuItems.map(item => {
          let badge = '';
          if (item.id === 'notifications' && unreadCount > 0) {
            badge = `<span class="more-page__menu-badge">${unreadCount > 9 ? '9+' : unreadCount}</span>`;
          }
          return `
            <div class="more-page__menu-item" onclick="handleMenuClick('${item.id}')">
              <div class="more-page__menu-icon" style="background: ${item.color}">
                ${item.icon}
              </div>
              <div class="more-page__menu-text">
                <div class="more-page__menu-label">${item.label}</div>
                <div class="more-page__menu-desc">${item.desc}</div>
              </div>
              ${badge}
              <svg class="more-page__menu-arrow" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function handleMenuClick(itemId) {
  const authRequired = ['profile', 'orders', 'notifications', 'favorites'];
  const user = AuthService.currentUser;

  if (authRequired.includes(itemId) && !user) {
    navigateToPage('login');
    return;
  }

  const pageMap = {
    profile: 'profile',
    orders: 'orders',
    notifications: 'notifications',
    favorites: 'favorites',
    programs: 'programs'
  };

  if (pageMap[itemId]) {
    navigateToPage(pageMap[itemId]);
    return;
  }

  if (itemId === 'contact') {
    const link = SiteSettings.whatsAppLink('السلام عليكم، أود التواصل مع شركة بركات المناسك.');
    if (link) window.open(link, '_blank', 'noopener');
    return;
  }

  alert('قريباً إن شاء الله');
}
