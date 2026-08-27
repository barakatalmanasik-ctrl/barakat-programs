function ProgramCard(program) {
  const statusClass = program.status || 'available';
  const typeLabels = {
    tourism: 'سياحية', religious: 'دينية', adventure: 'برية',
    family: 'عائلية', flight: 'جوية', special: 'خاصة'
  };
  const isFav = typeof FavoritesService !== 'undefined' && FavoritesService.isFavorite(program.id);

  return `
    <article class="program-card" data-program-id="${program.id}" onclick="navigateToDetail('${program.id}')">
      <div class="program-card__image">
        ${program.coverImage
          ? `<img src="${program.coverImage}" alt="${program.name}">`
          : `<div class="program-card__image-placeholder" style="background: ${program.gradient}">${program.emoji}</div>`
        }
        <span class="program-card__status program-card__status--${statusClass}">${program.statusText}</span>
        <span class="program-card__type-badge">${typeLabels[program.type] || program.type}</span>
        <button class="program-card__fav ${isFav ? 'program-card__fav--active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${program.id}', this)" aria-label="إضافة للمفضلة">
          <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="program-card__body">
        <div class="program-card__destination">
          <span>${program.destinationEmoji}</span>
          <span>${program.destination}</span>
        </div>
        <h3 class="program-card__name">${program.name}</h3>
        <p class="program-card__desc">${program.shortDescription}</p>
        <div class="program-card__meta">
          <span class="program-card__meta-item">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${program.dateDisplay}
          </span>
          <span class="program-card__meta-item">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${program.days} أيام / ${program.nights} ليالي
          </span>
        </div>
        <div class="program-card__footer">
          <div class="program-card__price">
            <span class="program-card__price-label">يبدأ من</span>
            <span class="program-card__price-value">${program.price.toLocaleString('ar-SA')} <span class="program-card__price-currency">${program.currency}</span></span>
          </div>
          <button class="program-card__btn" onclick="event.stopPropagation(); navigateToDetail('${program.id}')">عرض البرنامج</button>
        </div>
      </div>
    </article>
  `;
}

function toggleFavorite(programId, btn) {
  const isFav = FavoritesService.toggle(programId);
  btn.classList.toggle('program-card__fav--active', isFav);
  const svg = btn.querySelector('svg');
  svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
  btn.style.transform = 'scale(1.3)';
  setTimeout(() => btn.style.transform = '', 200);
}
