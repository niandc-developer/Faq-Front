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

function RequestApi(){
    // variable
    var $tdElementDp = $('table#statusTable td#docProcessing');
    var $tdElementTp = $('table#statusTable td#trainProcessing');
    var $tdElementSt = $('table#statusTable td#successfully_trained');
    var $tdElementTa = $('table#statusTable td#trainAvailable');
    var $errElement = $('#error')

    // inner loading gif
    $tdElementDp.html('<img src="../images/Preloader_4.gif" alt="接続中.....">');
    $tdElementTp.html('<img src="../images/Preloader_4.gif" alt="接続中.....">');
    $tdElementSt.html('<img src="../images/Preloader_4.gif" alt="接続中.....">');
    $tdElementTa.html('<img src="../images/Preloader_4.gif" alt="接続中.....">');

    // request api
    $.ajax({
        url: './train/status',
        type: 'GET',
        dataType: 'json',
        data: {
            _csrf: $('meta[name="_csrf"]').attr('content')
        },
        timeout: 10000,
    }).done(function(data) {
        // delete loading gif
        $tdElementDp.empty();
        $tdElementTp.empty();
        $tdElementSt.empty();
        $tdElementTa.empty();

        // change element
        if(data['document_counts']['processing'] === 0){
            $tdElementDp.text('停止中');
        } else {
            $tdElementDp.text('実行中');
        }

        if(data['training_status']['processing'] === false){
            $tdElementTp.text('停止中');
        } else {
            $tdElementTp.text('実行中');
        }

        $tdElementSt.text(data['training_status']['successfully_trained']);

        if(data['training_status']['successfully_trained'] && data['training_status']['available'] === true){
            $tdElementTa.text('使用可能');
        } else if(data['training_status']['successfully_trained'] && data['training_status']['available'] === false){
            $tdElementTa.text('使用不可能');
        } else {
            $tdElementTa.text('');
        }
        $errElement.text('')
    }).fail(function(error) {
        $errElement.text('内部エラー発生。ブラウザを更新するか、再度アクセスをお願い致します。')
    });
}

$(document).ready(function() {
    setInterval(RequestApi, 20000);
});