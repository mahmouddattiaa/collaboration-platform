const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize storage
// We expect credentials to be in environment variables
// GCS_PROJECT_ID, GCS_CLIENT_EMAIL, GCS_PRIVATE_KEY
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY ? process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  },
});

const bucketName = process.env.GCS_BUCKET_NAME;

if (!bucketName) {
  console.warn('⚠️ GCS_BUCKET_NAME not set. File uploads will fail.');
}

const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!bucketName) {
      return reject(new Error('Storage bucket not configured'));
    }

    const bucket = storage.bucket(bucketName);
    // Create a unique filename: timestamp-originalName
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const blob = bucket.file(filename);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
      resolve({
        url: publicUrl,
        filename: filename,
        mimetype: file.mimetype,
        size: file.size
      });
    });

    blobStream.end(file.buffer);
  });
};

module.exports = {
  uploadToGCS
};
