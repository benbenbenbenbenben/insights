/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  // Sets app default base URL
  app.baseUrl = '/';
  if (window.location.port === '') {  // if production
    // Uncomment app.baseURL below and
    // set app.baseURL to '/your-pathname/' if running from folder in production
    // app.baseUrl = '/polymer-starter-kit/';
  }

  // TOOD refactor load handlbars helpers
  Handlebars.compileAsync = function(tpl, callback) {
    // TODO
  };
  Handlebars.registerHelper('tableau_qa_token', function() {
    // TODO
    return '';
  });

  app.displayInstalledToast = function() {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
      Polymer.dom(document).querySelector('#caching-complete').show();
    }
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
    app.dashboardLocation = 'http://' + window.location.hostname + ':3001/api/v1/dashboard';
  });

  app.dashboardLocation = '';

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  window.addEventListener('paper-header-transform', function(e) {

  });

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    //app.$.headerPanelMain.scrollToTop(true);
  };

  app.closeDrawer = function() {
    //app.$.paperDrawerPanel.closeDrawer();
  };

  app.showtoast = function(text) {
    toast.text = text;
    toast.show();
  };

  app.pullup = function(event) {
    app.showtoast('pullup: ' + event.detail.delta.toString() + ' distance: ' + event.detail.distance);
  };

  app.pulldown = function(event) {
    app.showtoast('pulldown: ' + event.detail.delta.toString() + ' distance: ' + event.detail.distance);
  };

  app.gesture = function(event) {
    var steps = event.detail; // { rate, theta }
    var path = steps.nesw;
    app.showtoast(path.map(function(p){ return '{b:'+p.b+', r:'+p.r+'}'; }).join(','));
  };

  app.showurl = function(context) {
    console.log('show url');
  };

  app.iOSEventEnabled = false;
  app.__trackingIos = {
    start: 0,
    path: [],
    tracking: false,
    origin_x: 0,
    origin_y: 0
  };
  app.iOSEvent = function(data) {
    if (app.iOSEventEnabled == false)
      return;
    data.timestamp = data.timestamp * 1000;
    switch (data.type) {
      case 'pan-start':
        app.__trackingIos.start = data.timestamp;
        app.__trackingIos.tracking = true;
        app.__trackingIos.last = {
          w: data.width,
          h: data.height,
          cross: Math.sqrt(data.width * data.height),
          timestamp: app.__trackingIos.start,
          x: data.x * data.scale,
          y: data.y * data.scale,
          dx: 0,
          dy: 0,
          ddx: 0,
          ddy: 0,
        };
        app.__trackingIos.path = [app.__trackingIos.last];
        app.__trackingIos.origin_x = app.__trackingIos.last.x;
        app.__trackingIos.origin_y = app.__trackingIos.last.y;
        break;
      case 'pan':
        if (data.timestamp - app.__trackingIos.last.timestamp < 5)
          return;
        app.__trackingIos.last = {
          timestamp: data.timestamp,
          x: data.x * data.scale,
          y: data.y * data.scale,
          dx: (data.x * data.scale) - app.__trackingIos.origin_x,
          dy: (data.y * data.scale) - app.__trackingIos.origin_y,
          ddx: (data.x * data.scale) - app.__trackingIos.last.x,
          ddy: (data.y * data.scale) - app.__trackingIos.last.y,
        };
        app.__trackingIos.path.push(app.__trackingIos.last);
        break;
      case 'pan-end':
        app.__trackingIos.last = {
          timestamp: data.timestamp,
          x: data.x * data.scale,
          y: data.y * data.scale,
          dx: (data.x * data.scale) - app.__trackingIos.origin_x,
          dy: (data.y * data.scale) - app.__trackingIos.origin_y,
          ddx: (data.x * data.scale) - app.__trackingIos.last.x,
          ddy: (data.y * data.scale) - app.__trackingIos.last.y,
        };
        // TODO: there is no x or y here? i don't even know anymore
        //app.__trackingIos.path.push(app.__trackingIos.last);

        app.__trackingIos.tracking = false;

        // process path
        var tstart = app.__trackingIos.start;
        var track = app.__trackingIos.path.slice(1).map(function(t, i, a) {
          var time = t.timestamp - tstart;
          tstart = t.timestamp;
          var length = Math.sqrt(Math.pow(t.ddx, 2) + Math.pow(t.ddy, 2));
          var theta = Math.atan2(t.ddx, t.ddy) * (180 / Math.PI);
          theta = theta >= 0 ? theta : 360 + theta;
          var rate = length / time;
          return {
            rate, theta, time, length
          };
        });

        // gesturise path
        var averate = 0;
        var totlen = 0;
        var totlenf = 0;
        var nesw =  {
            track: track.map(function(t, i, c) {
              averate += (t.rate / c.length);
              totlen += t.length;
              var atheta = t.theta > 337.5 ? t.theta - 337.5 : t.theta + 22.5;
              var nesw = Math.floor(atheta / 45);
              return  { b: ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW'][nesw], r: t.rate.toFixed(3) };
            })
        };
        nesw.averate = averate;
        nesw.totlen = totlen;

        // north flick
        if (nesw.track.length > 0 && nesw.track.length == nesw.track.filter(function(p) { return p.b.indexOf('N') === 0; }).length)
        {
        }
        // south flick
        if (nesw.track.length > 0 && nesw.track.length == nesw.track.filter(function(p) { return p.b.indexOf('S') === 0; }).length)
        {
        }
        // west flick
        if (nesw.track.length > 0 && nesw.track.length == nesw.track.filter(function(p) { return p.b.indexOf('W') >= 0; }).length)
        {
          if (nesw.averate > 3) {
            TweenLite.fromTo(app.$.iframe0, 0.5, { x: 0 }, { x: - (app.$.iframe0.clientWidth), onComplete: function() {
              app.iOSEventEnabled = false;
              app.$.iframe0.style.visibility = 'hidden';
            } });
          }
        }
        // east flick
        if (nesw.track.length > 0 && nesw.track.length == nesw.track.filter(function(p) { return p.b.indexOf('E') >= 0; }).length)
        {
        }

        break;
      default:
        break;
    }
  };

  app.navigateStack = [];

  app.groupNavigate = function(path) {
    app.navigateStack.push({
      data: path,
      back: app.$.modal0dialog.close
    });
    var parts = path.split('/');
    var ref = app.$.data;
    while(parts.length > 0)
      ref = ref[parts.shift()];
    app.$.modal0dialog.querySelector('bb-masonry').data = ref;
    app.$.modal0dialog.open();
    app.$.modal0dialog.querySelector('bb-masonry')._windowResized();
  };

  app.navigateBack = function() {
    var pop = app.navigateStack.pop();
    if (pop)
      pop.back();
  };

  app.renderTemplates = [
    { name: 'group', source: '<div style="position: absolute; top: 1px; left: 1px; right: 1px; bottom:1px; overflow:hidden;">' +
                                  '<div><h2 style="margin:1px;" render-target></h2></div>' +
                                  '<bb-masonry style="width:100%; height:100%;" data-target no-tap="true"></bb-masonry>' +
                                  '' +
                                '</div>' }
  ];

  app.data = null;

  app.activeMenu = app.data;
  app.activeGroup = app.data;
  app.activeData = null;

  app.__tween= [];
  app.__vstate= 0;
  app.__vorigin= 0;
  app.__vtracking= false;
  app.__tpath= [];
  app.__tstart= 0;
  app.__vmouse= 0;

  app.dashboardLoaded = function(event, request) {
    app.data = request.response;
    app.activeMenu = app.data[0];
  }


  app.findAncestorWithAttribute = function(element, selector) {
    if (element == null || element == document)
      return null;
    if (element.hasAttribute(selector))
      return element;
    return app.findAncestorWithAttribute(element.parentNode, selector);
  };

  app.tap = function(event) {
    var element = app.findAncestorWithAttribute(event.target, 'tap-sender');
    if (element == null)
      return;
    app.activeData = element.data;
    if (app.activeData.content) {
      switch (app.activeData.content.type) {
        case 'link':
        case 'compute':
          var _f = function() {
            app.$.iframe0.style.visibility = 'visible';
            app.$.iframe0.onload = null;
            app.$.iframe0.loadtime = 0;
            clearInterval(app.$.iframe0.loadref);
            console.log(app.$.iframe0.loadref);
            TweenLite.fromTo(app.$.iframe0, 0.7, { x: 0, scale: 0.0 }, { scale: 1.0, onComplete: function() {
              app.iOSEventEnabled = true;
            } });
            TweenLite.to(app.$.modal0dialog, 0.7, { scale: 10.0, opacity: 0.0, onComplete: function(){
              app.$.modal0dialog.close();
            } });
            //app.$.modal0dialog.close();

          };

          app.$.masonry.querySelectorAll('[tap-sender]').forEach(
          	function(b) {
              if (b != element) {
            		setTimeout(function() {
            			TweenLite.to(b, 0.4, { ease: Power2.easeIn, scale: 0, opacity: 0, onComplete: function() {
            				setTimeout(function(){
            					TweenLite.set(b, { clearProps:'scale, opacity' });
                      app.$.iframe0.onload = _f;
                      app.$.iframe0.loadtime = Date.now();
                      app.$.iframe0.src = app.activeData.content.data;
                      app.$.iframe0.loadref = setInterval(function() {
                        app.showtoast('loading...' + (Math.random() * 100).toFixed('0'));
                      }, 500);
            				}, 1000);
            			}})
            		}, parseInt(Math.random() * 100));
              } else {
                setTimeout(function() {
                  TweenLite.to(b, 0.4, { ease: Power2.easeIn, scale: 100, backgroundColor: '#000000', onComplete: function() {

                  }});
                }, 200);
              }
          	}
          );

          break;
        default:
          break;
      }
    }
    else if (app.activeData.articles && app.activeData.articles.length) {
      app.activeGroup = app.activeData;

      //app.$.modal0dialog.querySelector('bb-masonry');
      app.navigateStack.push({
        data: null,
        back: app.$.modal0dialog.close.bind(app.$.modal0dialog)
      });
      app.$.modal0dialog.open();
      setTimeout(function() {
        app.$.modal0dialog.querySelector('bb-masonry')._windowResized();
      }, 10);
    }
  };

  app.track = function(event) {
    var element = app.findAncestorWithAttribute(event.target, 'track-scrollable');
    if (element == null)
      return;
    var parent = element.parentElement;
    var target = element;
    var currentTarget = element;

    switch(event.detail.state) {
          case 'start':
            this.__tstart = Date.now();
            this.__tpath = [];
            this.__vtracking = true;

            /* matrix(1, 0, 0, 1, 0, -2450) */
            this.__vorigin = parseFloat(getComputedStyle(currentTarget).transform.split(',')[5]) || 0;
            this.__vmouse = event.detail.y;

            this.__vstate = event.detail.dy;
            this.__tween.forEach(function(t) { t.kill(); });
            break;
          case 'track':
            event.detail.timeStamp = Date.now();
            this.__tpath.push(event.detail);
            var delta = this.__vorigin + (event.detail.dy - this.__vstate);
            var parenth = parent.clientHeight;
            var childh = currentTarget.clientHeight;

            var actual = delta;
            var bound = this.__vorigin == 0 || this.__vorigin == -(childh - parenth);
            // when delta at clipping points, show bounce
            if (-(delta) + parenth >= childh) {
              actual = -(childh - parenth);
              if (bound)
                this.fire('pullup', { distance: parenth - this.__vmouse, delta: -(delta) + parenth - childh });
            }
            if (delta > 0) {
              actual = 0;
              if (bound)
                this.fire('pulldown', { distance: this.__vmouse, delta: delta });
            }

            if (parenth > childh)
              break;
                                                /* matrix(1, 0, 0, 1, 0, -2450) */
            currentTarget.style.transform = 'matrix(1, 0, 0, 1, 0, ' + actual + ')';
            break;
          case 'end':
            this.__vtracking = false;
            var style = getComputedStyle(currentTarget);
            var currentX = parseFloat(style.transform.split(',')[4]) || 0;
            var currentY = parseFloat(style.transform.split(',')[5]) || 0;
            var minX = -(currentTarget.clientWidth - parent.clientWidth);
            var minY = -(currentTarget.clientHeight - parent.clientHeight);
            if (this.__tpath.length == 0)
              break;
            var tstart = this.__tstart;
            var track = this.__tpath.map(function(t, i, a){
              var time = t.timeStamp - tstart;
              tstart = t.timeStamp;
              var length = Math.sqrt(Math.pow(t.ddx, 2) + Math.pow(t.ddy, 2));
              var theta = Math.atan2(t.ddx, t.ddy) * (180 / Math.PI);
              theta = theta >= 0 ? theta : 360 + theta;
              var rate = length / time;
              return {
                rate, theta, time, length
              };
            });
            var nesw = track.map(function(t) {
              var atheta = t.theta > 337.5 ? t.theta - 337.5 : t.theta + 22.5;
              var nesw = Math.floor(atheta / 45);
              return  { b: ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW'][nesw], r: t.rate.toFixed(3) };
            });
            var element = currentTarget;

            // fire gesture
            this.fire('gesture', {
              track: track,
              element: element,
              nesw: nesw
            });
            // handle special gestures
            //if (element.hasAttribute('vertical'))
            // north flick
            if (nesw.length > 0 && nesw.length == nesw.filter(function(p) { return p.b.indexOf('N') === 0; }).length)
            {
              var change = (nesw[nesw.length - 1].r * 200);
              var actual = Math.max(currentY - change, minY);
              this.__tween = [TweenLite.fromTo(currentTarget, 0.4, { y: currentY }, { y: actual.toString() })];
            }
            // south flick
            if (nesw.length > 0 && nesw.length == nesw.filter(function(p) { return p.b.indexOf('S') === 0; }).length)
            {
              var change = (nesw[nesw.length - 1].r * 200);
              var actual = Math.min(currentY + change, 0);
              this.__tween = [TweenLite.fromTo(currentTarget, 0.4, { y: currentY }, { y: actual.toString() })];
            }
            // west flick
            if (nesw.length > 0 && nesw.length == nesw.filter(function(p) { return p.b.indexOf('W') >= 0; }).length)
            {
              var change = (nesw[nesw.length - 1].r * 200);
              // this.__tween = [TweenLite.fromTo(currentTarget, 0.4, { y: currentY }, { y: actual.toString() })];
              app.navigateBack();
            }
            // east flick
            if (nesw.length > 0 && nesw.length == nesw.filter(function(p) { return p.b.indexOf('E') >= 0; }).length)
            {
              var change = (nesw[nesw.length - 1].r * 200);
              // this.__tween = [TweenLite.fromTo(currentTarget, 0.4, { y: currentY }, { y: actual.toString() })];
              app.showtoast('east flick');
              app.$.modal1dialog.toggle();
            }

            break;
        }

  };


})(document);
