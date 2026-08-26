function renderDetailPage(programId) {
  const container = document.getElementById('detail-content');
  const program = MockData.programs.find(p => p.id === programId);

  if (!program) {
    container.innerHTML = EmptyState('❌', 'البرنامج غير موجود', 'عذراً، لم نتمكن من العثور على هذا البرنامج.');
    return;
  }

  const statusClass = program.status || 'available';
  const typeLabels = {
    tourism: 'سياحية', religious: 'دينية', adventure: 'برية',
    family: 'عائلية', flight: 'جوية', special: 'خاصة'
  };

  container.innerHTML = `
    <div class="detail-page">
      <div class="detail-page__hero">
        ${program.coverImage
          ? `<img class="detail-page__hero-img" src="${program.coverImage}" alt="${program.name}">`
          : `<div class="detail-page__hero-placeholder" style="background: ${program.gradient}">${program.emoji}</div>`
        }
        <div class="detail-page__hero-overlay"></div>
        <button class="detail-page__hero-back" onclick="history.back()">
          <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <button class="detail-page__hero-share">
          <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
        <div class="detail-page__hero-status">
          <span class="program-card__status program-card__status--${statusClass}">${program.statusText}</span>
        </div>
      </div>

      <div class="detail-page__content">
        <div class="detail-page__type-badge">${typeLabels[program.type] || program.type}</div>
        <h1 class="detail-page__title">${program.name}</h1>
        <div class="detail-page__destination">
          <span>${program.destinationEmoji}</span>
          <span>${program.destination}</span>
        </div>

        <div class="detail-page__info-grid">
          <div class="detail-page__info-card">
            <div class="detail-page__info-label">تاريخ الانطلاق</div>
            <div class="detail-page__info-value">${program.dateDisplay}</div>
          </div>
          <div class="detail-page__info-card">
            <div class="detail-page__info-label">تاريخ العودة</div>
            <div class="detail-page__info-value">${program.dateReturnDisplay}</div>
          </div>
          <div class="detail-page__info-card">
            <div class="detail-page__info-label">المدة</div>
            <div class="detail-page__info-value">${program.days} أيام / ${program.nights} ليالي</div>
          </div>
          <div class="detail-page__info-card">
            <div class="detail-page__info-label">السعر</div>
            <div class="detail-page__info-value" style="color: var(--color-secondary)">${program.price.toLocaleString('ar-SA')} ${program.currency}</div>
          </div>
        </div>

        ${program.highlights ? `
          <div class="detail-page__section">
            <h3 class="detail-page__section-title">أبرز ما في البرنامج</h3>
            <div class="detail-page__highlights">
              ${program.highlights.map(h => `
                <span class="detail-page__highlight-tag">${h}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="detail-page__section">
          <h3 class="detail-page__section-title">وصف البرنامج</h3>
          <p class="detail-page__description">${program.fullDescription}</p>
        </div>

        ${program.includedServices && program.includedServices.length ? `
          <div class="detail-page__section">
            <h3 class="detail-page__section-title">✅ الخدمات المشمولة</h3>
            <ul class="detail-page__services-list detail-page__services-list--included">
              ${program.includedServices.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${program.excludedServices && program.excludedServices.length ? `
          <div class="detail-page__section">
            <h3 class="detail-page__section-title">❌ الخدمات غير المشمولة</h3>
            <ul class="detail-page__services-list detail-page__services-list--excluded">
              ${program.excludedServices.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="detail-page__section">
          <h3 class="detail-page__section-title">📋 برنامج الرحلة</h3>
          <div class="detail-page__itinerary">
            ${program.itinerary.map((day, i) => DayAccordion(day, i)).join('')}
          </div>
        </div>

        ${program.hotels && program.hotels.length ? `
          <div class="detail-page__section">
            <h3 class="detail-page__section-title">🏨 أماكن الإقامة</h3>
            <div class="detail-page__hotels">
              ${program.hotels.map(h => HotelCard(h)).join('')}
            </div>
          </div>
        ` : ''}

        <div class="detail-page__section">
          <h3 class="detail-page__section-title">📝 شروط الحجز</h3>
          <div class="detail-page__terms-card">
            <p>${program.bookingTerms}</p>
          </div>
        </div>

        <div class="detail-page__section" style="margin-bottom: 120px;">
          <h3 class="detail-page__section-title">🔄 شروط الإلغاء</h3>
          <div class="detail-page__terms-card detail-page__terms-card--cancel">
            <p>${program.cancellationPolicy}</p>
          </div>
        </div>
      </div>

      <div class="detail-page__booking-bar">
        <div class="detail-page__booking-price">
          <span class="detail-page__booking-price-label">يبدأ من</span>
          <span class="detail-page__booking-price-value">${program.price.toLocaleString('ar-SA')} ${program.currency}</span>
          <span class="detail-page__booking-price-per">للشخص الواحد</span>
        </div>
        <button class="detail-page__booking-btn" onclick="handleBooking(${program.id})" ${program.status === 'full' ? 'disabled' : ''}>
          ${program.status === 'full' ? 'مكتمل' : 'طلب الحجز'}
        </button>
      </div>
    </div>
  `;
}

function handleBooking(programId) {
  window.location.hash = `booking/${programId}`;
}

function toggleAccordion(header) {
  const accordion = header.closest('.day-accordion');
  accordion.classList.toggle('open');
}
