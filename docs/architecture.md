# アーキテクチャ設計

## 概要

本ドキュメントは、要件定義書、機能一覧、および `docs/ED/product/` 配下の設計書を実現するためのシステムアーキテクチャを定義する。
前提は以下のとおりとする。

- 利用者は組合員のみであり、組合員コードとパスワードで認証する
- 画面はログイン、トップ、出資配当金お知らせ、マイページの 4 画面を提供する
- API は REST を採用し、JWT による認証を行う
- 永続化基盤は Amazon DynamoDB とし、既存の物理設計を優先して実装する
- AWS を用いた最小限のサーバレス構成とし、常時稼働サーバは持たない

## システム構成図（テキスト形式）

```text
[利用者ブラウザ]
        |
        | HTTPS
        v
[Amazon CloudFront]
   |                        \
   | 静的コンテンツ配信       \ API リクエスト転送
   v                         \
[Amazon S3]                  [Amazon API Gateway (HTTP API)]
                                 |
                                 | Lambda Proxy
                                 v
                         [AWS Lambda]
                         (Python 3.12 + FastAPI + Mangum)
                                 |
          +----------------------+-----------------------+
          |                      |                       |
          v                      v                       v
 [Amazon DynamoDB]      [AWS Secrets Manager]   [Amazon CloudWatch]
 (業務テーブル +         (JWT署名鍵、             (アプリログ、
  運用テーブル)           アプリ設定)               メトリクス、監視)
```

## ディレクトリ構成

```
project-root/
├── docs/           # 要件・設計ドキュメント
├── frontend/       # React (TypeScript) フロントエンド
├── backend/        # Python バックエンド
├── shared/         # 共通型定義
├── prompts/        # 生成AI用プロンプト
├── .copilot/       # GitHub Copilot 設定
└── .github/        # GitHub Actions ワークフロー
```

## 各コンポーネントの役割説明

### 1. フロントエンド

#### Amazon S3
- React アプリケーションのビルド成果物を配置する静的ホスティング先
- HTML、JavaScript、CSS、画像などの配信元となる
- オリジンアクセス制御を前提に、直接公開は避ける

#### Amazon CloudFront
- フロントエンド配信の CDN
- 静的ファイル配信の高速化と TLS 終端を担う
- `/api/*` を API Gateway にルーティングし、SPA と API を同一ドメイン配下で提供する
- キャッシュ制御により、静的アセットと API を分離して運用する

#### React + TypeScript フロントエンド
- 画面設計書にある 4 画面を SPA として実装する
- API Gateway 経由で REST API を呼び出す
- JWT はブラウザ保管時の安全性を重視し、HttpOnly Cookie またはメモリ保持を優先する
- クライアント側で入力チェック、ローディング表示、多重送信防止を実装する

### 2. API / アプリケーション層

#### Amazon API Gateway (HTTP API)
- 外部公開用の REST API エンドポイントを提供する
- Lambda Proxy 統合で FastAPI アプリケーションへリクエストを転送する
- CORS、タイムアウト、ステージ設定、アクセスログ出力を担う
- サーバレス構成として最小限でありながら、将来のカスタムドメイン運用にも対応しやすい

#### AWS Lambda
- FastAPI アプリケーションを実行するサーバレス実行基盤
- ログイン、ログアウト、組合員情報取得・更新、配当金一覧・詳細、受取方法取得・更新、お知らせ一覧取得を実装する
- 業務ルール、入力バリデーション、JWT 検証、DynamoDB との整合性制御を担当する
- 常時稼働サーバを持たず、最小限の運用負荷で要件を満たす

#### FastAPI + Mangum
- 既存方針どおり Python/FastAPI を API 実装の中心とする
- FastAPI で OpenAPI 生成、バリデーション、依存性注入を扱う
- Mangum により Lambda 上で ASGI アプリとして動作させる
- 画面/API/DB 設計との対応が明確で、機能追加時も保守しやすい

### 3. データ層

#### Amazon DynamoDB
- 業務データの永続化基盤
- `docs/ED/product/database_design.md` の物理設計を前提に以下の主要テーブルを配置する
  - `users`
  - `user_authentications`
  - `dividend_notices`
  - `dividend_infos`
  - `dividend_receipt_methods`
  - `bank_account_registrations`
- GSI を用いて、画面要件に必要な一覧取得と詳細取得を実現する
- 条件付き更新により `record_version` を使った楽観ロックを実現する

#### 運用用 DynamoDB テーブル
- API 設計の JWT 無効化とレート制限を満たすため、業務テーブルとは別に最小限の運用テーブルを追加する
- 追加候補は以下の 2 テーブルとする
  - `token_revocations`: ログアウト済み JWT の `jti` と有効期限を TTL 付きで保持する
  - `login_attempts`: 組合員コード単位の失敗回数とロック期限を TTL 付きで保持する
- これにより、Cognito を導入せずに設計書どおりの組合員コード認証とログアウト失効を実現する

### 4. セキュリティ / 運用補助

#### AWS Secrets Manager
- JWT 署名鍵、アプリケーション秘密値、外部連携用秘密値を保持する
- Lambda 環境変数への平文直書きを避ける

#### Amazon CloudWatch
- Lambda 実行ログ、API アクセスログ、メトリクス、アラームの集約先
- 認証失敗率、5xx、レイテンシ、スロットリングを監視対象とする
- 個人情報はログへ出力せず、必要な場合はマスキングして出力する

## データフロー

### 1. ログイン

1. 利用者が CloudFront 配下の React 画面へアクセスする
2. ログイン画面から `POST /api/v1/login` を呼び出す
3. API Gateway が Lambda 上の FastAPI にリクエストを転送する
4. FastAPI が `user_authentications` と `users` を参照して認証する
5. 認証成功時に JWT を発行し、必要に応じて `last_login_at` を更新する
6. フロントエンドは JWT を用いてトップ画面へ遷移する

### 2. トップ画面表示

1. フロントエンドが JWT 付きで `GET /api/v1/dividend/list` と `GET /api/v1/notice/list` を呼び出す
2. FastAPI が JWT を検証し、`token_revocations` に失効登録がないことを確認する
3. `dividend_infos`、`dividend_notices` を DynamoDB から取得する
4. レスポンスを返し、トップ画面にお知らせ一覧と配当情報一覧を表示する

### 3. 出資配当金お知らせ詳細表示・受取方法変更

1. フロントエンドが `GET /api/v1/dividend/{year}` を呼び出し、対象年度の詳細を取得する
2. FastAPI が `dividend_infos`、`dividend_receipt_methods`、必要に応じて `bank_account_registrations` を参照する
3. 利用者が受取方法を変更すると、`PUT /api/v1/dividend/method` を呼び出す
4. FastAPI が業務ルールを検証し、条件付き更新で `dividend_receipt_methods` と関連状態を更新する
5. 更新結果を返し、画面で完了メッセージを表示する

### 4. マイページ表示・更新

1. フロントエンドが `GET /api/v1/member` を呼び出し、組合員情報を取得する
2. FastAPI が `users`、必要に応じて `bank_account_registrations` を参照する
3. 返却時は API 設計に従い、表示対象の個人情報を必要な範囲でマスキングする
4. 利用者が編集後、`PUT /api/v1/member` を呼び出す
5. FastAPI が入力値を検証し、`record_version` を用いた条件付き更新で `users` を更新する
6. 更新結果を返し、マイページを再表示する

### 5. ログアウト

1. フロントエンドが `POST /api/v1/logout` を呼び出す
2. FastAPI が JWT の `jti` と失効期限を `token_revocations` に登録する
3. 以降の認証必須 API では、署名検証に加えて失効テーブル照会を行う
4. フロントエンドはログイン画面へ遷移し、クライアント側トークンを破棄する

## 使用する技術スタックの推奨と理由

### フロントエンド

| 項目 | 推奨技術 | 理由 |
|---|---|---|
| UI実装 | React 18 + TypeScript | 要件と既存方針に一致し、画面単位の保守性が高い。 |
| ビルドツール | Vite | SPA の開発体験とビルド速度が良く、S3 配信との相性が良い。 |
| ルーティング | React Router | ログイン、トップ、詳細、マイページの画面遷移を素直に実装できる。 |
| API通信 | Fetch API または Axios | JWT 付き REST API 呼び出し、共通ヘッダ、エラー制御を実装しやすい。 |
| 状態管理 | TanStack Query + React Context | サーバ状態と認証状態を分離しやすく、過剰なグローバル状態管理を避けられる。 |
| バリデーション | Zod | API 入出力やフォームの型安全な検証がしやすい。 |
| スタイリング | Tailwind CSS | 画面数が少ない構成で実装速度と保守性のバランスが良い。 |

### バックエンド

| 項目 | 推奨技術 | 理由 |
|---|---|---|
| APIフレームワーク | FastAPI | Python での型安全な REST API 実装、バリデーション、OpenAPI 生成に強い。 |
| Lambda 実行連携 | Mangum | FastAPI を AWS Lambda へ最小構成で載せられる。 |
| 認証 | JWT（PyJWT など） | API 設計書の JWT 前提に一致し、組合員コード認証と両立しやすい。 |
| パスワードハッシュ | Passlib / bcrypt | パスワードの安全な保存と検証を実装できる。 |
| DynamoDBアクセス | boto3 | AWS 標準 SDK であり、Lambda との親和性が高い。 |
| 入力検証 | Pydantic | FastAPI と統合しやすく、リクエスト/レスポンス定義を一元管理できる。 |

### AWS インフラ

| 項目 | 推奨技術 | 理由 |
|---|---|---|
| フロント配信 | S3 + CloudFront | 最小限のサーバレス構成で SPA 配信を実現できる。 |
| API公開 | API Gateway HTTP API | REST エンドポイント公開の標準構成で、Lambda と低コストに連携できる。 |
| アプリ実行 | AWS Lambda | 常時サーバ不要で、業務負荷に応じたスケールが可能。 |
| データストア | Amazon DynamoDB | 設計書の前提に一致し、サーバレス構成と整合する。 |
| 秘密情報管理 | AWS Secrets Manager | JWT 署名鍵などの秘匿情報を安全に保持できる。 |
| 監視 | Amazon CloudWatch | 最小限の運用監視と障害調査に必要。 |

## 推奨アーキテクチャ方針

- 最小構成は `CloudFront + S3 + API Gateway + Lambda + DynamoDB + Secrets Manager + CloudWatch` とする
- 認証は業務要件どおり組合員コード + パスワード認証を FastAPI 側で実装する
- JWT 失効、ログイン失敗回数制御は DynamoDB の運用テーブルで補完する
- 業務データモデルは `docs/ED/product/database_design.md` に合わせ、テーブル分割方針を維持する
- Lambda は単一 API アプリとして開始し、将来の負荷や責務分離が必要になった時点で機能単位に分割する

## 補足

- `docs/api.yaml` は現時点で未記述のため、FastAPI から OpenAPI を自動生成し、設計書との差分管理に利用するのがよい
- 画面設計書の一部 API パス記述と API 設計書に差分があるため、実装時は API 設計書の `/api/v1/...` を正とし、画面設計書を同期することを推奨する
