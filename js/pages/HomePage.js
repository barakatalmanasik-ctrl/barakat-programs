function renderHomePage() {
  const container = document.getElementById('home-content');
  const upcomingPrograms = getHomeUpcomingPrograms();
  const waHref = SiteSettings.whatsAppLink('السلام عليكم، أود الاستفسار عن برامجكم السياحية.');

  container.innerHTML = `
    <div class="welcome-section">
      <div class="welcome-section__greeting">مرحباً بك</div>
      <h1 class="welcome-section__name">اكتشف رحلتك المثالية</h1>
    </div>

    <div class="section" style="padding-top: 0">
      ${SearchBar('ابحث عن برنامج أو وجهة...', 'home-search')}
    </div>

    <div class="section" style="padding-top: 0">
      <div class="home-categories">
        <a class="home-categories__card" href="#programs">
          <span class="home-categories__icon home-categories__icon--programs">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </span>
          <span class="home-categories__body">
            <span class="home-categories__title">🕌 البرامج السياحية</span>
            <span class="home-categories__desc">اكتشف برامجنا السياحية والرحلات القادمة</span>
          </span>
          <svg class="home-categories__arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
        <a class="home-categories__card" href="#tickets">
          <span class="home-categories__icon home-categories__icon--tickets">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.34 9.4a2 2 0 0 1 1.42-2.54l12.92-3.34a2 2 0 0 1 2.45 2.45l-3.34 12.92a2 2 0 0 1-2.54 1.42L10 15l-1.5-3L6.6 11.5 3.5 9.9a2 2 0 0 1-.16-.5z"/><path d="M5.5 13.5 8 15.5"/></svg>
          </span>
          <span class="home-categories__body">
            <span class="home-categories__title">✈️ تذاكر الطيران</span>
            <span class="home-categories__desc">ابحث عن تذكرتك واستفسر عن الرحلات المتوفرة</span>
          </span>
          <svg class="home-categories__arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      </div>
    </div>

    <div class="section" style="padding-top: 0">
      <div class="section__header">
        <h2 class="section__title">البرامج القادمة <span id="home-upcoming-count" class="home-upcoming-count">${upcomingPrograms.length}</span></h2>
        <a class="section__link" href="#programs">
          عرض الكل
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </a>
      </div>
      <div class="programs-page__grid" id="home-upcoming-grid">
        ${upcomingPrograms.length
          ? upcomingPrograms.map(p => ProgramCard(p)).join('')
          : EmptyState(
              '🔍',
              'لا توجد برامج مطابقة لبحثك',
              '',
              '<button class="empty-state__reset-btn" onclick="resetAllFilters()">إزالة الفلاتر</button>'
            )}
      </div>
    </div>

    <div class="section" style="padding-top: 0">
      <div class="section__header">
        <h2 class="section__title">رحلات حسب الوجهة</h2>
      </div>
      <div class="destinations-scroll">
        ${ProgramsService.getDestinations().map(d => DestinationCard(d)).join('')}
      </div>
    </div>

    <div class="cta-section">
      <h3 class="cta-section__title">تحتاج مساعدة في اختيار رحلتك؟</h3>
      <p class="cta-section__text">فريقنا المتخصص جاهز لمساعدتك في العثور على البرنامج المثالي</p>
      <a href="${waHref || '#'}" target="_blank" rel="noopener" class="cta-section__btn" aria-label="تواصل معنا عبر واتساب">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        تواصل معنا
      </a>
    </div>
  `;
}
