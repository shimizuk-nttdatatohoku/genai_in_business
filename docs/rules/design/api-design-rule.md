# API設計ルール

# 基本方針

- REST APIとして設計する
- JSON形式を使用する
- 1 API は 1 つの目的だけを持つように責務を明確化する
- フロントエンドから利用しやすいIFを優先する
- AIエージェントが解釈しやすい単純構造とする

---

# URL設計

- 名詞ベースで設計する
- 複数形を使用する
- 小文字のみ使用する
- 階層を深くしすぎない

## OK

/api/v1/users

/api/v1/orders

---

## NG

/api/v1/getUsers

/api/v1/user_list

---

# HTTP Method

|Method|用途|
|---|---|
|GET|取得|
|POST|登録|
|PUT|更新|
|DELETE|削除|

---

# Request設計

- RequestBodyはJSON形式
- Optional項目を明示する
- 必須項目を明示する
- 型を明示する

---

# Response設計

- 共通レスポンス形式を使用する
- data配下に返却データを格納する
- エラー時はerrors配列を返却する

---

# 日時形式

- ISO8601形式を使用する

---

# エラー設計

- `docs/rules/common/error-rule.md` を参照する

---

# バリデーション

以下を定義する

- 必須
- 桁数
- 最大値
- 最小値
- 形式チェック

---

# 設計時注意事項

- Request/Responseを省略しない
- 型未定義を禁止する
- Optional有無を明示する
- エラー時動作を記載する
- 1 つの API で複数用途を兼ねる曖昧な責務にしない

---

# 禁止事項

- APIごとの独自レスポンス形式
- 動詞ベースURL
- Optional未記載
- 型未記載
- エラーコード未定義
- 「適切に処理する」「必要に応じて返却する」などの曖昧表現
