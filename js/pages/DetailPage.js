function renderDetailPage(programId) {
  const container = document.getElementById('detail-content');
  const program = ProgramsService.getById(programId);

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
        <button class="detail-page__hero-back" onclick="Router.back()">
          <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <button class="detail-page__hero-share" onclick="shareProgram('${program.id}')" aria-label="مشاركة الرابط">
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

        ${GallerySection()}

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
            <h3 class="detail-page__section-title">⭐ مميزات البرنامج</h3>
            <ul class="detail-page__features">
              ${program.includedServices.map(s => `
                <li class="detail-page__feature">
                  <svg class="detail-page__feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${s}</span>
                </li>
              `).join('')}
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
        <button class="detail-page__booking-btn" onclick="handleBooking('${program.id}')" ${program.status === 'full' ? 'disabled' : ''}>
          ${program.status === 'full' ? 'مكتمل' : 'طلب الحجز'}
        </button>
      </div>
    </div>
  `;
}

function handleBooking(programId) {
  // In-app booking flow (real Supabase). WhatsApp remains as an option
  // on the booking form and inside the booking detail page.
  Router.go('booking/' + programId);
}

var _shareProgramId = null;

function shareProgram(programId) {
  _shareProgramId = programId;

  if (navigator.share) {
    // Native share sheet: best on phones (includes WhatsApp, messages, etc.)
    const text = getShareMessage(programId, true);
    const url = getProgramUrl(programId);
    navigator.share({ title: text, text: text, url: url })
      .catch(function(err) {
        // User dismissed or API unavailable → fall back to the custom sheet.
        if (err && err.name !== 'AbortError') openShareSheet();
      });
    return;
  }

  openShareSheet();
}

function getProgramUrl(programId) {
  return 'https://barakat-al-manasik.web.app/p/' + encodeURIComponent(programId) + '/';
}

function getShareMessage(programId, short) {
  const program = ProgramsService.getById(programId);
  if (!program) return 'بركات المناسك | برامج العمرة والرحلات المميزة';
  const name = 'بركات المناسك | ' + program.name;
  if (short) return name;
  const details = [program.destination, program.dateDisplay, program.days + ' أيام / ' + program.nights + ' ليالي']
    .filter(Boolean).join(' · ');
  const price = program.price ? program.price.toLocaleString('ar-SA') + ' ' + program.currency : '';
  return name + '\n' + details + (price ? '\n' + price : '');
}

function openShareSheet() {
  const program = _shareProgramId ? ProgramsService.getById(_shareProgramId) : null;
  const existing = document.querySelector('.share-sheet-overlay') || document.querySelector('.share-sheet');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'share-sheet-overlay';
  overlay.onclick = closeShareSheet;

  const sheet = document.createElement('div');
  sheet.className = 'share-sheet';
  sheet.innerHTML = `
    <div class="share-sheet__handle"></div>
    <div class="share-sheet__header">
      <h3 class="share-sheet__title">مشاركة البرنامج</h3>
      <span class="share-sheet__subtitle">${program ? program.name : ''}</span>
    </div>
    <div class="share-sheet__grid">
      ${navigator.share ? `<button class="share-sheet__item" onclick="nativeShare()">
        <span class="share-sheet__icon share-sheet__icon--native">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </span>
        <span>مشاركة النظام</span>
      </button>` : ''}
      <button class="share-sheet__item" onclick="shareVia('whatsapp')">
        <span class="share-sheet__icon share-sheet__icon--whatsapp">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
        </span>
        <span>واتساب</span>
      </button>
      <button class="share-sheet__item" onclick="shareVia('telegram')">
        <span class="share-sheet__icon share-sheet__icon--telegram">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        </span>
        <span>تيليجرام</span>
      </button>
      <button class="share-sheet__item" onclick="shareVia('facebook')">
        <span class="share-sheet__icon share-sheet__icon--facebook">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </span>
        <span>فيسبوك</span>
      </button>
    </div>
    <button class="share-sheet__copy" onclick="copyShareLink()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
      نسخ رابط البرنامج
    </button>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(sheet);

  requestAnimationFrame(function() {
    overlay.classList.add('share-sheet-overlay--show');
    sheet.classList.add('share-sheet--show');
  });
}

function closeShareSheet() {
  const overlay = document.querySelector('.share-sheet-overlay');
  const sheet = document.querySelector('.share-sheet');
  if (overlay) {
    overlay.classList.remove('share-sheet-overlay--show');
    setTimeout(function() { overlay.remove(); }, 300);
  }
  if (sheet) {
    sheet.classList.remove('share-sheet--show');
    setTimeout(function() { sheet.remove(); }, 300);
  }
}

function nativeShare() {
  if (!_shareProgramId) return;
  const text = getShareMessage(_shareProgramId, true);
  const url = getProgramUrl(_shareProgramId);
  navigator.share({ title: text, text: text, url: url }).catch(function() {});
  closeShareSheet();
}

function shareVia(channel) {
  if (!_shareProgramId) return;
  const message = encodeURIComponent(getShareMessage(_shareProgramId, false));
  const url = getProgramUrl(_shareProgramId);
  let link = url;
  if (channel === 'whatsapp') {
    link = 'https://api.whatsapp.com/send?text=' + message + '%20' + encodeURIComponent(url);
  } else if (channel === 'telegram') {
    link = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + message;
  } else if (channel === 'facebook') {
    link = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
  }
  window.open(link, '_blank', 'noopener,noreferrer');
  closeShareSheet();
}

function copyShareLink() {
  if (!_shareProgramId) return;
  const url = getProgramUrl(_shareProgramId);
  const done = function() { closeShareSheet(); showShareToast('تم نسخ رابط المشاركة'); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(function(){ fallbackCopy(url); done(); });
  } else {
    fallbackCopy(url); done();
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

function showShareToast(message) {
  var prev = document.querySelector('.share-toast');
  if (prev) prev.remove();
  var el = document.createElement('div');
  el.className = 'share-toast';
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.classList.add('share-toast--show'); });
  setTimeout(function(){
    el.classList.remove('share-toast--show');
    setTimeout(function(){ el.remove(); }, 300);
  }, 2400);
}

function toggleAccordion(header) {
  const accordion = header.closest('.day-accordion');
  accordion.classList.toggle('open');
}
