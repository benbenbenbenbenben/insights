'use strict';

// TODO get version from config
var _pfx = '/api/v1';


var http = require("https");
var express = require('express');
var namespace = require('express-namespace');
var seneca = require('seneca')({ timeout: 10000 });
var util = require('util');
var fs = require('fs');
var bodyParser = require('body-parser');
var async = require('async');
var extend = require('extend');
var cors = require('cors');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


seneca.client({ host: 'localhost', port: 10101 });
var data = {
  act: (request, callback) => {
    extend(request, { role:'data' });
    seneca.act(request, callback);
  }
};

app.namespace(_pfx, () => {
  app.get('/ok', (req, res) => {
    res.send({ status:'ok' });
    // TODO include db status etc.
  });

  app.get('/dashboard', (req, res) => {
    console.log('getDashboard');
    data.act({
      cmd:'getDashboard',
      dashboard: {
        name: 'default'
        // TODO user and group information
      }
    }, (error, response) => {
      console.log('response');
      if (error)
        throw error;
      // TODO sanitize
      res.send(response);
    });
  });


});


console.log('starting server');
app.listen(3001);
