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

// TODO makes tableau self sign work
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

  app.get('/tableau', (req, res) => {
    var options = {
      "method": "POST",
      "hostname": "tableau-qa.novartis.net",
      "port": null,
      "path": "/trusted",
      "headers": {
        "content-type": "multipart/form-data; boundary=---011000010111000001101001",
        "cache-control": "no-cache"
      }
    };
    var r = http.request(options, function (ans) {
      var chunks = [];
      ans.on("data", function (chunk) {
        chunks.push(chunk);
      });
      ans.on("end", function () {
        var body = Buffer.concat(chunks);
        res.send(body);
      });
    });
    r.write("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"username\"\r\n\r\nsys_mccre3\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"target_site\"\r\n\r\nGL_Mobility_Reports\r\n-----011000010111000001101001--");
    r.end();
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
