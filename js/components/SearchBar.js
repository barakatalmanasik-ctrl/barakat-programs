function SearchBar(placeholder, id, value) {
  return `
    <div class="search-bar" ${id ? `id="${id}"` : ''}>
      <div class="search-bar__input-wrapper">
        <svg class="search-bar__icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" class="search-bar__input" placeholder="${placeholder || 'ابحث عن برنامج أو وجهة...'}" value="${value || ''}" oninput="handleSearch(this.value)">
      </div>
    </div>
  `;
}
