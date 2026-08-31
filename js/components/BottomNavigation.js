function BottomNavigation(currentPage) {
  const items = [
    { id: "home", label: "الرئيسية", icon: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
    { id: "programs", label: "البرامج", icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>` },
    { id: "tickets", label: "التذاكر", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.34 9.4a2 2 0 0 1 1.42-2.54l12.92-3.34a2 2 0 0 1 2.45 2.45l-3.34 12.92a2 2 0 0 1-2.54 1.42L10 15l-1.5-3L6.6 11.5 3.5 9.9a2 2 0 0 1-.16-.5z"/><path d="M5.5 13.5 8 15.5"/></svg>` },
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
