import { NextFunction, Request, Response } from 'express';
import config from '../../config/config';
import jwt from 'jsonwebtoken';
import { createHmac } from 'crypto';
import expressJwt from 'express-jwt';
import { executeSqlQuery } from './dbHelpers';


const requireSignin = expressJwt({
    secret: config.jwtSecret,
    resultProperty: 'locals.user',
    algorithms: ['HS256']
})


const hasAuthorization = function(request: Request, response: Response, next: NextFunction) {
    let authorized = false;

    const userIsAdministrator = response.locals.user.is_admin === 1;

    const userUpdatingHisOwnProfile = response.locals.profile && 
        response.locals.profile.id === response.locals.user.id && request.route.path === '/api/users/:userId';

    const userMakingPreset = response.locals.user && request.route.path === '/api/make-new-preset';

    const userModifyingHisOwnPreset = response.locals.user && response.locals.presetRecord && 
        response.locals.presetRecord.owner_id === response.locals.user.id && 
        request.route.path === '/api/presets/:presetId' && 
        (request.method === 'PUT' || request.method === 'DELETE');


    if (userIsAdministrator || userUpdatingHisOwnProfile || userMakingPreset ||
            userModifyingHisOwnPreset) 
        authorized = true;

    if (!authorized)
        return response.status(401).send({error: "not authorized"});
    else
        next();
}


const signin = async function(request: Request, response: Response) {
    let usersRecords = await executeSqlQuery(
        "SELECT id, name, email, password, is_admin FROM users WHERE email = $1", 
        [request.body.email,]
    )

    if (usersRecords.length === 0) return response.status(404).send(
        {error: `User with email ${request.body.email} was not found or database settings are invalid`}
    )
    let user = usersRecords[0];

    const sent_hash = createHmac(
        'sha256', config.secret
    ).update(request.body.password).digest('hex');

    if (user.password === sent_hash) {    
        const token = jwt.sign({
            id: user.id,
            is_admin: user.is_admin
        }, config.jwtSecret);

        response.cookie("t", token);

        return response.status(200).json({
            token,
            user: {id: user.id, name: user.name, email: user.email, is_admin: user.is_admin }
        })
    } else return response.status(401).send({error: "Email and password don't match."});
};

const signout = function(request: Request, response: Response) {
    response.clearCookie("t");
    return response.status(200).json({ message: "Signed out" });
};


export default { signin, signout, requireSignin, hasAuthorization };
