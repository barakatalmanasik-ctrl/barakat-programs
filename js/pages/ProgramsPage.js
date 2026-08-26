let filterState = {
  destination: 'all',
  type: 'all',
  duration: 'all',
  price: 'all',
  status: 'all',
  search: ''
};

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
        ${SearchBar('ابحث بالاسم أو الوجهة...', 'programs-search')}
      </div>
      <div class="programs-page__quick-filters" id="programs-quick-filters">
        ${FilterPanel(MockData.tripTypes, filterState.type, 'setTypeFilter')}
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
  let filtered = MockData.programs;

  if (filterState.search) {
    const q = filterState.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.destination.includes(q) ||
      p.shortDescription.includes(q) ||
      p.fullDescription.includes(q)
    );
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
      filtered = filtered.filter(p => p.days >= range.min && p.days <= range.max);
    }
  }

  if (filterState.price !== 'all') {
    const range = MockData.priceRanges.find(p => p.id === filterState.price);
    if (range) {
      filtered = filtered.filter(p => p.price >= range.min && p.price < range.max);
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
    return EmptyState('🔍', 'لا توجد برامج', 'لم نتمكن من العثور على برامج تطابق معايير البحث. جرّب تغيير الفلاتر.');
  }
  return filtered.map(p => ProgramCard(p)).join('');
}

function updateProgramsGrid() {
  const filtered = getFilteredPrograms();
  const grid = document.getElementById('programs-grid');
  const results = document.getElementById('programs-results');
  if (grid) grid.innerHTML = renderFilteredPrograms();
  if (results) results.innerHTML = `<div class="programs-page__results-count">${filtered.length} برنامج</div>`;
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
}
