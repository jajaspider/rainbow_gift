var express = require('express');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const KakaoStrategy = require('passport-kakao').Strategy;

const authRouter = express.Router();
let configPath = path.join(process.cwd(), 'config', 'develop.yaml');
let config = yaml.load(fs.readFileSync(configPath));
const kakaoConfig = _.get(config, 'kakao');
const DB = require('../models');
const User = DB['User'];

passport.use('kakao', new KakaoStrategy({
    clientID: kakaoConfig['key'],
    callbackURL: '/auth/kakao/callback', // 위에서 설정한 Redirect URI
}, async (accessToken, refreshToken, profile, done) => {
    //console.log(profile);
    // console.dir({
    //     accessToken,
    //     refreshToken,
    //     profile,
    //     done
    // }, {
    //     depth: null
    // });
    let userId = _.get(profile, 'id');
    let existUser = await User.findOne({
        user_id: userId
    }).lean();

    if (existUser) {
        // 이미 존재하니 return
        done(null, existUser._id);
        return;
    }
    try {
        let result = await User.create({
            user_id: userId,
            user_name: _.get(profile, 'username'),
            user_accessToken: accessToken,
            user_refreshToken: refreshToken
        });
        done(null, result._id);
    } catch (e) {
        console.dir(e);
        done(e);
    }

}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

authRouter.get('/login', passport.authenticate('kakao'));
authRouter.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
    session: true
}),

    (req, res) => {
        console.dir(req);
        return res.redirect('/');
    },
);

module.exports = authRouter;