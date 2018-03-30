# Tips
- 初期FAQデータ登録後、追加でFAQデータを登録したい
    - 追加登録したいFAQデータについては、「アップロード&学習」ページにて「初期FAQデータアップロード」からデータを追加登録頂く事が可能です
    - 「初期FAQデータアップロード」からアップロードされたデータは全てシステムに追加登録されるようになっています

- 既にシステムに登録されているFAQデータを入れ替える方法を教えてください
    - 「FAQデータ」ページにて「全データ削除」タブ配下にある「全データ削除」ボタンをクリック後、新規FAQデータを「初期FAQデータアップロード」からご登録下さい。新規FAQデータ入れ替え後、[「WatsonへFAQデータの登録方法」](../maintenance/faqRegist.md)・[「Watsonへ学習を実行」](../maintenance/faqLearning.md)を実施をお願い致します

- Watsonへ学習を行いたいのですが、数時間で終わる場合や1日かかる場合はなぜですか？
    - 学習時間の長さは、１つは学習データ量に比例します。QAデータとフィードバックデータが多い場合、学習に時間がかかります。ただし、少ないデータ量でも1日かかる場合がございます。Watsonは、学習データがアップロードされたことを自動で検知して学習を開始しますが、学習の開始タイミングはあくまでもWatson側の自動処理になっており、システム側では制御出来ない仕様となっています。そのため、少ないデータでも1日かかる可能性があります。