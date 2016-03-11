"use strict"
var async = require('async');
var seneca = require('seneca')().use('seneca-amqp-transport');

seneca.client({type:'amqp', pins:['data:*', 'data_test:*']});

async.series([
  done => {
    seneca.act(
      'data:configure',
      {
        config: {
          database: 'MobilityInsightsDev'
        }
      },
      function(error, response) {
        if (error)
          throw error;
        console.log('configure', response);
        done();
      }
    );
  },
  done => {
    seneca.act(
      'data_test:testmode',
      null,
      function(error, response) {
        if (error)
          throw error;
        console.log('testmode', response);
        done();
      }
    );
  },
  done => {
    seneca.act(
      'data_test:purge',
      null,
      function(error, response) {
        if (error)
          throw error;
        console.log('purge', response);
        done();
      }
    );
  },
  done => {
    seneca.act(
      'data:saveDashboard',
      {
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
              iconContent: '<p style="font-size: 40px; font-weight: bolder; color: white; opacity: 0.5; position: absolute; bottom: -30px; left: 10px;">Mobility Insights</p>',
              iconBackground: 'url(/images/Nvs_06730-s.jpg) no-repeat top left / cover',
              iconWidth: 8,
              iconHeight: 4
            },
            {
              name: 'metronic-7',
              content: {
                type: 'link',
                data: '/metronic/theme/templates/admin7_material_design/index.html'
              }
            },
            {
              name: 'Mobility Quarter Report - Q4 2015',
              iconBackground: 'orange',
              iconTemplate: 'group',
              iconSize: 4,
              articles: [
                {
                  name: 'Major accomplishments',
                  iconBackground: 'royalblue',
                  content: {
                    type: 'link',
                    data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/02.html'
                  }
                },
                {
                  name: 'Corporate devices overview',
                  iconBackground: 'firebrick',
                  content: {
                    type: 'link',
                    data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/03.html'
                  }
                },
                {
                  name: 'Distribution of corporate devices',
                  iconBackground: 'royalblue',
                  content: {
                    type: 'link',
                    data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/04.html'
                  }
                },
                {
                  name: 'BYOM',
                  iconBackground: 'firebrick',
                  content: {
                    type: 'link',
                    data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/05.html'
                  }
                },
                {
                  name: 'Mobile Apps Overview',
                  iconBackground: 'royalblue',
                  content: {
                    type: 'link',
                    data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/06.html'
                  }
                },
                {
                  name: 'Incident Management',
                  iconBackground: 'firebrick',
                  content: {
                    type: 'link',
                    data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/07.html'
                  }
                },
                {
                  name: 'Mobility Supporter Tool',
                  iconBackground: 'royalblue',
                  content: {
                    type: 'link',
                    data: 'http://192.37.61.19/_MobiReport_dashboard/Q42015/08.html'
                  }
                },
              ]
            },
            {
              name: 'P1 Report',
              iconBackground: 'teal',
              content: {
                type: 'link',
                data: 'http://glchbs-sp320071.eu.novartis.net:8823/'
              }
            },
            {
              name: 'Backup and Restore Report',
              iconBackground: 'yellowgreen',
              content: {
                type: 'link',
                data: 'http://glchbs-st320047.eu.novartis.net:8804/'
              }
            },
            {
              name: 'Ticket Devices Ratio',
              iconBackground: 'yellow',
              content: {
                type: 'link',
                data: 'https://tableau-dev.novartis.net/t/GL_Mobility_Reports/views/Ticket-devicesratio/INC_dashboards?:embed=y&:showShareOptions=true&:toolbar=no&:display_count=no'
              }
            },
            {
              name: 'MAS Operational KPI',
              iconBackground: 'skyblue',
              content: {
                type: 'link',
                data: 'https://tableau-dev.novartis.net/t/GL_Mobility_Reports/views/MAS_operational_KPI/KPIoverview?:embed=y&:showShareOptions=true&:display_count=no'
              }
            },
            {
              name: 'ROD Dashboard v2 (QA)',
              iconBackground: 'orange',
              content: {
                type: 'link',
                data: '/gotableau/tableau-qa.novartis.net/t/GL_Mobility_Reports/views/RODDashboards_v2/RoD_dashboard_iPhone?:embed=y&:showShareOptions=true&:display_count=no&:showVizHome=no#1'
              }
            },
          ],
          permissions: {
            readers: {
              groups: [ { name: 'everyone' } ]
            }
          }
        }
      },
      function(error, response) {
        if (error)
          throw error;
        console.log('save', response);
        done();
      }
    );
  }
], error => {
  if (error)
    throw error;
  try {
    seneca.close();
  } catch (ex) {
    ;
  }
});
