function LoadingState(text) {
  return `
    <div class="loading-state">
      <div class="loading-state__spinner"></div>
      <p class="loading-state__text">${text || 'جاري التحميل...'}</p>
    </div>
  `;
}
