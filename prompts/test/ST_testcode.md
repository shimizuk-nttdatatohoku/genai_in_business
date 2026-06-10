# 役割
あなたはPlaywrightに精通したエンジニアです。
以下の情報をもとに、E2Eテストコードを生成してください。

# 参照ドキュメント
- 画面設計書：
 #file:docs\ED\product\screen_design.md 
- 基本設計書：
 #file:docs\ED\product\sequence_diagram.md 
- 機能設計書：
#file:docs\ED\product\process-design\process-design 
- API設計
 #file:docs\ED\product\api_catalog.md 
 #file:docs\ED\product\interface_design.md 
- データベース設計
 #file:docs\ED\product\database_design.md 
 #file:docs\ED\product\er_diargram.md 
　
- 実装コード（対象画面）：
 #file:frontend\src\pages
- playwright.config.ts：
 #file:frontend\playwright.config.ts 
- 規約/ルール
 #file:docs\rules\development\test-rule.md
 #file:docs\rules\development\backend-rule.md
 #file:docs\rules\common\error-rule.md
 #file:docs\rules\common\naming-rule.md
 #file:AGENTS.md


# システム構成（固定）
- フロントエンド：React / TypeScript / Vite → CloudFront + S3
- バックエンド：FastAPI + Mangum → API Gateway + Lambda
- DB：DynamoDB
- テスト環境："https://d1nu1gd115mp6u.cloudfront.net"

# 生成ルール
1. 認証
   - データベース設計に基づき、ID/PWを作成する。
   　※データベースへのデータ投入は、生成したテストコードをもとに後ほど実施すため、テストに使用する値を直接コードに反映されること。

2. テストの構造
   - ページクラスは `tests/pages/` に配置する
   - テストファイルは `tests/e2e/` に配置する

3. アサーション
   - 各テストは1つの振る舞いを検証する（1テスト1アサーション原則）
   - 画面遷移後は `await page.waitForURL(...)` または `expect(page).toHaveURL(...)` で遷移完了を確認してからアサーションする
   - エラー表示の検証も含める

4. テストケースの網羅
   - 正常系（代表的な主フロー）
   - 準正常系（バリデーションエラー、権限エラー）
   - 異常系（APIエラー時のUI挙動）

5. コードスタイル
   - TypeScript で記述する
   - `test.step()` でステップを明記し、試験項目書との対応を取れるようにする
   - コメントは日本語で記載する

6. スクリーンショット
   - 入力画面、結果画面のスクリーンショットを取得し、証跡として残す
   - スクリーンショットは、"docs\tests\ST\evi"に格納する
   - スクリーンショットのファイル名は、画面設計書に記載された画面IDと紐づけること。

# 出力形式
- ページクラス（`tests/pages/【対象画面名】Page.ts`）
- テストファイル（`tests/e2e/【対象画面名】.spec.ts`）
- 各ファイルはコードブロックで出力する

# 制約
- `【要記入】` が残っている場合は生成を止めて確認を求めること
- 推測で実装せず、不明点は質問すること
```