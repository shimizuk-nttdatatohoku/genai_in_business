---
applyTo: "backend/**/*.py"
---
# バックエンド実装カスタムインストラクション

## 基本方針
- Python（型ヒント必須）・FastAPI・Mangumを使用し、AWS Lambda上で動作可能な構成とする
- 可読性・シンプルさ・AIエージェントが解釈しやすい構成を優先
- PoC向け最小構成を採用

## ディレクトリ責務
|ディレクトリ|責務|
|---|---|
|routers|API Endpoint（Request/Response制御のみ、業務ロジック・DBアクセス禁止）|
|services|業務ロジック（Router依存禁止、DBアクセスはRepository経由のみ、Response生成禁止）|
|repositories|DBアクセスのみ（業務ロジック・FastAPI依存禁止）|
|models|DB Model|
|schemas|Request/Response Schema（Pydantic、型定義省略禁止、分離）|
|common|共通処理|
|tests|試験コード（pytest、Router/Service単位で試験）|

## アーキテクチャ
Router → Service → Repository の三層構造を厳守

## FastAPI/Mangumルール
- APIRouter・async/await・ResponseModel・Dependency Injectionを利用
- Lambda Handlerはmain.pyに定義し、Mangum(app)を使用
- main.pyはFastAPI app生成・router/middleware登録・handler生成のみ

## ログ・例外・環境変数
- logger使用（print禁止、request_id出力、CloudWatch前提）
- 共通ExceptionHandler利用、stacktrace返却禁止、try-catch握り潰し禁止
- Secret/URL直書き禁止、os.getenv利用

## Lambda設計
- ステートレス設計、ローカルファイル保存・永続メモリ・セッション保持禁止

## requirements.txt
- 必要最小限のライブラリのみ追加、未使用ライブラリ禁止


## 命名規則

### 基本方針

- 可読性を優先する
- 略語を乱用しない（一般的なもののみ許可）
- 同一概念には同一名称を使用する
- 設計書と実装で名称を統一する
- 予約語や意味不明な短縮は使用禁止

### 共通ルール

|対象|ルール|
|---|---|
|単語区切り|英単語を使用|
|略語|一般的なもののみ許可|
|予約語|使用禁止|
|意味不明な短縮|禁止|

### Python

|対象|ルール|例|
|---|---|---|
|ファイル名|snake_case|user_service.py|
|クラス名|PascalCase|UserService|
|関数名|snake_case|get_user|
|定数|UPPER_SNAKE_CASE|MAX_RETRY_COUNT|

### API

|対象|ルール|例|
|---|---|---|
|URL|小文字・複数形・名詞ベース|/api/v1/users|

### DB

|対象|ルール|例|
|---|---|---|
|コレクション名|snake_case・複数形|users, order_items|
|項目名|snake_case|user_name, created_at|
|日時項目|`_at` サフィックス|created_at, updated_at|
|ID項目|`_id` サフィックス|user_id, order_id|

### テスト

- テスト名は日本語で記載し、正常系/異常系を明示する
	- 例: 正常系_ログイン成功、異常系_パスワード未入力

### 禁止事項

- 意味不明な略語
- 同義語混在
- 命名ルール違反
- DB/API/画面で異なる名称使用

## 禁止事項
- Routerで業務ロジック実装・DBアクセス
- Repositoryで業務ロジック
- printデバッグ・グローバル状態依存・localhost固定・URLハードコード
- 巨大関数・不要な抽象化/ライブラリ追加・FastAPI以外のFramework追加
- Lambda常駐前提コード
