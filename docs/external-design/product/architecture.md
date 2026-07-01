# アーキテクチャ設計書

---

## ドキュメント情報

| 項目 | 内容 |
|------|------|
| プロジェクト名 | 組合員情報・配布金管理 Web アプリ |
| システム名 | 組合情報参照システム |
| バージョン | 1.0.0 |
| 作成日 | 2026-05-22 |
| 最終更新日 | 2026-05-22 |
| 作成者 | GitHub Copilot |
| ステータス | Draft |

---

## 改訂履歴

| バージョン | 更新日 | 更新者 | 更新内容 |
|-----------|--------|--------|----------|
| 1.0.0| 2026-05-22 | GitHub Copilot | 初版作成 |

---

## 1. 概要

本書は、組合員が自身の出資配当情報および組合員情報を参照・更新する Web システムのアーキテクチャを定義する。
要件定義書、機能一覧、API 設計書、DB 設計書、インタフェース設計書に整合しつつ、AWS を用いた最小限のサーバレス構成を採用する。

本システムでは、以下の要件を満たすことを主眼とする。

- 組合員コードとパスワードによる認証
- ログイン後のトップ画面、出資配当金お知らせ参照、配当金受取方法更新、マイページ更新
- 個人情報および口座情報を含む通信の暗号化
- ログ出力、監査追跡、セッション管理

---

## 2. システム構成

### 2.1 システム構成図

```text
[利用者ブラウザ]
      |
      | HTTPS
      v
[Amazon CloudFront]
      |                           \
      | 静的配信                    \ HTTPS /api/*
      v                             \
[Amazon S3]                         [Amazon API Gateway]
                                        |
                                        | Lambda Proxy
                                        v
                              [AWS Lambda (Python/FastAPI)]
                                        |
                     +------------------+------------------+
                     |                  |                  |
                     |                  |                  |
                     v                  v                  v
              [Amazon DynamoDB]   [AWS Secrets Manager] [Amazon CloudWatch]
                     |
                     |
                     v
      [users / dividend_notices / distributions / notice_reads /
       receipt_methods / auth_sessions]
```

### 2.2 採用方針

- フロントエンドは React + TypeScript の SPA とし、S3 に配置した静的ファイルを CloudFront から配信する
- バックエンドは Python + FastAPI を Lambda 上で動作させ、API Gateway 経由で REST API を提供する
- データストアは DynamoDB を採用し、業務テーブルと技術テーブルを分離する
- 認証は独自の組合員コード + パスワード認証とし、ログイン後は Cookie ベースのサーバーサイドセッションで管理する
- 最小構成を維持するため、常時稼働サーバーや RDB、コンテナ基盤は採用しない

---

## 3. 各コンポーネントの役割

### 3.1 クライアント層

| コンポーネント | 役割 |
|---|---|
| 利用者ブラウザ | 組合員がログイン、閲覧、更新を行う実行環境。セッション Cookie を保持し、API を呼び出す。 |
| React + TypeScript SPA | ログイン画面、トップ画面、出資配当金お知らせ画面、マイページ画面を提供する。API 応答に応じて画面描画と入力制御を行う。 |

### 3.2 配信層

| コンポーネント | 役割 |
|---|---|
| Amazon CloudFront | SPA の高速配信、TLS 終端、キャッシュ制御を担う。`/api/*` は API Gateway に転送し、それ以外は S3 オリジンから配信する。 |
| Amazon S3 | React アプリのビルド成果物を格納する。静的ホスティングのオリジンとして利用する。 |

### 3.3 API / アプリケーション層

| コンポーネント | 役割 |
|---|---|
| Amazon API Gateway | REST API の公開エンドポイント。リクエストルーティング、入力受け渡し、HTTP メソッド制御を行う。 |
| AWS Lambda | FastAPI アプリケーションの実行基盤。ログイン、ログアウト、お知らせ一覧取得、詳細取得、受取方法更新、組合員情報取得、組合員情報更新を処理する。 |
| FastAPI | API ルーティング、入力バリデーション、レスポンス整形、業務サービス呼び出しを行う。OpenAPI 生成にも対応する。 |

### 3.4 データ / セキュリティ / 運用層

| コンポーネント | 役割 |
|---|---|
| Amazon DynamoDB | 業務データとセッション情報を保持する。単純なアクセスパターンとサーバレス構成に適する。 |
| AWS Secrets Manager | アプリケーション秘密情報を保管する。パスワードハッシュ用ソルトやセッション署名鍵などの機微情報を管理する。 |
| Amazon CloudWatch | アプリケーションログ、メトリクス、エラー監視を提供する。`X-Request-Id` による追跡を行う。 |

---

## 4. データストア構成

### 4.1 業務テーブル

以下の業務テーブルは既存の DB 設計書に従う。

| テーブル名 | 用途 |
|---|---|
| users | 組合員基本情報、認証情報、通知方法、口座情報の保持 |
| dividend_notices | 出資配当金お知らせの公開情報の保持 |
| distributions | 組合員ごとの配当金額、受取状況、受取方法の保持 |
| notice_reads | お知らせ既読状態の保持 |
| receipt_methods | 受取方法候補のマスタ保持 |

### 4.2 技術テーブル

| テーブル名 | 用途 |
|---|---|
| auth_sessions | ログインセッション管理用。セッション ID、user_id、csrf_token、expire_at、last_accessed_at、invalidated_at を保持する。 |

`auth_sessions` はインタフェース設計書の Cookie ベースセッション要件とログアウト時の安全な無効化要件を満たすために追加する技術テーブルである。

### 4.3 テーブル設計方針

- DynamoDB はオンデマンド課金を基本とし、初期運用時のキャパシティ調整を不要にする。
- `auth_sessions` は TTL 属性を持たせ、期限切れセッションを自動削除する。
- `distributions` は条件付き更新により楽観ロックを行い、配当金受取方法更新の二重送信や競合更新に対応する。
- 個人情報を含む項目は暗号化 at rest を前提とする。

---

## 5. データフロー

### 5.1 ログイン

1. 利用者がログイン画面で組合員コードとパスワードを入力する。
2. SPA が `POST /api/v1/auth-sessions` を API Gateway 経由で呼び出す。
3. Lambda 上の FastAPI が `users` テーブルから組合員情報とパスワードハッシュを取得し、認証を行う。
4. 認証成功時に `auth_sessions` テーブルへセッション情報を登録する。
5. レスポンスで `Set-Cookie` によるセッション Cookie と CSRF トークンを返却する。
6. SPA はトップ画面へ遷移し、お知らせ一覧取得 API を呼び出す。

### 5.2 トップ画面表示

1. SPA が `GET /api/v1/dividend-notices` を呼び出す。
2. Lambda がセッション Cookie を検証し、`auth_sessions` から有効セッションを確認する。
3. `distributions`、`dividend_notices`、`notice_reads` を参照し、対象組合員向けのお知らせ一覧を構成する。
4. 一覧データを返却し、SPA がトップ画面を描画する。

### 5.3 出資配当金お知らせ詳細表示

1. SPA が `GET /api/v1/dividend-notices/{noticeId}` を呼び出す。
2. Lambda が本人チェック後、`dividend_notices`、`distributions`、`receipt_methods` を参照する。
3. 既読登録が必要な場合は `notice_reads` を更新する。
4. 詳細情報、受取方法候補、更新可否を返却する。

### 5.4 配当金受取方法更新

1. SPA が `PUT /api/v1/dividend-notices/{noticeId}/receipt-method` を `X-CSRF-Token` 付きで呼び出す。
2. Lambda がセッション、CSRF、本人性、受付期間、受取済状態を検証する。
3. `distributions` を条件付き更新し、更新後結果を返却する。
4. CloudWatch に監査ログを出力する。

### 5.5 マイページ表示・更新

1. SPA が `GET /api/v1/users/me` で組合員情報を取得する。
2. 利用者が住所や連絡先を変更し、`PUT /api/v1/users/me` を呼び出す。
3. Lambda がバリデーション後に `users` テーブルを更新する。
4. 更新結果を返却し、CloudWatch に監査ログを出力する。

### 5.6 ログアウト

1. SPA が `DELETE /api/v1/auth-sessions/current` を呼び出す。
2. Lambda が `auth_sessions` を無効化または削除する。
3. 失効済み Cookie を返却し、SPA はログイン画面へ遷移する。

---

## 6. 使用技術スタックの推奨と理由

### 6.1 フロントエンド

| 項目 | 採用技術 | 理由 |
|---|---|---|
| 言語 | TypeScript | 型安全により API 契約との整合を保ちやすい。共有型定義とも親和性が高い。 |
| UI | React | 要件定義に合致し、SPA として画面遷移やフォーム管理を実装しやすい。 |
| ビルドツール | Vite | 開発体験が軽量で、S3 配信向けの静的ビルド生成に適する。 |
| 状態管理 | React Query または SWR | API 中心の参照・更新処理と相性がよく、キャッシュ制御と再取得を簡潔に実装できる。 |
| フォーム | React Hook Form | ログイン、受取方法変更、組合員情報更新の入力管理とバリデーションに適する。 |

### 6.2 バックエンド

| 項目 | 採用技術 | 理由 |
|---|---|---|
| 言語 | Python 3.12 | プロジェクト方針に合致し、FastAPI と Lambda の組み合わせで高い生産性を確保できる。 |
| Web フレームワーク | FastAPI | Pydantic によるバリデーション、OpenAPI 生成、型安全な API 実装が可能。 |
| Lambda アダプタ | Mangum | FastAPI を API Gateway + Lambda 上で動作させるための実装がシンプル。 |
| パスワードハッシュ | passlib または bcrypt | パスワードを平文保持せず、安全に照合できる。 |

### 6.3 インフラ / 運用

| 項目 | 採用技術 | 理由 |
|---|---|---|
| フロント配信 | Amazon S3 + CloudFront | サーバレスで低運用負荷。SPA 配信に適する。 |
| API 公開 | Amazon API Gateway | Lambda との統合が容易で、REST API の入口として標準的。 |
| 実行基盤 | AWS Lambda | 常時稼働サーバー不要で、アクセス変動に応じたスケールが可能。 |
| データベース | Amazon DynamoDB | NoSQL 要件と整合し、サーバレス構成に適する。 |
| 秘密情報管理 | AWS Secrets Manager | セキュアな鍵管理とローテーション運用が可能。 |
| 監視 | Amazon CloudWatch | ログ集約、エラートラッキング、メトリクス監視を最小構成で実現できる。 |

---

## 7. 非機能・セキュリティ方針

- 通信はすべて HTTPS とし、CloudFront および API Gateway で TLS を終端する。
- セッション Cookie には `HttpOnly`、`Secure`、`SameSite=Lax` を付与する。
- 状態変更 API では `X-CSRF-Token` を必須とし、CSRF 対策を行う。
- パスワード、口座番号、生メールアドレスはログへ出力しない。
- CloudWatch ログには `X-Request-Id`、`endpoint`、`method`、`user_id` を記録し、追跡性を確保する。
- DynamoDB のテーブル暗号化、Secrets Manager、IAM 最小権限により情報保護を行う。
- CORS は同一オリジンのみ許可し、ブラウザキャッシュは `no-store` を基本とする。

---

## 8. 本アーキテクチャの採用理由

- 要件上の画面数と API 数が限定的であり、単一の SPA と単一の API アプリケーションで十分に責務分離できる。
- 業務データが NoSQL 前提で整理されているため、DynamoDB を中心に据えることで設計整合性が高い。
- ログイン、一覧取得、詳細取得、更新処理はいずれも API 駆動であり、Lambda によるイベント駆動実行と相性がよい。
- 小規模から開始でき、運用負荷とコストを抑えつつ、将来の API 分割や監視強化にも拡張しやすい。

---

## 9. 今後の設計・実装への引き継ぎ事項

- `auth_sessions` の物理設計を DB 設計書へ追記する。
- API 仕様書 `docs/api.yaml` をインタフェース設計書と整合する形で具体化する。
- Lambda デプロイ方式、IaC 方針、CloudFront の SPA ルーティング設定を別途インフラ設計で定義する。
- 監査ログ項目と保持期間を運用設計で明確化する。
