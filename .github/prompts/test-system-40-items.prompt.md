---
name: test-system-40-items
description: "Playwrightテストコードを分析してシステムテスト項目書（Markdown）を生成する。ST-02のテストコード生成後に実施する。"
---

# システムテスト項目書 作成プロンプト

## 目的

既存の Playwright E2E テストコードを分析し、システムテスト項目書を生成する

## ステップ概要

1. **Playwright テストコード確認** — `frontend\tests\e2e\` 配下の既存 `.spec.ts` を確認する
2. **システムテスト項目書作成** — テストコードを正本として Markdown のシステムテスト項目書を生成する

## 1. 最初に読む参照ファイル

以下のファイルを優先順位順に解釈する

### 1.1 実装・テストルール

- #file:docs\rules\development\test-rule.md
- #file:docs\rules\development\frontend-rule.md
- #file:docs\rules\common\error-rule.md
- #file:docs\rules\common\naming-rule.md
- #file:AGENTS.md

### 1.2 画面・設計資料

- #file:docs\external-design\product\screen-design.md
- #file:docs\external-design\product\interface-design.md
- #file:docs\external-design\product\api-catalog.md

### 1.3 E2E テストコード・設定

- #file:frontend\playwright.config.ts
- #file:frontend\tests\e2e\login.spec.ts
- #file:frontend\tests\e2e\top.spec.ts
- #file:frontend\tests\e2e\dividend-notice.spec.ts
- #file:frontend\tests\e2e\my-page.spec.ts
- #file:frontend\tests\e2e\smoke.spec.ts

## 2. テストコード確認

- `frontend\tests\e2e\` 配下の `.spec.ts` を対象とする
- `support\` 配下は補助コードとして扱い、テスト項目の母集団には含めない
- `test.describe()` を画面または機能単位のセクションとして扱う
- `test()` を 1 テスト項目として扱う
- `test.step()` が存在する場合は、テスト手順へそのまま反映する
- `test.step()` が存在しない場合は、テスト本体の操作を時系列で要約してテスト手順へ変換する
- `expect()` と URL 遷移確認をもとに、期待結果と判定基準を自然言語へ変換する
- `mockAppApi`、`createErrorResponse`、テストデータ、画面遷移前提などの前提条件は備考欄へ転記する

## 3. テスト項目書の作成

### 出力先

`docs\tests\system-test\items`

### フォーマット

```markdown
# テスト項目書

## ヘッダー情報

| 項目 | 内容 |
|------|------|
| 対象機能 | ログイン画面 / トップ画面 / 出資配当金お知らせ画面 / マイページ画面 |
| テスト種別 | システムテスト |
| テスト環境 | ステージング |
| 作成日 | {YYYY-MM-DD} |
| 作成者 | QAエンジニア（GitHub Copilot） |

---

## {describe 名}

| No | テストID | テスト区分 | テスト項目 | テスト手順 | 期待結果 | 判定基準 | 結果 | 備考 |
|----|----------|----------|----------|----------|----------|----------|------|------|
| 001 | TC-LOGIN-001 | 正常系 | 正しい認証情報でトップ画面へ遷移できる | 1. ログイン画面を表示する<br>2. 認証情報を入力してログインする | `/top` へ遷移し、トップ画面の見出しが表示される | URL が `/top` であり、トップ画面見出しが可視状態である | （空欄） | |
```

### カラム定義

- **No**：全体連番を 3 桁ゼロ埋めで採番する（001〜）
- **テストID**：画面 ID とテスト番号から一意に採番する（例：`TC-LOGIN-001`, `TC-TOP-001`, `TC-DIVIDEND-001`, `TC-MYPAGE-001`）
- **テスト区分**：`test()` 名の接頭辞や文言から `正常系 / 準正常系 / 異常系` を判定する
- **テスト項目**：確認観点を 1 行で簡潔に表現する
- **テスト手順**：手順番号付きで記載し、Markdown テーブル内では `<br>` 区切りを使用する
- **期待結果**：`expect()` や URL 検証の内容を自然言語で記載する
- **判定基準**：OK / NG を判断できる観測条件を明記する
- **結果**：テスト実施前は空欄のままにする
- **備考**：API モック条件、テストデータ、前提画面などを記載する

### 生成ルール

1. `describe` 単位でセクションを分ける
2. テストコードに存在しないテスト項目は追加しない
3. 1 つの `test()` から 1 行のテスト項目を生成する
4. `test.step()` の文言は可能な限りそのままテスト手順へ使う
5. `saveEvidence()` は証跡取得処理として扱い、単独ではテスト手順にしない
6. `mockAppApi()` の差分設定がある場合は、備考欄へ API 応答条件を記載する
7. `toHaveURL()`、`toBeVisible()`、`toContainText()`、`toBeDisabled()`、`toHaveValue()` などの検証内容を期待結果と判定基準へ反映する

## 4. 注意事項

- 推測で画面仕様やテスト観点を補完しない
- テストコードに存在しないケースは追加しない
- 個人情報は必要最小限のテストデータ表現に留める
- `【要記入】` のようなプレースホルダは最終成果物に残さない
