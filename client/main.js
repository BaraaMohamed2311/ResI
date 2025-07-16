
const socket = io('http://localhost:5500'); 
const widthInput = document.getElementById("width"); 
const heightInput = document.getElementById("height"); 
const resizeBtn = document.getElementById("resize"); 
const uploadImg = document.getElementById("fileInput");
const beforeImg = document.getElementById("beforeImage");
const afterImg = document.getElementById("afterImage");
const spinner = document.getElementById("spinner");
const message = document.getElementById("message");
let bucket = null; 
let key = null;
let image_file = null;
resizeBtn.onclick = (e) => {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);

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
        .then((res) => res.json()).then((data) => {
            console.log("Response from server:", data);
            bucket = data.bucket;
            key = data.key;
            spinner.style.display = "block"; 

        })
        .catch((err) => console.log("Error occured", err));
}


socket.on('snsNotification', (data) => {

    if (data.success && bucket && key) {

        const resizedImageUrl = `https://${bucket}.s3.amazonaws.com/${key}`;
        afterImg.setAttribute("src", resizedImageUrl);
        spinner.style.display = "none";
        message.textContent = "Image resized and uploaded successfully!";
    } else if ( !bucket || !key) {
        console.error("Bucket or key is not defined. Cannot display resized image.");
        message.textContent = "Error: Bucket or key is not defined.";
    }
});