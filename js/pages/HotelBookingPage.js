// Hotel booking request — "حجز فندق 🏨".
//
// This section is NOT an online booking system. It only collects the guest's
// basic request and sends it to the company WhatsApp number (SiteSettings).
// A support agent then checks real availability and replies with options and
// prices via WhatsApp. No payment, no availability search, no database writes.
//
// The hotels shown are only a helper for the user's choice. They are NEVER
// marked as available/confirmed and no price is shown unless the hotel record
// officially carries one.

// ── Hotel catalog (gathered from the existing programs) ─────────────
// Reuses hotels already defined across all programs (from Supabase or the
// mock fallback). Kept deduplicated by name so the same hotel is never shown
// twice. This makes it easy to add more cities/hotels in the future.
function getAllHotels() {
  const map = {};
  (ProgramsService.getAll() || []).forEach(p => {
    (p.hotels || []).forEach(h => {
      if (!h || !h.name) return;
      if (!map[h.name]) map[h.name] = Object.assign({}, h);
    });
  });
  return Object.keys(map).map(k => map[k]);
}

// Editable city list for future expansion. A hotel whose city matches a known
// city is shown under it; unknown cities the agent can still handle via
// WhatsApp, so the select only offers what we know plus free text.
const HOTEL_CITIES = ['مشهد', 'قم', 'رشت', 'فومن', 'كربلاء', 'النجف', 'مكة المكرمة', 'المدينة المنورة'];

// Room types — keep aligned with the names used in the existing hotel data.
const HOTEL_ROOM_TYPES = ['غرفة مفردة', 'غرفة مزدوجة', 'غرفة ثلاثية', 'غرفة رباعية'];

const STARS_OPTIONS = [1, 2, 3, 4, 5];

// ── View ────────────────────────────────────────────────────────────
function renderHotelBookingPage() {
  const container = document.getElementById('hotels-content');
  const hotels = getAllHotels();

  container.innerHTML = `
    <div class="hotel-page">
      <div class="hotel-page__header">
        <div class="hotel-page__header-row">
          <button class="ticket-page__back" onclick="Router.back()" aria-label="رجوع">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 class="hotel-page__title">حجز فندق 🏨</h1>
        </div>
        <p class="hotel-page__subtitle">أرسل طلبك وسيتواصل معك فريقنا بأفضل الخيارات والأسعار عبر WhatsApp</p>
      </div>

      <div class="hotel-page__card">
        <div class="hotel-page__field">
          <label class="ticket-page__label" for="hotel-city"><span class="ticket-page__label-icon">📍</span> اختر المدينة</label>
          <select class="ticket-page__input" id="hotel-city" onchange="onHotelCityChange()">
            <option value="">اختر المدينة</option>
            ${HOTEL_CITIES.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">🌙</span> عدد الليالي</label>
          <div class="ticket-page__stepper">
            <button type="button" class="ticket-page__stepper-btn" onclick="stepHotelNights(-1)" aria-label="إنقاص">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="ticket-page__stepper-value" id="hotel-nights">1</span>
            <button type="button" class="ticket-page__stepper-btn" onclick="stepHotelNights(1)" aria-label="زيادة">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">⭐</span> تصنيف الفندق</label>
          <div class="hotel-page__stars" id="hotel-stars">
            ${STARS_OPTIONS.map(s => `
              <button type="button" class="hotel-page__star-btn" data-stars="${s}" onclick="selectHotelStars(${s})" aria-label="${s} نجوم">
                ${'⭐'.repeat(s)}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">🍽️</span> نوع الوجبات</label>
          <div class="ticket-page__seg">
            <button type="button" class="ticket-page__seg-btn hotel-page__meal-btn--active" data-meal="breakfast" onclick="selectHotelMeal('breakfast')">إفطار فقط</button>
            <button type="button" class="ticket-page__seg-btn" data-meal="full" onclick="selectHotelMeal('full')">3 وجبات</button>
          </div>
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">👥</span> عدد المسافرين</label>
          <div class="ticket-page__stepper">
            <button type="button" class="ticket-page__stepper-btn" onclick="stepHotelTravelers(-1)" aria-label="إنقاص">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="ticket-page__stepper-value" id="hotel-travelers">1</span>
            <button type="button" class="ticket-page__stepper-btn" onclick="stepHotelTravelers(1)" aria-label="زيادة">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">🛏️</span> نوع الغرفة</label>
          <select class="ticket-page__input" id="hotel-room">
            <option value="">اختر نوع الغرفة</option>
            ${HOTEL_ROOM_TYPES.map(r => `<option value="${r}">${r}</option>`).join('')}
          </select>
        </div>

        <p class="ticket-page__error" id="hotel-error"></p>

        <button type="button" class="ticket-page__submit" onclick="submitHotelRequest()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
          إرسال طلب الفندق عبر WhatsApp
        </button>
        <p class="ticket-page__note">لن يتم تأكيد الحجز الآن. سيفحص موظف الخدمة التوفر ويرسل لك الخيارات والسعر عبر WhatsApp.</p>
      </div>

      <div class="hotel-page__hotels" id="hotel-list" hidden></div>
    </div>
  `;
}

// ── Interactions ────────────────────────────────────────────────────
function stepHotelNights(delta) {
  const el = document.getElementById('hotel-nights');
  if (!el) return;
  const current = parseInt(el.textContent, 10) || 1;
  el.textContent = Math.min(90, Math.max(1, current + delta));
}

function stepHotelTravelers(delta) {
  const el = document.getElementById('hotel-travelers');
  if (!el) return;
  const current = parseInt(el.textContent, 10) || 1;
  el.textContent = Math.min(60, Math.max(1, current + delta));
}

let _hotelStars = null;
function selectHotelStars(stars) {
  _hotelStars = stars;
  document.querySelectorAll('.hotel-page__star-btn').forEach(b => {
    b.classList.toggle('hotel-page__star-btn--active', Number(b.getAttribute('data-stars')) === stars);
  });
}

function selectHotelMeal(meal) {
  const seg = document.querySelector('.hotel-page .ticket-page__seg');
  const btns = seg ? seg.querySelectorAll('[data-meal]') : [];
  btns.forEach(b => b.classList.toggle('hotel-page__meal-btn--active', b.getAttribute('data-meal') === meal));
}

let _selectedHotel = null;
function selectHotel(hotelName) {
  _selectedHotel = hotelName || null;
  document.querySelectorAll('.hotel-page__hotel-card').forEach(c => {
    const isSel = c.getAttribute('data-name') === hotelName;
    c.classList.toggle('hotel-page__hotel-card--selected', isSel);
    const btn = c.querySelector('.hotel-page__hotel-pick');
    if (btn) btn.textContent = isSel ? '✓ أفضل هذا الفندق' : 'أفضل هذا الفندق';
  });
}

// Show the matching hotels for the chosen city (optional helper).
function onHotelCityChange() {
  const city = document.getElementById('hotel-city').value;
  const list = document.getElementById('hotel-list');
  _selectedHotel = null;

  const cityHotels = getAllHotels().filter(h =>
    h.city && h.city.split('/').map(s => s.trim()).includes(city)
  );

  if (!city || cityHotels.length === 0) {
    if (list) { list.hidden = true; list.innerHTML = ''; }
    return;
  }

  if (list) {
    list.hidden = false;
    list.innerHTML = `
      <div class="hotel-page__hotels-title">فنادق متوفرة لدينا في ${_hsEscape(city)}</div>
      <p class="hotel-page__hotels-hint">خيار فقط لمساعدتك. التوفر الفعلي والسعر يحددهما موظف الخدمة.</p>
      <div class="hotel-page__hotels-grid">
        ${cityHotels.map(renderHotelCard).join('')}
      </div>
    `;
  }
}

function renderHotelCard(hotel) {
  const stars = Array(hotel.stars).fill('⭐').join('');
  const images = (hotel.images && hotel.images.length) ? hotel.images : (hotel.image ? [hotel.image] : []);
  const mainImage = images[0] || '';
  const short = (hotel.amenities && hotel.amenities.length)
    ? hotel.amenities.slice(0, 2).join(' · ')
    : '';

  return `
    <div class="hotel-page__hotel-card" data-name="${_hsEscape(hotel.name)}">
      <div class="hotel-page__hotel-img-wrap" ${images.length ? `onclick="openHotelGallery('${_hsEscape(hotel.name)}')"` : ''}>
        ${mainImage
          ? `<img src="${mainImage}" alt="${_hsEscape(hotel.name)}" class="hotel-page__hotel-img">`
          : `<div class="hotel-page__hotel-img-placeholder">🏨</div>`
        }
        ${images.length ? `
          <div class="hotel-page__hotel-photos">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            عرض الصور (${images.length})
          </div>
        ` : ''}
      </div>
      <div class="hotel-page__hotel-body">
        <div class="hotel-page__hotel-name">${_hsEscape(hotel.name)}</div>
        <div class="hotel-page__hotel-stars">${stars}</div>
        ${short ? `<div class="hotel-page__hotel-desc">${_hsEscape(short)}</div>` : ''}
        <button type="button" class="hotel-page__hotel-pick" onclick="selectHotel('${_hsEscape(hotel.name)}')">
          ${_selectedHotel === hotel.name ? '✓ أفضل هذا الفندق' : 'أفضل هذا الفندق'}
        </button>
      </div>
    </div>
  `;
}

// ── Hotel gallery modal (simple, swipe + fullscreen) ────────────────
const _hotelGalleries = {};
function _buildHotelGalleriesMap() {
  if (Object.keys(_hotelGalleries).length) return;
  getAllHotels().forEach(h => {
    const images = (h.images && h.images.length) ? h.images : (h.image ? [h.image] : []);
    if (images.length) _hotelGalleries[h.name] = images;
  });
}

let _hotelGalleryIndex = 0;
function openHotelGallery(name) {
  _buildHotelGalleriesMap();
  const images = _hotelGalleries[name];
  if (!images || !images.length) return;
  _hotelGalleryIndex = 0;
  _showHotelGallerySlide(images, name);
}

function _showHotelGallerySlide(images, name) {
  let overlay = document.getElementById('hotel-gallery-lightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'hotel-gallery-lightbox';
    overlay.id = 'hotel-gallery-lightbox';
    overlay.innerHTML = `
      <div class="hotel-gallery-lightbox__wrap">
        <img src="" alt="" class="hotel-gallery-lightbox__img">
        <button class="hotel-gallery-lightbox__close" onclick="closeHotelGallery()" aria-label="إغلاق">&times;</button>
        <button class="hotel-gallery-lightbox__nav hotel-gallery-lightbox__nav--prev" onclick="hotelGalleryNav(-1)" aria-label="السابقة">&rsaquo;</button>
        <button class="hotel-gallery-lightbox__nav hotel-gallery-lightbox__nav--next" onclick="hotelGalleryNav(1)" aria-label="التالية">&lsaquo;</button>
        <div class="hotel-gallery-lightbox__counter"></div>
        <div class="hotel-gallery-lightbox__thumbs"></div>
      </div>
    `;
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeHotelGallery(); });
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }
  const now = _hotelGalleries[name];
  overlay.setAttribute('data-name', name);
  const img = overlay.querySelector('.hotel-gallery-lightbox__img');
  img.src = now[_hotelGalleryIndex];
  img.alt = name;
  overlay.querySelector('.hotel-gallery-lightbox__counter').textContent =
    (_hotelGalleryIndex + 1) + ' / ' + now.length;
  overlay.querySelector('.hotel-gallery-lightbox__thumbs').innerHTML =
    now.map((src, i) => `
      <button class="hotel-gallery-lightbox__thumb${i === _hotelGalleryIndex ? ' hotel-gallery-lightbox__thumb--active' : ''}"
        onclick="hotelGalleryJump(${i})"><img src="${src}" alt=""></button>
    `).join('');
}

function hotelGalleryNav(dir) {
  const overlay = document.getElementById('hotel-gallery-lightbox');
  if (!overlay) return;
  const name = overlay.getAttribute('data-name');
  const images = _hotelGalleries[name];
  if (!images || !images.length) return;
  _hotelGalleryIndex = (_hotelGalleryIndex + dir + images.length) % images.length;
  _showHotelGallerySlide(images, name);
}

function hotelGalleryJump(i) {
  _hotelGalleryIndex = i;
  const overlay = document.getElementById('hotel-gallery-lightbox');
  const name = overlay ? overlay.getAttribute('data-name') : null;
  if (name) _showHotelGallerySlide(_hotelGalleries[name], name);
}

function closeHotelGallery() {
  const overlay = document.getElementById('hotel-gallery-lightbox');
  if (overlay) overlay.remove();
  document.body.style.overflow = '';
}

// Photo strip inside the card — click opens the gallery lightbox.
function _hsEscape(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── WhatsApp submit ─────────────────────────────────────────────────
// Pure message builder (testable without the DOM).
function buildHotelInquiryMessage(data) {
  const lines = [
    'السلام عليكم، أرغب بطلب حجز فندق:',
    '',
    'المدينة: ' + data.city,
    'عدد الليالي: ' + data.nights + (data.nights === 1 ? ' ليلة' : ' ليالي'),
    'تصنيف الفندق المطلوب: ' + (data.stars ? data.stars + ' نجوم' : 'غير محدد'),
    'الوجبات: ' + data.mealLabel,
    'عدد المسافرين: ' + data.travelers,
    'نوع الغرفة: ' + data.room,
    'الفندق المفضل إن وجد: ' + (data.hotel || 'لا يوجد'),
    '',
    'أرجو التحقق من التوفر وتزويدي بالخيارات والسعر.'
  ];
  return lines.join('\n');
}

function _hotelShowError(message) {
  const err = document.getElementById('hotel-error');
  if (err) err.textContent = message || '';
  if (!message) return;
  if (err) err.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function _hotelInvalid(el, invalid) {
  if (el) {
    if (invalid) el.classList.add('ticket-page__input--invalid');
    else el.classList.remove('ticket-page__input--invalid');
  }
}

function submitHotelRequest() {
  const cityEl = document.getElementById('hotel-city');
  const roomEl = document.getElementById('hotel-room');
  const nightsEl = document.getElementById('hotel-nights');
  const travelersEl = document.getElementById('hotel-travelers');

  _hotelInvalid(cityEl, false);
  _hotelInvalid(roomEl, false);
  _hotelShowError('');

  const city = cityEl ? cityEl.value : '';
  const room = roomEl ? roomEl.value : '';
  const nights = parseInt(nightsEl ? nightsEl.textContent : '1', 10) || 1;
  const travelers = parseInt(travelersEl ? travelersEl.textContent : '1', 10) || 1;

  if (!city) { _hotelInvalid(cityEl, true); _hotelShowError('يرجى اختيار المدينة'); if (cityEl) cityEl.focus(); return; }
  if (!room) { _hotelInvalid(roomEl, true); _hotelShowError('يرجى اختيار نوع الغرفة'); if (roomEl) roomEl.focus(); return; }

  const mealBtn = document.querySelector('.hotel-page .ticket-page__seg .ticket-page__seg-btn--active, .hotel-page .ticket-page__seg .hotel-page__meal-btn--active');
  const meal = mealBtn ? mealBtn.getAttribute('data-meal') : 'breakfast';
  const mealLabel = meal === 'full' ? '3 وجبات' : 'إفطار فقط';

  const message = buildHotelInquiryMessage({
    city: city,
    nights: nights,
    stars: _hotelStars,
    mealLabel: mealLabel,
    travelers: travelers,
    room: room,
    hotel: _selectedHotel
  });

  const link = SiteSettings.whatsAppLink(message);
  if (!link) {
    _hotelShowError('رقم الواتساب غير مضبوط في الإعدادات. يرجى الاتصال بإدارة الموقع.');
    return;
  }
  window.open(link, '_blank', 'noopener');
}
