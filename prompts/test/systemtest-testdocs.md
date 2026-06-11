# E2E試験項目書作成/テスト実行プロンプト

## 目的

既存の Playwright E2E テストコードを分析し、試験項目書を生成したうえで E2E テストを実行し、結果を試験項目書へ反映する

---

## ステップ概要

1. **Playwright テストコード確認** — `frontend\tests\e2e\` 配下の既存 `.spec.ts` を確認する
2. **試験項目書作成** — テストコードを正本として Markdown の試験項目書を生成する
3. **試験実施** — Playwright を実行する
4. **結果反映** — 実行結果を試験項目書の結果・備考へ反映する

## 1. 最初に読む参照ファイル

以下のファイルを優先順位順に解釈すること。

### 1.1 実装・試験ルール

- #file:docs\rules\development\test-rule.md
- #file:docs\rules\development\frontend-rule.md
- #file:docs\rules\common\error-rule.md
- #file:docs\rules\common\naming-rule.md
- #file:AGENTS.md

### 1.2 画面・設計資料

- #file:docs\external-design\product\screen-design.md
- #file:docs\external-design\product\interface-design.md
- #file:docs\external-design\product\api-catalog.md
- #file:docs\test-spec.md

### 1.3 E2E テストコード・設定

- #file:frontend\playwright.config.ts
- #file:frontend\tests\e2e\login.spec.ts
- #file:frontend\tests\e2e\top.spec.ts
- #file:frontend\tests\e2e\dividend-notice.spec.ts
- #file:frontend\tests\e2e\my-page.spec.ts
- #file:frontend\tests\e2e\smoke.spec.ts

## 2. ステップ 1 — Playwright テストコード確認

### 確認手順

- `frontend\tests\e2e\` 配下の `.spec.ts` を対象とする
- `support\` 配下は補助コードとして扱い、試験項目の母集団には含めない
- `test.describe()` を画面または機能単位のセクションとして扱う
- `test()` を 1 試験項目として扱う
- `test.step()` が存在する場合は、試験手順へそのまま反映する
- `test.step()` が存在しない場合は、テスト本体の操作を時系列で要約して試験手順へ変換する
- `expect()` と URL 遷移確認をもとに、期待結果と判定基準を自然言語へ変換する
- `mockAppApi`、`createErrorResponse`、テストデータ、画面遷移前提などの前提条件は備考欄へ転記する

## 3. ステップ 2 — 試験項目書の作成

### 出力先

`docs\tests\ST\items`

### フォーマット

```markdown
# 試験項目書

## ヘッダー情報

| 項目 | 内容 |
|------|------|
| 対象機能 | ログイン画面 / トップ画面 / 出資配当金お知らせ画面 / マイページ画面 |
| 試験種別 | E2Eテスト |
| 試験環境 | ステージング |
| 作成日 | {YYYY-MM-DD} |
| 作成者 | QAエンジニア（GitHub Copilot） |

---

## {describe 名}

| No | テストID | 試験区分 | 試験項目 | 試験手順 | 期待結果 | 判定基準 | 結果 | 備考 |
|----|----------|----------|----------|----------|----------|----------|------|------|
| 001 | TC-LOGIN-001 | 正常系 | 正しい認証情報でトップ画面へ遷移できる | 1. ログイン画面を表示する<br>2. 認証情報を入力してログインする | `/top` へ遷移し、トップ画面の見出しが表示される | URL が `/top` であり、トップ画面見出しが可視状態であること | OK | |
```

### カラム定義

- **No**：全体連番を 3 桁ゼロ埋めで採番する（001〜）
- **テストID**：画面 ID と試験番号から一意に採番する（例：`TC-LOGIN-001`, `TC-TOP-001`, `TC-DIVIDEND-001`, `TC-MYPAGE-001`）
- **試験区分**：`test()` 名の接頭辞や文言から `正常系 / 準正常系 / 異常系` を判定する
- **試験項目**：確認観点を 1 行で簡潔に表現する
- **試験手順**：手順番号付きで記載し、Markdown テーブル内では `<br>` 区切りを使用する
- **期待結果**：`expect()` や URL 検証の内容を自然言語で記載する
- **判定基準**：OK / NG を判断できる観測条件を明記する
- **結果**：試験実施前は空欄、実施後は `OK` または `NG` を記載する
- **備考**：API モック条件、テストデータ、前提画面、失敗原因などを記載する

### 生成ルール

1. `describe` 単位でセクションを分ける
2. テストコードに存在しない試験項目は追加しない
3. 1 つの `test()` から 1 行の試験項目を生成する
4. `test.step()` の文言は可能な限りそのまま試験手順へ使う
5. `saveEvidence()` は証跡取得処理として扱い、単独では試験手順にしない
6. `mockAppApi()` の差分設定がある場合は、備考欄へ API 応答条件を記載する
7. `toHaveURL()`、`toBeVisible()`、`toContainText()`、`toBeDisabled()`、`toHaveValue()` などの検証内容を期待結果と判定基準へ反映する

## 4. ステップ 3 — 試験実施

### 実行手順

以下のコマンドで Playwright を実行する

```bash
cd frontend
npm run test:e2e -- --project=chromium
```

### 実行時の補足

- `frontend/playwright.config.ts` の `baseURL` を使用する
- Playwright project は `chromium` で実行する
- ブラウザチャネル設定は `chrome` を前提とする

## 5. ステップ 4 — 結果反映

### 反映ルール

1. 各試験項目の結果列に `OK` または `NG` を記載する
2. テストが失敗した場合は、失敗した試験項目の備考欄へ原因を簡潔に記載する
3. テストが成功した場合は、既存の備考を維持しつつ失敗理由を追記しない
4. 実行対象外の項目は作成しない
5. 試験結果の反映後も、`No` と `テストID` の採番を崩さない

## 6. 注意事項

- 推測で画面仕様や試験観点を補完しない
- テストコードに存在しないケースは追加しない
- 個人情報は必要最小限のテストデータ表現に留める
- 既存のテストコードを変更せず、試験項目書作成と結果反映を優先する
- `【要記入】` のようなプレースホルダは最終成果物に残さない
- 実行に失敗した場合は、その事実を試験項目書へ反映し、原因を備考欄へ記載する
