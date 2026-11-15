# トワノソラ 開発メモの導入

1. `devlog` フォルダを丸ごと `~/Projects/soratowano/` にコピーします。
2. 親サイトの `index.html` に開発メモへのリンクを追加します（下記）。
3. `cd ~/Projects/soratowano && python3 -m http.server 8000` を実行し `http://localhost:8000/devlog/` で表示を確認します。
4. 問題がなければ GitHub にコミット・pushします。

## 親サイトへのリンク

一番簡単で安全なのは、親サイトの `index.html` の「ツール一覧」セクションの `</section>` の直後に下記を追加する方法です。

```html
<section class="retro-window compact-window" id="devlog-link">
  <div class="panel-title">
    <span>📓 開発メモ</span>
    <span class="panel-decoration" aria-hidden="true">×</span>
  </div>
  <div class="panel-content">
    <p>ツールごとの更新履歴や、今後の課題をまとめています。</p>
    <a class="retro-button" href="./devlog/">開発メモを見る ➜</a>
  </div>
</section>
```

既存の親サイトのCSSで装飾されます。親サイトのJSには触れません。

## 開発メモの追記

`devlog/data.js` **だけを編集**します。

### 新しい日付の記録を追加

該当ツールの `logs: [ ... ]` の中に以下を1件追加します。

```js
{
  date: "2026-11-16",
  title: "画面表示を調整",
  body: "スマホでの見え方を確認し、余白を調整。\n次はアラームを確認する。"
},
```

表示順は日付の新しい順に自動で並び替えます。

### 課題の追加

該当ツールの `tasks: [ ... ]` の中に追加します。

```js
{ text: "次の機能を検討する", done: false },
```

完了したら `done: true` にします。

### 新しいツールを追加

`window.DEVLOG_DATA = [ ... ]` の配列にオブジェクトを1件追加します。タブやHTMLを増やす必要はありません。

```js
{
  id: "new-tool",   // 他のツールと重複しない英数字・ハイフン
  name: "新しいツール",
  icon: "🔧",
  status: "制作予定",
  description: "ツールの説明。",
  url: "",         // 公開したら "../new-tool/" などに変更
  tasks: [],
  logs: []
},
```

`data.js` はJavaScriptなので、クォート・カンマ・括弧を消さないよう注意してください。

## 運用メモ

- 編集はVS Codeで行い、公開はGitHub pushで反映します。Webページ上の検索・開閉操作は閲覧用で、入力内容を保存する機能ではありません。
- 新しいツールが増えても、ページのデザインやメニュー構成を変更せずに自動表示されます。
- 公開前に個人情報・業務の内部情報・秘密情報を書いていないかを確認してください。
- この開発メモは公開ページです。URLを知らない人も検索などで見つけられる可能性があります。
