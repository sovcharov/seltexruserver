/*jslint nomen: true, node: true, unparam: true, white: true*/
(function () {
  "use strict";

  var express = require('express'),
  app = express(),
  mysql = require('mysql'),
  nodemailer = require('nodemailer'),
  mysqlConnection = require(__dirname + '/../serverconfig/dbconnectmysqlnode.js'),
  port = require(__dirname + '/../serverconfig/nodeconfig.js').serverPort,
  staticSitePath = require(__dirname + '/../serverconfig/nodeconfig.js').staticSitePath,
  getRidOfEmptyItems = require('./functions/myfunctions').getRidOfEmptyItems,
  createComplicatedQuery = require('./functions/myfunctions').createComplicatedQuery,
  checkIfCat = require('./functions/myfunctions').checkIfCat,
  http,
  httpServer;

  http = require('http');
  httpServer = http.createServer(app);
  httpServer.listen(port);

  app.use('/assets', express.static(__dirname + '/public'));
  app.use('/', express.static(__dirname + staticSitePath));
  app.use('/sis', express.static(__dirname + '../dist'));



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
      res.render('part', {part: rows[0]});
    });

    connection.end();

  });

  app.get(['/catalog/:search','/catalog/'], function (req, res) {

    var query = '',
    connection = mysql.createConnection(mysqlConnection),
    search = '',
    items = [];

    //prepare sql query
    if (req.params.search) {
      search = req.params.search;
      search = search.split(' ');
      search = getRidOfEmptyItems(search);
      query = createComplicatedQuery(search);
    } else {
      query = 'SELECT p.ID as id, p.Description AS description, p.Price as price, p.Numbers AS numbers, p.stock as stock, p.ordered as ordered, p.link as link from inventory as p order by p.Description';
    }

    query = connection.query(query);

    query
    .on('result', function (row, index) {
      items[items.length] = row;
    })
    .on('end', function () {
      res.render('search', {searchPhrase: req.params.search, items: items, length: items.length});
    });

    connection.end();

  });



  app.post('/api/sendmail/:phone', function (req, res) {
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 587,
      secure: false, // secure:true for port 465, secure:false for port 587,
      auth: {
        user: 'sales2@seltex.ru',
        pass: '1qwerty12345'
      }
    }),

    // setup email data with unicode symbols
    mailOptions = {
      from: '"SELTEX.RU" <sales2@seltex.ru>', // sender address
      to: 'sales@seltex.com', // list of receivers
      subject: 'Заказ звонка с сайта', // Subject line
      text: 'Перезвонить на номер: ' + req.params.phone, // plain text body
      html: '<h3>Перезвонить на номер: ' + req.params.phone + '</h3>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // return console.log(error);
        res.send(false);
      }
      res.send('OK');
      // console.log('Message %s sent: %s', info.messageId, info.response);
    });
  });

  app.get('/sis/*', (req, res) => {
    console.log('insis '+__dirname);
    // res.sendFile(path.join(__dirname, 'dist/index.html'));
  });

  app.get('/*', function (req, res) {

    res.render('notfound', {description: 'Страницы не существует'});

  });

}());
