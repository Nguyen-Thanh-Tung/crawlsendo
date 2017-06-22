var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShopSchema = new Schema(
    {
        shopId: {
            type: Number,
            unique: true,
            dropDups: true
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
);

module.exports = mongoose.model('Shops', ShopSchema);