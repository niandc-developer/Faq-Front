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

// table formatting
$(document).ready(function() {
    // for faq-page table setting(solr)
    $('#targetTable').DataTable({
        "ordering": false,
        "stateSave": true,
        "responsive": true,
        "processing": true,
        "serverSide": true,
        ajax: {
            url: './qa/list',
            type: 'POST',
            dataType: 'json',
            data: {
                "_csrf": $(':hidden[name="_csrf"]').val()
            }
        },
        //drawing table
        "columns": [
            {"data": "id"},
            {
                "data": "question",
                "render": $.fn.dataTable.render.text()
            },
            {    "data": "answer",
                 "render": $.fn.dataTable.render.text()
            },
            {
                "data": "flag",
                "render": function ( data, type, full ) {
                    if(data == 1){
                        return '<td>有効(初期)</td>'
                    }else if(data == 2){
                        return '<td>有効(追加登録)</td>'
                    }else if(data == 3){
                        return '<td>有効(ユーザフィードバック)</td>'
                    }else{
                        return '<td>無効</td>'
                    }
                }
            },
            {
                "data": "id",
                "render": function ( data, type, full ) {
                    return '<button type="submit" class="btn btn-outline btn-warning btn-sm"'
                        +'value='+data+' name="postData" formaction="/qa/modify">'
                        +' 編集</button>'
                        +'<button type="button" class="btn btn-outline btn-danger btn-sm" data-toggle="modal"'
                        +' data-target="#myModal'+data+'">'
                        +'  削除'
                        +'</button>'
                        +'<!-- Modal -->'
                        +'<div class="modal fade" id="myModal'+data+'" tabindex="-1" role="dialog"'
                        +' aria-labelledby="myModalLabel" aria-hidden="true">'
                        +'  <div class="modal-dialog">'
                        +'    <div class="modal-content">'
                        +'      <div class="modal-header">'
                        +'        <button type="button" class="close" data-dismiss="modal"'
                        +'         aria-hidden="true">&times;</button>'
                        +'        <h4 class="modal-title" id="myModalLabel">警告</h4>'
                        +'      </div>'
                        +'      <div class="modal-body">'
                        +'        一度削除されたデータはシステムで復元する事は出来ません</br>'
                        +'        削除前のデータへ復元が必要な場合は事前にエクスポートを行いましょう</br>'
                        +'        本当に削除しますか？'
                        +'      </div>'
                        +'      <div class="modal-footer">'
                        +'        <button type="button" class="btn btn-default" data-dismiss="modal">キャンセル</button>'
                        +'        <button type="submit" class="btn btn-danger" name="postData" '
                        +'         value="'+data+'" formaction="/qa/delete">削除</button>'
                        +'      </div>'
                        +'    </div>'
                        +'  <!-- /modal-content -->'
                        +'  </div>'
                        +'<!-- /modal-dialog -->'
                        +'</div>'
                }
            }
        ]
    });

    // for feedback-page(answer) table setting
    $('#targetTable2').DataTable({
        "ordering": false,
        "stateSave": true,
        "responsive": true,
        "processing": true,
        "serverSide": true,
        ajax: {
            url: './fb/list/ans',
            type: 'POST',
            dataType: 'json',
            data: {
                "_csrf": $(':hidden[name="_csrf"]').val()
            }
        },
        //drawing table
        "columns": [
            {
                "data": "question",
                "render": $.fn.dataTable.render.text()
            },
            {"data": "answer.0.id"},
            {"data": "answer.0.relevance"},
            {
                "data": "id",
                "render": function ( data, type, full ) {
                    return '<button type="submit" class="btn btn-outline btn-warning btn-sm"'
                        +'value="'+data+'" name="postData" formaction="/fb/modify">'
                        +' 編集</button>'
                        +'<button type="button" class="btn btn-outline btn-danger btn-sm" data-toggle="modal"'
                        +' data-target="#myModal'+data+'">'
                        +'  削除'
                        +'</button>'
                        +'<!-- Modal -->'
                        +'<div class="modal fade" id="myModal'+data+'" tabindex="-1" role="dialog"'
                        +' aria-labelledby="myModalLabel" aria-hidden="true">'
                        +'  <div class="modal-dialog">'
                        +'    <div class="modal-content">'
                        +'      <div class="modal-header">'
                        +'        <button type="button" class="close" data-dismiss="modal"'
                        +'         aria-hidden="true">&times;</button>'
                        +'        <h4 class="modal-title" id="myModalLabel">警告</h4>'
                        +'      </div>'
                        +'      <div class="modal-body">'
                        +'        一度削除されたデータはシステムで復元する事は出来ません</br>'
                        +'        削除前のデータへ復元が必要な場合は事前にエクスポートを行いましょう</br>'
                        +'        本当に削除しますか？'
                        +'      </div>'
                        +'      <div class="modal-footer">'
                        +'        <button type="button" class="btn btn-default" data-dismiss="modal">キャンセル</button>'
                        +'        <button type="submit" class="btn btn-danger" name="postData" '
                        +'         value="'+data+'" formaction="/fb/deletefb">削除</button>'
                        +'      </div>'
                        +'    </div>'
                        +'  <!-- /modal-content -->'
                        +'  </div>'
                        +'<!-- /modal-dialog -->'
                        +'</div>'
                }
            }
        ]
    });

    // for feedback-page(NoAnswer) table setting
    var table = $('#targetTable3').DataTable({
        "ordering": false,
        "stateSave": true,
        "responsive": true,
        "processing": true,
        "serverSide": true,
        ajax: {
            url: './fb/list/noans',
            type: 'POST',
            dataType: 'json',
            data: {
                "_csrf": $(':hidden[name="_csrf"]').val()
            }
        },
        //drawing table
        "columns": [
            {
                "data": "question",
                "render": $.fn.dataTable.render.text()
            },
            { "data": "answer.0.id" },
            {
                "data": "id",
                "render": function ( data, type, full ) {
                    return '<button type="submit" class="btn btn-outline btn-warning btn-sm"'
                        +'value="'+data+'" name="postData" formaction="/fb/modify">'
                        +' 編集</button>'
                        +'<button type="button" class="btn btn-outline btn-danger btn-sm" data-toggle="modal"'
                        +' data-target="#myModal'+data+'">'
                        +'  削除'
                        +'</button>'
                        +'<!-- Modal -->'
                        +'<div class="modal fade" id="myModal'+data+'" tabindex="-1" role="dialog"'
                        +' aria-labelledby="myModalLabel" aria-hidden="true">'
                        +'  <div class="modal-dialog">'
                        +'    <div class="modal-content">'
                        +'      <div class="modal-header">'
                        +'        <button type="button" class="close" data-dismiss="modal"'
                        +'         aria-hidden="true">&times;</button>'
                        +'        <h4 class="modal-title" id="myModalLabel">警告</h4>'
                        +'      </div>'
                        +'      <div class="modal-body">'
                        +'        一度削除されたデータはシステムで復元する事は出来ません</br>'
                        +'        削除前のデータへ復元が必要な場合は事前にエクスポートを行いましょう</br>'
                        +'        本当に削除しますか？'
                        +'      </div>'
                        +'      <div class="modal-footer">'
                        +'        <button type="button" class="btn btn-default" data-dismiss="modal">キャンセル</button>'
                        +'        <button type="submit" class="btn btn-danger" name="postData" '
                        +'         value="'+data+'" formaction="/fb/deletefb">削除</button>'
                        +'      </div>'
                        +'    </div>'
                        +'  <!-- /modal-content -->'
                        +'  </div>'
                        +'<!-- /modal-dialog -->'
                        +'</div>'
                }
            }
        ]
    });

    // for user-page　table setting
    $('#targetTable4').DataTable({
        "ordering": false,
        "stateSave": true,
        "responsive": true,
        "processing": true,
        "serverSide": true,
        ajax: {
            url: './admin/list',
            type: 'POST',
            dataType: 'json',
            data: {
                "_csrf": $(':hidden[name="_csrf"]').val()
            }
        },
        "columns": [
            {"data": "userid"},
            {
                "data": "group.0",
                "render": function ( data, type, full ) {
                    if(data === 'user'){
                        return '<td>On</td>'
                    }else{
                        return '<td>Off</td>'
                    }
                }
            },
            {
                "data": "group.1",
                "render": function ( data, type, full ) {
                    if(data === 'maint'){
                        return '<td>On</td>'
                    }else{
                        return '<td>Off</td>'
                    }
                }
            },
            {
                "data": "group.2",
                "render": function ( data, type, full ) {
                    if(data === 'admin'){
                        return '<td>On</td>'
                    }else{
                        return '<td>Off</td>'
                    }
                }
            },
            {
                "data": "userid",
                "render": function ( data, type, full ) {
                    console.log(data);
                    return '<button type="submit" class="btn btn-outline btn-warning btn-sm"'
                        +'value='+data+' name="postData" formaction="/admin/modify">'
                        +' 編集</button>'
                        +'<button type="button" class="btn btn-outline btn-danger btn-sm" data-toggle="modal"'
                        +' data-target="#myModal'+data+'">'
                        +'  削除'
                        +'</button>'
                        +'<!-- Modal -->'
                        +'<div class="modal fade" id="myModal'+data+'" tabindex="-1" role="dialog"'
                        +' aria-labelledby="myModalLabel" aria-hidden="true">'
                        +'  <div class="modal-dialog">'
                        +'    <div class="modal-content">'
                        +'      <div class="modal-header">'
                        +'        <button type="button" class="close" data-dismiss="modal"'
                        +'         aria-hidden="true">&times;</button>'
                        +'        <h4 class="modal-title" id="myModalLabel">警告</h4>'
                        +'      </div>'
                        +'      <div class="modal-body">'
                        +'        一度削除されたデータはシステムで復元する事は出来ません</br>'
                        +'        削除前のデータへ復元が必要な場合は事前にエクスポートを行いましょう</br>'
                        +'        本当に削除しますか？'
                        +'      </div>'
                        +'      <div class="modal-footer">'
                        +'        <button type="button" class="btn btn-default" data-dismiss="modal">キャンセル</button>'
                        +'        <button type="submit" class="btn btn-danger" name="postData" '
                        +'         value="'+data+'" formaction="/admin/delete">削除</button>'
                        +'      </div>'
                        +'    </div>'
                        +'  <!-- /modal-content -->'
                        +'  </div>'
                        +'<!-- /modal-dialog -->'
                        +'</div>'
                }
            }
        ]
    });

    // deal with Firefox and IE responsive design
    $('th').css('width','');
    //If the tab page is used, the table width will not be resized properly 
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        //When tab is clicked, resize table with
        $('th').css('width','');
    });
    // Redraw table(load)
    $('#targetTable').css('display', 'block');
    $('#targetTable2').css('display', 'block');
    $('#targetTable3').css('display', 'block');
    $('#targetTable4').css('display', 'block');
});