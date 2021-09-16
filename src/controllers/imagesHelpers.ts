const fs = require('fs');
import jimp from 'jimp';
import config from '../../config/config';
import { executeSqlQuery } from './dbHelpers';


const [defaultBackFilename, defaultEmptyFilename, defaultFont, defaultPicSize] = [
    `${config.presetDir}/${config.defaultBackFilename}`, 
    `${config.presetDir}/${config.defaultEmptyFilename}`,
    `${config.presetDir}/${config.defaultFont}`,
    config.defaultPicSize,
]

export const presetsToJson = async function(userId: number | undefined) {
    let presetsRecords = [];

    // filtering private presets
    if (userId)
        presetsRecords = await executeSqlQuery(
            "SELECT * FROM presets WHERE is_playable_by_all = 1 OR owner_id = $1",
            [userId,]
        )
    else
        presetsRecords = await executeSqlQuery("SELECT * FROM presets WHERE is_playable_by_all = 1")

    let result = [];
    for (let pr of presetsRecords) {
        let presetCards = await executeSqlQuery(
            "SELECT * FROM cards WHERE preset_id = $1", [pr.id]
        )

        let cardsTmp = [];
        for (let card of presetCards) {
            cardsTmp.push({
                value: card.value,
                filename: `/presets/${pr.name}/${card.filename}`,
                info: card.info
            })
        }

        result.push({
            presetId: pr.id,
            presetName: pr.name,
            owner: pr.owner_id,
            ownerName: pr.owner_name,
            cardBack: `/presets/${pr.name}/${pr.card_back}`,
            cardEmpty: `/presets/${pr.name}/${pr.card_empty}`,
            description: pr.description,
            cards: cardsTmp,
            playableByAll: pr.is_playable_by_all,
            viewableByAll: pr.is_viewable_by_all,
            viewableByUsers: pr.is_viewable_by_users
        })        
    }

    return result;
}


const prepareTargetDir = function(targetDir: string) {
    if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, {recursive: true}, (err: Error) => { if (err) throw err})
    }
    fs.mkdirSync(targetDir, {}, (err: Error) => { if (err) throw err});
}


export async function createImages(userId: number, body: any) {

    // correct directory for preset
    let presetExists = await executeSqlQuery(
        "SELECT id FROM presets WHERE name = $1",
        [body.presetName,]
    );
    if (presetExists.length > 0) throw `Preset with the name '${body.presetName}' already exists`;

    let ownedBy = await executeSqlQuery(
        "SELECT id, name, presets_owned FROM users WHERE id = $1",
        [userId,]
    );
    if (ownedBy[0].presets_owned >= config.maxOwnedPresets) throw `Can't create: preset limit exceeded`;

    // registering created preset in DB
    let createdPreset = await executeSqlQuery(
        `INSERT INTO presets 
            (owner_id, owner_name, name, is_playable_by_all, is_viewable_by_all, is_viewable_by_users, card_back, card_empty, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, owner_name;`,
        [userId, ownedBy[0].name, body.presetName,
            Number(body.isPlayableByAll === true), Number(body.isViewableByAll === true), Number(body.isViewableByUsers === true),
            'back.png', 'empty.png', body.presetDescription
        ]
    );
    if (createdPreset.length === 0) throw `Something went wrong during creating preset '${body.presetName}'`;


    // generating images with words
    prepareTargetDir(`${config.presetDir}/${body.presetName}`);
    let counter = 0;
    let filename, bgColor, cardValue;
    for (let cardWord of body.cardValues) {
        bgColor = body.bgColorTwo;
        filename = `number_${counter}.png`;

        if (counter % 2 == 0) {
            bgColor = body.bgColorOne;
            cardValue = cardWord.toLowerCase()
        }

        generateImage(cardWord, defaultPicSize, bgColor, defaultFont,
            `${config.presetDir}/${body.presetName}/${filename}`);

        await executeSqlQuery(
            "INSERT INTO cards (preset_id, value, filename, info) VALUES ($1, $2, $3, $4) RETURNING value",
            [createdPreset[0].id, cardValue, filename, body.cardInfos[counter] ]
        )

        counter++;
    }

    // back and empty slot colors
    generateImage('', defaultPicSize, body.backColor, defaultFont, `${config.presetDir}/${body.presetName}/back.png`);
    generateImage('', defaultPicSize, body.emptyColor, defaultFont, `${config.presetDir}/${body.presetName}/empty.png`);

    // update owned presets counter for user
    await executeSqlQuery(
        "UPDATE users SET presets_owned = $1 WHERE id = $2 RETURNING id",
        [ownedBy[0].presets_owned + 1, userId]
    );
}


export async function registerImages(userId: number, files: any, body: any) {

    // correct directory for preset
    let presetExists = await executeSqlQuery(
        "SELECT id FROM presets WHERE name = $1",
        [body.presetName,]
    );
    if (presetExists.length > 0) throw `Preset with the name '${body.presetName}' already exists`;

    let ownedBy = await executeSqlQuery(
        "SELECT id, name, presets_owned FROM users WHERE id = $1",
        [userId,]
    );
    if (ownedBy[0].presets_owned >= config.maxOwnedPresets) throw `Can't upload: preset limit exceeded`;

    // registering preset in DB
    let uploadedPreset = await executeSqlQuery(
        `INSERT INTO presets 
            (owner_id, owner_name, name, is_playable_by_all, is_viewable_by_all, is_viewable_by_users, card_back, card_empty, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, owner_name;`,
        [userId, ownedBy[0].name, body.presetName,
            Number(body.isPlayableByAll === 'true'), Number(body.isViewableByAll === 'true'), Number(body.isViewableByUsers === 'true'),
            'back', 'empty', body.presetDescription
        ]
    );
    if (uploadedPreset.length === 0) throw `Something went wrong during uploading preset '${body.presetName}'`;

    // registering images in db
    // copying file images
    // if no image for card back / card empty provided, default ones are used
    prepareTargetDir(`${config.presetDir}/${body.presetName}`);
    let [backFilename, emptyFilename] = [defaultBackFilename, defaultEmptyFilename];

    for (let fileObject of files) {
        if (fileObject.fieldname === 'backImg') backFilename = fileObject.path
        if (fileObject.fieldname === 'emptyImg') emptyFilename = fileObject.path

        if (/imgFile/.test(fileObject.fieldname)) {
            let [_, pairNum, cardNum] = fileObject.fieldname.match(/(\d)(one|two)/)
            let fileExtension = fileObject.mimetype.slice(6);
            let [fileInfo, imgInfoProp] = ["n/a", `imgInfo${pairNum}`];
            let targetFileName = `${config.presetDir}/${body.presetName}/${fileObject.filename}.${fileExtension}`;
            if (body[imgInfoProp]) fileInfo = body[imgInfoProp];

            minifyImage(defaultPicSize, fileObject.path, targetFileName);

            await executeSqlQuery(
                "INSERT INTO cards (preset_id, value, filename, info) VALUES ($1, $2, $3, $4) RETURNING value",
                [uploadedPreset[0].id, pairNum, `${fileObject.filename}.${fileExtension}`, fileInfo]
            )

            fs.rmSync(fileObject.path);
        }
    }

    // custom card back
    if (backFilename !== defaultBackFilename) {
        minifyImage(defaultPicSize, backFilename, `${config.presetDir}/${body.presetName}/back`);
        fs.rmSync(backFilename);
    } else fs.copyFileSync(backFilename, `${config.presetDir}/${body.presetName}/back`);

    // custom empty slot
    if (emptyFilename !== defaultEmptyFilename) {
        minifyImage(defaultPicSize, emptyFilename, `${config.presetDir}/${body.presetName}/empty`);
        fs.rmSync(emptyFilename);
    } else fs.copyFileSync(emptyFilename, `${config.presetDir}/${body.presetName}/empty`);

    // update owned presets counter for user
    await executeSqlQuery(
        "UPDATE users SET presets_owned = $1 WHERE id = $2 RETURNING id",
        [ownedBy[0].presets_owned + 1, userId]
    );
}


export async function deleteImages(presetRecord: any) {
    if (fs.existsSync(`${config.presetDir}/${presetRecord.name}`))
        fs.rmSync(`${config.presetDir}/${presetRecord.name}`, {recursive: true}, 
            (err: Error) => { if (err) throw err}
        )

    // 'on cascade db' setting ensures that card records will be automatically deleted with preset one
    await executeSqlQuery(
        "DELETE FROM presets WHERE id = $1 RETURNING id",
        [presetRecord.id,]
    );

    await executeSqlQuery(
        "UPDATE users SET presets_owned = ( SELECT presets_owned FROM users WHERE id = $1) - 1 WHERE id = $2 RETURNING id",
        [presetRecord.owner_id, presetRecord.owner_id]
    )
}


const minifyImage = async function(picSize: number, sourceFile: string, targetFile: string) {
    return await jimp.read(sourceFile).then(
        image => {
            image.background(0xFFFFFFFF).contain(picSize, picSize).write(targetFile);
        }
    ).catch(err => console.log(err));
}


const generateImage = async function(word: string, picSize: number, bgColor: string, font: string, outfile: string) {
    return await new jimp(picSize, picSize, bgColor, (err, image) => {
        jimp.loadFont(font).then(font => {
            let [textWidth, textHeight] = [jimp.measureText(font, word), jimp.measureTextHeight(font, word, picSize)];
            let [xpos, ypos] = [
                (picSize - textWidth) / 2,
                (picSize - textHeight) / 2
            ];
            image.print(font, xpos, ypos, word).write(outfile)
        })
    })
}
