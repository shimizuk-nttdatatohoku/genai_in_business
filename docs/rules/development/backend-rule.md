# Backend実装ルール

# 基本方針

- Pythonを使用する
- FastAPIを使用する
- Mangumを使用してAWS Lambdaへデプロイする
- AWS Lambda上で動作可能な構成とする
- 可読性を優先する
- シンプルな構成を優先する
- AIエージェントが解釈しやすい構成とする
- PoC向け最小構成を採用する

---

# 使用技術

|用途|技術|
|---|---|
|API Framework|FastAPI|
|Lambda Adapter|Mangum|
|Runtime|Python|
|Infrastructure|AWS SAM|
|Deploy|AWS Lambda + API Gateway|

---

# ディレクトリ構成

以下構成を標準とする。

```text
my-project/
├── template.yaml
├── src/
│   ├── main.py
│   ├── routers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── schemas/
│   ├── common/
│   └── requirements.txt
└── tests/
```

---

# 各ディレクトリ責務

|ディレクトリ|責務|
|---|---|
|routers|API Endpoint|
|services|業務ロジック|
|repositories|DBアクセス|
|models|DB Model|
|schemas|Request/Response Schema|
|common|共通処理|
|tests|試験コード|

---

# アーキテクチャ

以下構成を採用する。

Router
↓
Service
↓
Repository

---

# Routerルール

- APIRouterを使用する
- Request/Response制御のみ行う
- 業務ロジックを書かない
- DBアクセス禁止
- Pydantic Schemaを利用する

---

# Serviceルール

- 業務ロジックを実装する
- Router依存禁止
- DBアクセスはRepository経由のみ
- Response生成禁止

---

# Repositoryルール

- DBアクセスのみ行う
- 業務ロジック禁止
- FastAPI依存禁止

---

# Schemaルール

- Pydanticを使用する
- Request/Responseを分離する
- 型定義を省略しない

---

# FastAPIルール

- APIRouterを利用する
- async/awaitを使用する
- ResponseModelを定義する
- Dependency Injectionを利用する

---

# Mangumルール

- Lambda Handlerは main.py に定義する
- Mangum(app) を使用する

---

# main.py ルール

- FastAPI app生成のみ行う
- router登録を行う
- middleware登録を行う
- handler生成を行う

---

# ログ

- loggerを使用する
- print禁止
- request_idを出力する
- CloudWatch出力を前提とする

---

# 例外処理

- 共通ExceptionHandlerを使用する
- stacktrace返却禁止
- try-catch握り潰し禁止

---

# 環境変数

- Secret直書き禁止
- URL直書き禁止
- os.getenv を使用する

---

# Lambda設計

- ステートレス設計とする
- ローカルファイル保存禁止
- 永続メモリ依存禁止
- セッション保持禁止

---

# requirements.txt

- 必要最小限のライブラリのみ追加する
- 未使用ライブラリ禁止

---

# テスト

- pytestを使用する
- Router単位で試験する
- Service単位で試験する

---

# 命名規則

|対象|ルール|
|---|---|
|ファイル名|snake_case|
|Class名|PascalCase|
|Function名|snake_case|

---

# 禁止事項

- Routerで業務ロジック実装
- RouterからDBアクセス
- Repositoryで業務ロジック
- printデバッグ
- グローバル状態依存
- localhost固定
- URLハードコード
- 巨大関数
- 不要な抽象化
- 不要なライブラリ追加
- FastAPI以外のFramework追加
- Lambda常駐前提コード
