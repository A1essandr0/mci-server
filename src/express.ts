import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';

import path from 'path';
import routes from './routes';
import config from '../config/config';


const CURRENT_WORKING_DIR = process.cwd();

const app: Express = express();

app.use(express.json());
app.use('/presets', express.static(path.join(CURRENT_WORKING_DIR, config.presetDir)));
app.use(cookieParser());
app.use(compress());
app.use(helmet());

app.use(cors({
        origin: config.corsOrigin,
        optionsSuccessStatus: config.corsSuccessStatus
})); 

app.use('/', routes);


export { app };
