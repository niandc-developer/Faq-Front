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
const fbApi = config.get('api.fbApi');
const trainApi = config.get('api.trainApi');
const checkApi = config.get('api.checkApi');
const apiKey = config.get('api.apiKey');
const uploadPath = './tmp';

// function
//// check api(GET)関数(全ての処理の実行状況の確認が可能)
exports.checkProcessing = function(user, callback) {
    console.log('[INFO]exec checkProcessing function');
    var baseUrl = checkApi + '?apikey=' + apiKey + '&user=' + user;
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

//// faqdoc api(upload)関数
exports.uploadFaqDoc = function(file, user, callback) {
    console.log('[INFO]exec uploadFaqDoc function');
    var uploadUrl = faqdocApi + '/upload';

    // Shift_JISファイルがアップロードされた場合にutf-8へファイルを変換する
    var uploadFile = fs.readFileSync(file);
    var encType = encoding.detect(uploadFile);//文字コード取得
    // 文字コードチェック
    console.log('[INFO][uploadFaqDoc]check file encoding type');
    if(encType === 'SJIS'){
        console.log('[INFO][uploadFaqDoc]change file encoding type(sjis to utf8)');
        // utf-8へ強制変換
        var SJISBuffer = jconv.convert(uploadFile, 'Shift_JIS', 'UTF8' );
        var fileName = path.basename(file, path.extname(file));//ファイル名取得
        var utf8File = uploadPath+'/'+fileName+'2.csv';//変換用のファイルパス作成
        fs.writeFileSync(utf8File, SJISBuffer, 'utf-8');

        var formData = {
            'myFile': fs.createReadStream(utf8File),
            'apikey': apiKey,
            'user': user,
            'timeout': 180000 //milliseconds
        };
        request.post({ url: uploadUrl, formData: formData }, function(err, response, body) {
            callback(err, response, JSON.parse(body)); //ファイルPOSTの場合bodyがjson形式ではないためパースする
            fs.unlink(utf8File, function(err) {
                if (err) {
                    console.error('[INFO][uploadFaqDoc] delete file failed :' + err);
                } else {
                    console.log('[INFO][uploadFaqDoc] delete file Success');
                }
            });
        });
    }else{
        uploadFile='';
        var formData = {
            'myFile': fs.createReadStream(file),
            'apikey': apiKey,
            'user': user,
            'timeout': 180000 //milliseconds
        };
        request.post({ url: uploadUrl, formData: formData }, function(err, response, body) {
            callback(err, response, JSON.parse(body));
        });
    }
};

//// faqdoc api(dsc)関数
exports.postFaqdocDsc = function(user, callback) {
    console.log('[INFO]exec postFaqdocDsc function');
    var msg = {
        'apikey': apiKey,
        'user': user
    };
    var options = {
        url: faqdocApi + '/dsc',
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

//// train api(get)関数(Discoveryの登録・学習状況を確認)
exports.getTrain = function(user, callback) {
    console.log('[INFO]exec getTrain function');
    var baseUrl = trainApi + '?apikey=' + apiKey + '&user=' + user;
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

//// train api(POST)関数
exports.postTrain = function(user, callback) {
    console.log('[INFO]exec postFbdocDsc function');
    var msg = {
        'apikey': apiKey,
        'user': user
    };
    var options = {
        url: trainApi,
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