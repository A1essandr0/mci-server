import { createHmac } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import config from '../../config/config';
import { executeSqlQuery } from './dbHelpers';


const list = async function(request: Request, response: Response) {
    let usersList = await executeSqlQuery("SELECT id, name, email, is_admin FROM users")
    response.json(usersList);
};

const userById = async function(request: Request, response: Response, next: NextFunction, id: number) {
    let userProfiles = await executeSqlQuery(
        "SELECT id, name, email, is_admin FROM users WHERE id = $1", 
        [id,]
    );

    if (userProfiles.length === 0) response.status(404).send({error: `User with id=${id} not found or database settings are invalid`})
    response.locals.profile = userProfiles[0];

    next();
}

const read = function(request: Request, response: Response) {
    response.json(response.locals.profile);
};


const create = async function(request: Request, response: Response) {
    let userExists = await executeSqlQuery(
        "SELECT id, name, email, is_admin FROM users WHERE email = $1",
        [request.body.email,]
    )
    let totalUsers = await executeSqlQuery(
        "SELECT id FROM users"
    )

    if (userExists.length === 0 && totalUsers.length < config.maxRegisteredUsers) {
        const hash = createHmac('sha256', config.secret)
        .update(request.body.password)
        .digest('hex');

        await executeSqlQuery(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING name;",
            [request.body.name, request.body.email, hash]
        )
        response.status(200).json( { message: 'User created'} );

    } else response.status(401).send(
            { error: `User with email ${request.body.email} already exists or user limit exceeded`}
        )
};

const update = async function(request: Request, response: Response) {
    await executeSqlQuery(
        "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING name",
        [request.body.name, request.body.email, response.locals.profile.id]
    )
    response.status(200).json({ message: `User with id=${response.locals.profile.id} updated` });
};

const remove = async function(request: Request, response: Response) {
    // 'On cascade db' setting ensures that preset records will be automatically deleted with user.
    // Images themselves will remain though.
    await executeSqlQuery(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [response.locals.profile.id,]
    )
    response.status(200).json({ message: `User with id=${response.locals.profile.id} deleted` });
};


export default { list, create, read, userById, update, remove };