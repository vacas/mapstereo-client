const S3 = require('aws-sdk/clients/s3');
const multer = require('multer');
const upload = multer().single('soundBlob');

const s3 = new S3({ apiVersion: '2006-03-01' });

export const config = {
  api: {
    bodyParser: false,
  },
};


export default async (req, res) => {
  if (req.method === 'POST') {
    return upload(req, res, async (err) => {
      try {
        await s3.upload(
          {
            Bucket: process.env.AWS_BUCKET,
            Key: req.file.originalname,
            Body: Buffer.from(new Uint8Array(req.file.buffer)),
          },
          async (err, data) => {
            if (err) {
              console.log('error: ', err);
              res.sendStatus(404);
            }

            res.send(
              `https://${process.env.AWS_BUCKET}/${escape(
                req.file.originalname
              )}`
            );
          }
        );
      } catch (err) {
        console.log(err);
      }
    });
  }

  res.end();
};
