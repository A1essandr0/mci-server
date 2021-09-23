const fs = require('fs');
const zlib = require('zlib');
const tar = require('tar');

const config = {
    dbName: 'presets.db',
    presetDir: 'preset_src',
    backupDir: 'backup',
    archiveName: 'presets-archive'
}


console.log(`Creating backup for preset from ${config.presetDir} and database from ${config.dbName} ...`);

if (!fs.existsSync(config.backupDir)) fs.mkdirSync(config.backupDir, {}, (err) => { if (err) throw err});
let gzip = zlib.createGzip();
let input, output;
let dateNow = Date.now()

tar.create(
    {file: `${config.backupDir}/${config.archiveName}-${dateNow}.tar`},
    [config.presetDir, config.dbName]
).then(() => {
    input = fs.createReadStream(`${config.backupDir}/${config.archiveName}-${dateNow}.tar`);
    output = fs.createWriteStream(`${config.backupDir}/${config.archiveName}-${dateNow}.tar.gz`);
    input.pipe(gzip).pipe(output);
}).then(() => {
    fs.rm(`${config.backupDir}/${config.archiveName}-${dateNow}.tar`, () => {})
})