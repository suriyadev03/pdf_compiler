let comparisonResult1 = document.getElementById('comparisonResult1')
let comparisonResult2 = document.getElementById('comparisonResult2')
let resultPdf1 = document.getElementById('resultPdf1')
let resultPdf2 = document.getElementById('resultPdf2')
let Pdf1Text = document.getElementById('Pdf1Text')
let Pdf2Text = document.getElementById('Pdf2Text')
let changes = document.getElementById('changes')
let allChanges = []

document.getElementById('pdfForm').onsubmit = function (event) {
    event.preventDefault();
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
                    
                        allChanges.push(words);
                    }
                    if (part.removed) {
                        span.className = `removed shows_${i} ${removedWord ? 'removedWord':""} ${replaceText ? 'replacedText':""}`;
                        span.innerHTML = updateText;
                    } else if (part.added) {
                        span.className = `added show_${i} ${replaceAdd ? 'addedText':""}` ;
                        span.innerHTML = updateText;
                    } else {
                        span.className = '';
                        span.innerHTML = updateText;
                    }
                    resultHTML += span.outerHTML;
                });                
                resultPdf1.innerHTML = `<div>${resultHTML}</div`;
                resultPdf2.innerHTML = `<div>${resultHTML}</div`;
                Pdf1Text.innerHTML = resultHTML;
                Pdf2Text.innerHTML = resultHTML;
                console.log("allChanges",allChanges);
                
                showAllChanges()
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
};
const showAllChanges = () => {
    let allContent = ''; // Build all HTML at once
    allChanges.forEach((data, i) => {
        const mainChanges = `
            <div id="${data.title === "Added" ? data.pdf2 : ""}" class="${data.title !== "Added" ? data.pdf1 : ""}">
                <span><b>${data.title}</b></span>
                <span>${data.removed || ''}</span>
                <span>${data.added || ''}</span>
            </div>`;
        if (data.title.length) {
            allContent += mainChanges;
        }
    });
    changes.innerHTML = allContent; // Update DOM once
}

changes.addEventListener('click', function(event) {
    debugger
    const childDivClassName = event.target.closest('div[class^="shows_"]');
    const childDivId = event.target.closest('div[id^="shows_"]');
    if (childDivClassName) {
        const childClass = childDivClassName.className;
        let targetSpan = document.querySelector(`#comparisonResult1 .${childClass}`);
        let targetSpan2 = document.querySelector(`#comparisonResult2 .${childClass}`);
        targetSpan.classList.add('highlight');
        targetSpan2.classList.add('highlight');
        scrollToShowClass(targetSpan, targetSpan2);
        console.log('Clicked child div class name:', childClass);
    }else if (childDivId) {
        const childClass = childDivId.id;
        let targetSpan = document.querySelector(`#comparisonResult1 .${childClass}`);
        scrollToShowClass2(targetSpan);
    }
});
function scrollToShowClass2(targetSpan) {
    targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function scrollToShowClass(targetSpan1, targetSpan2) {
    targetSpan1.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetSpan2.scrollIntoView({ behavior: 'smooth', block: 'center' });
}