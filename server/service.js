

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

  const UploadToS3 = async (key,image, bucket , resize) => {

  try {

    const s3 = new S3Client({acessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, region: process.env.AWS_REGION});
  await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: image.buffer,
      ContentType: image.mimetype,
      Metadata: {
        resize:JSON.stringify(resize)
  }
    }));

  } catch (err) {
  return console.error("Cannot upload image", err);
  }

  }

  exports.UploadToS3 = UploadToS3;

