'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

var port = 3000;

app.use(express.static(`${__dirname}/app`));
app.use(cors());
console.log('Warning: Cross-Origin resource sharing is allowed for all domains.');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

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

app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
})
