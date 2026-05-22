# DB設計書（物理設計）

## 0. 設計方針

- 物理設計は NoSQL 前提とし、DynamoDB 互換のテーブル設計として整理する。
- 論理 ER 図の 1 エンティティを 1 テーブルに対応させ、責務の混在を避ける。
- 主キーは全テーブルで `_id` を使用し、UUID を採番する。
- リレーションは `xxx_id` による論理参照で表現し、FK / UNIQUE / CHECK はアプリケーション制御および条件付き更新で担保する。
- 共通監査項目として `created_at`、`updated_at`、`created_by`、`updated_by`、`is_deleted` を持つ。
- 一覧・詳細・更新 API のアクセスパターンに合わせ、DynamoDB の GSI を前提にインデックスを設計する。
- `NULL` 前提設計は避け、未設定を許容する項目は属性未保持で扱う。

## 1. テーブル一覧

| テーブル名 | 論理名 | 種別 | 概要 |
|---|---|---|---|
| users | 組合員 | マスタ | 組合員の基本情報、認証情報、通知方法設定を保持する。 |
| dividend_notices | 出資配当金お知らせ | マスタ | トップ画面および詳細画面で参照する公開お知らせ情報を保持する。 |
| distributions | 出資配当情報 | トラン | 組合員ごとの年度別出資配当情報と受取状況を保持する。 |
| notice_reads | お知らせ既読情報 | トラン | 組合員ごとのお知らせ既読状態を保持する。 |
| receipt_methods | 配当金受取方法 | マスタ | 配当金受取方法の候補値を保持する。 |

## 2. テーブル定義

### 2.1 users

- 論理名：組合員
- 概要：組合員の基本属性、ログイン認証用ハッシュ、通知方法設定を保持する。
- 種別：マスタ
- 主キー（PK）：`_id`
- 外部キー（FK）：なし
- ユニーク制約：`user_code`（アプリケーション保証）
- インデックス（提案）：`gsi_user_code`、`gsi_email`（案）
- 備考：`notification_method` は単一の整数値を保持する。`0` は「通知しない」、`1` は「SMSで通知」を表す。`users` の更新競合制御が必要な場合は `version` 追加を要確認とする。

#### カラム定義

| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| _id | 組合員ID | string | 36 | N | Y |  |  | UUID | 主キー |
| user_code | 組合員コード | string | 20案 | N |  |  | Y |  | ログインおよび画面表示で使用する識別子 |
| password_hash | パスワードハッシュ | string | 255案 | N |  |  |  |  | 認証比較用ハッシュ |
| user_name | 組合員名 | string | 100案 | N |  |  |  |  | 氏名 |
| user_name_kana | 組合員名カナ | string | 100案 | N |  |  |  |  | フリガナ |
| birth_date | 生年月日 | string | 10 | N |  |  |  |  | ISO8601 日付文字列 |
| postal_code | 郵便番号 | string | 8 | N |  |  |  |  | ハイフン込み郵便番号 |
| address | 住所 | string | 255案 | N |  |  |  |  | 住所 |
| phone_number | 電話番号 | string | 20 | N |  |  |  |  | 連絡先電話番号 |
| email | メールアドレス | string | 254 | N |  |  |  |  | 連絡先メールアドレス |
| contribution_balance | 出資金残高 | decimal | 12,2案 | N |  |  |  | 0 | マイページ表示用の現時点残高 |
| bank_account_info | 口座情報 | string | 255案 | Y |  |  |  |  | 受取方法表示用の口座情報 |
| notification_method | 通知方法 | integer | 1 | N |  |  |  | 0 | 0: 通知しない, 1: SMSで通知 |
| created_at | 作成日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| updated_at | 更新日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| created_by | 作成者 | string | 36案 | N |  |  |  | system | 作成者識別子 |
| updated_by | 更新者 | string | 36案 | N |  |  |  | system | 更新者識別子 |
| is_deleted | 論理削除フラグ | boolean | 1 | N |  |  |  | false | 論理削除管理 |

#### サンプルデータ

```json
{
  "_id": "usr-6e6d2f83-0db6-43c9-b6af-55e26e8df801",
  "user_code": "U000001",
  "password_hash": "<hash>",
  "user_name": "山田 太郎",
  "user_name_kana": "ヤマダ タロウ",
  "birth_date": "1980-01-15",
  "postal_code": "100-0001",
  "address": "東京都千代田区...",
  "phone_number": "090-1234-5678",
  "email": "taro.yamada@example.jp",
  "contribution_balance": 250000.00,
  "bank_account_info": "みらい銀行 東京支店 普通 1234567",
  "notification_method": 1,
  "created_at": "2026-05-21T09:00:00Z",
  "updated_at": "2026-05-21T09:00:00Z",
  "created_by": "system",
  "updated_by": "system",
  "is_deleted": false
}
```

### 2.2 dividend_notices

- 論理名：出資配当金お知らせ
- 概要：トップ画面一覧と詳細画面ヘッダに必要な公開情報を保持する。
- 種別：マスタ
- 主キー（PK）：`_id`
- 外部キー（FK）：なし
- ユニーク制約：なし
- インデックス（提案）：`gsi_publication_status`、`gsi_is_public_published_at`（案）
- 備考：`remarks` は詳細画面表示用の可変長メッセージ配列とする。

#### カラム定義

| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| _id | お知らせID | string | 36 | N | Y |  |  | UUID | 主キー |
| notice_title | お知らせタイトル | string | 120案 | N |  |  |  |  | 一覧・詳細表示タイトル |
| fiscal_year | 年度 | string | 4 | N |  |  |  |  | 対象年度 |
| remarks | 備考一覧 | array<string> | 10件案 | Y |  |  |  | [] | 詳細画面の備考表示 |
| publication_status | 公開状態 | string | 20案 | N |  |  |  | draft | `draft` / `published` / `closed` を想定 |
| is_public | 公開フラグ | boolean | 1 | N |  |  |  | false | 画面表示可否 |
| published_at | 公開日時 | string | 20 | Y |  |  |  |  | ISO8601 形式 |
| created_at | 作成日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| updated_at | 更新日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| created_by | 作成者 | string | 36案 | N |  |  |  | system | 作成者識別子 |
| updated_by | 更新者 | string | 36案 | N |  |  |  | system | 更新者識別子 |
| is_deleted | 論理削除フラグ | boolean | 1 | N |  |  |  | false | 論理削除管理 |

#### サンプルデータ

```json
{
  "_id": "ntc-2025-01",
  "notice_title": "2025年度 出資配当金のお知らせ",
  "fiscal_year": "2025",
  "remarks": [
    "受取方法は受付期間内のみ変更できます。",
    "受取済の場合は変更できません。"
  ],
  "publication_status": "published",
  "is_public": true,
  "published_at": "2026-05-01T00:00:00Z",
  "created_at": "2026-04-20T09:00:00Z",
  "updated_at": "2026-05-01T00:00:00Z",
  "created_by": "admin-001",
  "updated_by": "admin-001",
  "is_deleted": false
}
```

### 2.3 distributions

- 論理名：出資配当情報
- 概要：組合員ごとの対象年度配当金、受取状況、受取方法を保持する。
- 種別：トラン
- 主キー（PK）：`_id`
- 外部キー（FK）：`user_id`、`notice_id`、`receipt_method_id`（論理参照）
- ユニーク制約：`user_id` + `notice_id`（アプリケーション保証）
- インデックス（提案）：`gsi_user_notice`、`gsi_notice_user`（案）
- 備考：受取方法更新時は `version` を条件付き更新に使用し、楽観ロックを実装する。

#### カラム定義

| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| _id | 配当情報ID | string | 36 | N | Y |  |  | UUID | 主キー |
| user_id | 組合員ID | string | 36 | N |  | Y |  |  | `users._id` を参照 |
| notice_id | お知らせID | string | 36 | N |  | Y |  |  | `dividend_notices._id` を参照 |
| fiscal_year | 年度 | string | 4 | N |  |  |  |  | 対象年度 |
| contribution_balance | 出資金残高 | decimal | 12,2案 | N |  |  |  | 0 | 当該年度計算時点の残高 |
| dividend_amount | 配当金額 | decimal | 12,2案 | N |  |  |  | 0 | 支給予定または支給済金額 |
| dividend_rate | 配当率 | decimal | 5,2案 | N |  |  |  | 0 | 年度配当率 |
| receipt_status | 受取状況 | string | 20案 | N |  |  |  | unreceived | `unreceived` / `received` を想定 |
| receipt_method_id | 受取方法ID | string | 36 | Y |  | Y |  |  | `receipt_methods._id` を参照 |
| version | バージョン | string | 36案 | N |  |  |  | 1 | 楽観ロック用バージョン |
| created_at | 作成日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| updated_at | 更新日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| created_by | 作成者 | string | 36案 | N |  |  |  | system | 作成者識別子 |
| updated_by | 更新者 | string | 36案 | N |  |  |  | system | 更新者識別子 |
| is_deleted | 論理削除フラグ | boolean | 1 | N |  |  |  | false | 論理削除管理 |

#### サンプルデータ

```json
{
  "_id": "dst-2025-u000001",
  "user_id": "usr-6e6d2f83-0db6-43c9-b6af-55e26e8df801",
  "notice_id": "ntc-2025-01",
  "fiscal_year": "2025",
  "contribution_balance": 250000.00,
  "dividend_amount": 5000.00,
  "dividend_rate": 2.00,
  "receipt_status": "unreceived",
  "receipt_method_id": "rcp-bank-transfer",
  "version": "3",
  "created_at": "2026-05-01T00:00:00Z",
  "updated_at": "2026-05-21T09:30:00Z",
  "created_by": "batch-001",
  "updated_by": "usr-6e6d2f83-0db6-43c9-b6af-55e26e8df801",
  "is_deleted": false
}
```

### 2.4 notice_reads

- 論理名：お知らせ既読情報
- 概要：組合員がお知らせ詳細を閲覧した事実を保持する。
- 種別：トラン
- 主キー（PK）：`_id`
- 外部キー（FK）：`user_id`、`notice_id`（論理参照）
- ユニーク制約：`user_id` + `notice_id`（アプリケーション保証）
- インデックス（提案）：`gsi_user_notice`
- 備考：一覧画面の `isNew` 判定で使用するため、存在確認が高速になるように複合 GSI を付与する。

#### カラム定義

| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| _id | 既読情報ID | string | 36 | N | Y |  |  | UUID | 主キー |
| user_id | 組合員ID | string | 36 | N |  | Y |  |  | `users._id` を参照 |
| notice_id | お知らせID | string | 36 | N |  | Y |  |  | `dividend_notices._id` を参照 |
| read_at | 既読日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| created_at | 作成日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| updated_at | 更新日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| created_by | 作成者 | string | 36案 | N |  |  |  | system | 作成者識別子 |
| updated_by | 更新者 | string | 36案 | N |  |  |  | system | 更新者識別子 |
| is_deleted | 論理削除フラグ | boolean | 1 | N |  |  |  | false | 論理削除管理 |

#### サンプルデータ

```json
{
  "_id": "nrd-u000001-ntc-2025-01",
  "user_id": "usr-6e6d2f83-0db6-43c9-b6af-55e26e8df801",
  "notice_id": "ntc-2025-01",
  "read_at": "2026-05-21T09:15:00Z",
  "created_at": "2026-05-21T09:15:00Z",
  "updated_at": "2026-05-21T09:15:00Z",
  "created_by": "usr-6e6d2f83-0db6-43c9-b6af-55e26e8df801",
  "updated_by": "usr-6e6d2f83-0db6-43c9-b6af-55e26e8df801",
  "is_deleted": false
}
```

### 2.5 receipt_methods

- 論理名：配当金受取方法
- 概要：配当金詳細画面で選択可能な受取方法候補を保持する。
- 種別：マスタ
- 主キー（PK）：`_id`
- 外部キー（FK）：なし
- ユニーク制約：`method_code`（アプリケーション保証）
- インデックス（提案）：`gsi_method_code`
- 備考：候補値はマスタメンテナンスまたは初期データ投入で管理する。

#### カラム定義

| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| _id | 受取方法ID | string | 36 | N | Y |  |  | UUID | 主キー |
| method_code | 受取方法コード | string | 30案 | N |  |  | Y |  | システム内候補値コード |
| method_name | 受取方法名 | string | 50案 | N |  |  |  |  | 画面表示名 |
| created_at | 作成日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| updated_at | 更新日時 | string | 20 | N |  |  |  | system time | ISO8601 形式 |
| created_by | 作成者 | string | 36案 | N |  |  |  | system | 作成者識別子 |
| updated_by | 更新者 | string | 36案 | N |  |  |  | system | 更新者識別子 |
| is_deleted | 論理削除フラグ | boolean | 1 | N |  |  |  | false | 論理削除管理 |

#### サンプルデータ

```json
{
  "_id": "rcp-bank-transfer",
  "method_code": "bank_transfer",
  "method_name": "口座振込",
  "created_at": "2026-04-01T00:00:00Z",
  "updated_at": "2026-04-01T00:00:00Z",
  "created_by": "system",
  "updated_by": "system",
  "is_deleted": false
}
```

## 3. リレーション（物理）

NoSQL 前提のため物理 FK 制約は設定しない。整合性はサービス層の参照チェックと DynamoDB 条件式で担保する。

| 親テーブル | 子テーブル | 子カラム | 用途 | ON DELETE | ON UPDATE |
|---|---|---|---|---|---|
| users | distributions | user_id | 組合員ごとの配当情報参照 | RESTRICT 相当をアプリケーション制御 | RESTRICT 相当をアプリケーション制御 |
| users | notice_reads | user_id | お知らせ既読情報参照 | RESTRICT 相当をアプリケーション制御 | RESTRICT 相当をアプリケーション制御 |
| dividend_notices | distributions | notice_id | お知らせ詳細と配当情報の紐付け | RESTRICT 相当をアプリケーション制御 | RESTRICT 相当をアプリケーション制御 |
| dividend_notices | notice_reads | notice_id | お知らせ既読情報参照 | RESTRICT 相当をアプリケーション制御 | RESTRICT 相当をアプリケーション制御 |
| receipt_methods | distributions | receipt_method_id | 配当金受取方法候補参照 | RESTRICT 相当をアプリケーション制御 | RESTRICT 相当をアプリケーション制御 |

### 制約定義

| 種別 | 対象 | 制約内容 | 実装方針 |
|---|---|---|---|
| PK | 全テーブル | `_id` 一意 | UUID 採番 |
| UNIQUE | users | `user_code` 一意 | `gsi_user_code` 参照と登録時重複チェック |
| UNIQUE | distributions | `user_id` + `notice_id` 一意 | 条件付き書き込みで重複防止 |
| UNIQUE | notice_reads | `user_id` + `notice_id` 一意 | 条件付き書き込みで重複防止 |
| UNIQUE | receipt_methods | `method_code` 一意 | マスタ登録時重複チェック |
| CHECK | dividend_notices | `publication_status` は候補値内 | アプリケーション入力検証 |
| CHECK | distributions | `receipt_status` は候補値内 | アプリケーション入力検証 |
| CHECK | users | `notification_method` は 0 または 1 | 更新前入力検証 |

## 4. インデックス設計

| テーブル名 | インデックス名 | キー構成 | 用途 |
|---|---|---|---|
| users | gsi_user_code | PK:`user_code` | ログイン時の組合員特定、セッション再構築 |
| users | gsi_email | PK:`email` | メールアドレス重複確認が必要な場合の拡張案 |
| dividend_notices | gsi_publication_status | PK:`publication_status` / SK:`fiscal_year#updated_at` | 公開中お知らせ一覧を年度降順・更新日時降順で取得 |
| dividend_notices | gsi_is_public_published_at | PK:`is_public` / SK:`published_at` | 公開状態を単純に一覧取得する代替案 |
| distributions | gsi_user_notice | PK:`user_id` / SK:`notice_id` | 組合員本人の noticeId 単位詳細取得、受取方法更新対象取得 |
| distributions | gsi_notice_user | PK:`notice_id` / SK:`user_id` | お知らせ起点での配当データ確認、運用照会 |
| notice_reads | gsi_user_notice | PK:`user_id` / SK:`notice_id` | 一覧画面の `isNew` 判定 |
| receipt_methods | gsi_method_code | PK:`method_code` | 候補値マスタのコード検索 |

補足:

- `dividend_notices` 一覧は DynamoDB の sort key を昇順保持し、取得時に逆順走査する想定とする。
- `fiscal_year#updated_at` は `2025#2026-05-01T00:00:00Z` のような連結値を保持する設計案である。
- `users.notification_method` は単一整数属性のため追加インデックスは不要とする。

## 5. DDL（例）

以下は DynamoDB 互換テーブルを想定した代表例であり、実装時は IaC に合わせて調整する。

```sql
CREATE TABLE users (
    _id STRING HASH KEY,
    user_code STRING,
    password_hash STRING,
    user_name STRING,
    user_name_kana STRING,
    birth_date STRING,
    postal_code STRING,
    address STRING,
    phone_number STRING,
    email STRING,
    contribution_balance NUMBER,
    bank_account_info STRING,
    notification_method NUMBER,
    created_at STRING,
    updated_at STRING,
    created_by STRING,
    updated_by STRING,
    is_deleted BOOLEAN
)
WITH (
    billing_mode = 'PAY_PER_REQUEST',
    global_secondary_indexes = [
        {
            name = 'gsi_user_code',
            partition_key = 'user_code'
        }
    ]
);

CREATE TABLE dividend_notices (
    _id STRING HASH KEY,
    notice_title STRING,
    fiscal_year STRING,
    remarks LIST,
    publication_status STRING,
    is_public BOOLEAN,
    published_at STRING,
    created_at STRING,
    updated_at STRING,
    created_by STRING,
    updated_by STRING,
    is_deleted BOOLEAN,
    fiscal_year_updated_at STRING
)
WITH (
    billing_mode = 'PAY_PER_REQUEST',
    global_secondary_indexes = [
        {
            name = 'gsi_publication_status',
            partition_key = 'publication_status',
            sort_key = 'fiscal_year_updated_at'
        }
    ]
);

CREATE TABLE distributions (
    _id STRING HASH KEY,
    user_id STRING,
    notice_id STRING,
    fiscal_year STRING,
    contribution_balance NUMBER,
    dividend_amount NUMBER,
    dividend_rate NUMBER,
    receipt_status STRING,
    receipt_method_id STRING,
    version STRING,
    created_at STRING,
    updated_at STRING,
    created_by STRING,
    updated_by STRING,
    is_deleted BOOLEAN
)
WITH (
    billing_mode = 'PAY_PER_REQUEST',
    global_secondary_indexes = [
        {
            name = 'gsi_user_notice',
            partition_key = 'user_id',
            sort_key = 'notice_id'
        }
    ]
);
```

## 6. 前提・要確認事項

1. `dividend_notices` の公開対象は現行 ER では全組合員共通のお知らせとして整理した。組合員別公開制御が必要な場合は対象者属性または配信テーブル追加が必要である。
2. `users.bank_account_info` は自由記述のままとした。銀行名、支店名、口座種別、口座番号へ分割する必要がある場合は属性追加を行う。
3. `users` 更新時の競合制御項目は ER に未定義のため本書では追加していない。マイページ更新の同時更新対策が必要な場合は `version` 追加を検討する。
4. `receipt_status`、`publication_status` の候補値は処理設計から推定した案であり、正式なコード体系は別途定義が必要である。
5. `gsi_email` と `gsi_notice_user` は現行 API では必須ではない。運用検索や重複チェック要件が確定した段階で採用可否を決定する。
6. DynamoDB では物理 FK 制約を持てないため、削除時の参照整合性はサービス層で事前チェックする必要がある。
