const assert = require('assert');
const Database = require('better-sqlite3');
const fs = require('fs')
const testConfig = require('./testConfig');


// entry point for tests 



// #express server setup


// #client setup for fetches


context('SQLite3 database', function() {
    before(function() {
        const db = new Database(testConfig.testDbName);
    });

    after(function() {
        fs.unlink(testConfig.testDbName, (err) => { if (err) throw err})
    });

    // TODO remove after
    context('#read', function() {
        specify('should read from database file', function() {
            assert.strictEqual(fs.existsSync(testConfig.testDbName), true)
        })
    })


    // #list existing users
    // #list one user

    // #sign in with wrong name
    // #sign in with wrong pwd
    // #sign in correctly

    // #create user
    // #delete user

    
})


// context('Postgres database')
