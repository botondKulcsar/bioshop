const mongoose = require('mongoose');

exports.isValidObjectId = (id) =>  mongoose.Types.ObjectId.isValid(id)