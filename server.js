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
  emailAuth = require(__dirname + '/../serverconfig/nodeconfig.js').emailAuth,
  imagesDir = require(__dirname + '/../serverconfig/nodeconfig.js').imagesDir,
  getRidOfEmptyItems = require('./functions/myfunctions').getRidOfEmptyItems,
  createComplicatedQuery = require('./functions/myfunctions').createComplicatedQuery,
  checkIfCat = require('./functions/myfunctions').checkIfCat,
  http,
  httpServer,
  path = require('path'),
  fs = require('fs');


  http = require('http');
  httpServer = http.createServer(app);
  httpServer.listen(port);

  app.use('/assets', express.static(__dirname + '/public'));
  // app.use('/sis', express.static(__dirname + '/dist'));
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

    var query = "SELECT inventoryDescription.description as description, inventoryComments.comment as comment, inventoryManufacturers.fullName as manufacturerFullName, inventoryNumbers.number as number, p.ID as id, p.Price as price, p.stock as stock, p.ordered as ordered, p.link as link from inventoryNumbers, inventory as p, inventoryManufacturers, inventoryDescription, inventoryComments where inventoryManufacturers.id = inventoryNumbers.manufacturerId and inventoryNumbers.inventoryId = p.id and inventoryDescription.id = p.id and inventoryComments.id = p.id and p.Description not like N'яя%' and p.id = " + req.params.partId + " order by inventoryNumbers.main desc",
    connection = mysql.createConnection(mysqlConnection);

    connection.connect();

    connection.query(query, function (err, rows, fields) {
      var i = 0;
      for(i = 0; i < rows.length; i += 1) {
        if (i === 0) {
          rows[0].longDescription = rows[0].description + " " + rows[0].comment + " " + rows[0].manufacturerFullName + " " + rows[0].number;
          rows[0].allNumbers = [];
          rows[0].allNumbers[rows[0].allNumbers.length] = {number: rows[0].number, manufacturer: rows[0].manufacturerFullName};
        } else {
          rows[0].longDescription = rows[0].longDescription + " " + rows[i].number;
          rows[0].allNumbers[rows[0].allNumbers.length] = {number: rows[i].number, manufacturer: rows[i].manufacturerFullName};

        }
      }
      // console.log(imagesDir);
      res.render('part', {part: rows[0]});
    });

    connection.end();

  });

  app.get(['/catalog/:search','/catalog/'], function (req, res) {

    var query = '',
    connection = mysql.createConnection(mysqlConnection),
    search = '',
    items = [],
    currentId = 0,
    resultIndex = 0;

    //prepare sql query
    if (req.params.search) {
      search = req.params.search;
      search = search.split(' ');
      search = getRidOfEmptyItems(search);
      query = createComplicatedQuery(search);
    } else {
         query = 'SELECT p.ID as id, p.Description AS description, p.Price as price, p.Numbers AS numbers, p.stock as stock, p.ordered as ordered, p.link as link from inventory as p order by p.Description';
      // query = "SELECT inventoryDescription.description as description, p.id as id, inventoryComments.comment as comment, inventoryManufacturers.fullName as manufacturerFullName, inventoryNumbers.number as number, inventoryNumbers.main as main, p.Price as price, p.stock as stock, p.ordered as ordered, p.link as link from inventory as p, inventoryNumbers, inventoryManufacturers, inventoryDescription, inventoryComments where p.id = inventoryNumbers.inventoryId and p.id = inventoryDescription.id and p.id = inventoryComments.id and  inventoryManufacturers.id = inventoryNumbers.manufacturerId and p.Description not like N'яя%' order by p.description";
    }

    query = connection.query(query);

    query
    .on('result', function (row, index) {
      items[items.length] = row;
      // if(currentId !== row.id){
      //   currentId = row.id;
      //   resultIndex = items.length;
      //   items[resultIndex] = row;
      //   items[resultIndex].allNumbers = [];
      //   items[resultIndex].allNumbers[items[resultIndex].allNumbers.length] = row.number;
      // } else {
      //   if (row.main) {
      //     items[resultIndex].allNumbers.unshift(row.number);
      //     items[resultIndex].manufacturerFullName = row.manufacturerFullName;
      //   } else {
      //     items[resultIndex].allNumbers[items[resultIndex].allNumbers.length] = row.number;
      //   }
      // }

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
      auth: emailAuth
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

  app.get('/sis/*', function (req, res) {
    var sisPath = __dirname + staticSitePath + '/sis/index.html';
    // console.log(path);
    res.sendFile(path.join(sisPath));
  });

  app.get(/^\/(?!sis\/).*$/, function (req, res) {
    // app.get("/*", function (req, res) { //old get
    // console.log('inerror ');
    // res.sendFile(__dirname+'/dist/index.html');
    res.render('notfound', {description: 'Страницы не существует'});
  });

}());
