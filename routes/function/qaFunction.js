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
const fs = require('fs');
const jconv = require('jconv');
const path = require('path');
const encoding = require('encoding-japanese');

// 変数宣言
const faqdocApi = config.get('api.faqdocApi');
const apiKey = config.get('api.apiKey');
const uploadPath = './tmp';

// function
//// faqdoc api(import)関数
exports.importFqaDoc = function(file, user, callback) {
    console.log('[INFO]exec importFqaDoc function');
    var importUrl = faqdocApi + '/import';
    // Shift_JISファイルがアップロードされた場合にutf-8へファイルを変換する
    var importFile = fs.readFileSync(file);
    var encType = encoding.detect(importFile);//文字コード取得
    // 文字コードチェック
    console.log('[INFO][importFqaDoc]check file encoding type');
    if(encType === 'SJIS'){
        console.log('[INFO][importFqaDoc]change file encoding type(sjis to utf8)');
        // utf-8へ強制変換
        var SJISBuffer = jconv.convert(importFile, 'Shift_JIS', 'UTF8' );
        var fileName = path.basename(file, path.extname(file));//ファイル名取得
        var utf8File = uploadPath+'/'+fileName+'2.csv';//変換用のファイルパス作成
        fs.writeFileSync(utf8File, SJISBuffer, 'utf-8');

        var formData = {
            'myFile': fs.createReadStream(utf8File),
            'apikey': apiKey,
            'user': user,
            'timeout': 180000 //milliseconds
        };
        request.post({ url: importUrl, formData: formData }, function(err, response, body) {
            callback(err, response, JSON.parse(body)); //ファイルPOSTの場合bodyがjson形式ではないためパースする
        });
    }else{
        var formData = {
            'myFile': fs.createReadStream(file),
            'apikey': apiKey,
            'user': user,
            'timeout': 180000 //milliseconds
        };
        request.post({ url: importUrl, formData: formData }, function(err, response, body) {
            callback(err, response, JSON.parse(body)); //ファイルPOSTの場合bodyがjson形式ではないためパースする
        });
    }
};

//// faqdoc api(drop)関数 全消し
exports.dropFaqDoc = function(user, callback) {
    console.log('[INFO]exec dropFaqDoc function');
    var msg = {
        'apikey': apiKey,
        'user': user
    };
    var options = {
        url: faqdocApi + '/drop',
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

//// faqdoc api(GET)コール関数(all=<1>or<0>,id,title,body=<string>or<0>)
exports.getFaqDoc = function(all, id, question, answer, limit, skip, user, callback) {
    console.log('[INFO]exec getFaqDoc function');
    var baseUrl = faqdocApi + '?apikey=' + apiKey + '&user=' + user;
    if (id !== 0) {
        baseUrl = baseUrl + '&id=' + id;
    }
    if (question !== 0) {
        baseUrl = baseUrl + '&question=' + encodeURIComponent(question);
    }
    if (answer !== 0) {
        baseUrl = baseUrl + '&answer=' + encodeURIComponent(answer);
    }
    if (limit !== 0) {
        baseUrl = baseUrl + '&limit=' + limit;
    }
    if (skip !== 0) {
        baseUrl = baseUrl + '&skip=' + skip;
    }
    if (all !== 0) {
        baseUrl = faqdocApi + '?apikey=' + apiKey + '&user=' + user;
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

//// faqdoc api(PUT)関数（msg={id:<string>,title:<string>,body:<string>,flag:<string>}
exports.putFaqDoc = function(msg, user, callback) {
    console.log('[INFO]exec putFaqDoc function');
    msg['apikey'] = apiKey;
    msg['user'] = user;
    var options = {
        url: faqdocApi,
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

//// faqdoc api(POST)関数（msg={id:<string>,title:<string>,body:<string>,flag:<string>}
exports.postFaqDoc = function(msg, user, callback) {
    console.log('[INFO]exec postFaqDoc function');
    msg['apikey'] = apiKey;
    msg['user'] = user;
    var options = {
        url: faqdocApi,
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


//// faqdoc api(DELETE)関数
exports.deleteFaqDoc = function(msg, user, callback) {
    console.log('[INFO]exec deleteFaqDoc function');
    msg['apikey'] = apiKey;
    msg['user'] = user;
    var options = {
        url: faqdocApi,
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
