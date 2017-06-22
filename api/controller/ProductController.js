var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var Shop = require('../model/Shops.js');
var Product = require('../model/Products.js');
var apis = require('../model/Api.js');
var fs = require('fs');
exports.addProduct = function () {
    var urlBaseProduct = 'https://www.sendo.vn/san-pham/';
    m = 0;
    t = 0;
    // for(var m = 0; m<1; m++) {
    var category = apis[m].type;
    // for(let t = 0; t<20; t++){
    // console.log(apis[m].url);
    request({
        method: 'GET',
        uri: apis[m].url[0] + '?p=' + t
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            try {
                var data = JSON.parse(body).data;
                'use strict';
                for (let i = 0; i < data.length; i++) {
                    console.log(pathFromName(data[i].shop_name));


                    var count = 0; //Debug

                    // Get information of shop
                    request('https://www.sendo.vn/shop/' + pathFromName(data[i].shop_name) + '/thong-tin-shop', function (err, resp, bodyp) {
                        if (!err && resp.statusCode === 200) {
                            var shopId = parseInt(data[i].shop_id);
                            var shopName = data[i].shop_name;
                            // console.log(shopName);
                            var productId = parseInt(data[i].product_id);
                            var name = data[i].name;
                            // console.log(name);
                            var description = data[i].name;
                            var price = data[i].price;
                            var link = urlBaseProduct + pathFromName(name) + '-' + productId;
                            var image = data[i].img_url;

                            var $ = cheerio.load(bodyp);
                            var addressShop = $('.cont-shop-inf .address-shop-rw');
                            if (addressShop.length > 0) {
                                var addressFull = addressShop.get(0).children[3].children[0].data.trim();
                                var address = cutAddress(addressFull);
                                var phoneShop = '';
                                var email = '';
                                if (addressShop.length > 1) {
                                    phoneShop = addressShop.get(1).children[3].children[0].data.trim();
                                }
                                if (addressShop.length > 2) {
                                    email = addressShop.get(2).children[3].children[0].data.trim();
                                }

                                var apiMap = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(address) + '&key=AIzaSyAtRL6EJxOZUaHNUWw8k6gxHEfwN5JX5lc';

                                request(apiMap, function (err, rest, bodyt) {

                                    if (!err && rest.statusCode === 200) {
                                        var temp = JSON.parse(bodyt);
                                        if (temp.results.length > 0) {
                                            var data1 = JSON.parse(bodyt).results[0].geometry.location;
                                            var longitude = data1.lng;
                                            var latitude = data1.lat;

                                            //Save shop
                                            var shop = getShop(shopId, shopName, phoneShop, email, longitude, latitude, addressFull);
                                            saveShop(shop);

                                            //Save product
                                            var product = getProduct(productId, name, category, description, price, link, image, shopId);
                                            saveProduct(product);

                                            count++;
                                            console.log(count);
                                        }
                                    } else {
                                        console.log('Error when get location shop');
                                    }
                                });
                            }
                        } else {
                            console.log('Error when get information shop');
                        }
                    });
                }
            } catch (e) {
                console.log('error pare');
            }
        }
    });
    // }

    // }
};

//Get shop object
function getShop(shopId, name, phone, email, longitude, latitude, address) {
    return {
        shopId: shopId,
        name: name,
        phone: phone,
        email: email,
        location: {
            longitude: longitude,
            latitude: latitude
        },
        address: address
    };
}

//Get product object
function getProduct(productId, name, category, description, price, link, image, shopId) {
    return {
        productId: productId,
        name: name,
        category: category,
        description: description,
        price: price,
        link: link,
        image: image,
        // imageFile: {
        //     data: dataImage,
        //     contentType: contentTypeImage
        // },
        shopId: shopId
    }
}

//Format name (shop, product)
function pathFromName(str) {
    var lower = str.toLowerCase();
    var removeVN = removeVietnamese(lower);
    var abc = removeVN.split(' ');
    var result = [];
    for (var i = 0; i < abc.length; i++) {
        if (abc[i] !== '') {
            result.push(abc[i]);
        }
    }
    return result.join('-');
}

//encode uri for api search google map
function encodeURI(str) {
    return encodeURIComponent(str).replace(/'/g, "%27").replace(/"/g, "%22");
}

//cut address
function cutAddress(str) {
    var start = str.indexOf("phường(xã)");
    return str.substr(start);
}

//format vietnamese
function removeVietnamese(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
}

//save shop to database
function saveShop(shop) {
    var new_shop = new Shop(shop);
    new_shop.save(function (err, shop) {
        if (err) {
            console.log('Loi luu shop');
        }
    });
}

//save product to database
function saveProduct(product) {
    var locationStore = './storage/images/products/';
    var new_product = new Product(product);
    var pathFile = locationStore + pathFromName(new_product.name + ' ' + new_product.productId) + '.jpg';
    downloadImage(new_product.image, pathFile, function () {
        new_product.save(function (err, product) {
            if (err) {
                console.log('Loi luu product');
                fs.unlink(pathFile, function () {
                    console.log('Da xoa file');
                });
            }
        });
    });

}

//download image of product
function downloadImage(uri, pathFile, callback) {

    request.head(uri, function (err, res, body) {
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(pathFile)).on('close', callback);
    });
}

//get data binary of image
function getDataImage(link) {
    request({
        url: 'http://www.cedynamix.fr/wp-content/uploads/Tux/Tux-G2.png',
        encoding: 'binary'
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            return new Buffer(body, 'binary');
        } else {
            console.log('Loi luu anh');
        }
    });
}
