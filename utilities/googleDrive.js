const stream = require("stream");
const path = require("path");
const { google } = require('googleapis');
const apikeys = require('./apikeys.json');
var fs = require("fs");
const sharp = require("sharp");

const KEYFILEPATH = path.join(__dirname, {
  "type": process.env.GOOGLE_PROJECT_TYPE,
  "project_id": process.env.GOOGLE_PROJECT_ID,
  "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID,
  "private_key": process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure newline characters are handled correctly
  "client_email": process.env.GOOGLE_CLIENT_EMAIL,
  "client_id": process.env.GOOGLE_CLIENT_ID,
  "auth_uri": process.env.GOOGLE_AUTH_URI,
  "token_uri": process.env.GOOGLE_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.GOOGLE_CLIENT_X509_CERT_URL,
  "universe_domain": process.env.GOOGLE_UNIVERSE_DOMAIN,
});
const SCOPES = ["https://www.googleapis.com/auth/drive"]; 

const VIDEOKEYFILEPATH = path.join(__dirname, {
  type: process.env.GOOGLE_PROJECT_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure newline characters are handled correctly
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
});

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

const vAuth = new google.auth.GoogleAuth({
  keyFile: VIDEOKEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

const vDrive = google.drive({ version: 'v3', auth: vAuth });

async function saveToDrive(file, fileSize, mimeType, originalName, parent) {

    const bufferStream = new stream.PassThrough();
    bufferStream.end(file);

    return new Promise((resolve, reject) => {

    drive.files.create(
        {
          media: {
            mimeType: mimeType,
            body: bufferStream,
          },
          requestBody: {
            name: originalName,
            parents: parent,
          },
          fields: 'id',
          supportsAllDrives: true, // Allow resumable uploads for shared drives
        },
        {
          // Use the Axios library to handle resumable uploads
          onUploadProgress: (evt) => {
            const progress = (evt.bytesRead / fileSize / 1048576) * 100;
            // console.log(`Progress: ${progress.toFixed(2)}%`);
          },
        },
        (err, res) => {
            if (err) {
              reject(new Error(`An error occurred while uploading the file: ${err.message}`));
            } else {
              resolve({ msg: 'File uploaded successfully', data: res.data });
            }
          });
    });
}

async function videoSaveToDrive(file, fileSize, mimeType, originalName, parent) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(file);
  
  return new Promise((resolve, reject) => {

  vDrive.files.create(
      {
        media: {
          mimeType: mimeType,
          body: bufferStream,
        },
        requestBody: {
          name: originalName,
          parents: parent,
        },
        fields: 'id',
        supportsAllDrives: true, // Allow resumable uploads for shared drives
      },
      {
        // Use the Axios library to handle resumable uploads
        onUploadProgress: (evt) => {
          const progress = (evt.bytesRead / fileSize / 1048576) * 100;
          // console.log(`Progress: ${progress.toFixed(2)}%`);
        },
      },
      (err, res) => {
          if (err) {
            reject(new Error(`An error occurred while uploading the file: ${err.message}`));
          } else {
            resolve({ msg: 'File uploaded successfully', data: res.data });
          }
        });
  });
}

async function deleteFromDrive(fileKey) {
    let promise = new Promise(function (resolve, reject) {
    
    drive.files.delete({
        fileId: fileKey,
      }, function (err, data) {
        if (err)
          reject(new Error({ msg: "An error occurred while deleting the file" }));
        else resolve({ msg: "file deleted successfully", data: data });
      });
    }); 
    return promise;
  }

  async function deleteVideoFromDrive(fileKey) {
    let promise = new Promise(function (resolve, reject) {
    
    vDrive.files.delete({
        fileId: fileKey,
      }, function (err, data) {
        if (err)
          reject(new Error({ msg: "An error occurred while deleting the file" }));
        else resolve({ msg: "file deleted successfully", data: data });
      });
    }); 
    return promise;
  }

  const processExcelFile = async (worksheet, req) => {
    for (const row of worksheet.getRows()) {
      try {
        // Assuming the image path is in the first cell of each row
        const imagePath = row.getCell(1).value;
        console.log("in", imagePath);
  
        // Convert the image to WebP format
        const webpBuffer = await sharp(imagePath.file.buffer).webp().toBuffer();
  
        // Save the WebP image to Google Drive
        const result = await saveToDrive(
          webpBuffer,
          fileSize, // Ensure that fileSize is defined
          req.file.mimetype,
          req.file.originalname,
          ['1m_HmzJOnlx59htsKYcb2tWOoTnCM1sFl']
        );
  
        // Handle the result (success or failure)
        return {
          success: true,
          message: "Image uploaded successfully!",
          url: result.data.id,
        };
  
      } catch (error) {
        // Handle errors during the process
        console.error("Error processing row:", error);
        return {
          success: false,
          message: "Error processing row",
          error: error.message,
        };
      }
    }
  };
  
module.exports = { saveToDrive, videoSaveToDrive, deleteFromDrive, deleteVideoFromDrive, processExcelFile };
