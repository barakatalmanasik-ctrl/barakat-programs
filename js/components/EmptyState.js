function EmptyState(icon, title, text, actions) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">${icon || '🔍'}</div>
      <h3 class="empty-state__title">${title || 'لا توجد نتائج'}</h3>
      <p class="empty-state__text">${text || 'لم نتمكن من العثور على ما تبحث عنه. جرّب البحث بكلمات مختلفة.'}</p>
      ${actions ? `<div class="empty-state__actions">${actions}</div>` : ''}
    </div>
  `;
}
