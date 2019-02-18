//gfserveur.js
var http = require("http");
var fs = require('fs');
var express = require('express');
var app = express();
var controleur = require("./gfcontroleur");
var laconfig = require("./config.js");


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", null);
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});
app.get('/', (req, res) => {
  var result = controleur.Controller.Files();
  res.json(result);
});
app.listen(5000, function () {
  console.log('Example app listening on port 5000')
})
http.createServer(function(request, response) {
  response.end('ok');
}).listen(8000);

