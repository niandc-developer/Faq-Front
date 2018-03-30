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
const analyticsApi = config.get('api.analyticsApi');
const apiKey = config.get('api.apiKey');

//// analytics(get)用関数
exports.getAnalytics = function(type, user, callback) {
    console.log('[INFO]call getAnalytics function');
    var baseUrl = analyticsApi + '?apikey=' + apiKey + '&user=' + user + '&type=' + type;
    var options = {
        url: baseUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        json: true,
        timeout: 180000 //milliseconds
    };
    request.get(options, function(err, response, body) {
        callback(err, response, body);
    });
};
