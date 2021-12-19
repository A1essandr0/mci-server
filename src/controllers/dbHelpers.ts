const Database = require('better-sqlite3');
import { Client } from 'pg';
import config from '../../config/config';


export const executeSqlQuery = async function(text: string, values: (string|number)[] = []) {
    let queryResult;

    if (config.dbMode === 'sqlite') {
        const db = new Database(config.dbName);

        // sqlite3 specifics
        text = text.replace(/\$\d/g, '?');
        queryResult = db.prepare(text).all([...values]);

        db.close();
    }
    else if (config.dbMode === 'postgres') {
        const client = new Client({
            user: config.dbUser,
            host: config.dbHost,
            database: config.database,
            password: config.dbPassword,
            port: config.dbPort,
        })
        client.connect();

        let query = await client.query({
            text: text,
            values: values
        })
        queryResult = query.rows

        await client.end();
    }
    else throw "dbMode must be either 'sqlite' or 'postgres'";

    return queryResult;
}