var express = require('express');
var app = express();
app.listen(3000, function(){
    console.log('Connected');
});

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/CrawlSendo");
// var productController = require('./api/controller/ProductController.js');
// productController.addProduct();
// var route = require('./api/routes/CrawlRoute.js');
// route(app);