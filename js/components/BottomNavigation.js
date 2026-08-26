function BottomNavigation(currentPage) {
  const items = [
    { id: "home", label: "الرئيسية", icon: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
    { id: "programs", label: "البرامج", icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>` },
    { id: "bookings", label: "الحجوزات", icon: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
    { id: "more", label: "المزيد", icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>` }
  ];

  return `
    <nav class="bottom-nav">
      ${items.map(item => `
        <button class="bottom-nav__item ${currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
          ${item.icon}
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}
