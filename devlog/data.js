/*
 * 開発メモの編集場所はここだけです。
 * 新しいツールは projects 配列に1件追加。
 * 日付ごとの記録は、そのツールの logs に追加（新しい順に自動表示）。
 * 今後の課題は tasks に追加。
 * コード例は README.md にあります。
 */
window.DEVLOG_DATA = [
  {
    id: "interbarun", // URL内で使う固有の名前。後から変えないのがおすすめ
    name: "インターばるん",
    icon: "⏱️",
    status: "制作中",
    description: "運動時間と休憩時間を設定して繰り返せるインターバルタイマー。",
    url: "../timer/",
    tasks: [
      { text: "実際の運動中に使って、操作性を調整する", done: false },
      { text: "スマホでの音や画面表示を確認する", done: false }
    ],
    logs: [
      {
        date: "2026-11-15",
        title: "ツール名を「インターばるん」にして公開",
        body: "好きな音楽をかけながら使えるのが一番だなぁと思いつつひとまず公開、音声などまだ未確認ｽﾐﾏｾﾝ"
      }
    ]
  },
  {
    id: "reggie",
    name: "礼司（Reggie）",
    icon: "🛒",
    status: "公開中・制作中",
    description: "買い物中の合計金額と予算残額を確認するWebアプリ。",
    url: "https://reggieapp.com/",
    tasks: [
      { text: "ログインなしで利用できるように改修", done: false },
      { text: "有料サービスとして提供する機能の構築", done: false }
    ],
    logs: [
      {
        date: "2026-09-06",
        title: "ユーザーのログインが必要な状態で公開",
        body: "サブまの構成を流用して公開。地下のスーパーなど電波が届きにくい場所でも利用できるよう、IndexedDBを活用したオフライン対応を開発中。ログインなしで利用できる構成への変更も検討。"
      }
    ]
  },
  {
    id: "sign-dictionary",
    name: "手話単語動画辞典",
    icon: "🤟",
    status: "制作予定",
    description: "短い動画で手話の単語を確認できる辞典を構想中。",
    url: "", // 公開前は空欄
    tasks: [],
    logs: []
  }
];
