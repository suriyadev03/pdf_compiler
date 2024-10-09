let comparisonResult1 = document.getElementById('comparisonResult1')
let comparisonResult2 = document.getElementById('comparisonResult2')
let Pdf1Text = document.getElementById('Pdf1Text')
let Pdf2Text = document.getElementById('Pdf2Text')

document.getElementById('pdfForm').onsubmit = function(event) {
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
            let resultHTML1 = '';
            diff1.forEach((part, i) => {
                let updateText = part.value.replace(/\n/g, '<br/>');
                const span = document.createElement('span');
                if (part.added) {
                    span.className = `added show_${i}`;
                    span.innerHTML = updateText;
               } else if (part.removed) {
                    span.className = `removed shows_${i}`;
                    span.innerHTML = updateText;  
                } else {
                    span.className = 'unchanged';
                    span.innerHTML = updateText;
                }
                resultHTML1 += span.outerHTML;
            });
            
            comparisonResult1.innerHTML = resultHTML1;
            comparisonResult2.innerHTML = resultHTML1;
            Pdf1Text.innerHTML = resultHTML1;
            Pdf2Text.innerHTML = resultHTML1;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};

comparisonResult1.addEventListener('click', function(event) {
    if (event.target.classList.contains('added') || event.target.classList.contains('removed')) {
        const className = event.target.classList[1];
        let targetSpan = document.querySelector(`#Pdf1Text .${className}`);
        targetSpan.classList.add("clicked")
        scrollToShowClass(targetSpan);
    }
});
comparisonResult2.addEventListener('click', function(event) {
    if (event.target.classList.contains('added') || event.target.classList.contains('removed')) {
        const className = event.target.classList[1];
        let targetSpan = document.querySelector(`#Pdf2Text .${className}`);
        targetSpan.classList.add("clicked")
        scrollToShowClass(targetSpan);
    }
});


function scrollToShowClass(elementSpan) {
    elementSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
}