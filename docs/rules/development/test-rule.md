# テスト実装ルール

# 基本方針

- 自動試験を前提とする
- Playwrightを使用する
- pytestを使用する
- AIエージェントが解釈しやすい単純構造とする

---

# テスト分類

|種類|内容|
|---|---|
|UnitTest|単体試験|
|APITest|API試験|
|E2ETest|画面試験|

---

# Frontend Unit Test

- Vitestを使用する
- React Testing Libraryを使用する
- すべての UI コンポーネントにテストを作成する
- 実装詳細ではなく、ユーザー操作と画面結果を基準にテストを書く
- screen、fireEvent、userEventを活用する
- ユーザ向けメッセージや画面表示を検証する
- console確認やstacktrace出力に依存しない

---

# Backend Unit Test

- pytestを使用する
- Router単位で試験する
- Service単位で試験する
- AAAパターンを使用する
- fixtureを利用する

---

# テスト観点

以下観点を考慮する

- 正常系
- 必須チェック
- 境界値
- 異常系
- 認証
- 認可
- XSS
- CSRF

---

# Playwright

- PageObjectModelを使用する
- locator直書きを最小化する
- `sleep()` や固定時間待機に依存せず、表示条件や完了条件を待機する

---

# モック

- 外部APIはモック化する
- DB直接更新を避ける
- フロントエンドの API モックには MSW を使用する

---

# Backend Integration Test

- ローカル DynamoDB を使用した API エンドポイントテストを行う

---

# テストデータ

- テスト間依存禁止
- ハードコード最小化
- `docs/rules/common/implementation-rule.md` を参照する

---

# エラー確認

- HTTP Status確認
- ErrorCode確認
- エラーメッセージ確認

---

# 禁止事項

- `sleep()` や固定ミリ秒待機でテストを成立させること
- テスト順依存
- console確認前提
- テスト間状態共有
