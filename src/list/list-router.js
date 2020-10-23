'use strict'

const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const { cards, lists } = require('../store')

const listRouter = express.Router()
const bodyParser = express.json()

listRouter
  .route('/list')
  .get((req, res) => {
    // move implementation logic into here
  })
  .post(bodyParser, (req, res) => {
    // move implementation logic into here
  })

listRouter
  .route('/list/:id')
  .get((req, res) => {
    // move implementation logic into here
  })
  .delete((req, res) => {
    // move implementation logic into here
  })

module.exports = listRouter