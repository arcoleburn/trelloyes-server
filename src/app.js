'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const winston = require('winston');
const { v4: uuid } = require('uuid');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'info.log' })],
});
if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.log(error);
    response = { message: error.messager, error };
  }
  res.status(500).json(response);
});

const cards = [
  {
    id: 1,
    title: 'Task one',
    content: 'this is card one',
  },
];

const lists = [
  {
    id: 1,
    header: 'List One',
    cardIds: [1],
  },
];

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
});

//get cards endpoint
app.get('/card', (req, res) => {
  res.json(cards);
});
//get lists endpoint
app.get('/list', (req, res) => {
  res.json(lists);
});

//get card by id endpt
app.get('/car/:id', (req, res) => {
  const { id } = req.params;
  const card = cards.find((c) => c.id === id);

  if (!card) {
    logger.error(`card with ID ${id} not found`);
    return res.status(404).send('card not found');
  }
  res.json(card);
});

//get list by id endpt
app.get('/list/:id', (req, res) => {
  const { id } = req.params;
  const list = lists.find((li) => li.id == id);

  if (!list) {
    logger.error(`List with id ${id} not found.`);
    return res.status(404).send('List Not Found');
  }
  res.json(list);
});

app.post('/card', (req, res) => {
  const { title, content } = req.body;

  if (!title) { 
    logger.error('title is required');
    return res.status(400).send('invalid data, title required');
  }
  if (!content) {
    logger.error('content required');
    return res.status(400).send('invalid data, content required');
  }

  const id = uuid();

  const card = { id, title, content };

  cards.push(card);

  logger.info(`card with id ${id} creadted`)
  res.status(201).location(`http://localhost:8080/card/${id}`).json(card)
});


app.post('/list', (req, res) => {
  const { header, cardIds = [] } = req.body;

  if (!header) {
    logger.error(`Header is required`);
    return res
      .status(400)
      .send('Invalid data');
  }

  // check card IDs
  if (cardIds.length > 0) {
    let valid = true;
    cardIds.forEach(cid => {
      const card = cards.find(c => c.id == cid);
      if (!card) {
        logger.error(`Card with id ${cid} not found in cards array.`);
        valid = false;
      }
    });

    if (!valid) {
      return res
        .status(400)
        .send('Invalid data');
    }
  }

  // get an id
  const id = uuid();

  const list = {
    id,
    header,
    cardIds
  };

  lists.push(list);

  logger.info(`List with id ${id} created`);

  res
    .status(201)
    .location(`http://localhost:8000/list/${id}`)
    .json({id});
});

module.exports = app;
