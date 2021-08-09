const mongoose = require('mongoose');

const CustomerSchema = mongoose.Schema({
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
    email: {
        type: String,
        validate: {
            validator: function(v) {
                return /.+\@.+\..+/.test(v)
            },
            message: props => `${props.value} is not a valid email`
        },
        required: [true, 'email required']
        
    },
    password: {
        type: String,
        minLength:4,
        required: [true, 'password required']
    },
    address: {
        type: Object,
        required: true,
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
        city: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[\w\s\(\)-\.]{1,25}$/.test(v)
                },
                message: props => `${props.value} is not a valid city`
            },
            required: [true, 'city required']
        },
        state: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[A-Za-z\s-]{2,15}$/.test(v)
                },
                message: props => `${props.value} is not a valid state`
            },
            required: [true, 'state required']
        }
        ,
        ZIP: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[\w\s\(\)-\.]{2,10}$/.test(v)
                },
                message: props => `${props.value} is not a valid ZIP code`
            },
            required: [true, 'ZIP code required']
        }
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Customer', CustomerSchema);