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
const path = require('path');
const fs = require('fs');
const f = require('./function/trainFunction.js');

// 変数宣言
const uploadPath = './tmp';

// main
//// /train  : page 表示
router.get('/', function(req, res, next) {
    console.log('[INFO]call /train');
    console.log('[INFO][/train]call checkProcessing');
    f.checkProcessing(req.session.user, function(err, response, body) { //学習orインポート処理等が行われていないかチェック
        if (err || body['result'] === 'failure' || response.statusCode >= 203) {
            console.error('[ERROR][/train]api call result(error): ' + util.inspect(err));
            console.error('[ERROR][/train]api call result(body): ' + util.inspect(body));
            next(new Error('[ERROR][/train]api call failed'));
        } else {
            console.log('[INFO][/train]call getTrain');
            f.getTrain(req.session.user, function(err2, response2, body2) { //トレーニング状況のチェック
                if (err2 || body2['result'] === 'failure' || response2.statusCode >= 203) {
                    console.error('[ERROR][/train]api call result(error): ' + util.inspect(err2));
                    console.error('[ERROR][/train]api call result(body): ' + util.inspect(body2));
                    next(new Error('[ERROR][/train]api call failed'));
                } else {
                    console.log('[INFO][/train]render /train page');
                    res.render('train', { faqStatus: body['message'], trainStatus: body2['message']['training_status'],
                        docCounts: body2['message']['document_counts'], group: req.session.group,
                        csrfToken: req.csrfToken() });
                }
            });
        }
    });
});

//// /train/upload : 初期学習データアップロードボタンが押下された際の処理
router.post('/upload', function(req, res, next) {
    console.log('[INFO]call /train/upload');
    console.log('[INFO][/train/upload]check validate upload file');
    if (!req.files) {
        console.error('[ERROR][/train/upload]There is no file');
        next(new Error('[ERROR][train/upload]validate failed:there is no file'));
    } else if (path.extname(req.files.uploadFile.name) !== '.csv') {
        console.error('[ERROR][/train/upload]Invalid file extension');
        next(new Error('[ERROR][train/upload]validate failed:Invalid file extension'));
    } else {
        // upload ファイルの保存処理
        var uploadFile = uploadPath+'/'+req.files.uploadFile.name;
        req.files.uploadFile.mv(uploadFile, function(err) {
            if (err) {
                console.error('[ERROR][/train/upload]file save failed: ' + err);
                next(new Error('[ERROR][train/upload]file save failed:'));
            } else {
                f.uploadFaqDoc(uploadFile, req.session.user, function(err, response, body) {
                    // f.uploadFaqDoc関数内で実行しているリクエスト方法では自動でレスポンスデータをjsonパースしないため、明示的にパース処理を付与
                    if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                        console.error('[ERROR][train/upload]api call result(error): ' + util.inspect(err));
                        console.error('[ERROR][train/upload]api call result(body): ' + util.inspect(body));
                        console.error('[ERROR][train/upload]render /trainProcess page');
                        res.render('trainProcess', { result: 'failure', group: req.session.group, body: body });
                        fs.unlink(uploadFile, function(err) {
                            if (err) {
                                console.error('[ERROR][train/upload] delete file failed :' + err);
                            } else {
                                console.log('[INFO][train/upload] delete file Success');
                            }
                        });
                    } else {
                        console.log('[INFO][train/upload]render /trainProcess page');
                        res.render('trainProcess', { result: 'success', group: req.session.group });
                        fs.unlink(uploadFile, function(err) {
                            if (err) {
                                console.error('[ERROR][train/upload] delete file failed :' + err);
                            } else {
                                console.log('[INFO][train/upload] delete file Success');
                            }
                        });
                    }
                });
            }
        });
    }
});

//// /trainでFAQ登録ボタンが押下されたときの処理(FAQ＝solr文章のためURIはsolr)
router.post('/faqdoc', function(req, res, next) {
    console.log('[INFO]call /train/faqdoc');
    f.postFaqdocDsc(req.session.user, function(err, response, body) {
        if (err || body['result'] === 'failure' || response.statusCode >= 203) {
            console.error('[ERROR][/train/faqdoc]api call result(error): ' + util.inspect(err));
            next(new Error('[ERROR][/train/faqdoc]api call failed'));
        } else {
            console.log('[INFO][train/faqdoc]call checkProcessing');
            f.checkProcessing(req.session.user, function(err, response, body) { //学習orインポート処理等が行われていないかチェック
                if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                    console.error('[ERROR][/train/faqdoc]api call result(error): ' + util.inspect(err));
                    console.error('[ERROR][/train/faqdoc]api call result(body): ' + util.inspect(body));
                    next(new Error('[ERROR][/train/faqdoc]api call failed'));
                } else {
                    console.log('[INFO]render /train page');
                    res.render('trainProcess', { result: 'success', group: req.session.group });
                }
            });
        }
    });
});

//// /train で学習開始ボタンが押下されたときの処理
router.post('/fbdoc', function(req, res, next) {
    console.log('[INFO]call /train/fbdoc');
    f.postTrain(req.session.user, function(err, response, body) {
        if (err || body['result'] === 'failure' || response.statusCode >= 203) {
            console.error('[ERROR][/train/fbdoc]api call result(error): ' + util.inspect(err));
            console.error('[ERROR][/train/fbdoc]api call result(body): ' + util.inspect(body));
            next(new Error('[ERROR][/train/fbdoc]api call failed'));
        } else {
            console.log('[INFO][/train/fbdoc]call postTrain');
            f.checkProcessing(req.session.user, function(err, response, body) { //学習orインポート処理等が行われていないかチェック
                if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                    console.error('[ERROR][/train/fbdoc]api call result(error): ' + util.inspect(err));
                    console.error('[ERROR][/train/fbdoc]api call result(body): ' + util.inspect(body));
                    next(new Error('[ERROR][/train/fbdoc]api call failed'));
                } else {
                    console.log('[INFO]render /train page');
                    res.render('trainProcess', { result: 'success', group: req.session.group });
                }
            });
        }
    });
});

// /train/status : ReuestStatusTrain.js(javascript)から呼び出された際の処理
router.get('/status', function(req, res, next) {
    console.log('[INFO]call /train/status');
    f.getTrain(req.session.user, function(err, response, body) { //学習orインポート処理等が行われていないかチェック
        if (err || body['result'] === 'failure' || response.statusCode >= 203) {
            console.error('[ERROR][/train/status]api call result(error): ' + util.inspect(err));
            console.error('[ERROR][/train/status]api call result(body): ' + util.inspect(body));
            if(response.statusCode){
                res.status(response.statusCode).send('Internal Server Error')
            }else{
                res.status(500).send('Internal Server Error')
            }
        } else {
            console.log('[INFO][/train/status]render /train page(render train status table)');
            res.status(200).send(body['message']);
        }
    });
});

module.exports = router;