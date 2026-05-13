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
- 固定sleep禁止

---

# pytest

- AAAパターンを使用する
- fixtureを利用する

---

# モック

- 外部APIはモック化する
- DB直接更新を避ける

---

# テストデータ

- テスト間依存禁止
- ハードコード最小化

---

# エラー確認

- HTTP Status確認
- ErrorCode確認
- エラーメッセージ確認

---

# 禁止事項

- sleep固定待ち
- テスト順依存
- console確認前提
- localhost固定
- テスト間状態共有
