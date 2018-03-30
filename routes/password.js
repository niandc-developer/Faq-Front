/**
 * Copyright 2018 Nippon Information and Communication. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const express = require('express');
const router = express.Router();
const util = require('util');
const validator = require('validator');
const f = require('./function/adminFunction.js');

// 変数宣言

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('[INFO]call /password');
    if (req.session.user) {
        res.render('password', { userid: req.session.user, csrfToken: req.csrfToken() });
    } else {
        res.redirect('login');
    }
});

router.post('/', function(req, res, next) {
    console.log('[INFO][/password/change]call /password/change');
    // data check
    console.log('[INFO][/password/change]check validate data');
    if (validator.isEmpty(req.body['newPassword2']) === true) {
        next(new Error('[ERROR][admin/update]validate failed:newPassword2 is empty'));

    } else if (validator.isLength(req.body['newPassword2'], { min: 8 }) === false) {
        next(new Error('[ERROR][admin/update]validate failed:newPassword2'));

    } else if (validator.isEmpty(req.body['newPassword3']) === true) {
        next(new Error('[ERROR][admin/update]validate failed:newPassword3 is empty'));

    } else if (validator.isLength(req.body['newPassword3'], { min: 8 }) === false) {
        next(new Error('[ERROR][admin/update]validate failed:newPassword3'));

    } else if (validator.isEmpty(req.body['oldPassword']) === true) {
        next(new Error('[ERROR][admin/update]validate failed:oldPassword is empty'));

    } else if (validator.isLength(req.body['oldPassword'], { min: 8 }) === false) {
        next(new Error('[ERROR][admin/update]validate failed:oldPassword'));

    } else if (req.body['newPassword2'] !== req.body['newPassword3']) {
        next(new Error('[ERROR][admin/update]validate failed:newPassword2 is not equal newPassword3'));

    } else if (req.body['oldPassword'] === req.body['newPassword2']) {
        next(new Error('[ERROR][admin/update]validate failed:oldPassword is equal newPassword2'));
    } else {
        var postData = {
            'id': req.session.user,
            'old_password': req.body['oldPassword'],
            'new_password': req.body['newPassword3']
        };

        f.putAdminUserPassword(postData, req.session.user, function(err, response, body) {
            if (body['result'] === 'failure' && body['message'] === 'invalid userid or password.') {
                console.log('[INFO][admin/regist]' + body['message']);
                res.render('password', { userid: req.session.user, result: 'invalidpassword',
                    group: req.session.group, csrfToken: req.csrfToken() });

            } else if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][password/change]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][password/change]api call result(body): ' + util.inspect(body));
                next(new Error('[ERROR][admin/regist]api call failed'));
            } else {
                console.log('[INFO][password/change]return /password page');
                res.render('password', { userid: req.session.user, result: 'success', csrfToken: req.csrfToken() });
            }
        });
    }
});

module.exports = router;
