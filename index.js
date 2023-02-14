const AWS = require('aws-sdk');
const {CopyObjectRequest} = require("aws-sdk/clients/s3");
const Uuid = require('uuid');
const awsMeetupCredential = new AWS.SharedIniFileCredentials({ profile: 'MEETUP'})
AWS.config.credentials = awsMeetupCredential;
const S3 = new AWS.S3({apiVersion: "latest"});

//const BUCKET_NAME = 'demo-please-donot-encrypt-my-bucket';
const BUCKET_NAME = 'demo-dont-worry-encrypt-my-bucket';

function listExistingBuckets() {
  S3.listBuckets((err, data) => {
    if (err)
      console.error(err);
    else
      console.log(data.Buckets);
  });
}

function uploadLetter() {
  const uploadParams = {Bucket: BUCKET_NAME, Key: '', Body: ''};
  const file = 'letter-to-juliet.HTML';

  const fs = require('fs');
  const fileStream = fs.createReadStream(file);
  fileStream.on('error', function(err) {
    console.error('Letter Error', err);
  });

  if (fileStream.readable) {
    uploadParams.Body = fileStream;
    const path = require('path');
    uploadParams.Key = path.basename(file);

    S3.upload(uploadParams, (err, data) => {
      if (err) {
        console.log("Error on uploading letter", err);
      } if (data) {
        console.log("Upload letter Success", data.Location);
      }
    })
  }
}

function encryptBucket() {
  const bucketParam = {
    Bucket: BUCKET_NAME
  }

  S3.listObjectsV2(bucketParam, (err, data) => {
    if (err)
      console.error(err);
    else {
      console.log('bucket objects', data);
      for (const bucketObject in data.Contents) {
        const copyParams = {
          Bucket: BUCKET_NAME,
          CopySource: BUCKET_NAME + '/' + data.Contents[bucketObject].Key,
          Key: data.Contents[bucketObject].Key,
          SSECustomerAlgorithm: 'AES256',
          SSECustomerKey: "B3DBCB8D7594F0A21D3D9E0EA3B75444"
        }
        S3.copyObject(copyParams, (errCopy, dataCopied) => {
          if (errCopy)
            console.error('failed to encrypt', errCopy)
          else
            console.log('encrypted', dataCopied.CopyObjectResult.ETag);
        })
      }

      uploadLetter();
    }
  });
}

listExistingBuckets();
encryptBucket();