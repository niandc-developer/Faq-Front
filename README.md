# Faq-Front (NI+C FAQ Web Application)
## システム図
![1](/manual/img/system/system.jpg)

## Faq-Frontの操作マニュアル
[マニュアルページ](/manual/README.md)

## 開発構築手順
  0. IBM Cloudのアカウントを取得し、IBM Cloud CLIをインストールする
  1. NI+C Fap-Apiと通信するためのAPI-KEYを決める
  2. NI+C Fap-Apiをデプロイし、Node-redにAPI-KEYを設定する
  3. NI+C Faq-Frontをローカルへダウンロードする
  4. ```config/dev-ng.json```、```manifest/dev/manifest-dev-ng.yml```を修正する
  5. IBM Cloud CLIを使い、本アプリケーションをIBM Cloudにデプロイする

### IBM Cloudのアカウントを取得し、IBM Cloud CLIをダウンロードする
  - IBM Cloudのアカウントを取得する
    - [LINK](https://www.ibm.com/cloud-computing/jp/ja/bluemix/lite-account/)
  - ICM Cloud CLIをインストールする
    - [LINK](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started)

### NI+C FAQ APIと通信するためのAPI-KEYを決める
  - 本アプリケーションとNI+C Faq-ApiはAPI-KEYを使い通信を行いますので、Faq-FrontとFaq-Apiに設定するAPI-KEYを事前に作成してください
    - API-KEYの制限は特にございません。第3者に特定しづらい任意の文字列を作成してください

### NI+C FAQ APIをデプロイし、Node-redにAPI-KEYを設定する
  - [https://github.com/niandc-developer/Faq-Api](https://github.com/niandc-developer/Faq-Api)

### NI+C Faq-Frontをローカルへダウンロードする
``` git clone https://github.com/niandc-developer/Faq-Front.git ```   
or
Download ZIP

### ```config/dev-ng.json```、```manifest/dev/manifest-dev-ng.yml```を修正する
  - ```manifest/dev/manifest-dev-ng.yml```をエディターで開く
  - 「manifest-dev-ng.yml」内に記載された「```<input_your_faqweb_name>```」を書換えます

```
applications:
- name: <input_your_faqweb_name>
  memory: 1G
  disk_quota: 2G
  host: <input your faqweb name>
  env:
   NODE_ENV: dev-ng
   HTTPS_ENABLE: on
```

  - ```config/dev-ng.json```をエディターで開く
  - 「dev-ng.json」内に記載された「```<input_your_apikey>```」と```「<input_your_node-red_url>```」を書換えます
    - 「```<input_your_apikey>```」は[Faq-Apiのフローエディタの設定](https://github.com/niandc-developer/Faq-Api#node-red%E3%83%95%E3%83%AD%E3%83%BC%E3%82%A8%E3%83%87%E3%82%A3%E3%82%BF%E3%81%AE%E8%A8%AD%E5%AE%9A)で設定したAPI-KEYを記載します
    - 「```<input_your_node-red_url>```」は[Faq-Apiのmanifest.yml の編集](https://github.com/niandc-developer/Faq-Api#manifestyml-%E3%81%AE%E7%B7%A8%E9%9B%86)で```host```に設定したアプリケーション名を記載します

```
{
  "api": {
    "apiKey": "<input_your_apikey>",
    "faqApi": "https://<input_your_node-red_url>.mybluemix.net/api/v1/faq",
    "feedApi": "https://<input_your_node-red_url>.mybluemix.net/api/v1/feedback",
    "checkApi": "https://<input_your_node-red_url>.mybluemix.net/api/v1/check",
    "faqdocApi": "https://<input_your_node-red_url>.mybluemix.net/api/v1/faqdoc",
    "fbApi": "https://<input_your_node-red_url>.mybluemix.net/api/v1/fbdoc",
    "trainApi": "https://<input_your_node-red_url>.mybluemix.net/api/v1/train",
    "adminApi": "https://<input_your_node-red_url>.mybluemix.net/api/v1/user",
    "loginApi": "https://<input_your_node-red_url>.mybluemix.net/api/v1/login",
    "analyticsApi": "https://<input_your_node-red_url>.mybluemix.net/api/v1/analytics"
  }
}
```

### IBM Cloud CLIを使い、本アプリケーションをIBM Cloudにデプロイする
  - 必要なファイルの編集が完了したら、実際にアプリケーションをデプロイします

```
> cd <ソースコードが配置されたディレクトリ>
> bx cf push -f "manifest\dev\manifest-dev-ng.yml"

'cf push -f manifest\dev\manifest-dev-ng.yml' を起動しています...

Using manifest file manifest\dev\manifest-dev-ng.yml

Creating app アプリケーション名 in org 組織名 / space スペース名 as メールアドレス...
OK

Creating route アプリケーション名.mybluemix.net...
OK

Binding アプリケーション名.mybluemix.net to アプリケーション名...
OK

Uploading アプリケーション名...

＜＜省略＞＞

requested state: started
instances: 1/1
usage: 1G x 1 instances
urls: アプリケーション名.mybluemix.net
last uploaded: Fri Mar 2 08:21:44 UTC 2018
stack: cflinuxfs2
buildpack: SDK for Node.js(TM) (ibm-node.js-6.12.3, buildpack-v3.18-20180206-1137)

     state     since                    cpu    memory    disk      details
#0   running   2018-03-02 05:23:19 PM   0.0%   0 of 1G   0 of 2G

```

  - 正常にデプロイが完了すると「requested state: started」と表示され、IBM cloudのダッシュボードにアプリケーションが表示されます
    - アプリケーションに接続し、正常に利用できる事を確認して下さい
    - ログインIDとパスワードはFaq-Apiの[manifest.yml の編集](https://github.com/niandc-developer/Faq-Api#manifestyml-%E3%81%AE%E7%B7%A8%E9%9B%86)で設定した、FAQ管理ユーザ名(FAQ_ADMIN_USERNAME)とパスワード(FAQ_ADMIN_PASSWORD)になります

## Built With
### UI
- [SB Admin2](https://github.com/BlackrockDigital/startbootstrap-sb-admin-2)
- [jQuery Validation Plugin](https://github.com/jquery-validation/jquery-validation)
- [jQuery Password Strength Meter for Twitter Bootstrap](https://github.com/ablanco/jquery.pwstrength.bootstrap)
- [DataTables](https://datatables.net/)
### node.js
- [body-parser](https://www.npmjs.com/package/body-parser)
- [compression](https://www.npmjs.com/package/compression)
- [config](https://www.npmjs.com/package/config)
- [cookie-parser(https://www.npmjs.com/package/cookie-parser)
- [cookie-session](https://www.npmjs.com/package/cookie-session)
- [csurf](https://www.npmjs.com/package/csurf)
- [debug](https://www.npmjs.com/package/debug)
- [ejs](https://www.npmjs.com/package/ejs)
- [encoding-japanese](https://www.npmjs.com/package/encoding-japanese)
- [express](https://www.npmjs.com/package/express)
- [express-fileupload](https://www.npmjs.com/package/express-fileupload)
- [express-session](https://www.npmjs.com/package/express-session)
- [helmet](https://www.npmjs.com/package/helmet)
- [jconv]ｌ(https://www.npmjs.com/package/jconv)
- [morgan](https://www.npmjs.com/package/morgan)
- [request](https://www.npmjs.com/package/request)
- [serve-favicon](https://www.npmjs.com/package/serve-favicon)
- [validator](https://www.npmjs.com/package/validator)

## Copyright

Copyright 2018 Nippon Information and Communication Corporation

## License

This sample code is licensed under Apache 2.0.
Full license text is available in [LICENSE](LICENSE).