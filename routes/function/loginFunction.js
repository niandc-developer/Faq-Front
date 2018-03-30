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
const loginApi = config.get('api.loginApi');
const apiKey = config.get('api.apiKey');

//// admin api(POST)関数（msg={userid:<string>,:password<string>,group[]→[0]=user,[1]=maing,[2]=admin}
exports.postlogin = function(msg, user, callback) {
    console.log('[INFO]call postlogin function');
    msg['apikey'] = apiKey;
    msg['user'] = user;
    var options = {
        url: loginApi,
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

