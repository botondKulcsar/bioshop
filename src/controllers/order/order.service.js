const Order = require('../../models/order.model');

exports.create = async (newOrder) => {
    try {
        const orderToSave = new Order(newOrder);
        const savedOrder = await orderToSave.save();
        return savedOrder;
    } catch (err) {
        console.log(err.message);
        return false;
    }    
}

// get list of orders of a specific customer and sort it descending
exports.get = async ({ customerId, sortCriterium }) => {
    try {
        const orderList = await Order.find({ customerId }).sort(sortCriterium);
        return orderList;
    } catch (err) {
        console.log(err.message);
    }
}