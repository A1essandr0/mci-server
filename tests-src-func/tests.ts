const assert = require('assert');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
import { describe, it } from 'mocha';
import tConfig from './testConfig';


axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false }); // for local use only
const apiUrl = `${tConfig.server_host}:${tConfig.server_port}`;


// TODO relying on exact text responses = fragility, rework with assert.match
describe('Functional tests for api endpoints', function() {
    let testUserId: Promise<number>;
    let testUserToken: Promise<string>;
    

    describe('signing up', function() {
        it('#signing up as tester', async function() {
            let signupRequest = await axios.post(
                `${apiUrl}/api/users`, {
                    name: tConfig.testUserName,
                    email: tConfig.testUserEmail,
                    password: tConfig.testUserPassword,
                    passwordRepeat: tConfig.testUserPassword 
                }
            )
            assert.strictEqual(signupRequest.status, 200);
            assert.strictEqual(signupRequest.data['message'], "User created");
            assert.strictEqual(signupRequest.data['name'], tConfig.testUserName);
            testUserId = Promise.resolve(signupRequest.data['id']);
        })

        it('#signing up again with the same email', async function() {
            await testUserId;
            await axios.post(
                `${apiUrl}/api/users`, {
                    name: tConfig.testUserName + '2',
                    email: tConfig.testUserEmail,
                    password: tConfig.testUserPassword + '2',
                    passwordRepeat: tConfig.testUserPassword + '2' 
                }
            ).catch((errData: any) => {
                assert.strictEqual(errData.response.status, 401)
                assert.strictEqual(errData.response.data.error, 
                    `User with email ${tConfig.testUserEmail} already exists or user limit exceeded`)
            })                        
        })
    })


    describe('signing in', function() {
        it('#correctly', async function() {
            let userId = await testUserId;
            let signinRequest = await axios.post(
                `${apiUrl}/auth/signin`, {
                    email: tConfig.testUserEmail,
                    password: tConfig.testUserPassword,
                }
            )
            assert.strictEqual(signinRequest.status, 200);
            assert.strictEqual(signinRequest.data['user']['id'], userId);
            testUserToken = Promise.resolve(signinRequest.data['token']);
        })

        it('#incorrect email', async function() {
            await testUserId;
            await axios.post(
                `${apiUrl}/auth/signin`, {
                    email: 'a' + tConfig.testUserEmail,
                    password: tConfig.testUserPassword,
                }
            ).catch((errData: any) => {
                assert.strictEqual(errData.response.status, 404);
                assert.strictEqual(errData.response.data['error'], `User with email ${'a' + tConfig.testUserEmail} was not found or database settings are invalid`)
            })     
        })

        it('#incorrect password', async function() {
            await testUserId;
            await axios.post(
                `${apiUrl}/auth/signin`, {
                    email: tConfig.testUserEmail,
                    password: 'a' + tConfig.testUserPassword,
                }
            ).catch((errData: any) => {
                assert.strictEqual(errData.response.status, 401);
                assert.strictEqual(errData.response.data['error'], "Email and password don't match.")
            })          
        })
    })



    describe.skip('#making preset', function() {
    });

    describe.skip('#managing preset', function() {
    });

    describe.skip('#deleting preset', function() {
    });


    describe('admin', function() {
        it('#getting user info without signin is not allowed', async function() {
            let response = await axios.get(
                `${apiUrl}/api/users/1`
            ).catch((errData: any) => {
                assert.strictEqual(errData.response.status, 401)
            })
        })

        it('#correct admin', async function() {
            let token = await testUserToken;

            let correctResponse = await axios({
                method: 'GET',
                url: `${apiUrl}/api/users/1`,
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            })
            assert.strictEqual(correctResponse.status, 200)
            assert.strictEqual(correctResponse.data['name'], 'admin')
        })
        it('#incorrect admin', async function() {
            let token = await testUserToken;

            await axios({
                method: 'GET',
                url: `${apiUrl}/api/users/0`,
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            }).catch((errData: any) => {
                assert.strictEqual(errData.response.status, 404);
                assert.strictEqual(errData.response.data.error, 
                    'User with id=0 not found or database settings are invalid')
            })
        })
    })

    describe('editing user profile', function() {
        it('#modifying profile', async function() {
            let userId = await testUserId;
            let token = await testUserToken;

            let modifyRequest = await axios({
                method: 'PUT',
                url: `${apiUrl}/api/users/${userId}`, 
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
                data: {
                    id: userId,
                    name: 'Toaster',
                    email: tConfig.testUserEmail
                }                
            })
            assert.strictEqual(modifyRequest.status, 200);
            assert.strictEqual(modifyRequest.data['name'][0]['name'], "Toaster")
        })

        it('#modifying wrong profile', async function() {
            let token = await testUserToken;

            await axios({
                method: 'PUT',
                url: `${apiUrl}/api/users/1`, 
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                data: {
                    id: 1,
                    name: 'Notadmin',
                    email: 'notadmin@notadmin.com'
                }
            }).catch((errData: any) => {
                assert.strictEqual(errData.response.status, 401);
                assert.strictEqual(errData.response.data['error'], "not authorized");
            })
        })

        it('#deleting user', async function() {
            let userId = await testUserId;
            let token = await testUserToken;

            let deleteRequest = await axios.delete(
                `${apiUrl}/api/users/${userId}`, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }
            )
            assert.strictEqual(deleteRequest.status, 200);
            assert.strictEqual(deleteRequest.data['message'], `User with id=${userId} deleted`);
        })        
    })

})