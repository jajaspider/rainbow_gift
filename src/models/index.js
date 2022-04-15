const mongoose = require('mongoose');

// const roomSchema = require('./room');
const userSchema = require('./user');
// const permissionSchema = require('./permission');
// const manageSchema = require('./manage');
// const maplestorySchema = require('./maplestory');
// const lostarkSchema = require('./lostark');

// const Selection = mongoose.model('Selection', selectionSchema);

module.exports = {
    // Room: roomSchema,
    User: userSchema,
    // Permission: permissionSchema,
    // Manage: manageSchema,
    // Maplestory: maplestorySchema,
    // Lostark: lostarkSchema,
}