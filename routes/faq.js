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
const f = require('./function/faqFunction.js');

// 変数宣言

// main
/* GET faq page*/
router.get('/', function(req, res, next) {
    console.log('[INFO]render /faq page');
    res.render('faq', {group: req.session.group, csrfToken: req.csrfToken()});
});

/*POST sendボタンが押下されReuestWatson.js(javascript)から呼び出された際の処理 */
router.post('/ask', function(req, res, next) {
    console.log('[INFO]call faq page');
    f.RequestPostApi(req.body, req.session.user, function(err, response, body) {
        if (err || body['result'] === 'failure' || response.statusCode !== 200) {
            console.error('[ERROR][/ask]api call result(error):'+util.inspect(err));
            console.error('[ERROR][/ask]api call result(body):'+util.inspect(body));
            res.status(response.statusCode).send('Internal Server Error');
        } else {
            var logData = {
                'question': req.body['talk'],
                'resMessage': body['message']['resMessage'],
                'answer': body['message']['body']['docs']
            };
            console.log('[INFO][/ask]'+util.inspect(logData));
            res.status(200).send(body['message']);
        }
    });
});

/*POST いいねボタンもしくは回答なしボタンが押下された際の処理*/
router.post('/feedback', function(req, res, next) {
    f.PostFeedback(req.body, req.session.user, function(err, response, body) {
        if (err || response.statusCode !== 200) {
            console.error('[ERROR][/feedback]api call result(error):'+util.inspect(err));
            console.error('[ERROR][/feedback]api call result(body):'+util.inspect(body));
            res.status(response.statusCode).send('Internal Server Error');
        } else {
            var logData = {
                'emotion': req.body['emotion'],
                'answer': req.body['docid']
            };
            console.log('[INFO][/feedback]'+util.inspect(logData));
            res.status(200).send(body);
        }
    });
});

module.exports = router;
