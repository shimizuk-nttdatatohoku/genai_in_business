# フロントエンド単体試験プロンプト

## 目的

既存の Vitest / React Testing Library テストコードを修正・補完し、試験項目書を生成し、試験を実施する。

---

## ステップ概要

1. **テストコード生成・修正** — 既存コードを分析し、不足テストを追加・修正する
2. **試験項目書作成** — テストコードから試験項目書（Markdown）を生成する
3. **試験実施** — Vitest を実行し、結果を試験項目書に反映する

---

## 1. 最初に読む参照ファイル

以下のファイルを読み、優先順位順に解釈してください。

### 1.1 実装・試験ルール
- #file:docs\rules\development\test-rule.md
- #file:docs\rules\development\frontend-rule.md
- #file:docs\rules\common\naming-rule.md
- #file:AGENTS.md

### 1.2 画面・API 設計
- #file:docs\ED\product\screen_design.md
- #file:docs\ED\product\api_catalog.md
- #file:docs\ED\product\interface_design.md
- #file:docs\ED\product\process-design\LGN_001_process-design.md
- #file:docs\ED\product\process-design\LGN_002_process-design.md
- #file:docs\ED\product\process-design\TOP_001_process-design.md
- #file:docs\ED\product\process-design\DIV_001_process-design.md
- #file:docs\ED\product\process-design\DIV_002_process-design.md
- #file:docs\ED\product\process-design\MYP_001_process-design.md

### 1.3 既存テストコード・セットアップ
- #file:frontend\tests\setup.ts
- #file:frontend\tests\App.test.tsx
- #file:frontend\tests\DividendNoticePage.test.tsx
- #file:frontend\tests\MyPage.test.tsx

### 1.4 MSW モック
- #file:frontend\src\mocks\server.ts
- #file:frontend\src\mocks\handlers.ts

---

## 2. ステップ 1 — テストコード生成・修正

### 指示

以下のルールに従い、`frontend/tests/` 配下の既存テストコードを修正・補完してください。

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
| 初期表示 | ページ遷移後に期待する要素が表示されること |
| ユーザ操作 | ボタンクリック・フォーム入力・選択操作の動作 |
| バリデーション | 不正入力時にエラーメッセージが表示されること |
| 正常系 | API 成功時に期待するメッセージ・画面変化が起こること |
| 異常系 | API エラー時にエラーメッセージが表示されること |
| 認証 | 未ログイン状態でログイン画面へリダイレクトされること |
| ローディング | リクエスト中にローディング表示が出ること |

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

---

## 3. ステップ 2 — 試験項目書の作成

### 指示

ステップ 1 で生成・修正したテストコードを分析し、以下の形式で試験項目書を生成してください。

#### 出力先
`docs/tests/UT/product/UT_frontend_items.md`

#### フォーマット

```markdown
# フロントエンド単体試験 試験項目書

## サマリー

| 項目 | 値 |
|------|----|
| 実施総数 | {N} |
| 成功 | {N} |
| 失敗 | {N} |
| 未実施 | {N} |

---

## 試験項目一覧

| No | 対象ファイル | describe | テスト名(it) | 試験観点 | 試験内容 | 期待結果 | ステータス |
|----|------------|---------|-------------|---------|---------|---------|-----------|
| 1 | App.test.tsx | App | renders the login form | 初期表示 | ログインページを表示する | ヘッダー・入力欄・ログインボタン（無効）が表示される | 未実施 |
| ... | | | | | | | |
```

#### ステータス値
- `未実施` — 試験実施前（デフォルト）
- `成功` — PASS
- `失敗` — FAIL
- `スキップ` — SKIP

---

## 4. ステップ 3 — 試験実施

### 指示

以下のコマンドを実行し、試験結果を試験項目書に反映してください。

```bash
cd frontend
npm run test -- --reporter=verbose 2>&1
```

#### 反映ルール
1. 各テストの結果（PASS / FAIL / SKIP）をステータス列に転記する
2. サマリーの実施総数・成功・失敗・未実施を集計して更新する
3. FAIL のテストがある場合はその原因を試験項目書の備考欄に記載する

---

## 5. 注意事項

- 追加質問はせず、参照ファイルの優先順位に従って合理的な前提を置くこと
- 個人情報（氏名・住所）をテストデータとして過度に含めないこと
- 既存テストを削除しないこと（修正・追記のみ）
- 試験項目書は必ずテストコード生成後に作成すること（コードが正本）
