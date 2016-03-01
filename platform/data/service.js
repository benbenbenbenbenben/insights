'use strict';
var S = require('string');
var _ = require('underscore');
var mongoose = require('mongoose');
var seneca = require('seneca')({timeout:10000});
var async = require('async');
var extend = require('extend');

seneca.listen({host:'localhost', port:10101});

var lastModPlugin = function(schema, options) {
  schema.add({LastModified:Number});
  schema.pre('save', function(next){
    this.LastModified = new Date().getTime();
    next();
  });
  if (options && options.index)
    schema.path('LastModified').index(options.index);
};

var userSchema = new mongoose.Schema({
  name: String,
  user521: String,
  devices: [{ id: String }]
});

var userGroupSchema = new mongoose.Schema({
  name: String,
  users: [{ user521: String }]
});

var dashboardSchema = new mongoose.Schema({
  name: String,
  description: String,
  background: String,
  itemRenderTemplates: [{
    name: String,
    source: String
  }],
  articles: [{
    articleId: String
  }],
  permissions: {
    readers: {
      users: [{ user521: String }],
      groups: [{ name: String}]
    },
    writers: {
      users: [{ user521: String }],
      groups: [{ name: String}]
    }
  }
});

var articleSchema = new mongoose.Schema({
  name: String,
  iconBackground: String,
  iconContent: String,
  iconTemplate: String,
  permissions: {
    readers: {
      users: [{ user521: String }],
      groups: [{ name: String}]
    },
    writers: {
      users: [{ user521: String }],
      groups: [{ name: String}]
    }
  },
  articles: [{
    articleId: String
  }]
});

userSchema.plugin(lastModPlugin);
userGroupSchema.plugin(lastModPlugin);
dashboardSchema.plugin(lastModPlugin);
articleSchema.plugin(lastModPlugin);

var connection_string_template = 'mongodb://{{server}}/{{database}}';
var default_config = {
  server: 'localhost',
  database: 'mobilityInsights',
  test: false
}

class Service {
  constructor(config) {
    var self = this;
    var started = Date.now();
    self.config = config || {};
    for (var key in default_config) self.config[key] = self.config[key] || default_config[key];
    self.config.connect_string = S(connection_string_template).template(self.config).s;

    self.db = mongoose.createConnection(self.config.connect_string);
    self.db.on('error', console.error.bind(console, 'connection error: '));
    self.db.once('open', callback => { /* TODO preload stuff */ });

    // test endpoints
    seneca.add({role:'data.test', cmd:'testmode'}, (message, respond) => {
      self.config.test = true;
      respond(null, {ok:true});
    });
    seneca.add({role:'data.test', cmd:'purge'}, (message, respond) => {
      if (self.config.test) {
        async.series([
          done => self.user.remove({}, done),
          done => self.userGroup.remove({}, done),
          done => self.article.remove({}, done),
          done => self.dashboard.remove({}, done),
        ], error => {
          if (error)
            return respond(error);
          respond(null, {ok:true});
        });
      } else {
        respond(null, {ok:false});
      }
    });
    //

    // seneca shortcut
    var add = (cmd, callback) => seneca.add({role:'data', cmd:cmd}, callback);

    add('ok', (message, respond) => {
      respond(null, { started: started, status: 'ok' });
    });

    add('saveDashboard', (message, respond) => {
      debugger;
      var isNew = true;
      var newdash = message.dashboard;
      var newarticles = message.dashboard.articles;
      delete newdash.articles;
      var dashboard = null;
      async.series([
        done => {
          if (newdash._id) {
            isNew = false;
            self.dashboard.findOne({_id:newdash._id}, (error, result) => {
              if (error)
                throw error;
              if (result) {
                dashboard = result;
                // TODO: list articles
                extend(dashboard, newdash);
                //dashboard.save(done);
                async.series([
                  callback => dashboard.save(callback),
                  callback => self.articleSaver(dashboard, newarticles, callback)
                ], done);
              } else {
                throw 'could not find dashboard';
              }
            });
          } else {
            // TODO: lift articles
            dashboard = new self.dashboard(newdash);
            async.series([
              callback => dashboard.save(callback),
              callback => self.articleSaver(dashboard, newarticles, callback)
            ], done);
          }
        }
      ], error => {
        if (error)
          return respond(error);
        var result = {};
        extend(result, dashboard);
        return respond(null, result);
      });
    });

    add('getDashboard', (message, respond) => {
      console.log('getDashboard', message);
      var query = {};
      if (message && message.query)
        query = message.query;
      var output = [];
      self.dashboard.find(query, (error, result) => {
        if (error) return respond(error);
        if (result.length == 0) return respond(null, []);
        // TODO check permissions
        async.parallel(result.map(dash => {
          return (done) => {
            // load articles
            // dash has articles[{articleId:String}]
            output.push(dash);
            async.parallel(dash.articles.map(article => {
              return (subtaskDone) => { self.articleLoader(dash, article, subtaskDone); }
            }), done);
          };
        }), error => {
          if (error)
            return respond(error);
          return respond(null, output);
        });
      });
    });
  }

  articleLoader(parent, article, callback) {
    var self = this;
    self.article.findOne({ _id:article._id }, (error, result) => {
      if (error)
        throw error;
      if (result == null)
        return callback(null, null);
      // fill article
      extend(article, result);
      if (result.articles) {
        async.parallel(result.articles.map(subArticle => {
          return (subtaskDone) => { self.articleLoader(article, subArticle, subtaskDone) };
        }), error => {
          if (error)
            throw error;
          return callback(null);
        });
      }
    });
  }

  articleSaver(parent, articles, callback) {
    if (articles == null) {
      return callback();
    }
    var self = this;
    // parent has articles: [{articleId:String}]
    // 1. delete articles from parent if articles not "null"
    var deleteFirst = false;
    var subArticles = [];
    if (articles) {
      var knownIds = articles
                        .filter(article => article._id != null)
                        .map(article => article._id);
      var missingIds = parent.articles
                        .filter(article => knownIds.indexOf(article._id) < 0)
                        .map(article => article._id);
      parent.articles = parent.articles
                        .filter(article => missingIds.indexOf(article._id) < 0);
      deleteFirst = missingIds.length > 0;
    }
    // 2. add/update
    async.series([
      done => {
        if (deleteFirst) {
          parent.save(done);
        } else {
          done();
        }
      },
      done => async.parallel(articles.map(article => {
        return done => {
          if (article._id) {
            self.article.findOne({_id:article._id}, (error, result) => {
              if (error)
                throw error;
              var temp = parent.articles;
              delete parent.articles;
              extend(result, article);
              parent.articles = temp;
              result.save(done);
            });
          } else {
            var toSave = new self.article(article);
            var temp = parent.articles;
            delete parent.articles;
            extend(toSave, article);
            parent.articles = temp;
            toSave.save(done);
            subArticles.push(toSave._id);
          }
        }
      }), done),
      done => async.parallel(articles.map(article => {
        return subDone => self.articleSaver(article, article.articles, subDone);
      }), done),
      done => {
        console.log('######### SAVING PARENT.ARTICLES');
        console.log(subArticles, parent.articles);
        subArticles.forEach(sub => parent.articles.push({
          articleId: sub
        }));
        console.log(subArticles, parent.articles);
        parent.save(done);
      }
    ], callback);
  }

  get user() { return this.db.model('user', userSchema); }
  get userGroup() { return this.db.model('userGroup', userGroupSchema); }
  get article() { return this.db.model('article', articleSchema); }
  get dashboard() { return this.db.model('dashboard', dashboardSchema); }
}

module.exports = Service;
