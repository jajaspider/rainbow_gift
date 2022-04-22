const DB = require('../models');
const User = DB['User'];
const Gifticon = DB['Gifticon'];
const _ = require('lodash');

async function getGifticonList(userId) {
    try {
        let result = await User.findById(userId).lean();
        if (_.isEmpty(result)) {
            return [];
        }

        let gifticons = await Gifticon.find({
            user: result._id,
            isDelete: false
        });

        let gifticonResult = [];

        for (let gifticon of gifticons) {
            gifticonResult.push({
                name: gifticon.name,
                discription: gifticon.description,
                barcode: gifticon.barcode,
                expire_date: gifticon.expire_date,
                status: gifticon.status,
                store_name: gifticon.store_name
            })
        }

        return gifticonResult;
    } catch (e) {
        console.dir(e);
        return [];
    }
}

module.exports = {
    getGifticonList
};