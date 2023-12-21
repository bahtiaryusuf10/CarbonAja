const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const projectId = process.env.PROJECT_ID;
const keyFilename = path.join(__dirname, process.env.PRIVATE_KEY);
const bucketName = process.env.BUCKET_NAME;

const storage = new Storage({
  keyFilename,
  projectId,
});
const bucket = storage.bucket(bucketName);

const FileHelper = {
  async uploadFile(file, folder) {
    return new Promise((resolve, reject) => {
      const fileOutputName = `${folder}/${uuidv4()}.${file.originalname.split('.')[1]}`;
      const fileStream = bucket.file(fileOutputName).createWriteStream({
        resumable: false,
      });

      fileStream.on('finish', () => {
        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileOutputName}`;

        resolve({
          status: 'success',
          message: 'Upload file success',
          fileUrl,
        });
      });

      fileStream.on('error', (error) => {
        console.error('Error:', error);

        reject(new Error('Upload file failed'));
      });

      fileStream.end(file.buffer);
    });
  },

  async deleteFile(fileUrl) {
    try {
      const fileName = fileUrl.split(`${bucketName}/`)[1];
      await bucket.file(fileName).delete();

      return {
        status: 'success',
        message: 'Delete file success',
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        status: 'failed',
        message: 'Delete file failed',
      };
    }
  },
};

module.exports = FileHelper;
