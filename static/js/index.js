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
                    span.className = `added show_${0+i}`;
                    span.innerHTML = updateText;
               } else if (part.removed) {
                    span.className = `removed show_${1+i}`;
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
        let Pdf1Text = document.getElementById('Pdf1Text');
        let targetSpan = Pdf1Text.getElementsByClassName(className); // Select the first span inside Pdf1Text

        if (Pdf1Text && className) { // Ensure Pdf1Text and className exist
            if (Pdf1Text.classList.contains(className)) {
                if (targetSpan) { // Check if targetSpan exists
                    targetSpan.classList.add('clicked'); // Add 'clicked' class to the span
                    console.log('Added "clicked" class to the span inside Pdf1Text');
                } else {
                    console.error('No span found inside Pdf1Text');
                }
            } else {
                console.log(`Pdf1Text does not contain the class: ${className}`);
            }
        } else {
            console.error('Pdf1Text element or className is missing');
        }

    }
});
comparisonResult2.addEventListener('click', function(event) {
    if (event.target.classList.contains('added') || event.target.classList.contains('removed')) {
        const className = event.target.classList[1];
        console.log('Class name:', className);
    }
});
