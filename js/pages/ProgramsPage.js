let filterState = {
  destination: 'all',
  type: 'all',
  duration: 'all',
  price: 'all',
  status: 'all',
  search: ''
};

const PROGRAMS_TYPE_LABELS = {
  all: 'الكل',
  tourism: 'برامج سياحية',
  religious: 'برامج دينية',
  adventure: 'رحلات برية',
  flight: 'رحلات جوية',
  family: 'برامج عائلية',
  special: 'برامج خاصة'
};

const PROGRAMS_STATUS_LABELS = {
  available: 'متاح للحجز',
  published: 'متاح للحجز',
  limited: 'المقاعد محدودة',
  full: 'مكتمل',
  soon: 'قريباً',
  draft: 'مسودة',
  expired: 'منتهي'
};

function _normalizeArabic(str) {
  return String(str || '')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[،,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function _programSearchText(p) {
  return [
    p.name,
    p.destination,
    p.destinationEmoji,
    PROGRAMS_TYPE_LABELS[p.type],
    p.statusText,
    p.shortDescription,
    p.fullDescription,
    p.dateDisplay,
    (p.highlights || []).join(' '),
    (p.itinerary || []).map(d => (d.title || '') + ' ' + (d.city || '')).join(' ')
  ].filter(Boolean).join(' ');
}

function _matchesSearch(p, query) {
  if (!query) return true;
  const text = _normalizeArabic(_programSearchText(p));
  return String(query).split(/\s+/).filter(Boolean).every(token => text.includes(_normalizeArabic(token)));
}

function getVisibleTypeOptions() {
  const seen = {};
  ProgramsService.getVisible().forEach(p => { if (p.type) seen[p.type] = true; });
  return [{ id: 'all', label: 'الكل' }].concat(
    Object.keys(seen).map(t => ({ id: t, label: PROGRAMS_TYPE_LABELS[t] || t }))
  );
}

function getVisibleStatusOptions() {
  const seen = {};
  ProgramsService.getVisible().forEach(p => { if (p.status) seen[p.status] = true; });
  return [{ id: 'all', label: 'الكل' }].concat(
    Object.keys(seen).map(s => ({ id: s, label: PROGRAMS_STATUS_LABELS[s] || s }))
  );
}

function renderProgramsPage() {
  const container = document.getElementById('programs-content');
  const activeFilterCount = getActiveFilterCount();

  container.innerHTML = `
    <div class="programs-page">
      <div class="programs-page__header">
        <h1 class="programs-page__title">البرامج</h1>
        <button class="programs-page__filter-btn ${activeFilterCount > 0 ? 'has-count' : ''}" onclick="openFilterSheet()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          الفلاتر
          ${activeFilterCount > 0 ? `<span class="programs-page__filter-count">${activeFilterCount}</span>` : ''}
        </button>
      </div>
      <div class="programs-page__search">
        ${SearchBar('ابحث بالاسم أو الوجهة...', 'programs-search', filterState.search)}
      </div>
      <div class="programs-page__quick-filters" id="programs-quick-filters">
        ${FilterPanel(getVisibleTypeOptions(), filterState.type, 'setTypeFilter')}
      </div>
      <div class="programs-page__results" id="programs-results">
        <div class="programs-page__results-count">${getFilteredPrograms().length} برنامج</div>
      </div>
      <div class="programs-page__grid" id="programs-grid">
        ${renderFilteredPrograms()}
      </div>
    </div>
    <div id="filter-sheet-container">${FilterBottomSheet()}</div>
  `;
}

function getFilteredPrograms() {
  let filtered = ProgramsService.getVisible();

  if (filterState.search) {
    filtered = filtered.filter(p => _matchesSearch(p, filterState.search));
  }

  if (filterState.type !== 'all') {
    filtered = filtered.filter(p => p.type === filterState.type);
  }

  if (filterState.destination !== 'all') {
    filtered = filtered.filter(p => p.destination === filterState.destination);
  }

  if (filterState.duration !== 'all') {
    const range = MockData.durationRanges.find(d => d.id === filterState.duration);
    if (range) {
      filtered = filtered.filter(p => {
        const days = Number(p.days) || 0;
        return days >= range.min && (range.max === Infinity || days <= range.max);
      });
    }
  }

  if (filterState.price !== 'all') {
    const range = MockData.priceRanges.find(pr => pr.id === filterState.price);
    if (range) {
      filtered = filtered.filter(p => {
        const price = Number(p.price) || 0;
        return price >= range.min && (range.max === Infinity || price <= range.max);
      });
    }
  }

  if (filterState.status !== 'all') {
    filtered = filtered.filter(p => p.status === filterState.status);
  }

  return filtered;
}

function renderFilteredPrograms() {
  const filtered = getFilteredPrograms();
  if (filtered.length === 0) {
    return EmptyState(
      '🔍',
      'لا توجد برامج مطابقة لبحثك',
      'جرّب كلمات أخرى أو أزل الفلاتر لعرض جميع البرامج.',
      '<button class="empty-state__reset-btn" onclick="resetAllFilters()">إزالة الفلاتر</button>'
    );
  }
  return filtered.map(p => ProgramCard(p)).join('');
}

function updateProgramsGrid() {
  const filtered = getFilteredPrograms();
  const grid = document.getElementById('programs-grid');
  const results = document.getElementById('programs-results');
  if (grid) grid.innerHTML = renderFilteredPrograms();
  if (results) results.innerHTML = `<div class="programs-page__results-count">${filtered.length} برنامج</div>`;
  refreshHomeUpcoming();
}

function getHomeUpcomingPrograms() {
  const visible = ProgramsService.getVisible().filter(p => p.status === 'available' || p.status === 'limited' || p.status === 'published');
  if (filterState.search) return visible.filter(p => _matchesSearch(p, filterState.search));
  return visible;
}

function refreshHomeUpcoming() {
  const grid = document.getElementById('home-upcoming-grid');
  if (grid) {
    const items = getHomeUpcomingPrograms();
    grid.innerHTML = items.length
      ? items.map(p => ProgramCard(p)).join('')
      : EmptyState(
          '🔍',
          'لا توجد برامج مطابقة لبحثك',
          '',
          '<button class="empty-state__reset-btn" onclick="resetAllFilters()">إزالة الفلاتر</button>'
        );
  }
  const count = document.getElementById('home-upcoming-count');
  if (count) count.textContent = getHomeUpcomingPrograms().length;
}

function getActiveFilterCount() {
  let count = 0;
  if (filterState.destination !== 'all') count++;
  if (filterState.type !== 'all') count++;
  if (filterState.duration !== 'all') count++;
  if (filterState.price !== 'all') count++;
  if (filterState.status !== 'all') count++;
  return count;
}

function setFilter(key, value) {
  filterState[key] = value;
  refreshFilterSheet();
  updateFilterCountDisplay();
}

function setTypeFilter(typeId) {
  filterState.type = typeId;
  renderProgramsPage();
}

function resetAllFilters() {
  filterState = { destination: 'all', type: 'all', duration: 'all', price: 'all', status: 'all', search: '' };
  const searchInput = document.querySelector('#programs-search .search-bar__input');
  if (searchInput) searchInput.value = '';
  const homeSearchInput = document.querySelector('#home-search .search-bar__input');
  if (homeSearchInput) homeSearchInput.value = '';
  refreshFilterSheet();
  updateFilterCountDisplay();
  updateProgramsGrid();
}

function refreshFilterSheet() {
  const container = document.getElementById('filter-sheet-container');
  if (container) container.innerHTML = FilterBottomSheet();
}

function updateFilterCountDisplay() {
  const countEl = document.getElementById('filter-count');
  if (countEl) countEl.textContent = getFilteredPrograms().length;
}

function applyFilters() {
  closeFilterSheet();
  updateProgramsGrid();
  const btn = document.querySelector('.programs-page__filter-btn');
  const activeCount = getActiveFilterCount();
  if (btn) {
    btn.classList.toggle('has-count', activeCount > 0);
    const existingBadge = btn.querySelector('.programs-page__filter-count');
    if (existingBadge) existingBadge.remove();
    if (activeCount > 0) {
      const badge = document.createElement('span');
      badge.className = 'programs-page__filter-count';
      badge.textContent = activeCount;
      btn.appendChild(badge);
    }
  }
}

function openFilterSheet() {
  refreshFilterSheet();
  const sheet = document.getElementById('filter-sheet');
  if (sheet) {
    requestAnimationFrame(() => sheet.classList.add('active'));
  }
}

function closeFilterSheet() {
  const sheet = document.getElementById('filter-sheet');
  if (sheet) sheet.classList.remove('active');
}

function handleSearch(value) {
  filterState.search = value;
  updateProgramsGrid();
}

function filterByDestination(destination) {
  filterState.destination = destination;
  filterState.search = destination;
  const searchInput = document.querySelector('#programs-search .search-bar__input');
  if (searchInput) searchInput.value = destination;
  updateProgramsGrid();
  return false;
}
