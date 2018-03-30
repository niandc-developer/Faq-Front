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
const config = require('config');
const path = require('path');
const fs = require('fs');
const tf = require('./function/trainFunction.js');
const ff = require('./function/fbFunction.js');
const qf = require('./function/qaFunction.js');

// 変数宣言
const fbApi = config.get('api.fbApi');
const apiKey = config.get('api.apiKey');
const uploaPath = './tmp';
const urlRule = '(^http:\/\/)|(^https:\/\/)|(^Notes:\/\/)';
var ansArr = [];
var noansArr = [];

// main
//// /fb  : トップページ表示
router.get('/', function(req, res, next) {
    console.log('[INFO]call fb page');
    console.log('[INFO][/fb]call checkProcessing');
    tf.checkProcessing(req.session.user, function(err, response, body1) { //学習orインポート処理等が行われていないかチェック
        if (err || body1['result'] === 'failure' || response.statusCode >= 203) {
            console.error('[ERROR][/fb]api call result(error): ' + util.inspect(err));
            console.error('[ERROR][/fb]api call result(body): ' + util.inspect(body1));
            next(new Error('[ERROR][/fb]api call failed'));
        } else {
            res.render('fb', {faqStatus: body1['message'], group: req.session.group, csrfToken: req.csrfToken()});
        }
    });
});

//// トップページのフィードバックデータ表示用URI(publiec/javascripts/TableSettins.jsよりCall(jqueryプログインDataTablesの仕様に沿って実行))
router.post('/list(/ans)?(/noans)?',function(req, res, next) {
    console.log('[INFO]call '+req.originalUrl);
    if(req.originalUrl === "/fb/list/ans"){
        if(validator.isEmpty(req.body["search"]["value"]) === true){ //検索窓にキーワードが入力されていない場合
            ff.getFbDoc(0, 'answer', 0, 0, 0, 0, req.body["length"], req.body["start"], req.session.user,
                function(err, response, body1) {
                    if (err || body1['result'] === 'failure' || response.statusCode >= 203) {
                        console.error('[ERROR][/fb/list/ans]api call result(error): ' + util.inspect(err));
                        console.error('[ERROR][/fb/list/ans]api call result(body1): ' + util.inspect(body1));
                        next(new Error('[ERROR][/fb/list/ans]api call failed'));
                    } else {
                        var json = {
                            'draw': req.body["draw"],
                            'recordsTotal': body1["total_rows"],
                            'recordsFiltered': body1["total_rows"],
                            'data': body1['message']
                        };
                        console.log('[INFO]render /fb page(render feedback(good) data table)');
                        res.status(200).send(json);
                    }
            });
        } else { //検索窓にキーワードが入力された場合
            ff.getFbDoc(0, 0, 0, req.body["search"]["value"], 'answer', 0, 0, 0, req.session.user,
                function(err, response, body1) {
                    if (err || body1['result'] === 'failure' || response.statusCode >= 203) {
                        console.error('[ERROR][/fb/list/ans]api call result(error): ' + util.inspect(err));
                        console.error('[ERROR][/fb/list/ans]api call result(body1): ' + util.inspect(body1));
                        next(new Error('[ERROR][/fb/list/good]api call failed'));
                    } else {
                        var json = {
                            'draw': req.body["draw"],
                            'recordsTotal': body1["total_rows"],
                            'recordsFiltered': body1["total_rows"],
                            'data': body1['message']
                        };
                        console.log('[INFO]render /fb page(render feedback(good and search keyword) data table)');
                        res.status(200).send(json);
                    }
            });
        }
    }else if(req.originalUrl === "/fb/list/noans"){//fb/list/noansにアクセスが有った際の処理
        if(validator.isEmpty(req.body["search"]["value"]) === true){ //検索窓にキーワードが入力されていない場合
            ff.getFbDoc(0, 'noanswer', 0, 0, 0, 0, req.body["length"], req.body["start"], req.session.user,
                function(err, response, body2) {
                    if (err || body2['result'] === 'failure' || response.statusCode >= 203) {
                        console.error('[ERROR][/fb/list/noans]api call result(error): ' + util.inspect(err));
                        console.error('[ERROR][/fb/list/noans]api call result(body2): ' + util.inspect(body2));
                        next(new Error('[ERROR][/fb/list/good]api call failed'));
                    } else {
                        var json = {
                            'draw': req.body["draw"],
                            'recordsTotal': body2["total_rows"],
                            'recordsFiltered': body2["total_rows"],
                            'data': body2['message']
                        };
                        console.log('[INFO]render /fb page(render feedback(noans) data table)');
                        res.status(200).send(json);
                    }
            });
        } else { //検索窓にキーワードが入力された場合
            ff.getFbDoc(0, 0, 0, req.body["search"]["value"], 'noanswer', 0, 0, 0, req.session.user,
                function(err, response, body2) {
                    if (err || body2['result'] === 'failure' || response.statusCode >= 203) {
                        console.error('[ERROR][/fb/list/noans]api call result(error): ' + util.inspect(err));
                        console.error('[ERROR][/fb/list/noans]api call result(body2): ' + util.inspect(body2));
                        next(new Error('[ERROR][/fb/list/good]api call failed'));
                    } else {
                        var json = {
                            'draw': req.body["draw"],
                            'recordsTotal': body2["total_rows"],
                            'recordsFiltered': body2["total_rows"],
                            'data': body2['message']
                        };
                        console.log('[INFO]render /fb page(render feedback(noans) data table)');
                        res.status(200).send(json);
                    }
            });
        }
    }
});

//// /fb/import : インポートボタンが押下された際の処理
router.post('/import', function(req, res, next) {
    console.log('[INFO]call /fb/import');
    console.log('[INFO][/fb/import]check validate upload file');
    if (!req.files) {
        console.error('[ERROR][/fb/import]There is no file');
        next(new Error('[ERROR][/fb/import]validate failed:there is no file'));
    } else if (path.extname(req.files.importFile.name) !== '.csv') {
        console.error('[ERROR][/fb/import]Invalid file extension');
        next(new Error('[ERROR][/fb/import]validate failed:Invalid file extension'));
    } else {
        // upload ファイルの保存処理
        var uploadFile = uploaPath+'/'+req.files.importFile.name;
        req.files.importFile.mv(uploadFile, function(err) {
            if (err) {
                console.error('[ERROR][/fb/import]file save failed: ' + err);
                next(new Error('[ERROR][/fb/import]file save failed'));
            } else {
                ff.importFbDoc(uploadFile, req.session.user, function(err, response, body) {
                    if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                        console.error('[ERROR][/fb/import]api call result(error): ' + util.inspect(err));
                        console.error('[ERROR][/fb/import]api call result(body): ' + util.inspect(body));
                        res.render('fbImport', { resultImport: 'failure', group: req.session.group, body: body });
                        //ファイル削除
                        fs.unlink(uploadFile, function(err) {
                            if (err) {
                                console.error('[ERROR][/fb/import] delete file failed :' + err);
                            } else {
                                console.log('[INFO][/fb/import]delete file Success: '+uploadFile);
                            }
                        });
                    } else {
                        console.log('[INFO][/fb/import]render /fbImport page');
                        res.render('fbImport', { resultImport: 'success', group: req.session.group,
                            body: 'success' });
                        //ファイル削除
                        fs.unlink(uploadFile, function(err) {
                            if (err) {
                                console.error('[ERROR][/fb/import] delete file failed :' + err);
                            } else {
                                console.log('[INFO][/fb/import]delete file Success: '+uploadFile);
                            }
                        });
                    }
                });
            }
        });
    }
});

//// /fb/export : エクスポートボタンが押下された際の処理
router.get('/export', function(req, res, next) {
    console.log('[INFO]call /fb/export');
    var exportUrl = fbApi + '/export?apikey=' + apiKey + '&user=' + req.session.user;
    res.redirect(exportUrl);
});

//// /fb/new : page 表示
router.get('/new', function(req, res, next) {
    console.log('[INFO]call /fb/new');
    res.render('fbNew', { group: req.session.group, csrfToken: req.csrfToken() });
});

//// /fb/new で新規登録ボタンが押下されたときの処理
router.post('/regist', function(req, res, next) {
    console.log('[INFO]call /fb/regist');
    // empty check
    console.log('[INFO][/fb/regist]check validate data');
    if (validator.isEmpty(req.body['question']) === true) {
        next(new Error('[ERROR][/fb/regist]validate failed:question is empty'));

    } else if (validator.isLength(req.body['question'], { min: 4, max: 200 }) === false) {
        next(new Error('[ERROR][/fb/regist]validate failed:question is max 200 characters'));

    } else if (validator.isEmpty(req.body['answerId']) === true) {
        next(new Error('[ERROR][/fb/regist]validate failed:answerId is empty'));

    } else if (validator.isInt(req.body['answerId']) === false) {
        next(new Error('[ERROR][/fb/regist]validate failed:answerId is not integer'));

    } else if (validator.isEmpty(req.body['relevanceId']) === true) {
        next(new Error('[ERROR][/fb/regist]validate failed:relevanceId is empty'));

    } else if (validator.isInt(req.body['relevanceId'], { min: 0, max: 10 }) === false) {
        next(new Error('[ERROR][/fb/regist]validate failed:answerId is not integer or 0～4'));

    } else {
        var postData = {
            'question': req.body['question'],
            'answerid': req.body['answerId'],
            'relevance': req.body['relevanceId'],
            'flag': 2
        };

        ff.postFbDoc(postData, req.session.user, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/fb/regist]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][/fb/regist]api call result(body): ' + util.inspect(body));
                next(new Error('[ERROR][/fb/regist]api call failed'));
            } else {
                console.log('[INFO][/fb/regist]return /fb page');
                res.render('fbNew', { result: 'success', group: req.session.group, csrfToken: req.csrfToken() });
            }
        });
    }
});

//// /fb/drop: 全データ削除ボタンが押下されたときの処理
router.post('/drop', function(req, res, next) {
    console.log('[INFO]call /fb/drop');

    ff.dropFbDoc(req.session.user, function(err, response, body) {
        if (err || body['result'] === 'failure' || response.statusCode >= 203) {
            console.error('[ERROR][/fb/drop]api call result(error): ' + util.inspect(err));
            console.error('[ERROR][/fb/drop]api call result(body): ' + util.inspect(body));
            next(new Error('[ERROR][/fb/drop]api call failed'));
        } else {
            console.log('[INFO][/fb/drop]return /fb page');
            res.redirect('/fb');
        }
    });
});

//// /fb/modify: 編集ページ表示
router.post('/modify', function(req, res, next) {
    console.log('[INFO]call /fb/modify');
    if (validator.isInt(req.body['postData']) === false) {
        res.status(500);
        next(new Error('[ERROR][/fb/modify]Invalid data was entered'));
    } else {
        ff.getFbDoc(0, 0, req.body['postData'], 0, 0, 0, 0, 0, req.session.user, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/fb/modify]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][/fb/modify]api call result(body): ' + util.inspect(body));
                next(new Error('[ERROR][/fb/modify]api call failed'));
            } else {
                if (String(body['message']['answer'][0]['id']) !== "NoAnswer") {//いいね
                    // 登録された回答IDから、faq文章を検索、回答IDに紐づく回答内容を取得し、answer変数に格納
                    qf.getFaqDoc(0, body['message']['answer'][0]['id'], 0, 0, 0, 0, req.session.user,
                        function(err, response, body2) {
                            if (body2['message'] == null){
                                console.log('[INFO]render /fb/modify page');
                                var result = 'noanswer';
                                var answer = '回答情報がありません。本フィードバックを削除して下さいい';
                                res.render('fbModifyAns', { body: body['message'], result: result,
                                    answer: answer, group: req.session.group, csrfToken: req.csrfToken() });
                            } else if(err || body2['result'] === 'failure' || response.statusCode >= 203){
                                console.error('[ERROR][/fb/modify]api call result(error): ' + util.inspect(err));
                                console.error('[ERROR][/fb/modify]api call result(body): ' + util.inspect(body2));
                                next(new Error('[ERROR][/fb/modify]api call failed'));

                            } else {
                                console.log('[INFO]render /fb/modify page');
                                res.render('fbModifyAns', { body: body['message'], answer: body2['message']['answer'],
                                    group: req.session.group, csrfToken: req.csrfToken() });
                            }
                    });
                } else {//回答なし
                    res.render('fbModifyNAns', { body: body['message'], group: req.session.group,
                        csrfToken: req.csrfToken() });
                }
            }
        });
    }
});

//// /fb/modify: 編集ページで更新タンが押下されたときの処理
router.post('/registfb', function(req, res, next) {
    console.log('[INFO]call registfb');
    // data check
    console.log('[INFO][/fb/registfb]check validate data');
    if (validator.isEmpty(req.body['id']) === true) {
        next(new Error('[ERROR][/fb/registfb]validate failed:id is empty'));

    } else if (validator.isInt(req.body['id']) === false) {
        next(new Error('[ERROR][/fb/registfb]validate failed:id is not integer'));

    } else if (validator.isEmpty(req.body['question']) === true) {
        next(new Error('[ERROR][/fb/registfb]validate failed:question is empty'));

    } else if (validator.isLength(req.body['question'], { min: 4, max: 200 }) === false) {
        next(new Error('[ERROR][/fb/registfb]validate failed:question is max 200 characters'));

    } else if (validator.isEmpty(req.body['answerId']) === true) {
        next(new Error('[ERROR][/fb/registfb]validate failed:answerId is empty'));

    } else if (validator.isInt(req.body['answerId']) === false) {
        next(new Error('[ERROR][/fb/registfb]validate failed:answerId is not integer'));

    } else if (validator.isEmpty(req.body['relevanceId']) === true) {
        next(new Error('[ERROR][/fb/registfb]validate failed:relevanceId is empty'));

    } else if (validator.isInt(req.body['relevanceId'], { min: 0, max: 10 }) === false) {
        next(new Error('[ERROR][/fb/registfb]validate failed:answerId is not integer or 0～10'));

    } else {
        var putData = {
            'id': req.body['id'],
            'question': req.body['question'],
            'answerid': req.body['answerId'],
            'relevance': req.body['relevanceId'],
            'flag': 3
        };

        ff.putFbDoc(putData, req.session.user, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/fb/registfb]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][/fb/registfb]api call result(body): ' + util.inspect(body));
                next(new Error('[ERROR][/fb/registfb]api call failed'));
            } else {
                console.log('[INFO][/fb/registfb]return /fb page');
                res.redirect('/fb');
            }
        });
    }
});

//// /fb/regist/faq で新規登録ボタンが押下されたときの処理
router.post('/registfaq', function(req, res, next) {
    console.log('[INFO]call /fb/registfaq');
    // data check
    console.log('[INFO][/fb/registfaq]check validate data');
    if (validator.isEmpty(req.body['question']) === true) {
        next(new Error('[ERROR][/fb/registfaq]validate failed:question is empty'));

    } else if (validator.isLength(req.body['question'], { min: 4, max: 200 }) === false) {
        next(new Error('[ERROR][/fb/registfaq]validate failed:question is max 200 characters'));

    } else if (validator.isEmpty(req.body['answer']) === true) {
        next(new Error('[ERROR][/fb/registfaq]validate failed:answer is empty'));

    } else if (validator.isLength(req.body['answer'], { min: 4 }) === false) {
        next(new Error('[ERROR][/fb/registfaq]validate failed:answer is 4 characters or less'));

    } else if (validator.isEmpty(req.body['url']) === false && validator.matches(req.body['url'], urlRule) === false) {
        next(new Error('[ERROR][/qa/regist]validate failed:url'));

    } else {
        var postData = {
            'question': req.body['question'],
            'answer': req.body['answer'],
            'url': req.body['url'],
            'flag': 3
        };
        var deleteData = {
            'id': req.body['id']
        };
        qf.postFaqDoc(postData, req.session.user, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/fb/registfaq]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][/fb/registfaq]api call result(body): ' + util.inspect(body));
                next(new Error('[ERROR][/fb/registfaq]api call failed'));
            } else {
                // faq_docDBにデータを追加後、基データをfb_docから削除
                ff.deleteFbDoc(deleteData, req.session.user, function(err, response, body) {
                    if (body['result'] === 'failure' || response.statusCode >= 203) {
                        console.error('[ERROR][/fb/registfaq]api call result(error): ' + util.inspect(err));
                        console.error('[ERROR][/fb/registfaq]api call result(body): ' + util.inspect(body));
                        next(new Error('[ERROR][/fb/registfaq]api call failed'));
                    } else {
                        console.log('[INFO][/fb/registfaq]delete data form fb_doc(DB) success');
                        console.log('[INFO][/fb/registfaq]return /fb page');
                        res.redirect('/fb');
                    }
                });
            }
        });
    }
});

//// /fb/deleteGr: 編集ページで削除ボタンが押下されたときの処理
router.post('/deletefb', function(req, res, next) {
    console.log('[INFO]call /fb/deleteGr');
    // empty check
    console.log('[INFO][/fb/deletefb]check validate postData');
    if (validator.isEmpty(req.body['postData']) === true) {
        next(new Error('[ERROR][/fb/deletefb]validate failed:postData is empty'));
    } else {
        var deleteData = {
            'id': req.body['postData']
        };

        ff.deleteFbDoc(deleteData, req.session.user, function(err, response, body) {
            if (body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/fb/deletefb]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][/fb/deletefb]api call result(body): ' + util.inspect(body));
                next(new Error('[ERROR][/fb/delete]api call failed'));
            } else {
                console.log('[INFO][/fb/deletefb]return /fb page');
                res.redirect('/fb');
            }
        });
    }
});

module.exports = router;
