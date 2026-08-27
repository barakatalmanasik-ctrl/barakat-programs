function FilterBottomSheet() {
  return `
    <div class="filter-sheet" id="filter-sheet">
      <div class="filter-sheet__overlay" onclick="closeFilterSheet()"></div>
      <div class="filter-sheet__panel">
        <div class="filter-sheet__handle"></div>
        <div class="filter-sheet__header">
          <h3 class="filter-sheet__title">الفلاتر</h3>
          <button class="filter-sheet__reset" onclick="resetAllFilters()">مسح الكل</button>
        </div>
        <div class="filter-sheet__body" id="filter-sheet-body">

          <div class="filter-sheet__group">
            <div class="filter-sheet__group-title">الوجهة</div>
            <div class="filter-sheet__chips" id="filter-destinations">
              <button class="filter-sheet__chip ${filterState.destination === 'all' ? 'active' : ''}" onclick="setFilter('destination', 'all')">الكل</button>
              ${ProgramsService.getDestinations().map(d => `
                <button class="filter-sheet__chip ${filterState.destination === d.name ? 'active' : ''}" onclick="setFilter('destination', '${d.name}')">
                  ${d.emoji} ${d.name}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="filter-sheet__group">
            <div class="filter-sheet__group-title">نوع الرحلة</div>
            <div class="filter-sheet__chips" id="filter-types">
              ${MockData.tripTypes.map(t => `
                <button class="filter-sheet__chip ${filterState.type === t.id ? 'active' : ''}" onclick="setFilter('type', '${t.id}')">
                  ${t.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="filter-sheet__group">
            <div class="filter-sheet__group-title">مدة الرحلة</div>
            <div class="filter-sheet__chips" id="filter-duration">
              ${MockData.durationRanges.map(d => `
                <button class="filter-sheet__chip ${filterState.duration === d.id ? 'active' : ''}" onclick="setFilter('duration', '${d.id}')">
                  ${d.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="filter-sheet__group">
            <div class="filter-sheet__group-title">نطاق السعر (د.ع)</div>
            <div class="filter-sheet__chips" id="filter-price">
              ${MockData.priceRanges.map(p => `
                <button class="filter-sheet__chip ${filterState.price === p.id ? 'active' : ''}" onclick="setFilter('price', '${p.id}')">
                  ${p.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="filter-sheet__group">
            <div class="filter-sheet__group-title">حالة البرنامج</div>
            <div class="filter-sheet__chips" id="filter-status">
              <button class="filter-sheet__chip ${filterState.status === 'all' ? 'active' : ''}" onclick="setFilter('status', 'all')">الكل</button>
              <button class="filter-sheet__chip ${filterState.status === 'available' ? 'active' : ''}" onclick="setFilter('status', 'available')">متاح للحجز</button>
              <button class="filter-sheet__chip ${filterState.status === 'limited' ? 'active' : ''}" onclick="setFilter('status', 'limited')">المقاعد محدودة</button>
              <button class="filter-sheet__chip ${filterState.status === 'soon' ? 'active' : ''}" onclick="setFilter('status', 'soon')">قريباً</button>
            </div>
          </div>

        </div>
        <div class="filter-sheet__footer">
          <button class="filter-sheet__apply-btn" onclick="applyFilters()">
            عرض النتائج (<span id="filter-count">${getFilteredPrograms().length}</span>)
          </button>
        </div>
      </div>
    </div>
  `;
}
