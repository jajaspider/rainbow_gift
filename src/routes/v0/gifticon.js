var express = require('express');

const gifticonManager = require('../../core/gifticonManager');

const gifticonRouter = express.Router();

function gifticonValidator(body) {
    let requireKeys = ['name', 'barcode', 'expire_date', 'store_name'];

    _.map(requireKeys, (requireKey) => {
        if (!_.keys(body).includes(requireKey)) {
            throw new Error(`${requireKey} is required`);
        }
    });
}

/* GET users listing. */
gifticonRouter.get('/', async function (req, res, next) {
    // console.dir(req.user);
    let gifticons = await gifticonManager.getGifticonList(req.user._id);
    return res.json({
        isSuccess: true,
        gifticons
    })

});

gifticonRouter.post('/', async function (req, res, next) {
    try {
        gifticonValidator(req.body);

        // console.dir(req.user);
        let gifticons = await gifticonManager.getGifticonList(req.user._id);
        return res.json({
            isSuccess: true,
            gifticons
        })
    } catch (e) {
        console.dir(e);
        return res.statusCode(500).json({
            isSuccess: false
        })
    }


});

module.exports = gifticonRouter;