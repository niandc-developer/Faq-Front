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
const adminApi = config.get('api.adminApi');
const apiKey = config.get('api.apiKey');

//// admin api(GET)コール関数(all=<1>or<0>,id=<string>or<0>)
exports.getAdminUser = function(all, id, userid, limit, skip, user, callback) {
    console.log('[INFO]call getAdminUser function');
    var baseUrl = adminApi + '?apikey=' + apiKey + '&user=' + user;
    if (id !== 0) {//完全一致(レスポンスデータとして1ユーザのみ返却)
        baseUrl = baseUrl + '&id=' + encodeURIComponent(id);
    }
    if (userid !== 0) {//部分一致で検索可能(キーワード検索で利用)
        baseUrl = baseUrl + '&userid=' + encodeURIComponent(userid) +'*';
    }
    if (limit !== 0) {
        baseUrl = baseUrl + '&limit=' + limit;
    }
    if (skip !== 0) {
        baseUrl = baseUrl + '&skip=' + skip;
    }
    if (all !== 0) {
        baseUrl = adminApi + '?apikey=' + apiKey + '&user=' + user;
    }
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

//// admin api(POST)関数（msg={userid:<string>,:password<string>,group[]→[0]=user,[1]=maing,[2]=admin}
exports.postAdminUser = function(msg, user, callback) {
    console.log('[INFO]call postAdminUser function');
    msg['apikey'] = apiKey;
    msg['user'] = user;
    var options = {
        url: adminApi,
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

//// admin(password change) api(POST)関数（msg={userid:<string>,:password<string>,group[]→[0]=user,[1]=maing,[2]=admin}
exports.putAdminUserPassword = function(msg, user, callback) {
    console.log('[INFO]call putAdminUserPassword function');
    msg['apikey'] = apiKey;
    msg['user'] = user;
    var options = {
        url: adminApi + '/password',
        headers: {
            'Content-Type': 'application/json'
        },
        json: true,
        body: msg,
        timeout: 180000 //milliseconds
    };
    request.put(options, function(err, response, body) {
        callback(err, response, body);
    });
};

//// admin api(PUT)関数（msg={userid:<string>,:password<string>,group[]→[0]=user,[1]=maing,[2]=admin}
exports.putAdminUser = function(msg, user, callback) {
    console.log('[INFO]call putAdminUser function');
    msg['apikey'] = apiKey;
    msg['user'] = user;
    var options = {
        url: adminApi,
        headers: {
            'Content-Type': 'application/json'
        },
        json: true,
        body: msg,
        timeout: 180000 //milliseconds
    };
    request.put(options, function(err, response, body) {
        callback(err, response, body);
    });
};

//// admin api(DELETE)関数
exports.deleteAdminUser = function(msg, user, callback) {
    console.log('[INFO]call deleteSolrDoc function');
    msg['apikey'] = apiKey;
    msg['user'] = user;
    var options = {
        url: adminApi,
        headers: {
            'Content-Type': 'application/json'
        },
        json: true,
        body: msg,
        timeout: 180000 //milliseconds
    };
    request.delete(options, function(err, response, body) {
        callback(err, response, body);
    });
};