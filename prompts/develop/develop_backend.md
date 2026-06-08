# バックエンド一括実装プロンプト


## 実装プロンプト

あなたはこのリポジトリのバックエンド実装担当です。React フロントエンドは先行実装済みであり、これから FastAPI + AWS Lambda(Mangum) + DynamoDB 前提のバックエンドを一括実装します。

目的は、`docs\RD` と `docs\ED` 配下の要件書・設計書に記載された業務要件、API 契約、画面遷移、データ設計、試験観点を満たすバックエンド実装を、`backend/` 配下に一度で出力することです。

不足情報があっても追加質問はせず、参照ファイルの優先順位に従って合理的な前提を置き、その前提を短く明示したうえで実装を完了してください。説明だけで終わらず、実際のコード、テスト、ローカル実行補助まで出力してください。

### 1. 最初に読む参照ファイル

以下のファイルを読み、優先順位順に解釈してください。

#### 1.1 要件・機能・画面
- #file:docs\RD\function-list.md
- #file:docs\ED\product\screen_design.md

#### 1.2 API 契約
- #file:docs\ED\product\interface_design.md
- #file:docs\ED\product\api_catalog.md

#### 1.3 業務フロー
- #file:docs\ED\product\process-design\LGN_001_process-design.md
- #file:docs\ED\product\process-design\LGN_002_process-design.md
- #file:docs\ED\product\process-design\TOP_001_process-design.md
- #file:docs\ED\product\process-design\DIV_001_process-design.md
- #file:docs\ED\product\process-design\DIV_002_process-design.md
- #file:docs\ED\product\process-design\MYP_001_process-design.md

#### 1.4 データ設計
- #file:docs\ED\product\database_design.md
- #file:docs\ED\product\er_diargram.md
- #file:docs\ED\product\sequence_diagram.md

#### 1.5 実装・試験ルール
- #file:docs\rules\development\backend-rule.md
- #file:docs\rules\development\serverless-rule.md
- #file:docs\rules\development\test-rule.md
- #file:docs\rules\common\error-rule.md
- #file:docs\rules\common\naming-rule.md
- #file:docs\rules\common\glossary.md
- #file:docs\rules\common\implementation-rule.md
- #file:AGENTS.md

#### 1.6 補助参照
- #file:docs\architecture.md
- #file:docs\requirements.md
- #file:docs\test-spec.md
- #file:shared\types\user.ts
- #file:backend\requirements.txt
- #file:backend\requirements-dev.txt

### 2. 参照ファイルの優先順位

仕様が競合した場合は次の優先順位で採用してください。

1. `docs/RD/function-list.md` の機能定義
2. `docs/ED/product/interface_design.md` と `docs/ED/product/api_catalog.md` の API 契約
3. `docs/ED/product/process-design/*.md` の業務フローとエラー条件
4. `docs/ED/product/screen_design.md` の画面イベント起点・表示要件
5. `docs/ED/product/database_design.md` の DynamoDB 設計
6. `docs/rules/**` と `AGENTS.md` の実装規約
7. `docs/architecture.md` と `docs/requirements.md` の補足要件

`docs/api.yaml` は補助参照に留め、正本として扱わないでください。

### 3. 今回の出力対象

今回一度で出力する対象は以下です。

- `backend/app/` 配下の FastAPI アプリ本体
- `backend/tests/` 配下の pytest 一式
- `frontend/`の修正は最低にし、バックエンドとの整合性を保つための最低限の実装
- ローカル開発用の DynamoDB 初期化補助
- 必要最小限の設定補助やサンプルデータ

対象外は以下です。

- `frontend/` 配下のフロンエンドのデザイン
- AWS デプロイ用インフラ定義の全面変更
- 要件書にない新規機能の追加
- 不要なライブラリの追加

### 4. 実装対象の機能

以下の 7 API をすべて実装してください。
- IF-001 ログイン `POST /api/v1/auth-sessions`
- IF-002 ログアウト `DELETE /api/v1/auth-sessions/current`
- IF-003 出資配当金お知らせ一覧取得 `GET /api/v1/dividend-notices`
- IF-004 出資配当金お知らせ詳細取得 `GET /api/v1/dividend-notices/{noticeId}`
- IF-005 配当金受取方法更新 `PUT /api/v1/dividend-notices/{noticeId}/receipt-method`
- IF-006 組合員情報取得 `GET /api/v1/users/me`
- IF-007 組合員情報更新 `PUT /api/v1/users/me`

下記の一覧に記載された機能をすべて実現してください。
 `docs/RD/function-list.md`


### 5. 実装順序

以下の順序で実装してください。既存コードが空に近いため、まず土台を整えてから機能実装へ進んでください。
/frontend に実装されているReactのフロンエンドコードと整合性を保ちながら進んでください。

1. `backend/app/main.py` とアプリ初期化
2. 共通モジュール
3. 認証・セッション・CSRF 基盤
4. schema 定義
5. repository 実装
6. service 実装
7. router 実装
8. DynamoDB 初期化補助とシードデータ
9. pytest 一式

### 6. 推奨ディレクトリ構成

既存ルールを尊重し、少なくとも以下のような構成にしてください。必要に応じて細分化して構いませんが、責務が曖昧にならないようにしてください。

- `backend/app/main.py`
- `backend/app/routers/`
- `backend/app/services/`
- `backend/app/repositories/`
- `backend/app/schemas/`
- `backend/app/models/`
- `backend/app/common/`
- `backend/tests/unit/`
- `backend/tests/integration/`
- `backend/tests/conftest.py`
- `backend/scripts/` または `backend/infra/` 配下のローカル DynamoDB 初期化補助




### 7. テスト要件

`docs/rules/development/test-rule.md` と `AGENTS.md` を満たすよう、pytest を実装してください。


### 8. DynamoDB 初期化補助

ローカル検証を可能にするため、以下も出力してください。

- 必要テーブル作成スクリプト
- セッション保存方式に応じた追加テーブルまたは属性定義
- 最小限の seed data
- receipt method master の初期データ
- ログイン確認用のテストユーザー
- dividend notice 一覧・詳細・更新確認用のテストデータ

### 9. 出力形式

出力は次の順序で行ってください。

1. 採用したセッション保存方式と前提条件の短い要約
2. 作成または更新するファイル一覧
3. 各ファイルのコード
4. テストコード
5. ローカル DynamoDB 初期化補助
6. 最後に、実装した内容と未確定事項を短く整理し、 /docs 内にマークダウン形式のファイルで出力する。


コードを途中で省略しないでください。`TODO` や `後で実装` を残さず、実行可能な最小完全形を出してください。


### 10. 完了条件

以下をすべて満たしたら完了です。

- IF-001 から IF-007 まで 7 本すべてが実装されている
- `backend/app/` 配下に FastAPI + Mangum の実装が揃っている
- `backend/tests/` 配下に pytest が揃っている
- ローカル DynamoDB 初期化補助がある
- セッション、CSRF、認証、認可、共通エラー、ログ、PII マスキングが反映されている
- 設計書差分に対する採用前提が明示されている
- 実装がこのリポジトリのルールに整合している

この条件を満たすコードを、一度の出力で完了させてください。
