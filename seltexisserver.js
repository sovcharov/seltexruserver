/*jslint nomen: true, node: true, unparam: true, white: true*/
(function () {
  "use strict";
  // var test = require('./test');
  // console.log(test);
  // return;

  var express = require('express'),
    // cookieParser = require('cookie-parser'),
    app = express(),
    mysql = require('mysql'),
    mysqlConnection = require(__dirname + '/../seltexisserverconfig/dbconnectmysqlnode.js'),
    // myFunctions = require('./myfunctions'),
    // getTimeString = myFunctions.getTimeString,
    // getDateString = myFunctions.getDateString,
    // https = require('https'),
    // fs = require('fs'),
    // privateKey,
    // certificate,
    // credentials,
    // httpsServer;
    http,
    httpServer;

  //UNCOMMENT FOR production
  //
  // privateKey = fs.readFileSync(__dirname + '/../ssl.key');
  // certificate = fs.readFileSync(__dirname + '/../ssl.crt');
  // credentials = {key: privateKey, cert: certificate};
  // httpsServer = https.createServer(credentials, app);
  // httpsServer.listen(5555, function () {
  // });

  //COMMENT FOR production
  //
  http = require('http');
  httpServer = http.createServer(app);
  httpServer.listen(5555, function () {
    console.log('start');
  });

  app.use('/assets', express.static(__dirname + '/public'));

  app.set('view engine', 'ejs');

  app.use(function (req, res, next) {
    var allowedOrigins = ['http://1.local', 'https://fvolchek.net', 'https://www.fvolchek.net', 'http://localhost:4200', 'http://seltex.ru', 'http://www.seltex.ru'],
    origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "DELETE, PUT");
    next();
  });

  app.get('/catalog/:partId', function (req, res) {

    var query = "SELECT * FROM inventory WHERE id = " + req.params.partId,
      connection = mysql.createConnection(mysqlConnection);

    connection.connect();

    connection.query(query, function (err, rows, fields) {
      console.log(rows[0]);
      res.render('index', {part: rows[0]});
    });

  });

}());
