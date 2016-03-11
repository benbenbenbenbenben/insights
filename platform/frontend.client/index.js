'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var Hashids = require('hashids');
var hashids = new Hashids('sodium chloride');
var cookieParser = require('cookie-parser');
var http = require('https');

var port = 3000;

app.use(express.static(`${__dirname}/app`));
app.use(cookieParser());
app.use(cors());
console.log('Warning: Cross-Origin resource sharing is allowed for all domains.');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// TABLEAU JUNK

// TODO refactor as plugin
var hbPlugins = {
  tableau_qa_token: function(callback) {
    getTableauToken('tableau-qa.novartis.net', 3, callback);
  }
};
var getTableauToken = (domain, seconds, send) => {
  var milliseconds = (seconds * 1000);
  var _die = function() {
    die = 0;
    send({
      timeout: true
    });
  };
  var die = setTimeout(_die, milliseconds);

  var timeout = Date.now() + milliseconds;
  var _f = function() {
    var options = {
      "method": "POST",
      "hostname": domain,
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
        if (die == 0) {
          return;
        }
        clearTimeout(die);
        var body = Buffer.concat(chunks);
        if (body.length > 3) {
          lastTokenIssued = Date.now();
          lastTableauToken = body.toString();
        } else if (timeout > Date.now()) {
          return _f();
        }
        send({
          token: lastTableauToken,
          tokenAge: Date.now() - lastTokenIssued,
          tokenStale: body.length < 3
        });
      });
    });
    r.write("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"username\"\r\n\r\neunet\\sys_mccre3\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"target_site\"\r\n\r\nGL_Mobility_Reports\r\n-----011000010111000001101001--");
    r.end();
  };
  _f();
};


// TODO makes tableau self sign work
var lastTableauToken = '-1';
var lastTokenIssued = 0;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//

app.post('/signin', (req, res) => {
  res.cookie('mobility', hashids.encode(34, 21, 1289, 1417), { maxAge: 10 * 60 * 1000 });
  res.redirect('/');
});

app.get('/version', (req, res) => {
  res.send({
    iOS: {
      VersionNumber: '50.0.0.0',
      Text: 'Please update to version 50.0.0.0',
      Link_To_AppStore: 'https://appstorelink'
    },
    web: {
      VersionNumber: '1.0.0.0'
    }
  });
});

app.get('/tableau/:timeout?', (req, res) => { getTableauToken('tableau-qa.novartis.net', req.params.timeout || 3, (msg) => { res.send(msg); }); });

app.get('/gotableau/*', (req, res) => {
  var url = req.url.replace('/gotableau/', '');
  var domain = url.split('/')[0];
  var path = url.replace(domain, '');
  console.log({
    url, domain, path
  });
  getTableauToken(domain, req.params.timeout || 3, (msg) => {
    url = `https://${domain}/trusted/${msg.token}${path}`;
    console.log(url);
    res.redirect(url);
  });
});

app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
})
