const multer = require('multer');
const multers3 = require('multer-s3');
const fs = require('fs');
const AWS = require('aws-sdk');
const KEY = require('../../config/settings');
// Load credentials
AWS.config.update({
    secretAccessKey: KEY.AWS_SECRET_KEY,
    accessKeyId: KEY.AWS_ACCESS_KEY,
    region: KEY.AWS_REGION
});
const s3 = new AWS.S3();

//Create Bucket
module.exports.createBucket = (req, res, next) => {
        let item = req.body;
        let params = { Bucket: item.bucketName }
        s3.createBucket(params, (err, awsResp) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to create a new Bucket',
                    err
                });
            }
            res.status(200).json({
                status: 200,
                statusCode: 200,
                msg: 'Bucket created successfully',
                awsResp
            });
        });
    }
    // Get all buckets
module.exports.listBuckets = (req, res, next) => {
    s3.listBuckets((err, data) => {
        if (err) throw new Error(err);
        res.status(200).json({
            status: 200,
            statusCode: 200,
            msg: 'All buckets returned',
            data
        });
    });
}
module.exports.deleteBucket = (req, resp, next) => {
    let item = req.body;
    let params = { Bucket: item.bucketName };
    s3.deleteBucket(params, (err, data) => {
        if (err) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                msg: 'Failure to create a new Bucket',
                err
            });
        }
        res.status(200).json({
            status: 200,
            statusCode: 200,
            msg: 'Bucket created successfully',
            data
        });
    });
}
module.exports.deleteBucketCrossDomain = (req, resp, next) => {
        let item = req.body;
        let params = { Bucket: item.bucketName };
        s3.deleteBucketCors(params, (err, data) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to create a new Bucket',
                    err
                });
            }
            res.status(200).json({
                status: 200,
                statusCode: 200,
                msg: 'Bucket created successfully',
                data
            });
        });
    }
    // Get objects uploaded
module.exports.getObjects = (req, resp, next) => {
        let item = req.body;
        let params = { Bucket: item.bucketName };
        s3.getObject(params, (err, data) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to create a new Bucket',
                    err
                });
            }
            res.status(200).json({
                status: 200,
                statusCode: 200,
                msg: 'Bucket created successfully',
                data
            });
        });
    }
    // Upload file
module.exports.uploadAWSFile = (req, resp, next) => {
    let item = req.body;
    let upload = multer({
        storage: multers3({
            s3,
            bucket: 'wootow-legal-computing',
            metadata: async(req, file, cb) => {
                cb(null, { fieldName: "test" });
            },
            key: async(req, file, cb) => {
                cb(null, Date.now().toString());
            }
        }),
    });
}