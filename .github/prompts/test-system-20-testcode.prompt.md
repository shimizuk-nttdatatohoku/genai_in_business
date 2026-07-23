---
name: test-system-20-testcode
description: "観点表・設計書をもとにPlaywrightのE2Eテストコードを生成する。ST-01の観点表作成後に実施する。"
---

# システムテスト テストコード生成プロンプト

## 役割

あなたはPlaywrightに精通したエンジニアです
以下の情報をもとに、システムテストコードを生成してください

## 参照ドキュメント

- テスト観点表：
  - #file:../../docs/tests/system-test/items/systemtest-testview.md
- 画面設計書：
  - #file:../../docs/external-design/product/screen-design.md
- 基本設計書：
  - #file:../../docs/external-design/product/sequence-diagram.md
- 機能設計書：
  - #file:../../docs/external-design/product/process-design/process-design
- API設計
  - #file:../../docs/external-design/product/api-catalog.md
  - #file:../../docs/external-design/product/interface-design.md
- データベース設計
  - #file:../../docs/external-design/product/database-design.md
  - #file:../../docs/external-design/product/er-diargram.md
- 実装コード（対象画面）：
  - #file:../../frontend/src/pages
- playwright.config.ts：
  - #file:../../frontend/playwright.config.ts
- 規約/ルール
  - #file:../../docs/rules/development/test-rule.md
  - #file:../../docs/rules/development/backend-rule.md
  - #file:../../docs/rules/common/error-rule.md
  - #file:../../docs/rules/common/naming-rule.md
  - #file:../../AGENTS.md

## システム構成（固定）

- フロントエンド：React / TypeScript / Vite → CloudFront + S3
- バックエンド：FastAPI + Mangum → API Gateway + Lambda
- DB：DynamoDB
- テスト環境：`https://d1nu1gd115mp6u.cloudfront.net`

## 生成ルール

1. テストの構造
   - ページクラスは `tests/pages/` に配置する
   - テストファイルは `tests/e2e/` に配置する

2. アサーション
   - 各テストは1つの振る舞いを検証する（1テスト1アサーション原則）
   - 画面遷移後は `await page.waitForURL(...)` または `expect(page).toHaveURL(...)` で遷移完了を確認してからアサーションする
   - エラー表示の検証も含める

3. テストケースの網羅
   - `docs/tests/system-test/items/systemtest-testview.md` のテスト観点表に記載されている観点を網羅する
   - 正常系（代表的な主フロー）
   - 準正常系（バリデーションエラー、権限エラー）
   - 異常系（APIエラー時のUI挙動）

4. コードスタイル
   - TypeScript で記述する
   - `test.step()` でステップを明記し、テスト項目書と対応が取れるようにする
   - コメントは日本語で記載する

5. スクリーンショット
   - 入力画面、結果画面のスクリーンショットを取得し、証跡として残す
   - スクリーンショットは、`docs/tests/system-test/evidence` に格納する
   - スクリーンショットのファイル名は、画面設計書に記載された画面IDと紐づける

6. 設定ファイル
   - `frontend/playwright.config.ts` の内容を適宜変更する
   - 使用するユーザについては、別工程で作成するため、機能にあった任意のID、passwordを設定する

## 出力形式

- ページクラス（`tests/pages/[対象画面名]Page.ts`）
- テストファイル（`tests/e2e/[対象画面名].spec.ts`）
- 各ファイルはコードブロックで出力する

## 制約

- `【要記入】` が残っている場合は生成を止めて確認を求める
- 推測で実装せず、不明点は質問する
