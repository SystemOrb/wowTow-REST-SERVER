const aws = require('aws-sdk')
const KEY = require('../../config/settings');

const multer = require('multer')
const multerS3 = require('multer-s3')

const s3 = new aws.S3();
aws.config.update({
    secretAccessKey: KEY.AWS_SECRET_KEY,
    accessKeyId: KEY.AWS_ACCESS_KEY,
    region: KEY.AWS_REGION
});
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'wootow-legal-computing',
        metadata: function(req, file, cb) {
            cb(null, { fieldName: 'pasaporte' });
        },
        key: function(req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

module.exports = upload;