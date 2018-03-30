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
const f = require('./function/loginFunction.js');

//変数宣言
const useridRule = 'abcdefghijklnmopqrstuvwxyzABCDEFGHIJKLNMOPQRSTUVWXYZ0123456789@.-_';
const firstLoginUser = 'system-user';

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.faile >= 3) {
        console.log('[INFO]user login lock');
        res.render('lock', { csrfToken: req.csrfToken() });
    } else {
        res.render('login', { csrfToken: req.csrfToken() });
    }
});

router.post('/', function(req, res, next) {
    console.log('[INFO][/login/auth]call /login/auth');
    // ログインが3回以上失敗していたらロック
    if (req.session.faile >= 3) {
        console.log('[INFO]user login lock');
        res.render('lock');
    } else if (validator.isWhitelisted(req.body['userid'], useridRule) === true
        && validator.isLength(req.body['password'], { min: 8 }) === true) {

        var postData = {
            'id': req.body['userid'],
            'password': req.body['password']
        };

        f.postlogin(postData, firstLoginUser, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                var err = '入力が正しくありません。確認して再入力してください。';
                req.session.faile = req.session.faile + 1;
                console.error('[ERROR][/login]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][/login]api call result(body): ' + util.inspect(body));
                res.render('login', { result: err, csrfToken: req.csrfToken() });
            } else {
                req.session.user = postData['id'];
                req.session.group = body['message']['group'];
                console.log('[INFO][/login]login success');
                res.redirect('/');
            }
        });
    } else {
        var err = '入力が正しくありません。確認して再入力してください。';
        console.log('[INFO][/login]login error');
        res.render('login', { result: err, csrfToken: req.csrfToken() });
    }
});

module.exports = router;
