const express = require("express");
const multer = require('multer');
const cors = require("cors");
const dotenv = require("dotenv");
const { UploadToS3 } = require("./service");
const app = express();
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const upload = multer();

const axios = require('axios');
const server = createServer(app); 
const io = new Server(server, {
  cors: {
    origin: '*',
    methods:  ["GET", "POST", "PUT", "DELETE"],
  }
});

dotenv.config();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT;
app.route("/upload_files").post(upload.single('image'),async (req, res) => {

  const { width, height } = req.body;
  const bucket = process.env.BUCKET_NAME;
  console.log("Received width:", width, "height:", height, "bucket:", bucket);
  const img_file =req.file;
  // to upload tp images folder in bucket
  const key = `images/${img_file.originalname}`;
  if (!img_file || !bucket) {
    return res.status(400).send("Image or bucket name is missing");
  }
  // response after uploading the image
  const resizedKey = `resized/resized_${img_file.originalname}`;
  await UploadToS3(key,img_file, bucket, { width, height })
    .then(() => res.status(200).json({
      message: "File uploaded successfully",
      bucket: bucket,
      key: resizedKey,
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

// SNS Notification Endpoint
app.use('/sns', express.text({ type: '*/*' }));
app.route("/sns").post((req, res) => {
  const requestBody = JSON.parse(req.body);

console.log("req.body['Type']" ,requestBody['Type']);
const messageType = requestBody['Type'];

  if (messageType === 'SubscriptionConfirmation') {
    const subscribeUrl = requestBody.SubscribeURL;
    console.log('Received SubscriptionConfirmation');
    console.log('Confirming subscription by visiting:', subscribeUrl);

    // Automatically confirm the subscription
    axios.get(subscribeUrl)
      .then(() => {
        console.log('Subscription confirmed');
      })
      .catch(err => {
        console.error('Error confirming subscription:', err);
      });

  } else if (messageType === 'Notification') {
    const {message , success} = JSON.parse(requestBody.Message);
    console.log('SNS Notification received:', requestBody);

    io.emit('snsNotification', {
      message: message ,
      success: success
    });
  }

  res.status(200).send();
});

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
})