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
        shop: {
            shopId: {
                type: Number
            },
            name: String,
            phone: String,
            email: String,
            location:
                {
                    longitude: String,
                    latitude: String
                },
            address: String
        }
    }
);

module.exports = mongoose.model('Product', ProductSchema);
