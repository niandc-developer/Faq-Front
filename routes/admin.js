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
const f = require('./function/adminFunction.js');

// 変数宣言
const useridRule = 'abcdefghijklnmopqrstuvwxyzABCDEFGHIJKLNMOPQRSTUVWXYZ0123456789@.-_';

// main
//// /admin : トップページ表示
router.get('/', function(req, res, next) {
    console.log('[INFO]render /admin page');
    res.render('admin', {group: req.session.group, csrfToken: req.csrfToken()});
});

//// トップページのユーザ一覧表示用URI(publiec/javascripts/TableSettins.jsよりCall(jqueryプログインDataTablesの仕様に沿って実行))
router.post('/list',function(req, res, next) {
    console.log('[INFO]call /admin/list');
    if(validator.isEmpty(req.body["search"]["value"]) === true){ //検索窓にキーワードが入力されていない場合
        f.getAdminUser(0, 0, 0, req.body["length"], req.body["start"], req.session.user, function(err, response, body1) {
            if (err || body1['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/admin/list]api call result(error): '+util.inspect(err));
                next(new Error('[ERROR][/admin/list]api call failed'));
            } else {
                var json = {
                    'draw': req.body["draw"],
                    'recordsTotal': body1["total_rows"],
                    'recordsFiltered': body1["total_rows"],
                    'data': body1['message']
                 };
                console.log('[INFO]render /admin page(render user data table)');
                res.status(200).send(json);
            }
        });
    } else { //検索窓にキーワードが入力された場合
        f.getAdminUser(0, 0, req.body["search"]["value"], 0, 0, req.session.user, function(err, response, body1) {
            if (err || body1['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][/admin/list]api call result(error): '+util.inspect(err));
                next(new Error('[ERROR][/admin/list]api call failed'));
            } else {
                var json = {
                    'draw': req.body["draw"],
                    'recordsTotal': body1["total_rows"],
                    'recordsFiltered': body1["total_rows"],
                    'data': body1['message']
                };
                console.log('[INFO]render /admin page(render user data table(search keyword))');
                res.status(200).send(json);
            }
        });
    }
});

//// /admin/new : page 表示
router.get('/new', function(req, res, next) {
    console.log('[INFO]call /admin/new');
    res.render('adminNew', {group: req.session.group, csrfToken: req.csrfToken()});
});

//// /admin/new で新規登録ボタンが押下されたときの処理
router.post('/regist', function(req, res, next) {
    console.log('[INFO]call /admin/regist');
    // data check
    console.log('[INFO][/admin/regist]check validate data');
    if(validator.isEmpty(req.body['userid']) === true){
        next(new Error('[ERROR][admin/update]validate failed:userid is empty'));

    }else if(validator.isWhitelisted(req.body['userid'], useridRule) === false){
        next(new Error('[ERROR][admin/update]validate failed:userid'));

    }else if(validator.isEmpty(req.body['group'][0]) === true){
        next(new Error('[ERROR][admin/update]validate failed:user permission is empty'));

    }else if(validator.isEmpty(req.body['group'][1]) === true){
        next(new Error('[ERROR][admin/update]validate failed:group permission is empty'));

    }else if(validator.isEmpty(req.body['group'][2]) === true){
        next(new Error('[ERROR][admin/update]validate failed:admin permission is empty'));

    }else if(validator.isEmpty(req.body['password']) === true){
        next(new Error('[ERROR][admin/update]validate failed:password is empty'));

    }else if(validator.isLength(req.body['password'],{min:8}) === false){
        // パスワードが入力されている場合、８文字以上でなければ却下
        next(new Error('[ERROR][admin/update]validate failed: password'));

    }else{
        var postData = {
            'id': req.body['userid'],
            'group': [
                req.body['group'][0],
                req.body['group'][1],
                req.body['group'][2]
            ],
            'password': req.body['password']
        };

        f.postAdminUser(postData, req.session.user, function(err, response, body) {
            if(body['result'] === 'failure' && body['message']['error'] === 'conflict'){
                // ログインIDが既に登録されていたらエラー
                console.log('[INFO][admin/regist]'+body['message']);
                res.render('adminNew',{result:'conflict', group: req.session.group});
            }else if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][admin/regist]api call result(error): '+util.inspect(err));
                console.error('[ERROR][admin/regist]api call result(body): '+util.inspect(body));
                next(new Error('[ERROR][admin/regist]api call failed'));
            } else {
                console.log('[INFO][admin/regist]return /admin page');
                res.render('adminNew',{result:'success', group: req.session.group, csrfToken: req.csrfToken()});
            }
        });
    }
});

//// /admin/modify: 編集page 表示
router.post('/modify', function(req, res, next) {
    console.log('[INFO]call /admin/modify');
    if(validator.isEmpty(req.body['postData']) === true){
        res.status(500);
        next(new Error('[ERROR][admin/modify]validate failed: postData is empty'));
    } else if(validator.isWhitelisted(req.body['postData'], useridRule) === false){
        res.status(500);
        next(new Error('[ERROR][admin/modify]validate failed: Invalid data was entered'));
    }else{
        f.getAdminUser(0, req.body['postData'], 0, 0, 0, req.session.user, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.log('[INFO][admin/edit]api call result(error): '+util.inspect(err));
                next(new Error('[ERROR][admin/modify]api call failed'));
            } else {
                console.log('[INFO]render /admin/modify page');
                res.render('adminModify', {body: body['message'], group: req.session.group,
                    csrfToken: req.csrfToken()});
            }
        });
    }
});

//// /admin/modify: 編集ページで更新タンが押下されたときの処理
router.post('/update', function(req, res, next) {
    console.log('[INFO]call /admin/update');
    // data check
    console.log('[INFO][/admin/update]check validate data');
    if(validator.isEmpty(req.body['userid']) === true){
        next(new Error('[ERROR][admin/update]validate failed:userid is empty'));

    }else if(validator.isWhitelisted(req.body['userid'], useridRule) === false){
        next(new Error('[ERROR][admin/update]validate failed:userid'));

    }else if(validator.isEmpty(req.body['group'][0]) === true){
        next(new Error('[ERROR][admin/update]validate failed:user permission is empty'));

    }else if(validator.isEmpty(req.body['group'][1]) === true){
        next(new Error('[ERROR][admin/update]validate failed:group permission is empty'));

    }else if(validator.isEmpty(req.body['group'][2]) === true){
        next(new Error('[ERROR][admin/update]validate failed:admin permission is empty'));

    }else if(validator.isEmpty(req.body['newPassword1']) !== 'nochange'
             && validator.isLength(req.body['newPassword1'],{min:8}) === false){
        // パスワードが入力されている場合、８文字以上でなければ却下
        next(new Error('[ERROR][admin/update]validate failed: password'));
    }else{
        // nochangeの場合はパスワードを変更しないため空でPOST
        if(req.body['newPassword1'] === 'nochange'){
            req.body['newPassword1'] ='';
        }
        var putData = {
            'id': req.body['userid'],
            'group' : [
                req.body['group'][0],
                req.body['group'][1],
                req.body['group'][2]
            ],
            'password' : req.body['newPassword1']
        };

        f.putAdminUser(putData, req.session.user, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][admin/update]api call result(error): '+util.inspect(err));
                console.error('[ERROR][admin/update]api call result(body): '+util.inspect(body));
                next(new Error('[ERROR][admin/update]api call failed'));
            } else {
                // 画面表示用のuseridを設定
                putData['userid']=putData['id'];
                console.log('[INFO][admin/update]return /solr/edit page');
                res.render('adminModify', {body: putData, group: req.session.group, result:'success',
                    csrfToken: req.csrfToken()});
            }
        });
    }
});

//// /admin/delete: 編集ページで削除ボタンが押下されたときの処理
router.post('/delete', function(req, res, next) {
    console.log('[INFO]call /admin/delete');
    // data check
    console.log('[INFO][/admin/delete]check validate id');
    if(validator.isEmpty(req.body['postData']) === true){
        next(new Error('[ERROR][admin/delete]validate failed:postData is empty'));

    }else if(validator.isWhitelisted(req.body['postData'], useridRule) === false){
        next(new Error('[ERROR][admin/update]validate failed: Invalid data was entered'));

    }else{
        var deleteData = {
            'id': req.body['postData']
        };

        f.deleteAdminUser(deleteData, req.session.user, function(err, response, body) {
            if (err || body['result'] === 'failure' || response.statusCode >= 203) {
                console.error('[ERROR][admin/delete]api call result(error): '+util.inspect(err));
                console.error('[ERROR][admin/delete]api call result(body): '+util.inspect(body));
                next(new Error('[admin/delete]api call failed'));
            } else {
                console.log('[INFO][admin/update]return /admin/edit page');
                res.redirect('/admin');
            }
        });
    }
});

module.exports = router;
