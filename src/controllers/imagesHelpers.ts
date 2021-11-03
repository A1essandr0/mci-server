const fs = require('fs');
import config from '../../config/config';
import { executeSqlQuery } from './dbHelpers';
import { prepareTargetDir, minifyImage, generateImage } from './generalLib';


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


// TODO don't trust client data
export function presetIsValid(files: any, body: any) {
    let texts = JSON.parse(body['texts']);
    let types = JSON.parse(body['types']);


    return true;
}


export async function makeNewPreset(userId: number, files: any, body: any) {
    // console.log(files, body);

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

    // registering preset in DB
    let newMadePreset = await executeSqlQuery(
        `INSERT INTO presets 
            (owner_id, owner_name, name, is_playable_by_all, is_viewable_by_all, is_viewable_by_users, card_back, card_empty, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, owner_name;`,
        [userId, ownedBy[0].name, body.presetName,
            Number(body.isPlayableByAll === 'true'), Number(body.isViewableByAll === 'true'), Number(body.isViewableByUsers === 'true'),
            'back', 'empty', body.presetDescription
        ]
    );
    if (newMadePreset.length === 0) throw `Something went wrong during uploading preset '${body.presetName}'`;

    prepareTargetDir(`${config.presetDir}/${body.presetName}`);
    let [texts, types] = [ JSON.parse(body['texts']), JSON.parse(body['types']) ];

    // back and empty slots
    [   ['0_0', 'back', body.backColor ],
        ['0_1', 'empty', body.emptyColor ]
    ].forEach(async (slot) => {
        if (slot[0] in types) {
            let fileObject = files.filter((item: any) => item.fieldname === slot[0])[0];
            let fileExtension = fileObject.mimetype.slice(6);
            minifyImage(defaultPicSize, fileObject.path, 
                `${config.presetDir}/${body.presetName}/${slot[1]}`);
            fs.rmSync(fileObject.path);
        } else {
            let backImg = await generateImage('', defaultPicSize, slot[2], defaultFont);
            backImg.write(`${config.presetDir}/${body.presetName}/${slot[1]}`);    
        }
    })

    // main slots
    for (let key of Object.keys(types)) {
        if (key === '0_0' || key === '0_1') continue;
        let [pairNum, cardNum] = key.split('_')
        let infoKey = `${pairNum}_0`; let info: string;
        if (infoKey in texts) info = texts[infoKey]
            else info = 'n/a';
        let cardValue = `value_${pairNum}`;

        if (types[key] === 'img') {
            let fileObject = files.filter((item: any) => item.fieldname === key)[0];
            let fileExtension = fileObject.mimetype.slice(6);
            let targetFileName = `${config.presetDir}/${body.presetName}/${fileObject.filename}.${fileExtension}`;

            minifyImage(defaultPicSize, fileObject.path, targetFileName);

            await executeSqlQuery(
                "INSERT INTO cards (preset_id, value, filename, info) VALUES ($1, $2, $3, $4) RETURNING value",
                [newMadePreset[0].id, cardValue, `${fileObject.filename}.${fileExtension}`, info]
            )

            fs.rmSync(fileObject.path);
        }

        else if (types[key] === 'text') {
            let bgColor = pairNum === '1' ? body.bgColorOne : body.bgColorTwo;
            let filename = `image_${key}.png`;
            let cardWord = texts[key];

            let img = await generateImage(cardWord, defaultPicSize, bgColor, defaultFont);
            img.write(`${config.presetDir}/${body.presetName}/${filename}`)

            await executeSqlQuery(
                "INSERT INTO cards (preset_id, value, filename, info) VALUES ($1, $2, $3, $4) RETURNING value",
                [newMadePreset[0].id, cardValue, filename, info ]
            )
        }
    }

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
