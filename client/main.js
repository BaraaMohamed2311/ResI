const form = document.getElementById("form");
const widthInput = document.getElementById("width"); 
const heightInput = document.getElementById("height"); 
const resizeBtn = document.getElementById("resize"); 
const uploadImg = document.getElementById("fileInput");
const beforeImg = document.getElementById("beforeImage");
let bucket = null; 
let key = null;
let image_file = null;
resizeBtn.onclick = (e) => {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    console.log("Width:", width, "Height:", height);
    if (width  && height  && image_file) {
        submitForm(e, width, height , image_file);
    } else {
        alert("Please enter both width and height");
    }
};

uploadImg.onchange = (e) => {
    const file = e.target.files[0];
    image_file = file;
    console.log("Selected file:", file);

if (file) {
    const objectURL = URL.createObjectURL(file);
    beforeImg.setAttribute("src", objectURL);
    console.log("Selected file:", objectURL);
}
}

function submitForm(e, width, height , image_file) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", image_file);
    formData.append("width", width);
    formData.append("height", height);

    fetch("http://localhost:5500/upload_files", {
        method: 'POST',
        body:formData,
        mode: 'cors',
    })
        .then((res) => res.json).then((data) => {
            bucket = data.bucket;
            key = data.key;
            // Usage:

            getImage(bucket, `resized/${image_file.original_name}`)
    .catch(error => console.error('Failed to get image:', error));
        })
        .catch((err) => console.log("Error occured", err));
}


// Polling for the resized image you can replace this with SNS and upload your express server
function checkImageExists(url) {
    return fetch(url, { method: 'HEAD' })
        .then(response => response.ok)
        .catch(() => false);
}

async function getImage(bucket, imgPath) {
    
    
    // Polling mechanism
    const maxRetries = 20;
    let retryCount = 0;
    let imageExists = false;

    // Check image existence
    while (!imageExists && retryCount < maxRetries && bucket && imgPath) {
        const resizedImageUrl = `https://${bucket}.s3.amazonaws.com/${imgPath}`;

        imageExists = await checkImageExists(resizedImageUrl);
        if (imageExists) {
            console.log('Image is available. Updating src.');
            const imgElement = document.getElementById('your-img-id');

            imgElement.onload = () => {
                console.log('Image successfully rendered.');
            };

            imgElement.onerror = () => {
                console.log('Error rendering image.');
            };

            imgElement.src = resizedImageUrl;
            return;
        } else {
            console.log('Image not yet available. Retrying...');
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 5 seconds before retrying
        }
    }

    console.log('Image not available after retries.');
    throw new Error('Timeout waiting for image to be ready.');
}

