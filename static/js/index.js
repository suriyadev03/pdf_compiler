let headerTitle = document.getElementById('headerTitle')
let filesSelectionPage = document.getElementById('filesSelectionPage')
let resultPage = document.getElementById('resultPage')

let pdfInputOld = document.getElementById('old-pdf-selector');
let pdfInputNew = document.getElementById('new-pdf-selector');
let canvasOld = document.getElementById('pdf-canvas-old');
let canvasNew = document.getElementById('pdf-canvas-new');
let canvasOldContext = canvasOld.getContext('2d');
let canvasNewContext = canvasNew.getContext('2d');

let resultPdfOld = document.getElementById('old-pdf-result')
let resultPdfNew = document.getElementById('new-pdf-result')

let oldPdfNameElements = document.querySelectorAll('.old-pdf-name')
let newPdfNameElements = document.querySelectorAll('.new-pdf-name')

let removeOldPdfButton = document.querySelector('#remove-old-pdf')
let removeNewPdfButton = document.querySelector('#remove-new-pdf')

let changesContainer = document.getElementById('changes')
let selectNewFiles = document.getElementById('select-another-file')
let changeRecords = []
let isOldFileSelected = false;
let isNewFileSelected = false;

removeOldPdfButton.addEventListener("click", function() {
    canvasOldContext.clearRect(0, 0, canvasOld.width, canvasOld.height)
    removeOldPdfButton.style.display = "none"
    oldPdfNameElements.forEach((elem)=>{
        elem.innerHTML = "No file chosen";
    })
    pdfInputOld.file = ""
    isOldFileSelected = false;
});

removeNewPdfButton.addEventListener("click", function() {
    canvasNewContext.clearRect(0, 0, canvasNew.width, canvasNew.height)
    removeNewPdfButton.style.display = "none"
    newPdfNameElements.forEach((elem)=>{
        elem.innerHTML = "No file chosen";
    })
    pdfInputNew.file = ""
    isNewFileSelected = false;
});

canvasOld.addEventListener("click", function() {
    pdfInputOld.click(); // Trigger file input click
});

canvasNew.addEventListener("click", function() {
    pdfInputNew.click(); // Trigger file input click
});

pdfInputOld.addEventListener('change', (e) => {
    const file = pdfInputOld.files[0];
    handleFileSelection(file,e.target.id)
    isOldFileSelected = true;
});
pdfInputNew.addEventListener('change', (e) => {
    const file = pdfInputNew.files[0];
    handleFileSelection(file,e.target.id)
    isNewFileSelected = true;
});
selectNewFiles.addEventListener("click", function() {
    filesSelectionPage.style.display = "flex"
    resultPage.style.display = "none"
    headerTitle.innerHTML = "Compare Files"
});
const handleFileSelection = (file,id) => {
    if (file && file.type === 'application/pdf') {
        const removePdf = id == "old-pdf-selector" ? removeOldPdfButton : removeNewPdfButton
        removePdf.style.display = "block"
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            const pdfData = new Uint8Array(e.target.result);
            // Loading the PDF document
            const loadingTask = pdfjsLib.getDocument({ data: pdfData });
            
            loadingTask.promise.then(pdf => {
                console.log('PDF loaded');

                // Fetching the first page
                pdf.getPage(1).then(page => {
                    console.log('Page loaded');

                    const scale = 1.5; // Adjust scale for size
                    const viewport = page.getViewport({ scale: scale });

                    const canvasSelect = id == "old-pdf-selector" ? canvasOld : canvasNew
                    // Prepare canvas using PDF page dimensions
                    canvasSelect.height = viewport.height;
                    canvasSelect.width = viewport.width;

                    const renderContext = {
                        canvasContext: id == "old-pdf-selector" ? canvasOldContext : canvasNewContext,
                        viewport: viewport
                    };
                    page.render(renderContext).promise.then(() => {
                        console.log('Page rendered');
                    });
                });
                const fileNameSelect = id == "old-pdf-selector" ? oldPdfNameElements : newPdfNameElements
                fileNameSelect.forEach((elem)=>{
                    elem.innerHTML = file.name;
                })
            }, reason => {
                // PDF loading error
                console.error(reason);
            });
        };

        fileReader.readAsArrayBuffer(file); // Read the PDF file as an ArrayBuffer
    } else {
        alert('Please select a valid PDF file.');
    }
}
document.getElementById('pdfForm').onsubmit = function (event) {
    event.preventDefault();
    // if(!isOldFileSelected || !isNewFileSelected) return
    changeRecords = [];
    changesContainer.innerHTML = '';
    const formData = new FormData(this);
    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('result').innerText = data.error;
            } else {
                const diff1 = Diff.diffWords(data.text1, data.text2);
                let resultHTML = '';

                diff1.forEach((part, i, array) => {
                    const words = {
                        removed: '', added: '',pdf1:'',pdf2:'',title :''
                    }
                    let updateText = part.value.replace(/\n/g, '<br/>');
                    const span = document.createElement('span');
                    let removedWord = false;
                    let replaceText = false;
                    let replaceAdd = false;
                    let addedText = false;
                    if (i < array.length - 1) {
                        words.pdf1 = `shows_${i}`;
                        words.pdf2 = `shows_${i + 1}`;
                        if (part.removed) {
                            words.removed = updateText;
                            if (array[i + 1].added) {
                                words.added = array[i + 1].value.replace(/\n/g, '<br/>');
                                words.title = 'Replaced';
                                replaceText = true;
                            } else {
                                words.added = '';
                                words.title = 'Removed';
                                removedWord = true;
                            }
                        } else if (part.added) {
                            words.pdf2 = `shows_${i}`;
                            if (!array[i - 1]?.removed) {
                                words.title = 'Added';
                                words.added = updateText;
                                addedText = true;
                            } else {
                                replaceAdd = true;
                            }
                        }
                        changeRecords.push(words);
                    }
                    if (part.removed) {
                        span.className = `removed shows_${i} ${removedWord ? 'removedWord':""} ${replaceText ? 'replacedText':""}`;
                        span.innerHTML = updateText;
                    } else if (part.added) {
                        span.className = `added shows_${i} ${replaceAdd ? 'addedText':""}` ;
                        span.innerHTML = updateText;
                    } else {
                        span.className = '';
                        span.innerHTML = updateText;
                    }
                    resultHTML += span.outerHTML;
                });                
                resultPdfOld.innerHTML = resultHTML;
                resultPdfNew.innerHTML = resultHTML; 
                displayChangeSummary()
                filesSelectionPage.style.display = "none"
                resultPage.style.display = "flex"
                headerTitle.innerHTML = "Comparison Result"
            }
        })
        .catch(error => {
            console.error('Error:', error);
        }); 
};
const displayChangeSummary = () => {
    let changesHTML = '';
    changeRecords.forEach((record) => {
        let getRemovedCount = record.removed.split(/\s+/).map(word => word.replace(/[.,!?]/g, '')).filter(word => word.length > 0).length;
        let getAddedCount = record.added.split(/\s+/).map(word => word.replace(/[.,!?]/g, '')).filter(word => word.length > 0).length;
        const changeSummary = `
            <div id="${record.title === "Added" ? "added_"+""+record.pdf2 : "" +""+ record.title === "Removed" ? "removed_"+""+record.pdf1 : ""}" class="${record.title !== "Added" ? record.pdf1+" "+record.pdf2  : record.title === "Removed" ? "removed" : ""}">
                <span><b>${record.title}</b></span>
                <span><span>${record.removed || ''}</span><span>${record.removed ? "-"+getRemovedCount : ''}</span></span>
                <span><span>${record.added || ''}</span><span>${record.added ? "+"+getAddedCount : ''}</span></span>
            </div>`;
            if (record.title.length) {
                changesHTML += changeSummary;
            }
        });
        changesContainer.innerHTML = changesHTML;
}

changesContainer.addEventListener('click', function (event) {
    document.querySelectorAll('#resultPage .highlight').forEach(el => el.classList.remove('highlight'));
    const targetAdded = event.target.closest('div[id^="added_"]');
    const targetRemoved = event.target.closest('div[id^="removed_"]');
    const targetShow = event.target.closest('div[class^="shows_"]');

    let targetOld, targetNew;

    if (targetAdded) {
        const childClass = targetAdded.id.split('_').slice(1).join('_');
        targetOld = document.querySelector(`#new-pdf-text .${childClass}`);
    } else if (targetRemoved) {
        const childClass = targetRemoved.id.split('_').slice(1).join('_');
        targetOld = document.querySelector(`#old-pdf-text .${childClass}`);
    } else if (targetShow) {
        const childClass = targetShow.classList[0];
        targetOld = document.querySelector(`#old-pdf-text .${childClass}`);
        targetNew = document.querySelector(`#new-pdf-text .${targetShow.classList[1]}`);
    }
    // Highlight and scroll if any target spans are found
    targetOld?.classList.add('highlight');
    targetNew?.classList.add('highlight');
    scrollToHighlightedChanges(targetOld, targetNew);
});

function scrollToHighlightedChanges(targetOld, targetNew) {
    targetOld?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetNew?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
