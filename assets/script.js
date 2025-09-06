const url = './pdfs/vip_past_paper_class11_kohat_2025.pdf'; // PDF path

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.241/pdf.worker.min.js';

let pdfDoc = null, pageNum = 1, canvas = document.getElementById('pdf-viewer'), ctx = canvas.getContext('2d');

// Render any page
function renderPage(num){
    pdfDoc.getPage(num).then(function(page){
        const viewport = page.getViewport({scale:1.5});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render({canvasContext: ctx, viewport: viewport});
    });
}

// Show previous/next page controls
function showPageControls(){
    const controls = document.createElement('div');
    controls.style.textAlign = 'center';
    controls.style.marginTop = '10px';
    controls.innerHTML = `
        <button id="prevPage">Previous</button>
        <span id="pageInfo">Page ${pageNum} / ${pdfDoc.numPages}</span>
        <button id="nextPage">Next</button>
    `;
    document.querySelector('.pdf-section').appendChild(controls);

    document.getElementById('prevPage').addEventListener('click', ()=>{
        if(pageNum <= 1) return;
        pageNum--;
        renderPage(pageNum);
        document.getElementById('pageInfo').textContent = `Page ${pageNum} / ${pdfDoc.numPages}`;
    });

    document.getElementById('nextPage').addEventListener('click', ()=>{
        if(pageNum >= pdfDoc.numPages) return;
        pageNum++;
        renderPage(pageNum);
        document.getElementById('pageInfo').textContent = `Page ${pageNum} / ${pdfDoc.numPages}`;
    });
}

// Load PDF
pdfjsLib.getDocument(url).promise.then(function(pdf){
    pdfDoc = pdf;
    renderPage(pageNum);
    showPageControls();
}).catch(err => {
    console.error("PDF loading error: ", err);
});


