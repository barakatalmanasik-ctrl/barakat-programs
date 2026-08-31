const GALLERY_STATIC_FALLBACK = Array.from(
  { length: 30 },
  (_, i) => `images/trips/trip-${String(i + 1).padStart(2, '0')}.jpeg`
);

let GALLERY_IMAGES = [];

function GallerySection() {
  return `
    <div class="detail-page__section">
      <h3 class="detail-page__section-title">📸 معرض الصور</h3>
      <div class="gallery__grid gallery--collapsed" id="trip-gallery">
        <div class="gallery__loading">جاري تحميل الصور...</div>
      </div>
      <button class="gallery__more" onclick="toggleGallery()" style="display:none">عرض كل الصور</button>
    </div>
  `;
}

async function loadGalleryImages() {
  const grid = document.getElementById('trip-gallery');
  if (!grid) return;

  let items = [];
  try {
    const { data, error } = await SupabaseClient
      .from('gallery_images')
      .select('image_url')
      .eq('enabled', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    items = (data || []).map(r => r.image_url).filter(Boolean);
  } catch (e) {
    // Database unreachable: keep showing the classic static album.
    items = GALLERY_STATIC_FALLBACK.slice();
  }

  const gridNow = document.getElementById('trip-gallery');
  if (!gridNow || gridNow !== grid) return;

  GALLERY_IMAGES = items;
  renderGalleryGrid();
}

function renderGalleryGrid() {
  const grid = document.getElementById('trip-gallery');
  if (!grid) return;
  const more = grid.parentElement.querySelector('.gallery__more');

  if (GALLERY_IMAGES.length === 0) {
    grid.classList.remove('gallery--collapsed');
    grid.innerHTML = '<div class="gallery__empty">لا توجد صور في المعرض حالياً</div>';
    if (more) more.style.display = 'none';
    return;
  }

  grid.innerHTML = GALLERY_IMAGES.map((src, i) => `
    <button class="gallery__item" onclick="openGallery(${i})" aria-label="فتح الصورة ${i + 1}">
      <img src="${src}" alt="صورة ${i + 1}" loading="lazy">
    </button>
  `).join('');

  if (more) {
    more.style.display = '';
    more.textContent = `عرض كل الصور (${GALLERY_IMAGES.length})`;
  }
}

function toggleGallery() {
  const grid = document.getElementById('trip-gallery');
  if (!grid) return;
  const collapsed = grid.classList.toggle('gallery--collapsed');
  const btn = grid.parentElement.querySelector('.gallery__more');
  if (btn) {
    btn.textContent = collapsed
      ? `عرض كل الصور (${GALLERY_IMAGES.length})`
      : 'إخفاء الصور';
  }
}

let galleryLightboxIndex = 0;

function openGallery(index) {
  if (!GALLERY_IMAGES.length) return;
  galleryLightboxIndex = index;
  if (document.getElementById('gallery-lightbox')) closeGallery();

  const overlay = document.createElement('div');
  overlay.className = 'gallery-lightbox';
  overlay.id = 'gallery-lightbox';
  overlay.innerHTML = `
    <div class="gallery-lightbox__img-wrap">
      <img src="${GALLERY_IMAGES[galleryLightboxIndex]}" alt="صورة الرحلة">
      <button class="gallery-lightbox__btn gallery-lightbox__close" onclick="closeGallery()" aria-label="إغلاق">&times;</button>
      <button class="gallery-lightbox__btn gallery-lightbox__nav gallery-lightbox__nav--prev" onclick="galleryNav(-1)" aria-label="الصورة السابقة">&rsaquo;</button>
      <button class="gallery-lightbox__btn gallery-lightbox__nav gallery-lightbox__nav--next" onclick="galleryNav(1)" aria-label="الصورة التالية">&lsaquo;</button>
      <div class="gallery-lightbox__counter"></div>
    </div>
  `;

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeGallery();
  });

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  updateGalleryCounter();
}

function closeGallery() {
  const overlay = document.getElementById('gallery-lightbox');
  if (overlay) overlay.remove();
  document.body.style.overflow = '';
}

function galleryNav(dir) {
  if (!GALLERY_IMAGES.length) return;
  galleryLightboxIndex =
    (galleryLightboxIndex + dir + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
  const img = document.querySelector('#gallery-lightbox img');
  if (img) img.src = GALLERY_IMAGES[galleryLightboxIndex];
  updateGalleryCounter();
}

function updateGalleryCounter() {
  const counter = document.querySelector('#gallery-lightbox .gallery-lightbox__counter');
  if (counter) {
    counter.textContent = `${galleryLightboxIndex + 1} / ${GALLERY_IMAGES.length}`;
  }
}

document.addEventListener('keydown', function (e) {
  if (!document.getElementById('gallery-lightbox')) return;
  if (e.key === 'Escape') closeGallery();
  if (e.key === 'ArrowLeft') galleryNav(-1);
  if (e.key === 'ArrowRight') galleryNav(1);
});