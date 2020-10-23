'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const {
  errorHandler,
  validateBearerToken,
} = require('./validateAndError/validateAndError');

const app = express();

const cardRouter = require('./card/card-router');
const listRouter = require('./list/list-router');

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use(errorHandler);
app.use(validateBearerToken);

app.use(cardRouter);
app.use(listRouter);

module.exports = app;
