const express = require("express");
const multer = require('multer');
const cors = require("cors");
const dotenv = require("dotenv");
const { UploadToS3 } = require("./service");
const app = express();
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const upload = multer();
const path =require("path");
const server = createServer(app); 
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

dotenv.config();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
app.route("/upload_files").post(upload.single('image'),async (req, res) => {
  console.log("req.body",req.body , "\n req.file", req.file);
  const { width, height } = req.body;
  const bucket = process.env.BUCKET_NAME;
  const img_file =req.file;
  // to upload tp images folder in bucket
  const key = `images/${img_file.originalname}`;
  if (!img_file || !bucket) {
    return res.status(400).send("Image or bucket name is missing");
  }

  await UploadToS3(key,img_file, bucket, { width, height })
    .then(() => res.status(200).json({
      message: "File uploaded successfully",
      bucket: bucket,
      key: key,
    }))
    .catch(err => res.status(500).json("Error uploading file: " + err.message));


});


// Handle client connections
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.route("/sns").post((req, res) => {

  if(req.success) {
    io.emit('snsNotification', { message: 'image resized successfully', success:true});
  }
  else{
    io.emit('snsNotification', { message: 'image resized failed', success:false});
  }
  
  
});

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
})