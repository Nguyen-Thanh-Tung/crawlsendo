var mongoose = require('mongoose');
var Shops = require('./Shops.js');
var Schema = mongoose.Schema;
//(thể loại, mô tả, giá, thương hiệu, hình ảnh)
var ProductSchema = new Schema(
    {
        productId: {
            type: Number,
            unique: true,
            dropDups: true
        },
        name: String,
        category: String,
        description: String,
        price: String,
        link: String,
        image: String,
        shopId: Number
    }
);

module.exports = mongoose.model('Product', ProductSchema);
