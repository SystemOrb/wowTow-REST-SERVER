/* Modules & common */
const aws = require('aws-sdk');
const KEY = require('../../config/settings');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const app = express();
const s3 = new aws.S3();
/* End Modules && Common */
/*
Schemas 
*/
const DocLegal = require('../../models/grueros/documents');
const Provider = require('../../models/grueros/employer');
/*
End Schemas
*/
aws.config.update({
    secretAccessKey: KEY.AWS_SECRET_KEY,
    accessKeyId: KEY.AWS_ACCESS_KEY,
    region: KEY.AWS_REGION
});
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'wootow-legal-computing',
        acl: 'public-read',
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            cb(null, Date.now().toString() + '.jpg')
        }
    })
})

app.post('/upload/:app/:id/:operationType', upload.single('image'), function(req, res, next) {
    const operationUpload = req.params.operationType;
    switch (operationUpload) {
        case 'document':
            if (!documentType(req.query.documentType)) {
                return res.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'Document Invalid'
                });
            }
            uploadDocument(req.file.location, req.params.id, req.query.documentType, res);
            break;
    }
    // res.send('Successfully uploaded ' + req.files.length + ' files!')
    // return res.json({ 'imageUrl': req.file.location });

})
let validateDBCollection = (db) => {
    try {
        let db_available = ['employers', 'client', 'admin'];
        if (db_available.indexOf(db) < 0) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        throw error;
    }
}
let documentType = (ClientDoc) => {
        try {
            let document_accepted = ['DNI', 'LICENSE', 'POLICY', 'PASSPORT', 'SELFIE', 'RESIDENCE'];
            if (document_accepted.indexOf(ClientDoc) < 0) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            throw error;
        }
    }
    // Metodo para agregar documentos a un gruero
let uploadDocument = (aws_url, provider, documentType, callback) => {
    Provider.findById(provider, (err, providerData) => {
        if (err) {
            return callback.status(500).json({
                status: false,
                statusCode: 500,
                msg: 'Failure to verify if this provider exists',
                err
            });
        }
        if (!providerData) {
            return callback.status(400).json({
                status: false,
                statusCode: 400,
                msg: 'This provider doesnt exists in our system',
            });
        }
        // Paso las validaciones entonces cargamos el documento en el sistema
        const uploadLegacy = new DocLegal({
            document_name: aws_url,
            user: providerData._id,
            documentType
        });
        uploadLegacy.save((err, docUploaded) => {
            if (err) {
                return callback.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to upload this document in our system',
                    err
                });
            }
            callback.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Your Document has been uploaded successfully. Please wait for our confirmation',
                docUploaded
            });
        });
    });
}
module.exports = app;