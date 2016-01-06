'use strict';

import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();

// Application configuration
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

export default app;
