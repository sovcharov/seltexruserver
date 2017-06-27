/*jslint nomen: true, node: true, unparam: true, white: true*/
(function () {
  "use strict";

  var express = require('express'),
    app = express(),
    mysql = require('mysql'),
    mysqlConnection = require(__dirname + '/../serverconfig/dbconnectmysqlnode.js'),
    port = require(__dirname + '/../serverconfig/nodeconfig.js').serverPort,
    staticSitePath = require(__dirname + '/../serverconfig/nodeconfig.js').staticSitePath,
    http,
    httpServer;

  http = require('http');
  httpServer = http.createServer(app);
  httpServer.listen(port);

  app.use('/assets', express.static(__dirname + '/public'));
  app.use('/', express.static(__dirname + staticSitePath));


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

  app.get('/catalog/part/:partId', function (req, res) {

    var query = "SELECT * FROM inventory WHERE id = " + req.params.partId,
      connection = mysql.createConnection(mysqlConnection);

    connection.connect();

    connection.query(query, function (err, rows, fields) {
      // console.log(rows[0]);
      res.render('part', {part: rows[0]});
    });

    connection.end();

  });

  app.get(['/catalog/:search','/catalog/'], function (req, response) {

    var query = '',
      connection = mysql.createConnection(mysqlConnection),
      search = '',
      i,
      items = [];

    //prepare sql query
    if (req.params.search) {
      search = req.params.search;
      search = search.split(' ');
      for (i = 0; i < search.length; i += 1) {
        if (!search[i]) {
          search.splice(i,1);
          i -= 1;
        }
      }
      console.log(search);
    } else {
      query = 'SELECT p.ID as ProductID, p.Description AS ProductName, p.Price as ListPrice, p.Numbers AS CategoryName, p.stock as qty, p.ordered as qtyOrdered, p.link as link from inventory as p order by p.Description limit 10';
    }

    query = connection.query(query);

    query
      .on('result', function (row, index) {
          items[items.length] = row;
      })
      .on('end', function () {
        response.render('search', {searchPhrase: search, items: items, length: items.length});

      });

    // response.render('search', {searchPhrase: 'asdf', items : []});

    connection.end();


  });


  app.get('/*', function (req, res) {

    res.render('notfound', {part: {description: 'Страницы не существует', stock: 0, ordered: 0}});

  });

}());
