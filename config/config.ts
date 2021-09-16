import sconfig from './sconfig';


const config = {
    port: process.env.PORT || 3000,
    https_port: process.env.PORT || 3003,
    https: true,
    mode: process.env.NODE_ENV || 'development',

    corsOrigin: ['http://localhost:4500',],
    corsSuccessStatus: 200,

    dbMode: 'sqlite',                // only valid modes are 'sqlite' and 'postgres'
    dbName: 'presets.db',            // file used as db by sqlite3

    dbUser: sconfig.dbUser,                  // PostgreSQL configuration
    dbPassword: sconfig.dbPassword,
    dbHost: 'localhost',
    database: 'memoricci_db',
    dbPort: 5432,

    maxRegisteredUsers: 100,
    maxOwnedPresets: 10,

    presetDir: 'preset_src',         // preset storage
    uploadsDir: 'uploads',
    maxFileSize: 500*1024,
    maxFilesNum: 24,
    defaultBackFilename: 'defaultBack.png',
    defaultEmptyFilename: 'defaultEmpty.png',

    defaultFont: 'FreeSans20White.fnt',
    defaultPicSize: 120,

    initDbOnStart: false,            // restore DB to default state on start?
    clearUploadsOnStart: true,      // delete everything from uploads on start?
    clearAddedPresetsOnStart: false, // delete user added presets on start?

    secret: sconfig.secret,
    jwtSecret: sconfig.jwtSecret,
    adminPwd: sconfig.adminPwd,      // default superadmin
    userPwd: sconfig.userPwd,        // default user

    ssl_key: sconfig.ssl_key_local,
    ssl_cert: sconfig.ssl_cert_local
}

if (process.env.NODE_ENV === 'production') {
    config.ssl_key = sconfig.ssl_key_vm;
    config.ssl_cert = sconfig.ssl_cert_vm;
    config.corsOrigin = ['https://victorious-tree-0945fe003.azurestaticapps.net', 'https://www.memoricci.fun'];

}

export default config;

