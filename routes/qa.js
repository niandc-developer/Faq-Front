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
const qf = require('./function/qaFunction.js');
const tf = require('./function/trainFunction.js');

// 変数宣言
const faqdocApi = config.get('api.faqdocApi');
const apiKey = config.get('api.apiKey');
const uploadPath = './tmp';
const urlRule = '(^http:\/\/)|(^https:\/\/)|(^Notes:\/\/)';

// main
//// /qa  : トップページ表示
router.get('/', function(req, res, next) {
    console.log('[INFO]call /qa');
    console.log('[INFO][/qa]call checkProcessing');
    tf.checkProcessing(req.session.user, function(err, response, body1) { //学習orインポート処理等が行われていないかチェック
        if (err || body1['result'] === 'failure' || response.statusCode >= 203) {
            console.error('[ERROR][/qa]api call result(error): ' + util.inspect(err));
            console.error('[ERROR][/qa]api call result(body): ' + util.inspect(body1));
            next(new Error('[ERROR][/qa]api call failed'));
        } else {
            console.log('[INFO]render /qa page(do not render faq data table)');
            res.render('qa', {faqStatus: body1['message'],  group: req.session.group, csrfToken: req.csrfToken() });
        }
    });
});

//// トップページのFAQデータ表示用URI(publiec/javascripts/TableSettins.jsよりCall(jqueryプログインDataTablesの仕様に沿って実行))
router.post('/list',function(req, res, next) {
    console.log('[INFO]call /qa/list');
    if(validator.isEmpty(req.body["search"]["value"]) === true){ //検索窓にキーワードが入力されていない場合
        qf.getFaqDoc(0, 0, 0, 0, req.body["length"], req.body["start"], req.session.user,
            function(err, response, body1) {
                if (err || body1['result'] === 'failure' || response.statusCode >= 203) {
                    console.error('[ERROR][/qa/list][no search word]api call result(error): ' + util.inspect(err));
                    console.error('[ERROR][/qa/list]api call result(body): ' + util.inspect(body1));
                    next(new Error('[ERROR][/qa/list]api call failed'));
                } else {
                    var json = {
                        'draw': req.body["draw"],
                        'recordsTotal': body1["total_rows"],
                        'recordsFiltered': body1["total_rows"],
                        'data': body1['message']
                    };
                    console.log('[INFO][/qa/list]render /qa page(render faq data table)');
                    res.status(200).send(json);
                }
        });
    } else { //検索窓にキーワードが入力された場合
        qf.getFaqDoc(0, 0, req.body["search"]["value"], 0, 0, 0, req.session.user,
            function(err, response, body1) {
                if (err || body1['result'] === 'failure' || response.statusCode >= 203) {
                    console.error('[ERROR][/qa/list][no search word]api call result(error): ' + util.inspect(err));
                    console.error('[ERROR][/qa/list]api call result(body): ' + util.inspect(body1));
                    next(new Error('[ERROR][/qa]api call failed'));
                } else {
                    var json = {
                        'draw': req.body["draw"],
                        'recordsTotal': body1["total_rows"],
                        'recordsFiltered': body1["total_rows"],
                        'data': body1['message']
                    };
                    console.log('[INFO][/qa/list]render /qa page(render faq data table(search keyword))');
                    res.status(200).send(json);
                }
        });
    }
});

//// /qa/import : インポートボタンが押下された際の処理
router.post('/import', function(req, res, next) {
    console.log('[INFO]call /qa/import');
    console.log('[INFO][/qa/import]check validate upload file');
    if (!req.files) {
        console.error('[ERROR][/qa/import]There is no file');
        next(new Error('[ERROR][/qa/import]validate failed:there is no file'));
    } else if (path.extname(req.files.importFile.name) !== '.csv') {
        console.error('[ERROR][/qa/import]Invalid file extension');
        next(new Error('[ERROR][/qa/import]validate failed:Invalid file extension'));
    } else {
        // upload ファイルの保存処理とファイルのPOST
        var uploadFile = uploadPath+'/'+req.files.importFile.name;
        req.files.importFile.mv(uploadFile, function(err) {
            if (err) {
                console.error('[ERROR][/qa/import]file save failed: ' + err);
                next(new Error('[ERROR][/qa/import]file save failed:'));
            } else {
                qf.importFqaDoc(uploadFile, req.session.user, function(err, response, body) {
                    if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                        console.error('[ERROR][/qa/import]api call result(error): ' + util.inspect(err));
                        console.error('[ERROR][/qa/import]api call result(body): ' + util.inspect(body));
                        console.log('[INFO][/qa/import]render /qaImport page');
                        res.render('qaImport', { resultImport: 'failure', group: req.session.group, body: body });
                        //ファイル削除
                        fs.unlink(uploadFile, function(err) {
                            if (err) {
                                console.error('[ERROR][/qa/import] delete file failed :' + err);
                            } else {
                                console.log('[INFO][/qa/import] delete file Success');
                            }
                        });
                    } else {
                        console.log('[INFO][/qa/import]render /qaImport page');
                        res.render('qaImport', { resultImport: 'success', group: req.session.group,
                            body: 'success' });
                        //ファイル削除
                        fs.unlink(uploadFile, function(err) {
                            if (err) {
                                console.error('[ERROR][/qa/import] delete file failed :' + err);
                            } else {
                                console.log('[INFO][/qa/import] delete file Success');
                            }
                        });
                    }
                });
            }
        });
    }
});

//// /qa/export : エクスポートボタンが押下された際の処理
router.get('/export', function(req, res, next) {
    console.log('[INFO]call /qa/export');
    var exportUrl = faqdocApi + '/export?apikey=' + apiKey + '&user=' + req.session.user;
    res.redirect(exportUrl);
});

//// /qa/new : page 表示
router.get('/new', function(req, res, next) {
    console.log('[INFO]call /qa/new');
    res.render('qaNew', { group: req.session.group, csrfToken: req.csrfToken() });
});

//// /qa/new で新規登録ボタンが押下されたときの処理
router.post('/regist', function(req, res, next) {
    console.log('[INFO]call /qa/regist');
    // data check
    console.log('[INFO][/qa/regist]check validate data');
    if (validator.isEmpty(req.body['question']) === true) {
        next(new Error('[ERROR][/qa/regist]validate failed:question is empty'));

    } else if (validator.isLength(req.body['question'], { min: 4, max: 200 }) === false) {
        next(new Error('[ERROR][/qa/regist]validate failed:question is 4-200 characters or less'));

    } else if (validator.isEmpty(req.body['answer']) === true) {
        next(new Error('[ERROR][/qa/regist]validate failed:answer is empty'));

    } else if (validator.isLength(req.body['answer'], { min: 4 }) === false) {
        next(new Error('[ERROR][/qa/regist]validate failed:answer is 4 characters or less'));

    } else if (validator.isEmpty(req.body['url']) === false && validator.matches(req.body['url'], urlRule) === false) {
        next(new Error('[ERROR][/qa/regist]validate failed:url'));

    } else {
        var postData = {
            'question': req.body['question'],
            'answer': req.body['answer'],
            'url': req.body['url'],
            'flag': 2
        };

        qf.postFaqDoc(postData, req.session.user, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/qa/regist]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][/qa/regist]api call result(body): ' + util.inspect(body));
                next(new Error('[ERROR][/qa/regist]api call failed'));
            } else {
                console.log('[INFO][/qa/regist]return /qa page');
                res.render('qaNew', { result: 'success', group: req.session.group, csrfToken: req.csrfToken() });
            }
        });
    }
});

//// /qa/drop: 全データ削除ボタンが押下されたときの処理
router.post('/drop', function(req, res, next) {
    console.log('[INFO]call /qa/drop');

    qf.dropFaqDoc(req.session.user, function(err, response, body) {
        if (err || body['result'] === 'failure' || response.statusCode >= 203) {
            console.error('[ERROR][/qa/drop]api call result(error): ' + util.inspect(err));
            console.error('[ERROR][/qa/drop]api call result(body): ' + util.inspect(body));
            next(new Error('[ERROR][/qa/drop]api call failed'));
        } else {
            console.log('[INFO][/qa/drop]return /qa page');
            res.redirect('/qa');
        }
    });
});

//// /qa/modify: 編集page 表示
router.post('/modify', function(req, res, next) {
    console.log('[INFO]call /qa/modify');
    if (validator.isInt(req.body['postData']) === false) {
        res.status(500);
        next(new Error('[ERROR][/qa/modify]Invalid data was entered'));
    } else {
        qf.getFaqDoc(0, req.body['postData'], 0, 0, 0, 0, req.session.user, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/qa/modify]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][/qa/modify]api call result(body): ' + util.inspect(body));
                next(new Error('[ERROR][/qa/modify]api call failed'));
            } else {
                console.log('[INFO]render /qa/modify page');
                res.render('qaModify', { body: body['message'], group: req.session.group,
                    csrfToken: req.csrfToken() });
            }
        });
    }
});

//// /qa/update: 編集ページで更新タンが押下されたときの処理
router.post('/update', function(req, res, next) {
    console.log('[INFO]call /qa/update');
    // data check
    console.log('[INFO][/qa/update]check validate data');
    if (validator.isEmpty(req.body['id']) === true) {
        next(new Error('[ERROR][/qa/update]validate failed:id is empty'));

    } else if (validator.isInt(req.body['id']) === false) {
        next(new Error('[ERROR][/qa/update]validate failed:id is not integer'));

    } else if (validator.isEmpty(req.body['flag']) === true) {
        next(new Error('[ERROR][/qa/update]validate failed:flag is empty'));

    } else if (validator.isInt(req.body['flag']) === false) {
        next(new Error('[ERROR][/qa/update]validate failed:flag is not integer'));

    } else if (validator.isEmpty(req.body['question']) === true) {
        next(new Error('[ERROR][/qa/update]validate failed:question is empty'));

    } else if (validator.isLength(req.body['question'], { min: 4, max: 200 }) === false) {
        next(new Error('[ERROR][/qa/update]validate failed:question is 4-200 characters or less'));

    } else if (validator.isEmpty(req.body['answer']) === true) {
        next(new Error('[ERROR][/qa/update]validate failed:answer is empty'));

    } else if (validator.isLength(req.body['answer'], { min: 4 }) === false) {
        next(new Error('[ERROR][/qa/update]validate failed:answer is 4 characters or less'));

    } else if (validator.isEmpty(req.body['url']) === false && validator.matches(req.body['url'], urlRule) === false) {
        next(new Error('[ERROR][/qa/regist]validate failed:url'));

    } else {
        var putData = {
            'id': req.body['id'],
            'question': req.body['question'],
            'answer': req.body['answer'],
            'url': req.body['url'],
            'flag': parseInt(req.body['flag']),
        };

        qf.putFaqDoc(putData, req.session.user, function(err, response, body) {
            if (body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/qa/update]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][/qa/update]api call result(body): ' + util.inspect(body));
                next(new Error('[ERROR][/qa/update]api call failed'));
            } else {
                console.log('[INFO][/qa/update]return /qa/edit page');
                res.render('qaModify', { body: putData, group: req.session.group, result: 'success',
                    csrfToken: req.csrfToken() });
            }
        });
    }
});

//// /qa/delete: 削除ボタンが押下されたときの処理
router.post('/delete', function(req, res, next) {
    console.log('[INFO]call /qa/delete');
    // empty check
    console.log('[INFO][/qa/delete]check validate id');
    if (validator.isEmpty(req.body['postData']) === true) {
        next(new Error('[ERROR][/qa/delete]validate failed:id is empty'));
    } else {
        var deleteData = {
            'id': req.body['postData']
        };

        qf.deleteFaqDoc(deleteData, req.session.user, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/qa/delete]api call result(error): ' + util.inspect(err));
                console.error('[ERROR][/qa/delete]api call result(body): ' + util.inspect(body));
                next(new Error('[ERROR][/qa/delete]api call failed'));
            } else {
                console.log('[INFO][/qa/delete]return /qa page');
                res.redirect('/qa');
            }
        });
    }
});

module.exports = router;
