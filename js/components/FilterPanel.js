function FilterPanel(filters, activeFilter, onFilterChange) {
  return `
    <div class="filter-panel" role="tablist">
      ${filters.map(filter => `
        <button class="filter-panel__chip ${activeFilter === filter.id ? 'active' : ''}" 
                data-filter="${filter.id}"
                onclick="${onFilterChange}('${filter.id}')"
                role="tab"
                aria-selected="${activeFilter === filter.id}">
          ${filter.label}
        </button>
      `).join('')}
    </div>
  `;
}
