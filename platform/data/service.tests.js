'use strict';
var async = require('async');
var Service = require('./service.js');
var seneca = require('seneca')({timeout:10000});

seneca.client({host:'localhost', port:10101});

var lastService = null;
var getService = renew => {
  if (lastService == null || renew == true)
    lastService = new Service({
      server: 'localhost',
      database: 'MobilityInsightsTest'
    });
  return lastService;
};

exports.dataTests = {

  setUp: callback => {
    callback();
  },

  tearDown: callback => {
    callback();
  },

  
}
