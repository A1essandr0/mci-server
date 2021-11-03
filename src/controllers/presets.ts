import { NextFunction, Request, Response } from 'express';
import { 
    createImages, registerImages, deleteImages, presetsToJson, makeNewPreset, presetIsValid
} from './imagesHelpers';
import { executeSqlQuery } from './dbHelpers';


const list = async function(request: Request, response: Response) {
    const userId = Number(request.headers.userid) || undefined;
    let presets = await presetsToJson(userId);
    response.json(presets);
}

const read = function(request: Request, response: Response) {
    response.json(response.locals.presetRecord);
}


const make = async function(request: any, response: Response) {
    if (!presetIsValid(request.files, request.body)) {
        response.status(500).send(
            { error: `Sent preset with name=${request.body.presetName} hasn't been formed correctly`});
        return;
    }

    try {
        await makeNewPreset(response.locals.user.id, request.files, request.body);
    } catch(error) {
        console.error(error)
        response.status(500).send({ error: error})
        return;
    }

    response.status(200).json({ message: `Preset with name=${request.body.presetName} created` });
}



// to be deprecated
const create = async function(request: Request, response: Response) {
    try {
        await createImages(response.locals.user.id, request.body);
    } catch(error) {
        console.error(error)
        response.status(500).send({ error: error});
        return;
    }

    response.status(200).json({ message: `Preset with name=${request.body.presetName} created` });
}

// to be deprecated
const upload = async function(request: any, response: Response) {
    try {
        await registerImages(response.locals.user.id, request.files, request.body);
    } catch(error) {
        console.error(error)
        response.status(500).send({ error: error})
        return;
    }

    response.status(200).json({ message: `Preset with name=${request.body.presetName} uploaded` });
}



const edit = async function(request: Request, response: Response) {
    await executeSqlQuery(
        `UPDATE presets SET is_playable_by_all = $1, is_viewable_by_all = $2, is_viewable_by_users = $3 
            WHERE id = $4 RETURNING id `,
        [Number(request.body.isPlayableByAll), Number(request.body.isViewableByAll), 
            Number(request.body.isViewableByUsers), response.locals.presetRecord.id ]
    )

    response.status(200).json({ message: `Preset with id=${request.body.id} modified` });
}


// IMPORTANT this one doesn't mark files and db records as deleted.
// It really deletes it for good.
const remove = function(request: Request, response: Response) {
    if (response.locals.presetRecord) deleteImages(response.locals.presetRecord);

    response.status(200).json({ message: `Preset with id=${response.locals.presetRecord.id} deleted` });
}

const presetById = async function(request: Request, response: Response, next: NextFunction, id: number) {
    let presetRecords = await executeSqlQuery('SELECT * FROM presets WHERE id = $1', [id,])

    if (presetRecords.length === 0) response.status(404).send(
        {error: `Preset with id=${id} not found or database settings are invalid`}
    )

    response.locals.presetRecord = presetRecords[0];

    next();
}

export default { list, read, make, upload, create, edit, remove, presetById, presetsToJson };