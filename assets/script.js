const url = './pdfs/vip_past_paper_class11_kohat_2025.pdf';
const canvas = document.getElementById('pdf-viewer');
const ctx = canvas.getContext('2d');

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.241/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;

function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport: viewport
        };
        page.render(renderCtx);
    });
}

pdfjsLib.getDocument(url).promise.then(doc => {
    pdfDoc = doc;
    renderPage(pageNum);
}).catch(err => {
    console.error("PDF loading error:", err);
});
