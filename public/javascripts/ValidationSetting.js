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
//New rule
//// for login id
jQuery.validator.addMethod(
    "alphaNumeric",
    function(value, element) {
        reg = new RegExp("^[0-9a-zA-Z\-@._]+$");
        return this.optional(element) || reg.test(value);
    },
    "** ログインIDは[0-9],[a-z],[A-Z],[@],[.],[-],[_]のみ許可されております **"
);
//// for password
jQuery.validator.addMethod(
    "notEqual",
    function(value, element, param) {
        return this.optional(element) || value != $(param).val();
    },
    "** 旧パスワードと違うパスワードを入力して下さい **"
);
//// for url
jQuery.validator.addMethod(
    "dedicatedUrl",
    function(value, element) {
        reg = new RegExp("(^http:\/\/)|(^https:\/\/)|(^Notes:\/\/)");
        return this.optional(element) || reg.test(value);
    },
    "** URLは[http://],[https://],[Notes://]のみ許可されております **"
);

// setting
$('form[name="form"]').validate({
    rules: {
        'id': {
            required: true,
            number: true
        },
        'flag': {
            required: true,
            number: true
        },
        'question': {
            required: true,
            minlength: 4,
            maxlength: 200
        },
        'answer': {
            required: true,
            minlength: 4
        },
        'url': {
            dedicatedUrl: true
        },

        'answerId': {
            required: true,
            number: true
        },
        'relevanceId': {
            required: true,
            number: true
        },
        'group[]': {
            required: true
        },
        'userid': {
            required: true,
            alphaNumeric: true
        },
        'password': {
            required: true,
            minlength: 8,
        },
        'newPassword1': {
            minlength: 8
        },
        'newPassword2': {
            required: true,
            minlength: 8,
            notEqual: "#oldPassword"
        },
        'newPassword3': {
            required: true,
            minlength: 8,
            equalTo: "#newPassword2"
        },
        'oldPassword': {
            required: true,
            minlength: 8
        },
        'importFile': {
            extension: "csv"
        }
    },
    messages: {
        'id': {
            'required': '** id番号を入力して下さい **',
            'number': '** 数字のみ入力可能です **'
        },
        'body': {
            'required': '** bodyを入力して下さい **',
            'minlength': '** 最低4文字以上で入力して下さい **'
        },
        'flag': {
            'required': '** flagを入力して下さい **'
        },
        'question': {
            'required': '** 質問を入力してください **',
            'maxlength': '** 200文字以下で入力して下さい **',
            'minlength': '** 最低4文字以上で入力して下さい **'
        },
        'answer': {
            'required': '** 回答を入力してください **',
            'minlength': '** 最低4文字以上で入力して下さい **'
        },
        'answerId': {
            'required': '** id番号を入力してください **',
            'number': '** 数字のみ入力可能です **'
        },
        'relevanceId': {
            'required': '** 関連度の番号を入力してください **',
            'number': '** 数字のみ入力可能です **'
        },
        'rankerId': {
            'required': '** 関連度の番号を入力してください **'
        },
        'group[]': {
            'required': '** 権限を入力して下さい **'
        },
        'userid': {
            'required': '** ユーザ名を入力してください **'
        },
        'password': {
            'required': '** パスワードを入力してください **',
            'minlength': '** 最低8文字以上で入力して下さい **'
        },
        'newPassword1': {
            'minlength': '** 最低8文字以上で入力して下さい **'
        },
        'newPassword2': {
            'required': '** パスワードを入力してください **',
            'minlength': '** 最低8文字以上で入力して下さい **'
        },
        'newPassword3': {
            'required': '** パスワードを入力してください **',
            'minlength': '** 最低8文字以上で入力して下さい **',
            'equalTo': '** 異なるパスワードが入力されています **'
        },
        'oldPassword': {
            'required': '** パスワードを入力してください **',
            'minlength': '** 最低8文字以上で入力して下さい **'
        },
        'importFile': {
            'extension': '** csvファイル以外はアップロード出来ません **'
        }
    },
    errorPlacement: function(error, element) {
        element.before(error);
    }
});

// Double transmission disabled
$('form[name="form"]').submit(function() {
    if ($('form[name="form"]').valid() == true) {
        setTimeout(function() {
            $(form).find('button[type="submit"]').prop('disabled', true);
        }, 250);
    };
});