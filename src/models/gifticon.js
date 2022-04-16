const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const STATUS = ["active", "expired", "used"]

// Define Schemes
const gifticonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    expire_date: {
        type: String,
        required: true
    },
    store_name: {
        type: String,
        required: true
    },
    barcode: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        required: true,
        default: "active"
    },
    isDelete: {
        type: Schema.Types.Boolean,
        default: false
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true
    }


}, {
    timestamps: true
});

// Create Model & Export
module.exports = mongoose.model('Gifticon', gifticonSchema);