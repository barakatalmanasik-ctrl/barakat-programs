// Generates per-program Open Graph social previews.
// 1. Fetches live programs from Supabase (anon key).
// 2. Renders a 1200x630 share image per program (real program photo + brand overlay).
// 3. Writes a static <project>/p/<program-id>/index.html per program carrying unique
//    og:title / og:description / og:image / og:url, then instant-redirects humans to
//    the real app page (#detail/<id>).
//
// Usage: node scripts/generate-og-pages.js
// Requires a headless-capable Chrome/Edge on the machine.

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { pathToFileURL, fileURLToPath } = require('url');

const CFG = {
  url: 'https://fulgfalcqerwcvfbahel.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bGdmYWxjcWVyd2N2ZmJhaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTc0NjEsImV4cCI6MjEwMzMzMzQ2MX0.f7cWAa_QUiLFoqUHCjx4Hkv9mTRaS6-ZOqg4b1-PeNQ',
  origin: 'https://barakat-al-manasik.web.app'
};

const REPO = path.resolve(__dirname, '..');
const OUT_PAGES = path.join(REPO, 'p');
const OUT_SHARE = path.join(REPO, 'images', 'share');
const TEMP = path.join(os.tmpdir(), 'barakat-og');

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

const DEST_FALLBACK = {
  '22222222-1111-0000-0000-000000000001': { name: 'المملكة العربية السعودية', emoji: '🇸🇦' },
  '11111111-1111-0000-0000-000000000001': { name: 'إيران', emoji: '🇮🇷' },
  '11111111-2222-0000-0000-000000000001': { name: 'إيران', emoji: '🇮🇷' }
};

function findChrome() {
  return CHROME_CANDIDATES.find(p => fs.existsSync(p)) || null;
}

async function supabaseGet(table, query) {
  const u = new URL(CFG.url + '/rest/v1/' + table + '?' + new URLSearchParams(query));
  const res = await fetch(u.toString(), {
    headers: { apikey: CFG.anonKey, Authorization: 'Bearer ' + CFG.anonKey }
  });
  if (!res.ok) throw new Error(table + ': HTTP ' + res.status + ' ' + res.statusText);
  return res.json();
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function truncate(s, max) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trim() + '…';
}

function metaDecode(s) {
  return String(s || '').replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)));
}

async function renderShareImage(program, dest) {
  const chrome = findChrome();
  const cover = program.cover_image; // e.g. images/covers/umrah-air-1.jpeg
  if (!chrome || !cover) return null;

  const localCover = path.join(REPO, ...cover.split('/').map(decodeURIComponent));
  if (!fs.existsSync(localCover)) return null;

  const id = String(program.id);
  const outPng = path.join(OUT_SHARE, id + '.png');
  await fs.promises.mkdir(TEMP, { recursive: true });
  const tempHtml = path.join(TEMP, id + '.html');

  const coverUrl = pathToFileURL(localCover).href;
  const name = escapeHtml(metaDecode(program.name) || 'رحلتك القادمة');
  const destLine = escapeHtml((dest ? dest.emoji + ' ' + dest.name : '') + (program.days ? ' · ' + program.days + ' أيام / ' + program.nights + ' ليالي' : ''));
  const priceLine = program.price != null ? escapeHtml('من ' + Number(program.price).toLocaleString('ar-SA') + ' ' + metaDecode(program.currency || 'د.ع') + ' للشخص الواحد') : '';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@500;700&family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;padding:0;width:1200px;height:630px;overflow:hidden;font-family:'Tajawal','Noto Kufi Arabic',sans-serif;background:#0e1e33;}
  .wrap{position:relative;width:1200px;height:630px;}
  .bg{position:absolute;inset:0;width:1200px;height:630px;object-fit:cover;}
  .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,25,45,.12) 0%,rgba(10,25,45,.35) 55%,rgba(8,20,38,.93) 100%);}
  .brand{position:absolute;top:34px;right:40px;display:flex;align-items:center;gap:10px;background:rgba(10,25,45,.55);border:1px solid rgba(255,255,255,.25);color:#f3e2b8;font-weight:700;font-size:22px;padding:10px 20px;border-radius:999px;backdrop-filter:blur(2px);}
  .brand .dot{width:10px;height:10px;border-radius:50%;background:#C8963E;flex-shrink:0;}
  .bottom{position:absolute;left:40px;right:40px;bottom:44px;color:#fff;}
  .name{font-family:'Noto Kufi Arabic',sans-serif;font-weight:700;font-size:46px;line-height:1.35;text-shadow:0 2px 18px rgba(0,0,0,.55);}
  .dest{margin-top:14px;font-size:24px;color:#ffd98a;font-weight:700;}
  .price{margin-top:8px;font-size:20px;color:#eef2f7;}
  .cta{position:absolute;bottom:44px;left:40px;background:#C8963E;color:#11304f;font-weight:700;font-size:22px;padding:14px 26px;border-radius:14px;box-shadow:0 6px 22px rgba(0,0,0,.35);}
  .cta small{display:block;font-size:14px;font-weight:400;opacity:.9;}
</style></head>
<body><div class="wrap">
  <img class="bg" src="${coverUrl}" alt="">
  <div class="shade"></div>
  <div class="brand"><span class="dot"></span>بركات المناسك للسفر والسياحة</div>
  <div class="bottom">
    <div class="name">${name}</div>
    <div class="dest">${destLine}</div>
    ${priceLine ? `<div class="price">${priceLine}</div>` : ''}
  </div>
  <div class="cta">احجز الآن<small>barakat-al-manasik.web.app</small></div>
</div></body></html>`;

  await fs.promises.writeFile(tempHtml, html, 'utf8');

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=12000',
    '--screenshot=' + outPng,
    pathToFileURL(tempHtml).href
  ];
  const r = spawnSync(chrome, args, { stdio: 'ignore', timeout: 60000 });
  if (r.status !== 0 || !fs.existsSync(outPng) || fs.statSync(outPng).size < 2000) {
    try { fs.unlinkSync(outPng); } catch (e) {}
    return null;
  }
  return outPng;
}

async function main() {
  let programs;
  let dests = {};
  try {
    programs = await supabaseGet('programs', { select: 'id,name,emoji,destination_id,cover_image,short_description,full_description,price,currency,days,nights', apikey: CFG.anonKey, order: 'name' });
  } catch (e) {
    console.error('فشل جلب البرامج:', e.message);
    process.exit(1);
  }
  try {
    const raw = await supabaseGet('destinations', { select: 'id,name,emoji' });
    (raw || []).forEach(d => { dests[d.id] = d; });
  } catch (e) {
    console.warn('destinations غير قابلة للقراءة، استخدام خريطة بديلة.');
  }

  await fs.promises.mkdir(OUT_PAGES, { recursive: true });
  await fs.promises.mkdir(OUT_SHARE, { recursive: true });

  let ok = 0;
  for (const p of programs) {
    if (!p.id) continue;
    const id = String(p.id);
    const dest = dests[p.destination_id] || DEST_FALLBACK[p.destination_id] || { name: '', emoji: '' };

    const name = truncate(metaDecode(p.name) || 'رحلتك القادمة', 60);
    const short = truncate(metaDecode(p.short_description) || metaDecode(p.full_description) || 'أسعار مميزة وخدمات متكاملة، الانطلاق من كربلاء قرب مرقد الحُرّ', 110);
    const meta = [short];
    if (dest.name) meta.push(dest.emoji + ' ' + dest.name);
    if (p.days) meta.push(p.days + ' أيام / ' + p.nights + ' ليالي');
    if (p.price != null && p.currency) meta.push('من ' + Number(p.price).toLocaleString('ar-SA') + ' ' + metaDecode(p.currency));
    const ogDesc = truncate(meta.join(' · '), 180);

    const ogUrl = CFG.origin + '/p/' + encodeURIComponent(id) + '/';
    const appUrl = CFG.origin + '/#detail/' + encodeURIComponent(id);
    const ogTitle = 'بركات المناسك | ' + name;

    let ogImage = null;
    const sharePng = await renderShareImage(p, dest);
    if (sharePng) {
      ogImage = CFG.origin + '/images/share/' + id + '.png';
    } else if (p.cover_image) {
      ogImage = CFG.origin + '/' + p.cover_image;
    } else {
      ogImage = CFG.origin + '/images/og-cover.png';
    }

    const pageDir = path.join(OUT_PAGES, id);
    await fs.promises.mkdir(pageDir, { recursive: true });
    const pageHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(ogTitle)} | بركات المناسك للسفر والسياحة</title>
<meta name="description" content="${escapeHtml(ogDesc)}">
<meta name="robots" content="noindex, follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="بركات المناسك للسفر والسياحة">
<meta property="og:title" content="${escapeHtml(ogTitle)}">
<meta property="og:description" content="${escapeHtml(ogDesc)}">
<meta property="og:image" content="${escapeHtml(ogImage)}">
<meta property="og:image:width" content="${sharePng ? '1200' : ''}">
<meta property="og:image:height" content="${sharePng ? '630' : ''}">
<meta property="og:image:alt" content="${escapeHtml(name)}">
<meta property="og:url" content="${escapeHtml(ogUrl)}">
<meta property="og:locale" content="ar_IQ">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(ogTitle)}">
<meta name="twitter:description" content="${escapeHtml(ogDesc)}">
<meta name="twitter:image" content="${escapeHtml(ogImage)}">
<meta http-equiv="refresh" content="0; url=${escapeHtml(appUrl)}">
<script>location.replace(${JSON.stringify(appUrl)});</script>
</head>
<body>
<noscript><a href="${escapeHtml(appUrl)}">افتح برنامج ${escapeHtml(name)} على موقع بركات المناسك</a></noscript>
</body>
</html>`;
    await fs.promises.writeFile(path.join(pageDir, 'index.html'), pageHtml, 'utf8');
    ok++;
    console.log('✓', p.name, '| image:', ogImage, '| share-img:', sharePng ? 'generated' : 'none');
  }

  console.log('\nتم إنشاء', ok, 'صفحة مشاركة في /p');
}

main().catch(e => { console.error(e); process.exit(1); });