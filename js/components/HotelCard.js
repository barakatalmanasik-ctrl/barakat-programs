function HotelCard(hotel) {
  const stars = Array(hotel.stars).fill(`<svg class="hotel-card__star" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`).join('');

  return `
    <div class="hotel-card">
      <div class="hotel-card__top">
        ${hotel.image
          ? `<img src="${hotel.image}" alt="${hotel.name}" class="hotel-card__image">`
          : `<div class="hotel-card__image-placeholder">🏨</div>`
        }
        <div class="hotel-card__info">
          <div class="hotel-card__name">${hotel.name}</div>
          <div class="hotel-card__stars">${stars}</div>
          <div class="hotel-card__location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${hotel.city}
          </div>
        </div>
      </div>
      <div class="hotel-card__details">
        <div class="hotel-card__detail">
          <span class="hotel-card__detail-label">نوع الغرفة</span>
          <span class="hotel-card__detail-value">${hotel.roomType}</span>
        </div>
        <div class="hotel-card__detail">
          <span class="hotel-card__detail-label">عدد الليالي</span>
          <span class="hotel-card__detail-value">${hotel.nights} ليالي</span>
        </div>
        ${hotel.rating ? `
          <div class="hotel-card__detail">
            <span class="hotel-card__detail-label">التقييم</span>
            <span class="hotel-card__detail-value hotel-card__detail-value--rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-secondary)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${hotel.rating}
            </span>
          </div>
        ` : ''}
      </div>
      ${hotel.amenities && hotel.amenities.length ? `
        <div class="hotel-card__amenities">
          ${hotel.amenities.map(a => `<span class="hotel-card__amenity">${a}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}
