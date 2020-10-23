'use strict';

const express = require('express');
const logger = require('../logger');
const { v4: uuid } = require('uuid');

const cardRouter = express.Router();
const bodyParser = express.json();
const { cards, lists } = require('../store');

cardRouter
  .route('/card')
  .get((req, res) => {
    res.json(cards);
  })
  .post(bodyParser, (req, res) => {
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

    logger.info(`card with id ${id} creadted`);
    res
      .status(201)
      .location(`http://localhost:8080/card/${id}`)
      .json(card);
  });

cardRouter
  .route('/card/:id')
  .get((req, res) => {
    const { id } = req.params;
    const card = cards.find((c) => c.id === id);

    if (!card) {
      logger.error(`card with ID ${id} not found`);
      return res.status(404).send('card not found');
    }
  })
  .delete((req, res) => {
    const { id } = req.params;

    const cardIndex = cards.findIndex((c) => c.id == id);

    if (cardIndex === -1) {
      logger.error(`Card with id ${id} not found.`);
      return res.status(404).send('Not found');
    }

    //remove card from lists
    //assume cardIds are not duplicated in the cardIds array
    lists.forEach((list) => {
      const cardIds = list.cardIds.filter((cid) => cid !== id);
      list.cardIds = cardIds;
    });

    cards.splice(cardIndex, 1);

    logger.info(`Card with id ${id} deleted.`);

    res.status(204).end();
  });

module.exports = cardRouter;
