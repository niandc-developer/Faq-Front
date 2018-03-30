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
const request = require('request');
const config = require('config');

// 変数宣言
const faqApi = config.get('api.faqApi');
const feedApi = config.get('api.feedApi');
const apiKey = config.get('api.apiKey');

// 関数宣言
//// faq apiコール関数
exports.RequestPostApi = function(msg, user, callback) {
    console.log('[INFO]call faq Api');
    msg['apikey'] = apiKey;
    msg['user'] = user;
    var options = {
        url: faqApi,
        headers: {
            'Content-Type': 'application/json'
        },
        json: true,
        body: msg,
        timeout: 180000 //milliseconds
    };
    request.post(options, function(err, response, body) {
        callback(err, response, body);
    });
};

//// feedback apiコール関数
exports.PostFeedback = function(msg, user, callback) {
    console.log('[INFO]call feedback Api');
    msg['apikey'] = apiKey;
    msg['user'] = user;
    var options = {
        url: feedApi,
        headers: {
            'Content-Type': 'application/json'
        },
        json: true,
        body: msg,
        timeout: 180000 //milliseconds
    };
    request.post(options, function(err, response, body) {
        callback(err, response, body);
    });
};
