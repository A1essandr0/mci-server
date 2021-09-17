const https = require('https');
const fs = require('fs');
import { app } from './express';
import config from '../config/config';
import { init_db } from '../scripts/init-db';


const options = {
    key: fs.readFileSync(config.ssl_key),
    cert: fs.readFileSync(config.ssl_cert)
  };


if (config.initDbOnStart) init_db();

if (config.clearUploadsOnStart)
    if (fs.existsSync(config.uploadsDir)) {
        console.log(`Clearing '${config.uploadsDir}'...`);
        fs.rmSync(config.uploadsDir, {recursive: true}, (err: Error) => { if (err) throw err});
        fs.mkdirSync(config.uploadsDir);        
    }

if (config.verifyPresetsOnStart) {
    // TODO
    console.info(`(TBD) Verifying presets integrity...`);

}; 


if (config.https) {
    https.createServer(options, app).listen(config.https_port, (): void => {
        console.info(`https server successfully started on port: ${config.https_port}, mode: ${config.mode}`)
    })
}
else {
    app.listen(config.port, (): void => {
        console.info(`http server successfully started on port ${config.port}, mode: ${config.mode}`)
    })
}
