/* Final script: pdf.js setup, cards render, viewer, search, basic animations.
   Works local (file://) and online (https://). */

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

/* Papers list: add new entries here */
const PAPERS = [
  {
    id: 'paper-1',
    title: 'VIP Past Paper - Kohat Board',
    subtitle: 'Class 11 — 2025',
    fileLocal: 'pdfs/vip past paper class 11 kohat board 2025.pdf',
    fileWeb: 'pdfs/vip%20past%20paper%20class%2011%20kohat%20board%2025.pdf'
  }
];

/* UI refs */
const cardsEl = document.getElementById('cards');
const viewer = document.getElementById('viewer');
const canvasWrap = document.getElementById('canvasWrap');
const vtitle = document.getElementById('vtitle');
const pageInfo = document.getElementById('pageInfo');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const closeBtn = document.getElementById('closeBtn');
const homeBtn = document.getElementById('homeBtn');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

let pdfDoc = null, currentPage = 1, totalPages = 0, currentPaper = null;

/* Render cards */
function renderCards(list){
  cardsEl.innerHTML = '';
  list.forEach((p,i)=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `<h3 data-id="${escapeHtml(p.id)}">${escapeHtml(p.title)}</h3>
                    <p class="sub">${escapeHtml(p.subtitle)}</p>
                    <div class="card-actions"><button class="open-btn" data-id="${escapeHtml(p.id)}">Open VIP</button></div>`;
    cardsEl.appendChild(el);
    el.style.animationDelay = (i*0.06)+'s';
  });

  document.querySelectorAll('.open-btn').forEach(b => b.addEventListener('click', e => openPaper(e.currentTarget.dataset.id)));
  document.querySelectorAll('.card h3').forEach(h => h.addEventListener('click', e => openPaper(e.currentTarget.dataset.id)));
}

/* Open paper */
async function openPaper(id){
  const p = PAPERS.find(x => x.id === id);
  if (!p) return;
  currentPaper = p;
  vtitle.textContent = `${p.title} — ${p.subtitle}`;
  viewer.classList.add('open'); viewer.setAttribute('aria-hidden','false');
  canvasWrap.innerHTML = '';

  const fileURL = (window.location.protocol === 'file:') ? p.fileLocal : p.fileWeb;

  if (window.location.protocol === 'file:'){
    const iframe = document.createElement('iframe');
    iframe.className = 'fallback-iframe';
    iframe.src = p.fileLocal;
    canvasWrap.appendChild(iframe);
    pageInfo.textContent = '1 / 1';
    prevBtn.disabled = true; nextBtn.disabled = true;
    return;
  }

  try {
    const loading = pdfjsLib.getDocument(fileURL);
    pdfDoc = await loading.promise;
    totalPages = pdfDoc.numPages;
    currentPage = 1;
    renderPage(currentPage);
  } catch (err) {
    canvasWrap.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.className = 'fallback-iframe';
    iframe.src = fileURL;
    canvasWrap.appendChild(iframe);
    pageInfo.textContent = '1 / 1';
    prevBtn.disabled = true; nextBtn.disabled = true;
    console.error(err);
  }
}

/* Render a page with watermark */
async function renderPage(pageNum){
  canvasWrap.innerHTML = '';
  const page = await pdfDoc.getPage(pageNum);
  const containerWidth = Math.min(window.innerWidth * 0.96, 1100);
  const viewport = page.getViewport({ scale: 1 });
  const scale = containerWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(scaledViewport.width);
  canvas.height = Math.floor(scaledViewport.height);
  canvasWrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

  drawWatermark(ctx, canvas, 'Uploaded by Muhammad Maooz');

  pageInfo.textContent = `${currentPage} / ${totalPages}`;
  prevBtn.disabled = (currentPage <= 1);
  nextBtn.disabled = (currentPage >= totalPages);
}

function drawWatermark(ctx, canvas, text){
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#00ffe7';
  ctx.font = Math.max(12, Math.floor(canvas.width / 24)) + 'px Orbitron, sans-serif';
  const stepX = canvas.width / 3;
  const stepY = canvas.height / 5;
  for (let y = stepY/2; y < canvas.height; y += stepY) {
    for (let x = -stepX/2; x < canvas.width + stepX; x += stepX) {
      ctx.translate(x, y);
      ctx.rotate(-0.6);
      ctx.fillText(text, 0, 0);
      ctx.rotate(0.6);
      ctx.translate(-x, -y);
    }
  }
  ctx.restore();
}

/* Navigation */
prevBtn.addEventListener('click', ()=>{ if (currentPage>1) { currentPage--; renderPage(currentPage); }});
nextBtn.addEventListener('click', ()=>{ if (currentPage<totalPages) { currentPage++; renderPage(currentPage); }});
closeBtn.addEventListener('click', closeViewer);
homeBtn.addEventListener('click', ()=>{ closeViewer(); document.getElementById('hero').scrollIntoView({behavior:'smooth'}); });

function closeViewer(){
  viewer.classList.remove('open');
  viewer.setAttribute('aria-hidden','true');
  canvasWrap.innerHTML = '';
  pdfDoc = null;
}

/* Search UI */
searchInput.style.width = '0';
searchInput.style.opacity = '0';
searchInput.style.pointerEvents = 'none';
searchBtn.addEventListener('click', ()=>{
  if (searchInput.style.width === '0px' || searchInput.style.width === '') {
    searchInput.style.width = (window.innerWidth < 520) ? '180px' : '340px';
    searchInput.style.opacity = '1';
    searchInput.style.pointerEvents = 'auto';
    searchInput.focus();
  } else {
    searchInput.value = '';
    filterCards('');
    searchInput.style.width = '0';
    searchInput.style.opacity = '0';
    searchInput.style.pointerEvents = 'none';
  }
});
searchInput.addEventListener('input', e => filterCards(e.target.value));

function filterCards(q){
  const term = String(q || '').trim().toLowerCase();
  if (!term) return renderCards(PAPERS);
  renderCards(PAPERS.filter(p => (p.title + ' ' + (p.subtitle || '')).toLowerCase().includes(term)));
}

/* Reveal animations */
function revealCardsOnLoad(){
  document.querySelectorAll('.card').forEach((c,i)=>{
    c.style.animationDelay = (i*0.06)+'s';
    setTimeout(()=> c.classList.add('reveal'), 100 + i*80);
  });
}

/* Utility */
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* Init */
renderCards(PAPERS);
revealCardsOnLoad();

/* close viewer on ESC */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeViewer(); });

/* responsive: recalc render when window resizes while a PDF is open */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(()=> {
    if (pdfDoc && currentPage) renderPage(currentPage);
  }, 250);
});
