"use strict"
var async = require('async');
// var Service = require('./service.js');
var Seneca = require('seneca');
var seneca = null;
var deepEqual = require('deep-equal');


// var lastService = null;
// var getService = renew => {
//   if (lastService == null || renew == true)
//     lastService = new Service({
//       server: 'localhost',
//       database: 'MobilityInsightsTest'
//     });
//   return lastService;
// };

exports.dataTests = {

  setUp: callback => {
    seneca = Seneca({timeout:10000});
    seneca.client({host:'localhost', port:10101});
    seneca.act({role:'data.test', cmd:'testmode'}, (error, response) => {
      seneca.act({role:'data.test', cmd:'purge'}, (error, response) => {
        callback();
      });
    });
  },

  tearDown: callback => {
    seneca.close();
    callback();
  },

  serviceIsOkay: test => {
    test.expect(3);
    seneca.act({role:'data', cmd:'ok'}, (error, response) => {
      test.ok(error == null);
      test.ok(response);
      test.ok(response.status = 'ok');
      test.done();
    });
  },

  serviceCanGetDashboards: test => {
    test.expect(2);
    seneca.act({role:'data', cmd:'getDashboard'}, (error, response) => {
      test.ok(error == null);
      test.ok(response);
      test.done();
    });
  },

  thereAreNoDashboards: test => {
    test.expect(2);
    seneca.act({role:'data', cmd:'getDashboard'}, (error, response) => {
      test.ok(error == null);
      test.ok(response.length == 0);
      test.done();
    });
  },

  aComplexDashboardCanBeCreated: test => {
    test.expect(8);
    var dashboard = {
      name: 'default',
      description: 'default dashboard',
      background: 'white',
      itemRenderTemplates: [
        { name: 'folder', source: '<div render-target></div>' },
        { name: 'alert', source: '<div>alert text</div>' }
      ],
      articles: [
        { name: 'test article 1', itemContent: 'test article 1' },
        { name: 'test article 2', itemContent: 'test article 2' },
        { name: 'test article 3', itemContent: 'test article 3',
          articles: [
            { name: 'test sub article 1', itemContent: 'test sub article 1' },
            { name: 'test sub article 2', itemContent: 'test sub article 2' }
          ]
        }
      ],
      permissions: {
        readers: {
          groups: [ { name: 'everyone' } ]
        }
      }
    };
    seneca.act({role:'data', cmd:'saveDashboard', dashboard:dashboard}, (error, response) => {
      test.ok(error == null);
      test.ok(response != null);
      test.ok(response._id);

      test.ok(dashboard.name == response.name);
      test.ok(dashboard.description == response.description);
      test.ok(dashboard.background == response.background);

      test.ok(dashboard.itemRenderTemplates.length == response.itemRenderTemplates.length);
      test.ok(dashboard.articles.length == response.articles.length);

      test.done();
    });
  },



}
