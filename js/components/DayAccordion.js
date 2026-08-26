function DayAccordion(dayData, index) {
  const isOpen = index === 0 ? 'open' : '';

  const mealIcons = {
    breakfast: { label: 'فطور', emoji: '☀️' },
    lunch: { label: 'غداء', emoji: '🍽️' },
    dinner: { label: 'عشاء', emoji: '🌙' }
  };

  const activeMealLabels = [];
  if (dayData.meals) {
    if (dayData.meals.breakfast) activeMealLabels.push('فطور');
    if (dayData.meals.lunch) activeMealLabels.push('غداء');
    if (dayData.meals.dinner) activeMealLabels.push('عشاء');
  }

  return `
    <div class="day-accordion ${isOpen}" data-accordion>
      <div class="day-accordion__header" onclick="toggleAccordion(this)">
        <div class="day-accordion__header-left">
          <div class="day-accordion__number">${dayData.day}</div>
          <div>
            <div class="day-accordion__title">${dayData.title}</div>
            <div class="day-accordion__subtitle">${dayData.city}${activeMealLabels.length ? ' · ' + activeMealLabels.join(' - ') : ''}</div>
          </div>
        </div>
        <svg class="day-accordion__arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="day-accordion__content">
        <div class="day-accordion__body">

          ${dayData.visits && dayData.visits.length ? `
            <div class="day-accordion__section">
              <div class="day-accordion__section-title">📍 الزيارات</div>
              ${dayData.visits.map(v => `
                <div class="day-accordion__item">
                  <div class="day-accordion__item-icon day-accordion__item-icon--visit">📍</div>
                  <div class="day-accordion__item-content">
                    <div class="day-accordion__item-text">${v}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${dayData.activities && dayData.activities.length ? `
            <div class="day-accordion__section">
              <div class="day-accordion__section-title">🎯 الأنشطة</div>
              ${dayData.activities.map(a => `
                <div class="day-accordion__item">
                  <div class="day-accordion__item-icon day-accordion__item-icon--activity">🎯</div>
                  <div class="day-accordion__item-content">
                    <div class="day-accordion__item-text">${a}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${dayData.meals ? `
            <div class="day-accordion__section">
              <div class="day-accordion__section-title">🍽️ الوجبات</div>
              <div class="day-accordion__meals-row">
                ${Object.entries(dayData.meals).map(([key, included]) => `
                  <span class="day-accordion__meal ${included ? 'day-accordion__meal--included' : 'day-accordion__meal--excluded'}">
                    ${mealIcons[key].emoji} ${mealIcons[key].label}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${dayData.hotel ? `
            <div class="day-accordion__section">
              <div class="day-accordion__section-title">🏨 الإقامة</div>
              <div class="day-accordion__hotel-mini">
                <span class="day-accordion__hotel-name">${dayData.hotel.name}</span>
                <span class="day-accordion__hotel-detail">${dayData.hotel.stars} نجوم · ${dayData.hotel.roomType} · ${dayData.hotel.nights} ليالي</span>
              </div>
            </div>
          ` : ''}

          ${dayData.notes ? `
            <div class="day-accordion__notes">
              <strong>ملاحظات:</strong> ${dayData.notes}
            </div>
          ` : ''}

        </div>
      </div>
    </div>
  `;
}
