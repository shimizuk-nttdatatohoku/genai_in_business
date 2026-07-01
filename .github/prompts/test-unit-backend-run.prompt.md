---
name: test-unit-backend-run
description: "pytestのテストコードを修正・補完し、テストを実施してカバレッジを出力する"
---

# バックエンド単体テスト生成・実施プロンプト

## 目的

既存の pytest コードを修正・補完し、テストを実施してカバレッジを出力する

## ステップ概要

1. **pytest コード生成・修正** — 既存コードを分析し、不足テストを追加・修正する
2. **試験実施・カバレッジ出力** — pytest を実行し、カバレッジを出力する

## 1. 最初に読む参照ファイル

以下のファイルを読み、優先順位順に解釈する

### 1.1 実装・試験ルール

- #file:docs/rules/development/test-rule.md
- #file:docs/rules/development/backend-rule.md
- #file:docs/rules/common/error-rule.md
- #file:docs/rules/common/naming-rule.md
- #file:AGENTS.md

### 1.2 API 設計・処理設計

- #file:docs/external-design/product/api-catalog.md
- #file:docs/external-design/product/interface-design.md
- #file:docs/external-design/product/process-design/lgn-001-process-design.md
- #file:docs/external-design/product/process-design/lgn-002-process-design.md
- #file:docs/external-design/product/process-design/top-001-process-design.md
- #file:docs/external-design/product/process-design/div-001-process-design.md
- #file:docs/external-design/product/process-design/div-002-process-design.md
- #file:docs/external-design/product/process-design/myp-001-process-design.md

### 1.3 既存テストコード

- #file:backend/tests/conftest.py
- #file:backend/tests/unit/test-auth-sessions.py
- #file:backend/tests/unit/test-dividend-notices.py
- #file:backend/tests/unit/test-health.py
- #file:backend/tests/unit/test-users.py

## 2. ステップ 1 — pytest コード生成・修正

### 指示

以下のルールに従い、`backend/tests/unit/` 配下の既存テストコードを修正・補完する

#### 実装ルール

- Router 単位でテストする（`FastAPI TestClient` を使用）
- AAAパターン（Arrange / Act / Assert）に従う
- `conftest.py` の fixture（`client`, `seeded_dynamodb`, `authenticated_client`）を活用する
- 外部 DB は `moto` でモック化する（`seeded_dynamodb` fixture 経由）
- 各テスト関数に Google スタイルの docstring を付ける
- レスポンスの標準形式（`success`, `data`, `errors`）と、実装済みエラーコードを検証する
- 入力エラーは現行の例外ハンドラ仕様に従い `400` を期待し、欠損時は `E_101`、形式不正時は `E_102` を優先して検証する

#### テスト観点（以下をすべてカバーする）

| 観点 | 内容 |
|------|------|
| 正常系 | 期待レスポンス・ステータスコード・ペイロードの検証 |
| 必須チェック | 必須フィールド欠損時に `400` / `E_101` が返る |
| 入力値バリデーション | 不正フォーマット・型違反で `400` / `E_102` が返る |
| 認証 | 保護対象 API で Cookie セッションなしの場合に `401` が返る |
| CSRF | 状態変更 API で CSRF トークンなしまたは不正時に `401` が返る |
| 異常系 | ID 指定 API では存在しないリソースに対して `404` が返る |

#### 観点の適用ルール

- 上記観点はエンドポイント特性に応じて適用し、すべての観点を全エンドポイントに機械的に適用しない
- `GET /health` には認証・CSRF・更新系の観点を適用しない
- `POST /api/v1/auth-sessions` には既存セッション前提の認証・CSRF観点を適用しない
- `DELETE` / `PUT` 系エンドポイントでは、正常系に加えて認証・CSRF・入力エラーを優先して補完する

#### 対象 API（8 エンドポイント全て）

| ID | エンドポイント |
|----|--------------|
| HC-001 | `GET /health` |
| IF-001 | `POST /api/v1/auth-sessions` |
| IF-002 | `DELETE /api/v1/auth-sessions/current` |
| IF-003 | `GET /api/v1/dividend-notices` |
| IF-004 | `GET /api/v1/dividend-notices/{noticeId}` |
| IF-005 | `PUT /api/v1/dividend-notices/{noticeId}/receipt-method` |
| IF-006 | `GET /api/v1/users/me` |
| IF-007 | `PUT /api/v1/users/me` |

#### テストコード出力先

- `backend/tests/unit/test_auth_sessions.py`
- `backend/tests/unit/test_dividend_notices.py`
- `backend/tests/unit/test_users.py`
- `backend/tests/unit/test_health.py`

---

## 3. ステップ 2 — 試験実施・カバレッジ出力

### 実施手順

以下のコマンドを実行する

```bash
cd backend
pytest tests/unit/ -v --tb=short --cov=app --cov-report=term-missing 2>&1
```

### 結果の確認

1. PASSED / FAILED / SKIPPED の件数をチャットに要約して表示する
2. カバレッジが **80% 未満** のモジュールを一覧表示する
3. FAILED のテストがある場合は、原因を簡潔に説明する

---

## 4. 注意事項

- 追加質問はせず、参照ファイルの優先順位に従って合理的な前提を置く
- 個人情報（氏名・住所・口座番号）をログや出力に含めない
- 既存テストを削除しない（修正・追記のみ）
