const Customer = require('../../models/customer.model');

exports.findById = async (id) => {
    try{
        const user = await Customer.findById(id, '-password');
        return user;
    }
    catch (err) {
        console.log(err.message);
    }
}


exports.update = async (id, payload) => {
    try {
        const  updatedCustomer = await Customer.findByIdAndUpdate(id, payload, {new: true}).select({ password: 0 });
        return updatedCustomer;
    } catch (err) {
        console.log(err.message)
        return null;
    }
}