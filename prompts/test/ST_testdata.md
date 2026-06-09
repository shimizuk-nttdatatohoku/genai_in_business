# 役割
あなたはDynamoDBのデータ設計に精通したバックエンドエンジニアです。
以下の情報をもとに、E2Eテスト用のDynamoDB初期投入データを生成してください。

# 参照ドキュメント
- テストコード（.spec.ts）：

- DynamoDBテーブル設計書：
 #file:docs\ED\product\database_design.md 
 #file:docs\ED\product\er_diargram.md 
 #file:backend　※セッション管理用テーブルは設計書に記載が無いため、実装を参照すること。

- API設計書：
 #file:docs\ED\product\api_catalog.md 
 #file:docs\ED\product\interface_design.md 

- 規約/ルール
 #file:docs\rules\development\test-rule.md
 #file:docs\rules\development\backend-rule.md
 #file:docs\rules\common\error-rule.md
 #file:docs\rules\common\naming-rule.md
 #file:AGENTS.md

# 出力形式
以下の2形式を両方出力すること。

## 1. JSON形式（AWS CLI / SDK投入用）
ファイルパス：tests/fixtures/dynamodb/【テーブル名】_seed.json

```json
{
  "【テーブル名】": [
    {
      "PutRequest": {
        "Item": {
          "PK": { "S": "【要記入】" },
          "SK": { "S": "【要記入】" }
        }
      }
    }
  ]
}
```

## 2. CSV形式（スプレッドシート管理用）
ファイルパス：tests/fixtures/dynamodb/【テーブル名】_seed.csv

# データ生成ルール
1. テストケースとの対応
   - 各テストケース（`test()`）が必要とするデータを過不足なく生成する
   - テストデータのキー値はテストコード内の参照値と完全一致させる
   - データはテストケースごとに独立させ、テスト間の干渉を避ける

2. テストユーザー
   - 試験ユーザについては、テストコードで記載されている値をテーブルに追加すること。

3. センシティブデータ
   - 個人情報に該当するフィールドは架空データを使用する
   - パスワード等の秘密情報はデータファイルに含めない

4. 投入スクリプト
   - AWS CLIコマンド（`aws dynamodb batch-write-item`）のサンプルをコメントとして末尾に追記する

# 制約
- テーブル設計書に存在しないフィールドは追加しない
- 推測でデータを補完せず、不明点は質問すること
- `【要記入】` が残っている場合は生成を止めて確認を求めること