const mongoose = require('mongoose');

// Define Schemes
const manageSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    user_name: {
        type: String
    },
    user_accessToken: {
        type: String,
        required: true
    },
    user_refreshToken: {
        type: String,
        required: true
    }


}, {
    timestamps: true
});

// Create Model & Export
module.exports = mongoose.model('User', manageSchema);