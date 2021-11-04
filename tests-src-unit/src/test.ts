const assert = require('assert');
const fs = require('fs');
import { describe, it } from 'mocha';
import { 
    prepareTargetDir, minifyImage, generateImage, sleep 
} from '../../src/controllers/generalLib';
import tConfig from './testConfig';


describe('Target directory correctness', function() {
    const testDirName = 'testing-purpose-dir';

    it('#verify directory creation and deletion', function() {
        assert.strictEqual(fs.existsSync(testDirName), false);

        prepareTargetDir(testDirName);
        assert.strictEqual(fs.existsSync(testDirName), true);
        prepareTargetDir(testDirName);
        assert.strictEqual(fs.existsSync(testDirName), true);

        fs.rmSync(testDirName, {recursive: true}, (err: Error) => {})
        assert.strictEqual(fs.existsSync(testDirName), false);
    })
})


describe('Minifying images', function() {
    const correctResultFile = 'minification_correct_result.jpg';
    const wrongResultFile = 'minification_wrong_result.jpg';
    const sourceImage = `${tConfig.fixturesDir}/ankle.jpg`;
    const validationImage = `${tConfig.fixturesDir}/ankle_minified.jpg`;

    before(async function() {
        await minifyImage(tConfig.defaultPicSize, sourceImage, correctResultFile);
        await minifyImage(tConfig.defaultPicSize + 2, sourceImage, wrongResultFile);
    });

    after(function() {
        fs.rmSync(wrongResultFile, {recursive: true}, (err: Error) => {});
        fs.rmSync(correctResultFile, {recursive: true}, (err: Error) => {});
    });

    it('#test image minification', function() {
        const validationImageBuffer = fs.readFileSync(validationImage);
        const correctImageBuffer = fs.readFileSync(correctResultFile);
        const wrongImageBuffer = fs.readFileSync(wrongResultFile);

        assert.strictEqual(validationImageBuffer.equals(correctImageBuffer), true);
        assert.strictEqual(validationImageBuffer.equals(wrongImageBuffer), false);
    });
})


describe('Generating images', function() {
    const correctFile = 'generation_correct_result.jpg';
    const wrongFile = 'generation_wrong_result.jpg';
    const validationFile = `${tConfig.fixturesDir}/generated.jpg`;
    const font = tConfig.defaultFont;

    it('#test image generation', async function() {
        const validationFileBuffer = fs.readFileSync(validationFile);

        let correctImg = await generateImage('test', tConfig.defaultPicSize, 'orange', font);
        correctImg.write(correctFile, (err) => {
            const correctFileBuffer = fs.readFileSync(correctFile);
            assert.strictEqual(validationFileBuffer.equals(correctFileBuffer), true);
            fs.rmSync(correctFile, {recursive: true}, (err: Error) => {});
        });

        let wrongImg = await generateImage('test', tConfig.defaultPicSize + 2, 'orange', font);
        wrongImg.write(wrongFile, (err) => {
            const wrongFileBuffer = fs.readFileSync(wrongFile);
            assert.strictEqual(validationFileBuffer.equals(wrongFileBuffer), false);
            fs.rmSync(wrongFile, {recursive: true}, (err: Error) => {});
        })
    })
})