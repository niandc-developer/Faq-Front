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
const f = require('./function/analyticsFunction.js');

// 変数宣言
var dt = new Date();

// main
//// /analytics : トップページ表示
router.get('/', function(req, res, next) {
    console.log('[INFO]render /analytics page');
    f.getAnalytics('monthly', req.session.user, function(err, response, body) {
        if (err || body['result'] === 'failure' || response.statusCode >= 203) {
            console.error('[ERROR][/status]api call result(error):'+util.inspect(err));
            console.error('[ERROR][/status]api call result(body):'+util.inspect(body));
            next(new Error('[ERROR][/status]api call failed'));
        } else {
            console.log('[INFO]render /analytics page');
            console.log(body['message']);
            res.render('analytics', {group: req.session.group, body: body['message']});
        }
    });
});

module.exports = router;
