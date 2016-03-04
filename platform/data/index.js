var Service = require('./service.js');

var service = new Service({
  server: 'localhost',
  database: 'MobilityInsightsDev'
});

/*
var conn, mongoose;
var mongoose = require("mongoose");
var conn = mongoose.connect("mongodb://localhost/MobilityInsightsDev");

conn.connection.db.dropDatabase();
*/
