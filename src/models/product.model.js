const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    longDescription: {
        type: String
    },
    imageUrl: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);