'use strict';
var seneca = require('seneca').use('seneca-amqp-transport');
var apn = require('apn');

var apnService = apn.connection({
  production: true,
  passphrase: 'Novartis1',
  pfx: 'APNS_SSL_MobilityReport.p12'
});

apnService.on('connected', () => {
  console.log('APNS connected');
});

apnService.on("transmitted", (notification, device) => {
  console.log("APNS notification transmitted to:" + device.token.toString("hex"));
});

apnService.on("transmissionError", (errCode, notification, device) => {
  console.error("APNS notification caused error: " + errCode + " for device ", device, notification);
  if (errCode === 8) {
    console.error("APNS a error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
  }
});

apnService.on("timeout", () => {
  console.log("APNS connection timeout");
});

apnService.on("disconnected", () => {
  console.log("APNS disconnected");
});

apnService.on("socketError", console.error);

seneca.add('push:apns', (message, done) => {
  var data = message.body.data;
  var alert = message.body.alert;
  var devices = message.body.devices;

  var note = new apn.notification();
  note.badge = 1;
  note.contentAvailable = true;
  note.payload = data;
  note.setAlertText(alert);
  apnService.pushNotification(note, devices);

  done(null, {ok:true});
});

seneca.listen({type:'amqp', pin:'push:*'});
