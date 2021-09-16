import { Client } from 'pg';
const Database = require('better-sqlite3');

import config from '../config/config';
import { createHmac } from 'crypto';
import { dbSchemaSqlite, defaultPresetsSqlite, 
    dropTablesQuery, createTablesQuery, createAdminQuery, createUserQuery, createPresetsQuery 
} from './db-schema';


const init_db_pg = async function() {
    const client = new Client({
        user: config.dbUser,
        host: config.dbHost,
        database: config.database,
        password: config.dbPassword,
        port: config.dbPort,
    })
    client.connect();

    console.log('Initializing Postgres db...');
    await client.query(dropTablesQuery);
    await client.query(createTablesQuery);
    console.log('...done');
  
    console.log('pg: Creating admin and ordinary user...');
    const a_hash = createHmac('sha256', config.secret)
                    .update(config.adminPwd)
                    .digest('hex');
    const o_hash = createHmac('sha256', config.secret)
                    .update(config.userPwd)
                    .digest('hex');
    createAdminQuery.values[2] = a_hash;
    createUserQuery.values[2] = o_hash;
    await client.query(createAdminQuery);
    await client.query(createUserQuery);
    console.log('...done');

    console.log('pg: Creating default presets...');
    await client.query(createPresetsQuery);
    console.log('...done');

    await client.end();
}


const init_db_sqlite = function() {
    const db = new Database(config.dbName);

    console.log('Initializing Sqlite db...');
    db.exec(dbSchemaSqlite);
    console.log('...done');

    console.log('sqlite: Creating admin user...');
    const a_hash = createHmac('sha256', config.secret)
                    .update(config.adminPwd)
                    .digest('hex');
    db.prepare(
        'INSERT INTO users (name, email, password, is_admin, is_teacher, presets_owned) VALUES (?, ?, ?, ?, ?, ?);'
    ).run('admin','admin@admin.com', a_hash, 1, 1, -100);
    console.log('...done');

    console.log('sqlite: Creating ordinary user...');
    const o_hash = createHmac('sha256', config.secret)
                    .update(config.userPwd)
                    .digest('hex');
    db.prepare(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?);'
    ).run('VelikolepnayaAntonina','va@va.com', o_hash);
    console.log('...done');
    
    console.log('sqlite: Creating default presets...');
    db.exec(defaultPresetsSqlite);
    console.log('...done');
    
    db.close();
}


let init_db: Function = () => { throw "dbMode must be either 'sqlite' or 'postgres'" };
if (config.dbMode === 'sqlite') {
    init_db = init_db_sqlite;
} else if (config.dbMode === 'postgres') {
    init_db = init_db_pg;
}

export { init_db };