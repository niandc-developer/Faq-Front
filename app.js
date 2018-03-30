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
'use strict';

// モジュール呼び出し //
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const csurf = require('csurf');
const express = require('express');
const favicon = require('serve-favicon');
const fileUpload = require('express-fileupload');
const logger = require('morgan');
const path = require('path');
const helmet = require('helmet');

// Express 標準設定 //
const app = express();
app.use(compression());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '/public/images/favicon.ico')));
const logFormat = ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version"'
                +' :status :res[content-length] ":referrer" ":user-agent"';
app.use(logger(logFormat));

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

//// helmet setting
app.use(helmet());
app.use(helmet.noCache());

//// cookie-session setting
app.use(cookieSession({
    name: 'session',
    keys: ['+wM0K2)Ulf', 'EO-kgZy(50'],
    cookie: {
        path: '/',
        secure: true,
        httpOnly: true,
        maxAge: 30 * 60 * 1000, // 30 minute
        expires: 30 * 60 * 1000 // 30 minute
    }
}));

//// csrf setting
app.use(csurf({ cookie: true }));

// ルーティング設定 //
//// session check function
const sessionCheck = function(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        console.log('[info][seession check]redirect login page');
        res.redirect('/login');
    }
};
//// https check function
const httpsCheck = function(req, res, next) {
    if(process.env.HTTPS_ENABLE === 'on'){
        if(!process.env.PORT){
            next();
        }else if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === 'http') {
            res.redirect('https://' + req.headers.host + req.url);
        }else{
            next();
        }
    }
    next();
};
//// login/logout ページ
app.use('/login', httpsCheck, require('./routes/login'));
app.use('/logout', httpsCheck, require('./routes/logout'));
//// passwordページ
app.use('/password', httpsCheck, sessionCheck, require('./routes/password'));
//// topページ
app.use('/', httpsCheck, sessionCheck, require('./routes/index'));
//// faqページ
app.use('/faq', httpsCheck, sessionCheck, require('./routes/faq'));
//// Q&Aメンテナンスページ
app.use('/qa', httpsCheck, sessionCheck, require('./routes/qa'));
//// フィードバック情報メンテナンスページ
app.use('/fb', httpsCheck, sessionCheck, require('./routes/fb'));
//// 再学習実行ページ
app.use('/train', httpsCheck, sessionCheck, require('./routes/train'));
//// 管理ページ
app.use('/admin', httpsCheck, sessionCheck, require('./routes/admin'));
//// APIコール数確認ページ
app.use('/analytics', httpsCheck, sessionCheck, require('./routes/analytics'));

// エラー設定 //
require('./routes/error-handler')(app);

// アプリケーション起動 //
const port = process.env.PORT || 3000;
app.listen(port, function StartServer(){
    console.log('[info]listening at:', port);
});
