const url = './pdfs/vip_past_paper_class11_kohat_2025.pdf'; // PDF path

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.241/pdf.worker.min.js';

let pdfDoc = null, pageNum = 1, canvas = document.getElementById('pdf-viewer'), ctx = canvas.getContext('2d');

function renderPage(num){
    pdfDoc.getPage(num).then(function(page){
        const viewport = page.getViewport({scale:1.5});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render({canvasContext:ctx, viewport:viewport});
    });
}

pdfjsLib.getDocument(url).promise.then(function(pdf){
    pdfDoc = pdf;
    renderPage(pageNum);
});

// Search bar toggle
const searchIcon = document.getElementById('searchIcon');
const searchBar = document.getElementById('searchBar');
searchIcon.addEventListener('mouseover', ()=>{ searchBar.style.width='150px'; searchBar.style.opacity=1; });
searchIcon.addEventListener('click', ()=>{ searchBar.classList.toggle('active'); });

// WhatsApp number toggle
const whatsappBtn = document.getElementById('whatsappBtn');
whatsappBtn.addEventListener('click', ()=>{ whatsappBtn.classList.toggle('show-number'); });

// Scroll to PDF
function scrollToPDF(){ document.querySelector('.pdf-section').scrollIntoView({behavior:'smooth'}); }
function goHome(){ window.scrollTo({top:0, behavior:'smooth'}); }

