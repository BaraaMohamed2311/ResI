
const socket = io('http://localhost:5500'); 
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

    fetch("https://res-i-zbbe.vercel.app/upload_files", {
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


socket.on('snsNotification', (data) => {
  console.log('Received SNS notification:', data);
    if (data.success) {
        const resizedImageUrl = `https://${bucket}.s3.amazonaws.com/${imgPath}`;
        alert(data.message);
        const resizedImage = document.getElementById("resizedImage");
        resizedImage.setAttribute("src", resizedImageUrl);
    } else {
        alert(data.message);
    }
});