# Live2Dモーダルデモ

制作物セクションの「Live2D デモ」ボタンから、ペンギンのモデルをMudDialogで開きます。既存のWorkItemやCosmos DBのスキーマは変更せず、独立したデモカードとして追加しています。

## 操作と読み込み

- ドラッグ・タッチ操作で顔、体、視線を動かします。モデルにフォーカスすると矢印キーでも操作できます。
- リセットボタン、またはモデル上のHomeキーで正面に戻します。
- ×、Esc、背景クリックで閉じます。モデルの読込中でも閉じられます。
- モーダルを開いた時だけSDKとモデルを読み込みます。モデルの取得先はAzure Functionsで、Blobへ直接アクセスしません。
- 閉じる時には進行中のモデル通信、描画ループ、イベント、ResizeObserver、モデルとGPUリソースを解放します。共有のCoreスクリプトは再利用します。
- 読み込み失敗・WebGL非対応時は案内と再試行ボタンを表示します。タブが非表示の間は描画を止めます。
- 表情ボタン、表情切り替え、モーション再生は今回の対象外です。physics3.jsonがある場合は物理演算を適用します。動きを減らす設定では追従の補間と物理演算を抑えます。

## 設定

既存の名前付きHttpClient `functions` と `AzureFunctions:BaseUrl` を再利用します。既定のモデルパスは `live2d/penguin/1254.model3.json` です。現在のBaseUrlの末尾 `TestFromSite` は、既存の `GetPortfolioData` と同様に相対URL解決で置き換えられます。APIディレクトリ自体をBaseUrlにする場合は末尾を `/api/` としてください。

別モデルにする場合は、wwwroot/appsettings.json等に次を追加できます。

```json
"Live2D": {
  "ModelPath": "live2d/penguin/1254.model3.json"
}
```

モデルJSON内の相対参照を使って、`1254.moc3`、`1254.physics3.json`、`1254.2048/texture_00.png`等を取得します。表示用メタデータのcdi3.jsonは描画には不要なため取得しません。

別オリジンからFunctionsを利用する場合は、Function AppのCORSにサイトのオリジンを許可してください。新しい環境やローカルURLにも個別の許可が必要です。今回Azureの設定は変更していません。

## SDKとビルド

[公式Cubism Web Framework](https://github.com/Live2D/CubismWebFramework/tree/198a3769c26ca3d7b600e932590433badd392edd)のR5をコミット固定で使用しています。Coreは[公式配信](https://www.live2d.com/sdk/download/web/)のCubism 5.3用URL `https://cubism.live2d.com/sdk-web/core/06/live2dcubismcore.min.js` から読み込みます。そのため初回表示には公式配信元への接続が必要です。

自作の描画処理は `src/live2d/runtime.js`、Blazorとの接続は `Portfolio/wwwroot/js/live2d-demo.js` にあります。生成済みの `live2d-runtime.js` をコミットしているため、通常の.NETビルド・既存のデプロイ手順にNode.jsは不要です。描画処理やSDKを変更した場合はリポジトリルートで以下を実行し、生成物もコミットしてください。

```sh
npm ci --ignore-scripts
npm run build:live2d
npm run test:live2d
dotnet build Portfolio/Portfolio.csproj --configuration Release
```

SDKのシェーダーはビルド時に埋め込みます。これにより、シェーダーごとの追加通信やStatic Web Appsの拡張子別設定が不要になります。ビルドスクリプトは固定したSDKのローダーを照合し、SDK変更時に想定が変わった場合は失敗するようにしています。SDKの権利表記は `Portfolio/wwwroot/lib/live2d/LICENSE.md` に同梱しています。

## 検証結果

- 自動テスト7件成功：相対パス、他ディレクトリへの参照拒否、表示後の破棄、読込中の終了、再試行、DOM削除時の後始末、初期化前の終了。
- Releaseビルド成功。既存のWorkDetailDialogにContentStyleの非推奨警告があります（変更対象外）。
- 実モデルを使い、ブラウザで表示・ドラッグ・キーボード・リセット・Esc・閉じて開き直しを確認。
- 開発用中継で404を発生させ、案内表示から「もう一度読み込む」で復帰することを確認。
- 幅390px・高さ844pxで、モーダルとモデルが画面内に収まることを確認。実機のタッチ操作は未検証。
- ローカルのCORS制約を避けるため、画面検証はローカル中継経由で本番Functionsの資産を取得しました。公開サイトへのデプロイ後の動作確認は未実施です。
