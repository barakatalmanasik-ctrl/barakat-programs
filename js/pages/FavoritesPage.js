function renderFavoritesPage() {
  const container = document.getElementById('favorites-content');
  const user = AuthService.currentUser;
  if (!user) { navigateToPage('login'); return; }

  const favoriteIds = FavoritesService.getAll();
  const favoritePrograms = MockData.programs.filter(p => favoriteIds.includes(String(p.id)));

  container.innerHTML = `
    <div class="favorites-page">
      <div class="favorites-page__header">
        <button class="favorites-page__back" onclick="navigateToPage('more')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 class="favorites-page__title">المفضلة</h1>
      </div>

      <div class="favorites-page__list" id="favorites-list">
        ${favoritePrograms.length === 0 ? `
          <div class="favorites-page__empty">
            <div class="favorites-page__empty-icon">❤️</div>
            <h3>لا توجد برامج مفضلة</h3>
            <p>أضف البرامج التي تعجبك بالضغط على أيقونة القلب</p>
            <button class="favorites-page__empty-btn" onclick="navigateToPage('programs')">تصفح البرامج</button>
          </div>
        ` : favoritePrograms.map(program => {
          const statusClass = program.status || 'available';
          const typeLabels = {
            tourism: 'سياحية', religious: 'دينية', adventure: 'برية',
            family: 'عائلية', flight: 'جوية', special: 'خاصة'
          };
          return `
            <div class="favorites-page__card" onclick="navigateToDetail(${program.id})">
              <div class="favorites-page__card-image">
                ${program.coverImage
                  ? `<img src="${program.coverImage}" alt="${program.name}">`
                  : `<div class="favorites-page__card-placeholder" style="background: ${program.gradient}">${program.emoji}</div>`
                }
                <span class="program-card__status program-card__status--${statusClass}">${program.statusText}</span>
              </div>
              <div class="favorites-page__card-body">
                <div class="favorites-page__card-destination">${program.destinationEmoji} ${program.destination}</div>
                <h3 class="favorites-page__card-name">${program.name}</h3>
                <p class="favorites-page__card-desc">${program.shortDescription}</p>
                <div class="favorites-page__card-meta">
                  <span>📅 ${program.dateDisplay}</span>
                  <span>⏱️ ${program.days} أيام</span>
                </div>
                <div class="favorites-page__card-footer">
                  <span class="favorites-page__card-price">${program.price.toLocaleString('ar-SA')} ${program.currency}</span>
                  <button class="favorites-page__card-remove" onclick="event.stopPropagation(); removeFavorite(${program.id})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                   إزالة
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function removeFavorite(programId) {
  FavoritesService.remove(programId);
  renderFavoritesPage();
}
