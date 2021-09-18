import { 
    devConfiguration, productionConfiguration, localProductionConfiguration 
} from '../.env';


let sconfig;
switch (process.env.NODE_ENV) {
    case 'production':
        sconfig = productionConfiguration;        
        break;

    case 'local':
        sconfig = localProductionConfiguration;        
        break;
    
    default:
        sconfig = devConfiguration;
}


const config = {
    mode: process.env.NODE_ENV,

    port: 3000,
    https_port: 3003,
    https: true,

    corsOrigin: sconfig.corsOrigin,
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
    verifyPresetsOnStart: true, // delete user added presets on start?

    secret: sconfig.secret,
    jwtSecret: sconfig.jwtSecret,
    adminPwd: sconfig.adminPwd,      // default superadmin
    userPwd: sconfig.userPwd,        // default user

    ssl_key: sconfig.ssl_key,
    ssl_cert: sconfig.ssl_cert
}


export default config;

