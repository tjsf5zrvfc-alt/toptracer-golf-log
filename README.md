# Toptracer Golf Log

Toptracer RangeのスクリーンショットをiPhone Safariからアップロードし、ブラウザ上のOCRでショットデータを読み取って記録する無料構成のWebアプリです。Version 1.2では、1回の練習を1つのセッションとして管理できます。

- フロントエンド: HTML / CSS / JavaScript
- OCR: Tesseract.js
- グラフ: Chart.js
- SMART GOLF連携: `GET https://portal.sma-gol.app/api/swing/latest_list`
- 保存先: Google Apps Script Web App + Googleスプレッドシート
- 公開: GitHub Pages
- ビルド: 不要

## Version 1.2の主な機能

- セッション管理: 日付、セッション名、練習テーマ、練習メモ、次回の課題を保存
- クラブ選択: Driver, 5W, 4U, 6I, 7I, 8I, 9I, PW, 50°, 56° のプルダウン
- クラブ別統計: 平均キャリー、最高キャリー、最低キャリー、10球平均
- 目標飛距離: クラブごとに設定し、目標との差と達成率を表示
- ショット評価: 🟢 ナイス / 🟡 普通 / 🔴 ミス をワンタップ記録
- 今日のまとめ: クラブ別平均、ベストショット、最高初速、平均左右ブレ、メモ、次回の課題
- スイングチェックリスト: ドライバー、アイアンのチェック項目を編集可能
- 本番データとサンプルデータを完全分離
- iPhone向けの大きめフォーム、ボタン、余白
- iPhoneのライト/ダークモードに自動対応
- SMART GOLF APIから最新ショットを同期
- TopTracer、SMART GOLF、手入力を同じデータモデルで統計化

## 使い方

1. `記録`画面で現在の練習セッションを確認します。
2. `変更`を押して、日付、セッション名、練習テーマ、練習メモ、次回の課題を入力します。
3. スクリーンショットを選ぶか、`手入力で記録`を押します。
4. `確認・修正`画面で、クラブ、キャリー、トータル、初速、打ち出し角、左右ブレ、評価を確認します。
5. `このセッションに保存`を押します。
6. `履歴`画面でセッション別、クラブ別に統計とグラフを確認します。
7. 練習終了時は`今日のまとめを見る`を押します。

OCRは画像の明るさ、文字サイズ、Toptracer側の画面変更で誤読します。このアプリは誤読する前提で作っているため、保存前に必ず確認・修正画面を挟みます。OCRできない場合も、手入力だけで保存できます。

## SMART GOLF同期

SMART GOLFの`portal.sma-gol.app`で利用されているBearer Token、または同じブラウザのログイン済みCookieセッションで、`GET /api/swing/latest_list`からショットデータを取り込めます。

1. `設定`画面を開きます。
2. `SMART GOLF`の`Bearer Token`にトークンを貼り付けます。
3. Cookie認証も使いたい場合は、同じSafariでSMART GOLFへログインしておきます。Cookie欄は控えとして保存できます。
4. `clubType変換`を必要に応じて編集します。
5. `SMART GOLF設定保存`を押します。
6. `記録`画面の`SMART GOLF同期`を押します。

同期ボタンは、まずBearer Tokenを試し、期限切れや無効な場合はCookieセッション認証を試します。ブラウザの安全仕様上、貼り付けたCookie文字列をJavaScriptから`Cookie`ヘッダーとして直接送信することはできません。そのため、Cookie認証は「同じブラウザでSMART GOLFへログイン済み」のセッションCookieを`credentials: include`で送る方式です。

Bearer Tokenが使えない場合は、SMART GOLFの`latest_list` API response JSONを手動で取り込めます。

1. `設定`画面を開きます。
2. `latest_list API response JSON`にJSON配列を貼り付けます。
3. または、`.json` / `.txt`ファイルを選択します。
4. `JSON確認`を押して、件数と代表データを確認します。
5. `確認したJSONを取り込む`を押します。

この方式ではBearer Tokenは不要です。貼り付け/ファイル読み込みでも、SMART GOLF API同期と同じ`SmartGolfImporter`で内部データへ変換します。重複防止として、`shotDateTime`、`carry`、`ballSpeed`が一致するショットは追加しません。

初期clubType変換:

- `1=Driver`
- `2=3W`
- `3=5W`
- `4=7W`
- `5=4U`
- `6=5U`
- `7=6I`
- `8=7I`
- `9=8I`
- `10=9I`
- `11=PW`
- `12=AW`
- `13=SW`

SMART GOLFから取得したJSONは内部データへ変換されます。

- `carryDist` -> `carry`
- `totalDist` -> `total`
- `runDist` -> `run`
- `clubSpeed` -> `clubSpeed`
- `ballSpeed` -> `ballSpeed`
- `smashFactor` -> `smashFactor`
- `launchAngle` -> `launchAngle`
- `sideAngle` -> `sideAngle`
- `backSpin` -> `backSpin`
- `sideSpin` -> `sideSpin`
- `clubPath` -> `clubPath`
- `faceAngle` -> `faceAngle`
- `apex` -> `apex`
- `landingAngle` -> `landingAngle`
- `impactAngleAtMoi` -> `impactAngle`
- `offPin` -> `offline`
- `swingDate` -> `date` / `shotDateTime`

重複防止として、`shotDateTime`、`carry`、`ballSpeed`が一致するショットは追加しません。SMART GOLF同期データは本番データとして保存されますが、履歴画面のデータソースフィルタで`すべて`、`TopTracer`、`SMART GOLF`、`手入力`を切り替えられます。

同期エラー表示:

- `401`: `Bearer Tokenが期限切れです。`
- `403`: `SMART GOLFへログインしてください。`
- 通信失敗: `同期できませんでした。`

ブラウザから直接SMART GOLF APIを呼ぶため、SMART GOLF側のCORS設定によっては同期できない場合があります。その場合は後述のプロキシ構成を検討してください。

## 本番データとサンプルデータ

`履歴`画面で`サンプル追加`を押すと、サンプル専用領域にデータが入ります。

- サンプルデータはGoogleスプレッドシートへ送信されません。
- サンプルデータは本番履歴へ混ざりません。
- サンプルデータは本番統計へ反映されません。
- `サンプル削除`でサンプルだけ一括削除できます。

## 目標飛距離の設定

1. `設定`画面を開きます。
2. クラブごとの目標キャリーを入力します。
3. `目標を保存`を押します。
4. 履歴のクラブ別統計に、現在平均、目標との差、達成率が表示されます。

## スイングチェックリスト

`設定`画面でチェックリストを編集できます。

初期値:

ドライバー
- 力まない
- 左手を絞る
- 右肩を引く
- トップで間を作る

アイアン
- 右手は下に落とす
- 左手は最短距離
- 左肩が開く前に入れ替える

## Googleスプレッドシート作成

1. Googleドライブを開きます。
2. `新規` -> `Googleスプレッドシート`を選びます。
3. ファイル名を`Toptracer Golf Log`などに変更します。
4. メニューの`拡張機能` -> `Apps Script`を開きます。

## Apps Script設定

1. Apps Scriptエディタで、最初からある`コード.gs`の中身を削除します。
2. このリポジトリの`gas/Code.gs`を開き、中身をすべてコピーして貼り付けます。
3. 保存します。
4. 関数選択で`setup`を選び、`実行`を押します。
5. 初回は権限確認が出るので、自分のGoogleアカウントで許可します。
6. `デプロイ` -> `新しいデプロイ`を押します。
7. 種類は`ウェブアプリ`を選びます。
8. 次のように設定します。
   - 説明: `Toptracer Golf Log`
   - 次のユーザーとして実行: `自分`
   - アクセスできるユーザー: `全員`
9. `デプロイ`を押します。
10. 表示された`ウェブアプリURL`をコピーします。
11. アプリの`設定`画面に貼り付けて`設定を保存`を押します。

Version 1.2では、Googleスプレッドシートに以下を保存します。

- セッション日付
- セッション名
- 練習テーマ
- 練習メモ
- 次回の課題
- クラブ
- 目標キャリー
- キャリー
- トータル
- ボール初速
- 打ち出し角
- 左右ブレ
- ショット評価
- ショットメモ
- データソース
- SMART GOLFのHS、ミート率、スピン、クラブパス、フェース角、最高到達点、着地角、オフライン、インパクト角

既存シートがある場合も、`setup`を実行すると不足している列が追加されます。

## GitHub Pages公開

1. GitHubでこのリポジトリを開きます。
2. `Settings` -> `Pages`を開きます。
3. `Build and deployment`の`Source`を`Deploy from a branch`にします。
4. `Branch`で`main`、フォルダで`/ (root)`を選んで保存します。
5. 数分待つと、同じ画面に公開URLが表示されます。
6. iPhone SafariでそのURLを開きます。

このアプリはビルド不要なので、GitHub Pagesではリポジトリ直下のファイルをそのまま配信できます。

## iPhoneホーム画面追加

1. iPhone SafariでGitHub Pagesの公開URLを開きます。
2. 画面下の共有ボタンを押します。
3. `ホーム画面に追加`を選びます。
4. 名前を確認して`追加`を押します。
5. ホーム画面のアイコンから起動できます。

## 注意

- Tesseract.jsとChart.jsはCDNから読み込みます。初回利用時はインターネット接続が必要です。
- Apps Scriptへの送信はブラウザ制約を避けるため`no-cors`で行います。アプリ側ではGoogle側の保存完了レスポンスを厳密には読めないため、保存後にスプレッドシートも確認してください。
- SMART GOLFのBearer TokenとCookie欄の内容はlocalStorageに保存します。共有端末では使わないでください。
- SMART GOLFのOAuthや公式開発者向け認可仕様は確認できていないため、GitHub Pages単体ではBearer Token方式を採用しています。
- 端末内保存は同じブラウザのlocalStorageを使います。Safariのサイトデータを削除すると消えます。
- 将来のラウンド管理、AI分析、AI練習メニュー提案、Apple Watch対応、複数枚OCR、Golfshot連携に備え、セッション、ショット、目標、チェックリストを分けて保存しています。

## SMART GOLFの再ログインを減らす案

OAuthや公式APIキー方式がSMART GOLFから提供されている場合は、それを使うのが最も安全です。公開仕様が確認できない場合、静的なGitHub Pagesだけでログインセッションを安全に再利用するのは難しいです。

現実的な代替案:

- Cloudflare Workersプロキシ: TokenをWorkers側のSecretに保存し、アプリはWorkersのURLだけを呼びます。
- Google Apps Scriptプロキシ: Apps ScriptのPropertiesServiceにTokenを保存し、`/api/swing/latest_list`をApps Script経由で取得します。
- 手動更新: Token期限切れ時だけ設定画面で貼り替えます。

本アプリのフロント側は`Importer`構成にしています。

- `TopTracerImporter`
- `SmartGolfImporter`
- `ManualImporter`

将来、SkyTrakやTrackManを追加する場合も、新しいImporterで内部ショット形式へ変換すれば統計・Google Sheets保存・今日のまとめを流用できます。
