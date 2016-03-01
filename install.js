"use strict"
var async = require('async');
var Seneca = require('seneca');

var seneca = Seneca({timeout:10000});
seneca.client({host:'localhost', port:10101});

async.series([
  done => {
    seneca.act({
      role: 'data',
      cmd: 'configure',
      config: {
        database: 'MobilityInsightsDev'
      }
    }, function(error, response) {
      if (error)
        throw error;
      done();
    });
  },
  done => {
    seneca.act({
      role: 'data',
      cmd: 'saveDashboard',
      dashboard: {
        name: 'default',
        description: 'Default Dashboard',
        background: 'white',
        itemRenderTemplates: [
          { name: 'notice', source: '<div><div render-target></div></div>' }
        ],
        articles: [
          {
            name: 'Welcome',
            iconContent: 'Welcome to Mobility Insights',
            iconWidth: 8,
            iconHeight: 4
          },
          {
            name: 'Mobility Quarter Report - Q4 2015',
            iconBackground: 'orange',
            iconTemplate: 'group',
            iconSize: 8,
            articles: [
              {
                name: 'Major accomplishments',
                content: {
                  type: 'link',
                  data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/02.html'
                }
              },
              {
                name: 'Corporate devices overview',
                content: {
                  type: 'link',
                  data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/03.html'
                }
              },
              {
                name: 'Distribution of corporate devices',
                content: {
                  type: 'link',
                  data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/04.html'
                }
              },
              {
                name: 'BYOM',
                content: {
                  type: 'link',
                  data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/05.html'
                }
              },
              {
                name: 'Mobile Apps Overview',
                content: {
                  type: 'link',
                  data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/06.html'
                }
              },
              {
                name: 'Incident Management',
                content: {
                  type: 'link',
                  data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/07.html'
                }
              },
              {
                name: 'Mobility Supporter Tool',
                content: {
                  type: 'link',
                  data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/08.html'
                }
              },

            ]
          },
        ],
        permissions: {
          readers: {
            groups: [ { name: 'everyone' } ]
          }
        }
      }
    }, function(error, response) {
      if (error)
        throw error;
      done();
    });
  }
], error => {
  if (error)
    throw error;
  seneca.close();
});
