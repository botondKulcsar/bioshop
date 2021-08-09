const mongoose = require('mongoose');

const TokenSchema = mongoose.Schema({
    refreshToken: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Token', TokenSchema);