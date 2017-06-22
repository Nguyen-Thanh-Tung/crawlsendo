module.exports = function(app){
    var productController = require('../controller/ProductController.js');
    app.route('/add-product')
        .get(productController.addProduct);
};