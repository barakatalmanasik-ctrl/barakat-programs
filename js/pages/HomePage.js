function renderHomePage() {
  const container = document.getElementById('home-content');
  const upcomingPrograms = getHomeUpcomingPrograms();

  container.innerHTML = `
    <div class="welcome-section">
      <div class="welcome-section__greeting">مرحباً بك</div>
      <h1 class="welcome-section__name">اكتشف رحلتك المثالية</h1>
    </div>

    <div class="section" style="padding-top: 0">
      ${SearchBar('ابحث عن برنامج أو وجهة...', 'home-search')}
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
      <a href="https://wa.me/9647730332831" target="_blank" rel="noopener" class="cta-section__btn" aria-label="تواصل معنا عبر واتساب">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        تواصل معنا
      </a>
    </div>
  `;
}
