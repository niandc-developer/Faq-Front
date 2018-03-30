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

// function
//// post feedback(no answer) function
function FeedbackSad(qtext) {
    $.ajax({
        url: './faq/feedback',
        type: 'POST',
        dataType: 'json',
        data: {
            _csrf: $('meta[name="_csrf"]').attr('content'),
            emotion: 'Sad',
            qtext: qtext
        },
        timeout: 10000,
    }).done(function(data) {
        alert('「回答なし」をフィードバックしました！');
    }).fail(function(error) {
        alert('エラーが発生しました。大変申し訳ございませんが、再度アクセスをお願い致します。' + '事象が続く場合は担当者までご連絡をお願い致します。');
    });
};

//// post feedback(answer) function
function FeedbackLike(qtext, id) {
    $.ajax({
        url: './faq/feedback',
        type: 'POST',
        dataType: 'json',
        data: {
            _csrf: $('meta[name="_csrf"]').attr('content'),
            emotion: 'Like',
            qtext: qtext,
            docid: id
        },
        timeout: 10000
    }).done(function(data) {
        alert('「いいね」をフィードバックしました！');
    }).fail(function(error) {
        alert('エラーが発生しました。大変申し訳ございませんが、再度アクセスをお願い致します。' + '事象が続く場合は担当者までご連絡をお願い致します。');
    });
};

// main
$(document).ready(function() {
    // setting variable
    var $btnElement = $('#clickChatBtn');
    var $formElement = $('#inputTextForm');
    var $chatElement = $('.chat');
    var inputText = '';
    // out put first message
    $chatElement.html('<img src="../images/Preloader_2.gif" alt="接続中.....">');
    RequestWatson('first');

    // push enter key
    $formElement.keypress(function(e){
        if ( e.which === 13 ) {
            inputText = EscapeHtml($('#inputTextForm').val());
            if(inputText){
                RequestWatson(inputText);
            };
            return false;
        }
    });

    // push send button
    $btnElement.click(function(){
        inputText = EscapeHtml($('#inputTextForm').val());
        if(inputText){
            RequestWatson(inputText);
        };
    });

    // request faq and get answer
    function RequestWatson(question){
        if (typeof(question) !== undefined && $.trim(question) !== ''){
            $formElement.val('');
            $chatElement.html('<img src="../images/Preloader_2.gif" alt="検索中.....">');
        };
        $.ajax({
            url: './faq/ask',
            type: 'POST',
            dataType: 'json',
            data: {
              _csrf: $('meta[name="_csrf"]').attr('content'),
              talk: question
            },
            timeout: 30000,
        }).done(function(data) {
          var watsonMessage = '';
          if (data.resCategory === 'START') {
            // view is first access
            watsonMessage = watsonMessage + '<li class="left clearfix">\n'
                                          + '<span class="chat-img pull-left">\n'
                                          + '<img src="../images/icon-faq.jpg" alt="FAQボット" '
                                          + 'width="50" class="img-circle" />\n'
                                          + '</span>\n'
                                          + '<div class="chat-body clearfix">\n'
                                          + '<div class="header">\n'
                                          + '<strong class="primary-font">FAQボット</strong>\n'
                                          + '</div>\n'
                                          + '<p>\n'
                                          + data.resMessage
                                          + '\n</p>';
          } else {
            // view : input user question
            watsonMessage = watsonMessage + '<li class="left clearfix">\n'
                                          + '<span class="chat-img pull-left">\n'
                                          + '<img src="../images/icon-user.jpg" alt="FAQボット" '
                                          + 'width="50" class="img-circle" />\n'
                                          + '</span>\n'
                                          + '<div class="chat-body clearfix">\n'
                                          + '<div class="header">\n'
                                          + '<strong class="primary-font">あなた</strong>\n'
                                          + '</div>\n'
                                          + '<p>\n'
                                          + EscapeHtml(question)
                                          + '\n</p>\n'
                                          + '</div>\n'
                                          + '</li>\n';
            if (data.resCategory === "NO_ANSWER") {
              // view :there is not an answer
              watsonMessage = watsonMessage + '<li class="left clearfix">\n'
                                            + '<span class="chat-img pull-left">\n'
                                            + '<img src="../images/icon-faq.jpg" '
                                            + 'width="50" alt="FAQボット" class="img-circle" />\n'
                                            + '</span>\n'
                                            + '<div class="chat-body clearfix">\n'
                                            + '<div class="header">\n'
                                            + '<strong class="primary-font">FAQボット</strong>\n'
                                            + '</div>\n'
                                            + '<p>\n'
                                            + data.resMessage
                                            + '\n</p>\n'
                                            + '</div>\n'
                                            + '</li>\n';
            } else {
                // view :there is an answer
                watsonMessage = watsonMessage + '<li class="left clearfix">\n'
                                              + '<span class="chat-img pull-left">\n'
                                              + '<img src="../images/icon-faq.jpg" '
                                              + 'width="50" alt="FAQボット" class="img-circle" />\n'
                                              + '</span>\n'
                                              + '<div class="chat-body clearfix">\n'
                                              + '<div class="header">\n'
                                              + '<strong class="primary-font">FAQボット</strong>\n'
                                              + '</div>\n'
                                              + '<p>\n'
                                              + '以下の回答が見つかりました'
                                              + '\n</p>\n'
                                              + '</div>\n'
                                              + '</li>\n';
                // view : Store watson answers in variables
                var myFeedback = '';
                data.body.docs.forEach(function(val) {
                  // check confidence
                  if(val.result_metadata.confidence){//When learning was done
                    var numChange = parseFloat(val.result_metadata.confidence); // convert to number
                    numChange = numChange * 100;
                    var confidence = numChange.toFixed(1); // Round up
                  }else if(val.result_metadata.confidence === 0){
                    var confidence = 0;
                  }else{
                    var confidence = "N/A";
                  }
                  // check url and setting variable
                  if(val.extracted_metadata.url){//If the variable has url information
                    var insertUrl = '<p><a href="'+val.extracted_metadata.url
                                    +'" target="_blank">'+val.extracted_metadata.url+'</a></p>';
                  }else{
                    var insertUrl = '';
                  }
                  //For ranker search, set the confidence
                  watsonMessage = watsonMessage + '<li class="right clearfix">\n'
                                                + '<span class="chat-img pull-right">\n'
                                                + '<button type="button" class="btn btn-danger btn-circle" '
                                                + 'onClick="FeedbackLike(\''+question+'\',\''+val.id+'\');'
                                                + 'this.disabled = true;">'
                                                + '<i class="fa fa-heart"></i>\n'
                                                + '</button>\n'
                                                + '</span>\n'
                                                + '<div class="chat-body clearfix">\n'
                                                + '<div class="header">\n'
                                                + '<small class="primary-font text-muted">\n'
                                                + val.question
                                                + '\n</small>\n'
                                                + '<small class="text-muted">\n'
                                                + '(確信度: '+confidence+'% '+'&nbsp;FAQ-ID: '+val.id + ')'
                                                + '\n</small>\n'
                                                + '</div>'
                                                + '<storng>\n'
                                                + val.answer
                                                + '</strong>\n'
                                                + '</div>\n'
                                                + insertUrl
                                                + '</li>\n';
                });
            };
              // view : no answers button
              watsonMessage = watsonMessage + '<li class="right clearfix">\n'
                                            + '<button type="button" class="btn btn-danger pull-right" '
                                            + 'onClick="FeedbackSad(\''+question+'\');this.disabled = true;">'
                                            + '回答なし</button>\n'
                                            + '</li>\n';
            }
          $formElement.show();
          $chatElement.html(watsonMessage);
          $formElement.focus();
        }).fail(function(error) {
          // ajax処理がエラーだった場合
          //if (document.getElementById('inputTextForm').value != "") {
           $chatElement.html('');
           $chatElement.html('エラーが発生しました。大変申し訳ございませんが、再度アクセスをお願い致します。<br/>'
                             +'事象が続く場合は担当者までご連絡をお願い致します。');
          //};
          $formElement.focus();
       });
    };

    // XSS対策
    function EscapeHtml (string) {
        if(typeof string !== 'string') {
          return string;
        }
        return string.replace(/[&'`"<>]/g, function(match) {
          return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
          }[match]
        });
      };
});
