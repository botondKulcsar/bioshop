const Customer = require('../../models/customer.model');
const Token = require('../../models/token.model');

exports.findToken = (refreshToken) => Token.findOne({ refreshToken });

exports.saveToken = (refreshToken) => Token.create({ refreshToken });

exports.deleteToken = (refreshToken) => Token.deleteOne({ refreshToken });

exports.create = async (customerData) => {
    try {
        const newUser = new Customer(customerData);
        const savedCustomer = await newUser.save();
        return savedCustomer;
    } catch (err) {
        console.log(err.message);
    }
}

exports.emailIsUnique =  async (email) => {
    const emailList = await Customer.find({email}, 'email');
    return emailList.length === 0;
}

exports.login = async (email) => {
    try {
        const user = await Customer.findOne({ email });
        return user;
        }
    catch (err) {
        console.log(err.message);
        return err;
    }
}