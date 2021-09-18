import express, { Request, Response, NextFunction } from 'express';
import authCtrl from './controllers/auth';
import usersCtrl from './controllers/users';
import presetsCtrl from './controllers/presets';
import config from '../config/config';
const multer = require('multer');


const router = express.Router();

const upload = multer({
    dest: `${config.uploadsDir}`,
    limits: {
        fileSize: config.maxFileSize,
        files: config.maxFilesNum
    } 
}).any();

const uploadImages = function(request: Request, response: Response, next: NextFunction) {
    upload(request, response, function(err: any) {
        if (err instanceof multer.MulterError) {
            console.error(err)
            response.status(500).send({ error: err['code']});
        }
        else next();
    })
}


router.route('/auth/signin')
    .post(authCtrl.signin);

router.route('/auth/signout')
    .get(authCtrl.signout);


router.route('/api/users')
    .get(usersCtrl.list) // TODO add requireSignin to protect emails
    .post(usersCtrl.create);

router.route('/api/users/:userId')
    .get(usersCtrl.read) // TODO add requireSignin to protect emails
    .put(authCtrl.requireSignin, authCtrl.hasAuthorization, usersCtrl.update)
    .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, usersCtrl.remove);

router.param('userId', usersCtrl.userById);


router.route('/api/presets')
    .get(presetsCtrl.list)
    .post(authCtrl.requireSignin, authCtrl.hasAuthorization, uploadImages, presetsCtrl.upload)

router.route('/api/presets/:presetId')
    .get(presetsCtrl.read)
    .put(authCtrl.requireSignin, authCtrl.hasAuthorization, presetsCtrl.edit)
    .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, presetsCtrl.remove);

router.route('/api/new-preset')
    .post(authCtrl.requireSignin, authCtrl.hasAuthorization, presetsCtrl.create);

router.param('presetId', presetsCtrl.presetById);


export default router;
