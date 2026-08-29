function renderNotificationsPage() {
  const container = document.getElementById('notifications-content');
  const user = AuthService.currentUser;
  if (!user) { navigateToPage('login'); return; }

  const notifications = NotificationsService.getAll();
  const unreadCount = NotificationsService.getUnreadCount();

  container.innerHTML = `
    <div class="notifications-page">
      <div class="notifications-page__header">
        <button class="notifications-page__back" onclick="Router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 class="notifications-page__title">الإشعارات</h1>
        ${unreadCount > 0 ? `<button class="notifications-page__mark-read" onclick="markAllNotificationsRead()">تعيين الكل كمقروء</button>` : ''}
      </div>

      <div class="notifications-page__list" id="notifications-list">
        ${notifications.length === 0 ? `
          <div class="notifications-page__empty">
            <div class="notifications-page__empty-icon">🔔</div>
            <h3>لا توجد إشعارات</h3>
            <p>ستظهر هنا أي تحديثات أو إشعارات جديدة</p>
          </div>
        ` : notifications.map(notif => {
          const typeConfig = {
            welcome: { icon: '👋', color: '#1B3A5C' },
            promo: { icon: '🎁', color: '#C8963E' },
            update: { icon: '📢', color: '#2D7A3A' },
            order: { icon: '📦', color: '#E8A317' },
            system: { icon: '⚙️', color: '#666' }
          };
          const type = typeConfig[notif.type] || typeConfig.system;
          return `
            <div class="notifications-page__card ${notif.read ? '' : 'notifications-page__card--unread'}" onclick="readNotification('${notif.id}', this)">
              <div class="notifications-page__card-icon" style="background:${type.color}15; color:${type.color}">${type.icon}</div>
              <div class="notifications-page__card-body">
                <h4 class="notifications-page__card-title">${notif.title}</h4>
                <p class="notifications-page__card-text">${notif.message}</p>
                <span class="notifications-page__card-time">${formatNotificationTime(notif.timestamp)}</span>
              </div>
              ${!notif.read ? '<span class="notifications-page__card-dot"></span>' : ''}
              <button class="notifications-page__card-delete" onclick="event.stopPropagation(); deleteNotification('${notif.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function formatNotificationTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return time.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function readNotification(id, el) {
  NotificationsService.markAsRead(id);
  el.classList.remove('notifications-page__card--unread');
  const dot = el.querySelector('.notifications-page__card-dot');
  if (dot) dot.remove();
  updateNotificationBadge();
}

function deleteNotification(id) {
  NotificationsService.remove(id);
  const el = document.querySelector(`.notifications-page__card[onclick*="'${id}'"]`);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-100%)';
    setTimeout(() => renderNotificationsPage(), 300);
  } else {
    renderNotificationsPage();
  }
  updateNotificationBadge();
}

function markAllNotificationsRead() {
  NotificationsService.markAllAsRead();
  renderNotificationsPage();
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const count = NotificationsService.getUnreadCount();
  document.querySelectorAll('.notification-badge').forEach(badge => {
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  });
}
