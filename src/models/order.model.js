const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');

const OrderSchema = mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    deliveryAddress: {
        type: Object,
        required: true,
        firstName: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[A-Za-z\s-]{2,15}$/.test(v)
                },
                message: props => `${props.value} is not a valid first name`
            },
            required: [true, 'first name required']
        },
        lastName: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[A-Za-z\s-]{2,15}$/.test(v)
                },
                message: props => `${props.value} is not a valid last name`
            },
            required: [true, 'last name required']
        },
        phone: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[\d\-\.\(\)]{8,14}$/.test(v)
                },
                message: props => `${props.value} is not a valid phone number`
            },
            required: [true, 'phone number required']
        },
        street: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[\w\-\s]{2,55}$/.test(v)
                },
                message: props => `${props.value} is not a valid street`
            },
            required: [true, 'street required']
        },
        number: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[\d\-\.\(\)]{1,6}$/.test(v)
                },
                message: props => `${props.value} is not a valid house number`
            },
            required: [true, 'house number required']
        },
        ZIP: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[\w\s\(\)-\.]{2,10}$/.test(v)
                },
                message: props => `${props.value} is not a valid ZIP code`
            },
            required: [true, 'ZIP code required']
        },
        city: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[\w\s\(\)-\.]{1,25}$/.test(v)
                },
                message: props => `${props.value} is not a valid city`
            },
            required: [true, 'city required']
        }
    },
    products: [ 
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true,
                min: 1
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                max: 20
            }
        }
     ],
    total: {
        type: Number,
        required: true,
        min: 1
    },
    shipping: {
        type: Number,
        required: true,
        min: 10
    }
}, {
    timestamps: true
});

OrderSchema.plugin(idValidator);

module.exports = mongoose.model('Order', OrderSchema);