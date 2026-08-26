function Header() {
  const user = AuthService.currentUser;
  const unreadCount = NotificationsService.getUnreadCount();

  return `
    <div class="header">
      <div class="header__brand">
        <div class="header__logo">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#C8963E"/>
            <path d="M2 17l10 5 10-5" stroke="#C8963E" stroke-width="2" fill="none"/>
            <path d="M2 12l10 5 10-5" stroke="#C8963E" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div>
          <div class="header__title">بركات المناسك</div>
          <div class="header__subtitle">Barakat Al-Manasik</div>
        </div>
      </div>
      <div class="header__actions">
        ${user ? `
          <button class="header__action-btn" title="حسابي" onclick="navigateToPage('profile')">
            <div class="header__avatar">${user.name.charAt(0)}</div>
          </button>
        ` : ''}
        <button class="header__action-btn" title="الإشعارات" onclick="navigateToPage('notifications')">
          <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          ${unreadCount > 0 ? `<span class="header__badge">${unreadCount > 9 ? '9+' : unreadCount}</span>` : ''}
        </button>
      </div>
    </div>
  `;
}

function renderHeader() {
  const user = AuthService.currentUser;
  const unreadCount = NotificationsService.getUnreadCount();

  document.getElementById('app-header').innerHTML = `
    <div class="header">
      <div class="header__brand">
        <div class="header__logo">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#C8963E"/>
            <path d="M2 17l10 5 10-5" stroke="#C8963E" stroke-width="2" fill="none"/>
            <path d="M2 12l10 5 10-5" stroke="#C8963E" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div>
          <div class="header__title">بركات المناسك</div>
          <div class="header__subtitle">Barakat Al-Manasik</div>
        </div>
      </div>
      <div class="header__actions">
        ${user ? `
          <button class="header__action-btn" title="حسابي" onclick="navigateToPage('profile')">
            <div class="header__avatar">${user.name.charAt(0)}</div>
          </button>
        ` : ''}
        <button class="header__action-btn" title="الإشعارات" onclick="navigateToPage('notifications')">
          <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          ${unreadCount > 0 ? `<span class="header__badge">${unreadCount > 9 ? '9+' : unreadCount}</span>` : ''}
        </button>
      </div>
    </div>
  `;
}
