---
name: test-unit-frontend-run
description: "Vitest/RTLのテストコードを修正・補完し、テストを実施してカバレッジを出力する"
---

# フロントエンド単体テスト生成・実施プロンプト

## 目的

既存の Vitest / React Testing Library テストコードを修正・補完し、テストを実施して、カバレッジを証跡として出力する

## ステップ概要

1. **テストコード生成・修正** — 既存コードを分析し、不足テストを追加・修正する
2. **試験実施・カバレッジ出力** — Vitest を実行し、テスト一覧・カバレッジ・HTML を出力して確認する

## 1. 最初に読む参照ファイル

以下のファイルを読み、優先順位順に解釈する

### 1.1 実装・試験ルール

- #file:../../docs/rules/development/test-rule.md
- #file:../../docs/rules/development/frontend-rule.md
- #file:../../docs/rules/common/naming-rule.md
- #file:../../AGENTS.md

### 1.2 API 設計・画面設計

- #file:../../docs/external-design/product/screen-design.md
- #file:../../docs/external-design/product/api-catalog.md
- #file:../../docs/external-design/product/interface-design.md
- #file:../../docs/external-design/product/process-design/lgn-001-process-design.md
- #file:../../docs/external-design/product/process-design/lgn-002-process-design.md
- #file:../../docs/external-design/product/process-design/top-001-process-design.md
- #file:../../docs/external-design/product/process-design/div-001-process-design.md
- #file:../../docs/external-design/product/process-design/div-002-process-design.md
- #file:../../docs/external-design/product/process-design/myp-001-process-design.md

### 1.3 既存テストコード・セットアップ

- #file:../../frontend/tests/setup.ts
- #file:../../frontend/tests/App.test.tsx
- #file:../../frontend/tests/DividendNoticePage.test.tsx
- #file:../../frontend/tests/MyPage.test.tsx

### 1.4 MSW モック

- #file:../../frontend/src/mocks/server.ts
- #file:../../frontend/src/mocks/handlers.ts

## 2. ステップ 1 — テストコード生成・修正

### 指示

以下のルールに従い、`frontend/tests/` 配下の既存テストコードを修正・補完する

#### 実装ルール

- Vitest + React Testing Library を使用する
- `MemoryRouter` でルーティングをラップして各画面をテストする
- API モックには MSW（`server.use(...)`）を使用し、DB 直接操作は行わない
- ユーザ操作は `userEvent.setup()` を使用する
- `waitFor` で非同期完了を待機し、`sleep()` や固定時間待機は使わない
- `screen.getByRole` / `screen.getByLabelText` / `screen.getByText` を優先する

#### テスト観点（以下をすべてカバーする）

| 観点 | 内容 |
|------|------|
| 初期表示 | ページ遷移後に期待する要素が表示される |
| ユーザ操作 | ボタンクリック・フォーム入力・選択操作の動作が設計通りになっている |
| バリデーション | 不正入力時にエラーメッセージが表示される |
| 正常系 | API 成功時に期待するメッセージ・画面変化が起こる |
| 異常系 | API エラー時にエラーメッセージが表示される |
| 認証 | 未ログイン状態でログイン画面へリダイレクトされる |
| ローディング | リクエスト中にローディング表示が出る |

#### 対象画面（全 4 画面）

| 画面ID | ファイル | ルート |
|--------|---------|--------|
| LGN-001 | `tests/App.test.tsx` | `/` |
| TOP-001 | `tests/App.test.tsx` | `/top` |
| DIV-001/002 | `tests/DividendNoticePage.test.tsx` | `/dividend-notices/*` |
| MYP-001 | `tests/MyPage.test.tsx` | `/my-page` |

#### 出力先

- `frontend/tests/App.test.tsx`
- `frontend/tests/DividendNoticePage.test.tsx`
- `frontend/tests/MyPage.test.tsx`

## 3. ステップ 2 — 試験実施・カバレッジ出力

### 実施手順

まず、既存の `package.json` と `vite.config.ts` を確認し、定義済み script と設定に沿ってコマンドを実行する。

#### 3.1 テスト一覧の出力

テストケース一覧を以下で取得する。

```bash
cd frontend
npm run test -- --reporter=verbose
```

PowerShell の実行ポリシーで `npm` がブロックされる場合のみ、以下に切り替える。

```bash
cd frontend
npm.cmd run test -- --reporter=verbose
```

#### 3.2 カバレッジ出力

カバレッジを以下で出力する。

```bash
cd frontend
npm run test -- --reporter=verbose --coverage
```

#### 3.3 HTML 証跡

Vitest の coverage HTML を証跡として使用する。

- 出力先は `frontend/coverage/` 配下とし、`frontend/coverage/index.html` を確認する
- カバレッジの数値確認とあわせて HTML 出力の存在を確認する

### 結果の確認

1. `--reporter=verbose` の標準出力から、各テストケースの実行一覧を確認する
2. PASS / FAIL / SKIP の件数を簡潔に整理する
3. ターミナル出力と HTML からカバレッジ結果を確認する
4. HTML の出力先パスを明示する
5. FAIL のテストがある場合は、原因を簡潔に説明する

### 出力方針

- 証跡の第一優先は `npm run test -- --reporter=verbose --coverage` の実行結果と `frontend/coverage/index.html` とする
- テスト一覧は `--reporter=verbose` の標準出力で確認する
- カバレッジ数値と HTML の両方を確認対象に含める
- 不要なレポートファイル、設定ファイル、補助スクリプトは作成しない
- backend のテストや backend 用レポートは対象外とする

---

## 4. 注意事項

- 追加質問はせず、参照ファイルの優先順位に従って合理的な前提を置く
- 個人情報（氏名・住所）をテストデータとして過度に含めない
- 既存テストを削除しない（修正・追記のみ）
- backendのテストは実行しない（frontend のみ対象）
