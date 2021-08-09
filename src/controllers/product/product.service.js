const Product = require('../../models/product.model');

exports.findAll = async (filter = {}) => {
    try {
        const products = await Product.find(filter);
        return products;
    } catch (err) {
        console.log(err.message);
    }
};

exports.findOne = async (id) => {
    try {
        const selectedProduct = await Product.findById(id);
        return selectedProduct;
    } catch (err) {
        console.log(err.message);
    }
};