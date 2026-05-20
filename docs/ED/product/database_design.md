# DB設計書（物理設計）

## 0. 設計方針
- 本設計は [ER図](docs/ED/product/er_diargram.md) を基にした物理設計であり、永続化基盤は Amazon DynamoDB を前提とする。
- ER図のエンティティを 1 テーブルとして物理設計し、テーブル名・カラム名は命名規則に従い `snake_case` で統一する。
- DynamoDB では外部キー、ユニーク制約、CHECK 制約を RDB のように物理強制できないため、本書では「論理制約」として定義し、アプリケーション制御または条件付き更新で担保する。
- 監査要件に対応するため、更新対象テーブルには `created_at`、`created_by`、`updated_at`、`updated_by` を付与する。
- 更新競合が発生しうるテーブルには `record_version` を付与し、楽観ロックを行う。
- 業務上の参照整合性と復旧性を考慮し、マスタ系テーブルには `deleted_flag`、`deleted_at` を持たせて論理削除を採用する。
- データ型は論理的な型表現として `varchar`、`int`、`bigint`、`decimal`、`timestamp`、`date`、`boolean` を用いる。DynamoDB 実装時は `String`、`Number`、`Boolean` に読み替える。

## 1. テーブル一覧
| テーブル名 | 論理名 | 種別（マスタ/トラン/履歴/ログ） | 概要 |
|---|---|---|---|
| users | ユーザ | マスタ | 組合員本人の基本情報、連絡先、通知方法、状態を保持する。 |
| user_authentications | ユーザ認証情報 | マスタ | ユーザコードに対するログイン認証情報と認証状態を保持する。 |
| dividend_notices | 出資配当金お知らせ | マスタ | 年度別の配当通知見出し、公開状態、案内文言を保持する。 |
| dividend_infos | 出資配当情報 | トラン | ユーザごとの年度別出資残高、配当金額、受取状況を保持する。 |
| dividend_receipt_methods | 配当金受取方法情報 | トラン | 出資配当情報ごとの受取方法設定を保持する。 |
| bank_account_registrations | 口座登録情報 | マスタ | ユーザの登録口座状態および振込先口座表示情報を保持する。 |

## 2. テーブル定義

- 本章の `UNIQUE` 列は、主キーとは独立して定義するユニーク制約のみを示す。主キーによる一意性は `PK` 列で管理する。

### 2.1 users
- 論理名：ユーザ
- 概要：組合員本人の基本属性、連絡先、通知方法、利用状態を保持する。
- 種別：マスタ
- 主キー（PK）：`user_code`
- 外部キー（FK）：なし
- ユニーク制約：なし
- インデックス（提案）：`pk_users(user_code)`
- NoSQL物理キー：パーティションキー `user_code`
- 備考（論理削除/監査/バージョン管理など）：論理削除あり、監査カラムあり、楽観ロックあり

#### カラム定義
| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| user_code | ユーザコード | varchar | 20 | N | Y | N | N | - | ユーザを一意に識別する業務キー。 |
| user_name | ユーザ名 | varchar | 100 | N | N | N | N | - | ユーザ氏名。 |
| user_name_kana | ユーザ名カナ | varchar | 100 | Y | N | N | N | null | ユーザ氏名カナ。 |
| birth_date | 生年月日 | date | - | Y | N | N | N | null | 本人確認用の生年月日。 |
| postal_code | 郵便番号 | varchar | 8 | Y | N | N | N | null | ハイフン込み 8 桁想定。 |
| address | 住所 | varchar | 255 | Y | N | N | N | null | 都道府県以降を含む住所。 |
| phone_number | 電話番号 | varchar | 20 | Y | N | N | N | null | 固定電話・携帯電話の双方を想定。 |
| email_address | メールアドレス | varchar | 254 | Y | N | N | N | null | 通知先メールアドレス。 |
| notification_method | 通知方法 | varchar | 20 | N | N | N | N | email | 通知方法。`email`、`postal_mail`、`none` を想定。 |
| user_status | ユーザ状態 | varchar | 20 | N | N | N | N | active | 利用状態。`active`、`inactive`、`suspended` を想定。 |
| record_version | レコードバージョン | bigint | 19 | N | N | N | N | 1 | 楽観ロック用の更新バージョン。 |
| deleted_flag | 削除フラグ | boolean | - | N | N | N | N | false | 論理削除判定。 |
| deleted_at | 削除日時 | timestamp | - | Y | N | N | N | null | 論理削除日時。 |
| created_at | 作成日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | レコード作成日時。 |
| created_by | 作成者 | varchar | 20 | N | N | N | N | system | レコード作成者のユーザコード。 |
| updated_at | 更新日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | レコード最終更新日時。 |
| updated_by | 更新者 | varchar | 20 | N | N | N | N | system | レコード最終更新者のユーザコード。 |

### 2.2 user_authentications
- 論理名：ユーザ認証情報
- 概要：ユーザの認証に必要なハッシュ化パスワード、認証状態、最終ログイン日時を保持する。
- 種別：マスタ
- 主キー（PK）：`user_code`
- 外部キー（FK）：`user_code` -> `users.user_code`
- ユニーク制約：なし
- インデックス（提案）：`pk_user_authentications(user_code)`
- NoSQL物理キー：パーティションキー `user_code`
- 備考（論理削除/監査/バージョン管理など）：論理削除は行わず `account_status` で管理、監査カラムあり、楽観ロックあり

#### カラム定義
| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| user_code | ユーザコード | varchar | 20 | N | Y | Y | N | - | `users` と 1:1 で対応するキー。 |
| password_hash | パスワードハッシュ | varchar | 255 | N | N | N | N | - | ハッシュ化済みパスワード。 |
| account_status | アカウント状態 | varchar | 20 | N | N | N | N | active | `active`、`locked`、`inactive` を想定。 |
| password_updated_at | パスワード更新日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | パスワード最終更新日時。 |
| last_login_at | 最終ログイン日時 | timestamp | - | Y | N | N | N | null | 最終ログイン成功日時。 |
| record_version | レコードバージョン | bigint | 19 | N | N | N | N | 1 | 楽観ロック用の更新バージョン。 |
| created_at | 作成日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | レコード作成日時。 |
| created_by | 作成者 | varchar | 20 | N | N | N | N | system | レコード作成者。 |
| updated_at | 更新日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | レコード最終更新日時。 |
| updated_by | 更新者 | varchar | 20 | N | N | N | N | system | レコード最終更新者。 |

### 2.3 dividend_notices
- 論理名：出資配当金お知らせ
- 概要：トップ画面や配当画面に表示する年度別のお知らせを保持する。
- 種別：マスタ
- 主キー（PK）：`notice_id`
- 外部キー（FK）：なし
- ユニーク制約：`fiscal_year`, `title`
- インデックス（提案）：`pk_dividend_notices(notice_id)`、`idx_dividend_notices_01(publication_status, fiscal_year, published_at)`
- NoSQL物理キー：パーティションキー `notice_id`、GSI `gsi_dividend_notices_01(publication_status, fiscal_year)`
- 備考（論理削除/監査/バージョン管理など）：論理削除あり、監査カラムあり、楽観ロックあり

#### カラム定義
| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| notice_id | お知らせID | varchar | 36 | N | Y | N | N | - | お知らせを一意に識別する ID。UUID 想定。 |
| fiscal_year | 対象年度 | int | 4 | N | N | N | Y(複合) | - | 配当対象年度。 |
| title | 件名 | varchar | 200 | N | N | N | Y(複合) | - | お知らせ見出し。 |
| explanatory_message | 説明文 | varchar | 2000 | Y | N | N | N | null | 画面表示する補足説明。 |
| support_link | サポートリンク | varchar | 255 | Y | N | N | N | null | 問い合わせまたは詳細ページ URL。 |
| publication_status | 公開状態 | varchar | 20 | N | N | N | N | draft | `draft`、`published`、`closed` を想定。 |
| published_at | 公開日時 | timestamp | - | Y | N | N | N | null | 公開開始日時。 |
| record_version | レコードバージョン | bigint | 19 | N | N | N | N | 1 | 楽観ロック用の更新バージョン。 |
| deleted_flag | 削除フラグ | boolean | - | N | N | N | N | false | 論理削除判定。 |
| deleted_at | 削除日時 | timestamp | - | Y | N | N | N | null | 論理削除日時。 |
| created_at | 作成日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | レコード作成日時。 |
| created_by | 作成者 | varchar | 20 | N | N | N | N | system | レコード作成者。 |
| updated_at | 更新日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | レコード最終更新日時。 |
| updated_by | 更新者 | varchar | 20 | N | N | N | N | system | レコード最終更新者。 |

### 2.4 dividend_infos
- 論理名：出資配当情報
- 概要：ユーザごとの年度別の出資残高、配当率、配当金額、受取状況を保持する。
- 種別：トラン
- 主キー（PK）：`dividend_info_id`
- 外部キー（FK）：`notice_id` -> `dividend_notices.notice_id`、`user_code` -> `users.user_code`
- ユニーク制約：`notice_id`, `user_code`
- インデックス（提案）：`pk_dividend_infos(dividend_info_id)`、`idx_dividend_infos_01(user_code, notice_id)`、`idx_dividend_infos_02(notice_id, receipt_status)`
- NoSQL物理キー：パーティションキー `dividend_info_id`、GSI `gsi_dividend_infos_01(user_code, notice_id)`、GSI `gsi_dividend_infos_02(notice_id, receipt_status)`
- 備考（論理削除/監査/バージョン管理など）：論理削除なし、監査カラムあり、楽観ロックあり

#### カラム定義
| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| dividend_info_id | 出資配当情報ID | varchar | 36 | N | Y | N | N | - | 出資配当情報を一意に識別する ID。UUID 想定。 |
| notice_id | お知らせID | varchar | 36 | N | N | Y | Y(複合) | - | 対象となる出資配当金お知らせ ID。 |
| user_code | ユーザコード | varchar | 20 | N | N | Y | Y(複合) | - | 対象ユーザのコード。 |
| capital_balance_amount | 出資残高金額 | decimal | 15,2 | N | N | N | N | 0.00 | 対象年度時点の出資残高。 |
| dividend_amount | 配当金額 | decimal | 15,2 | N | N | N | N | 0.00 | 対象年度の配当金額。 |
| dividend_rate_before_tax | 税引前配当率 | decimal | 5,2 | N | N | N | N | 0.00 | 税引前配当率。 |
| dividend_rate_after_tax | 税引後配当率 | decimal | 5,2 | N | N | N | N | 0.00 | 税引後配当率。 |
| receipt_status | 受取状態 | varchar | 20 | N | N | N | N | unselected | `unselected`、`selected`、`completed` を想定。 |
| record_version | レコードバージョン | bigint | 19 | N | N | N | N | 1 | 楽観ロック用の更新バージョン。 |
| created_at | 作成日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | レコード作成日時。 |
| created_by | 作成者 | varchar | 20 | N | N | N | N | system | レコード作成者。 |
| updated_at | 更新日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | レコード最終更新日時。 |
| updated_by | 更新者 | varchar | 20 | N | N | N | N | system | レコード最終更新者。 |

### 2.5 dividend_receipt_methods
- 論理名：配当金受取方法情報
- 概要：ユーザが選択した配当金受取方法を出資配当情報単位で保持する。
- 種別：トラン
- 主キー（PK）：`dividend_info_id`
- 外部キー（FK）：`dividend_info_id` -> `dividend_infos.dividend_info_id`
- ユニーク制約：なし
- インデックス（提案）：`pk_dividend_receipt_methods(dividend_info_id)`
- NoSQL物理キー：パーティションキー `dividend_info_id`
- 備考（論理削除/監査/バージョン管理など）：論理削除なし、監査カラムあり、楽観ロックあり

#### カラム定義
| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| dividend_info_id | 出資配当情報ID | varchar | 36 | N | Y | Y | N | - | `dividend_infos` と 1:1 で対応するキー。 |
| receipt_method | 受取方法 | varchar | 30 | N | N | N | N | registered_bank_transfer | `registered_bank_transfer`、`service_counter` を想定。 |
| record_version | レコードバージョン | bigint | 19 | N | N | N | N | 1 | 楽観ロック用の更新バージョン。 |
| created_at | 作成日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | 初回登録日時。 |
| created_by | 作成者 | varchar | 20 | N | N | N | N | system | 初回登録者。 |
| updated_at | 更新日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | 最終更新日時。 |
| updated_by | 更新者 | varchar | 20 | N | N | N | N | system | 最終更新者。 |

### 2.6 bank_account_registrations
- 論理名：口座登録情報
- 概要：ユーザの口座登録有無および振込先口座の表示用属性を保持する。
- 種別：マスタ
- 主キー（PK）：`bank_account_registration_id`
- 外部キー（FK）：`user_code` -> `users.user_code`
- ユニーク制約：`user_code`
- インデックス（提案）：`pk_bank_account_registrations(bank_account_registration_id)`、`idx_bank_account_registrations_01(user_code, bank_registration_status)`
- NoSQL物理キー：パーティションキー `bank_account_registration_id`、GSI `gsi_bank_account_registrations_01(user_code, bank_registration_status)`
- 備考（論理削除/監査/バージョン管理など）：論理削除あり、監査カラムあり、楽観ロックあり

#### カラム定義
| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|
| bank_account_registration_id | 口座登録情報ID | varchar | 36 | N | Y | N | N | - | 口座登録情報を一意に識別する ID。UUID 想定。 |
| user_code | ユーザコード | varchar | 20 | N | N | Y | Y | - | 口座登録対象ユーザのコード。 |
| bank_registration_status | 口座登録状態 | varchar | 20 | N | N | N | N | unregistered | `registered`、`unregistered`、`pending` を想定。 |
| financial_institution_name | 金融機関名 | varchar | 100 | Y | N | N | N | null | 振込先金融機関名。 |
| branch_name | 支店名 | varchar | 100 | Y | N | N | N | null | 振込先支店名。 |
| account_holder_name_kana | 口座名義人カナ | varchar | 100 | Y | N | N | N | null | 口座名義人カナ。 |
| record_version | レコードバージョン | bigint | 19 | N | N | N | N | 1 | 楽観ロック用の更新バージョン。 |
| deleted_flag | 削除フラグ | boolean | - | N | N | N | N | false | 論理削除判定。 |
| deleted_at | 削除日時 | timestamp | - | Y | N | N | N | null | 論理削除日時。 |
| created_at | 作成日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | レコード作成日時。 |
| created_by | 作成者 | varchar | 20 | N | N | N | N | system | レコード作成者。 |
| updated_at | 更新日時 | timestamp | - | N | N | N | N | CURRENT_TIMESTAMP | レコード最終更新日時。 |
| updated_by | 更新者 | varchar | 20 | N | N | N | N | system | レコード最終更新者。 |

## 3. 制約定義

### 3.1 主キー（PK）
| テーブル名 | 主キー |
|---|---|
| users | `user_code` |
| user_authentications | `user_code` |
| dividend_notices | `notice_id` |
| dividend_infos | `dividend_info_id` |
| dividend_receipt_methods | `dividend_info_id` |
| bank_account_registrations | `bank_account_registration_id` |

### 3.2 外部キー（FK）
| 子テーブル | 子カラム | 親テーブル | 親カラム | ON DELETE | ON UPDATE | 備考 |
|---|---|---|---|---|---|---|
| user_authentications | user_code | users | user_code | RESTRICT | CASCADE | ユーザ削除時は認証情報の孤立を防ぐ。NoSQL 実装では削除 API で同時制御する。 |
| dividend_infos | notice_id | dividend_notices | notice_id | RESTRICT | CASCADE | 公開済みお知らせに紐づく配当情報を保護する。 |
| dividend_infos | user_code | users | user_code | RESTRICT | CASCADE | ユーザ退会時も配当情報保全を優先する。 |
| dividend_receipt_methods | dividend_info_id | dividend_infos | dividend_info_id | CASCADE | CASCADE | 配当情報削除時は受取方法も連動削除する。 |
| bank_account_registrations | user_code | users | user_code | RESTRICT | CASCADE | 口座登録情報の孤立を防ぐ。 |

### 3.3 ユニーク制約
| テーブル名 | 制約名 | 対象カラム | 目的 |
|---|---|---|---|
| dividend_notices | uq_dividend_notices_01 | `fiscal_year`, `title` | 同一年度で同一件名のお知らせ重複を防ぐ。 |
| dividend_infos | uq_dividend_infos_01 | `notice_id`, `user_code` | 年度別お知らせ単位でユーザごとの配当情報を一意に保つ。 |
| bank_account_registrations | uq_bank_account_registrations_01 | `user_code` | ユーザごとの有効な口座登録情報を 1 件に保つ。 |

### 3.4 CHECK 制約
| テーブル名 | 制約名 | 条件 | 目的 |
|---|---|---|---|
| users | ck_users_01 | `notification_method in ('email', 'postal_mail', 'none')` | 通知方法の値を制御する。 |
| users | ck_users_02 | `user_status in ('active', 'inactive', 'suspended')` | ユーザ状態の値を制御する。 |
| users | ck_users_03 | `deleted_flag = false or deleted_at is not null` | 論理削除時の削除日時整合性を担保する。 |
| user_authentications | ck_user_authentications_01 | `account_status in ('active', 'locked', 'inactive')` | 認証状態の値を制御する。 |
| dividend_notices | ck_dividend_notices_01 | `publication_status in ('draft', 'published', 'closed')` | 公開状態の値を制御する。 |
| dividend_notices | ck_dividend_notices_02 | `fiscal_year >= 2000 and fiscal_year <= 9999` | 対象年度の妥当性を担保する。 |
| dividend_infos | ck_dividend_infos_01 | `capital_balance_amount >= 0` | 出資残高の負値を防止する。 |
| dividend_infos | ck_dividend_infos_02 | `dividend_amount >= 0` | 配当金額の負値を防止する。 |
| dividend_infos | ck_dividend_infos_03 | `dividend_rate_before_tax >= 0 and dividend_rate_before_tax <= 100` | 税引前配当率の範囲を制御する。 |
| dividend_infos | ck_dividend_infos_04 | `dividend_rate_after_tax >= 0 and dividend_rate_after_tax <= 100` | 税引後配当率の範囲を制御する。 |
| dividend_infos | ck_dividend_infos_05 | `receipt_status in ('unselected', 'selected', 'completed')` | 受取状態の値を制御する。 |
| dividend_receipt_methods | ck_dividend_receipt_methods_01 | `receipt_method in ('registered_bank_transfer', 'service_counter')` | 受取方法の値を制御する。 |
| bank_account_registrations | ck_bank_account_registrations_01 | `bank_registration_status in ('registered', 'unregistered', 'pending')` | 口座登録状態の値を制御する。 |
| bank_account_registrations | ck_bank_account_registrations_02 | `deleted_flag = false or deleted_at is not null` | 論理削除時の削除日時整合性を担保する。 |

## 4. リレーション（物理）
- `users` 1 : 1 `user_authentications`
- `users` 1 : 0..1 `bank_account_registrations`
- `users` 1 : N `dividend_infos`
- `dividend_notices` 1 : N `dividend_infos`
- `dividend_infos` 1 : 1 `dividend_receipt_methods`
- DynamoDB 実装時は参照整合性をアプリケーションサービス層で担保し、削除時は関連テーブルを同一トランザクション API または整合性制御付きバッチで更新する。

## 5. インデックス設計
| テーブル名 | インデックス名 | 種別 | 対象カラム | 想定ユースケース |
|---|---|---|---|---|
| users | pk_users | PK | `user_code` | ユーザ本人情報の単票取得。 |
| dividend_notices | pk_dividend_notices | PK | `notice_id` | お知らせ ID 指定取得。 |
| dividend_notices | idx_dividend_notices_01 | GSI / 複合 | `publication_status`, `fiscal_year`, `published_at` | 公開中のお知らせを年度順・公開日時順に一覧取得する。 |
| dividend_infos | pk_dividend_infos | PK | `dividend_info_id` | 配当情報単票取得。 |
| dividend_infos | idx_dividend_infos_01 | GSI / 複合 | `user_code`, `notice_id` | マイページでユーザ単位の配当情報を取得する。 |
| dividend_infos | idx_dividend_infos_02 | GSI / 複合 | `notice_id`, `receipt_status` | 年度別のお知らせ配下で受取状況別の対象者を抽出する。 |
| bank_account_registrations | pk_bank_account_registrations | PK | `bank_account_registration_id` | 口座登録情報単票取得。 |
| bank_account_registrations | idx_bank_account_registrations_01 | GSI / 複合 | `user_code`, `bank_registration_status` | ユーザの口座登録有無判定、振込可否チェックを行う。 |

### 5.1 インデックス設計上の補足
- `user_authentications` はログイン時に `user_code` 指定で参照するため、主キーのみで十分とする。
- `dividend_receipt_methods` は `dividend_info_id` での単票参照・更新が中心であるため、主キーのみで十分とする。
- DynamoDB の GSI 数はコストに直結するため、本書では画面要件から直接必要なアクセスパターンに限定している。

## 6. DDL（例）
※ NoSQL 実装時の DynamoDB テーブル作成に先立ち、論理制約確認用の代表的な SQL 例を示す。

```sql
CREATE TABLE users (
    user_code VARCHAR(20) PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_name_kana VARCHAR(100),
    birth_date DATE,
    postal_code VARCHAR(8),
    address VARCHAR(255),
    phone_number VARCHAR(20),
    email_address VARCHAR(254),
    notification_method VARCHAR(20) NOT NULL DEFAULT 'email',
    user_status VARCHAR(20) NOT NULL DEFAULT 'active',
    record_version BIGINT NOT NULL DEFAULT 1,
    deleted_flag BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20) NOT NULL DEFAULT 'system',
    CONSTRAINT ck_users_01 CHECK (notification_method IN ('email', 'postal_mail', 'none')),
    CONSTRAINT ck_users_02 CHECK (user_status IN ('active', 'inactive', 'suspended')),
    CONSTRAINT ck_users_03 CHECK (deleted_flag = FALSE OR deleted_at IS NOT NULL)
);

CREATE TABLE dividend_infos (
    dividend_info_id VARCHAR(36) PRIMARY KEY,
    notice_id VARCHAR(36) NOT NULL,
    user_code VARCHAR(20) NOT NULL,
    capital_balance_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    dividend_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    dividend_rate_before_tax DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    dividend_rate_after_tax DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    receipt_status VARCHAR(20) NOT NULL DEFAULT 'unselected',
    record_version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20) NOT NULL DEFAULT 'system',
    CONSTRAINT uq_dividend_infos_01 UNIQUE (notice_id, user_code),
    CONSTRAINT fk_dividend_infos_01 FOREIGN KEY (notice_id) REFERENCES dividend_notices (notice_id),
    CONSTRAINT fk_dividend_infos_02 FOREIGN KEY (user_code) REFERENCES users (user_code),
    CONSTRAINT ck_dividend_infos_01 CHECK (capital_balance_amount >= 0),
    CONSTRAINT ck_dividend_infos_02 CHECK (dividend_amount >= 0),
    CONSTRAINT ck_dividend_infos_03 CHECK (dividend_rate_before_tax >= 0 AND dividend_rate_before_tax <= 100),
    CONSTRAINT ck_dividend_infos_04 CHECK (dividend_rate_after_tax >= 0 AND dividend_rate_after_tax <= 100),
    CONSTRAINT ck_dividend_infos_05 CHECK (receipt_status IN ('unselected', 'selected', 'completed'))
);

CREATE TABLE dividend_receipt_methods (
    dividend_info_id VARCHAR(36) PRIMARY KEY,
    receipt_method VARCHAR(30) NOT NULL DEFAULT 'registered_bank_transfer',
    record_version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20) NOT NULL DEFAULT 'system',
    CONSTRAINT fk_dividend_receipt_methods_01 FOREIGN KEY (dividend_info_id) REFERENCES dividend_infos (dividend_info_id) ON DELETE CASCADE,
    CONSTRAINT ck_dividend_receipt_methods_01 CHECK (receipt_method IN ('registered_bank_transfer', 'service_counter'))
);

CREATE TABLE bank_account_registrations (
    bank_account_registration_id VARCHAR(36) PRIMARY KEY,
    user_code VARCHAR(20) NOT NULL,
    bank_registration_status VARCHAR(20) NOT NULL DEFAULT 'unregistered',
    financial_institution_name VARCHAR(100),
    branch_name VARCHAR(100),
    account_holder_name_kana VARCHAR(100),
    record_version BIGINT NOT NULL DEFAULT 1,
    deleted_flag BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20) NOT NULL DEFAULT 'system',
    CONSTRAINT uq_bank_account_registrations_01 UNIQUE (user_code),
    CONSTRAINT fk_bank_account_registrations_01 FOREIGN KEY (user_code) REFERENCES users (user_code),
    CONSTRAINT ck_bank_account_registrations_01 CHECK (bank_registration_status IN ('registered', 'unregistered', 'pending')),
    CONSTRAINT ck_bank_account_registrations_02 CHECK (deleted_flag = FALSE OR deleted_at IS NOT NULL)
);
```

## 7. 前提・要確認事項
- 本設計は DynamoDB を前提とするため、FK、UNIQUE、CHECK は物理制約ではなく、アプリケーション制御または条件付き更新で実装する前提である。
- `user_code` は外部連携済みの組合員コードを利用する前提とし、採番ルールは別途定義が必要である。
- `notice_id`、`dividend_info_id`、`bank_account_registration_id` は UUID 形式を想定している。
- `notification_method`、`user_status`、`account_status`、`publication_status`、`receipt_status`、`receipt_method`、`bank_registration_status` のコード値は実装前にマスタ値定義と API レスポンス仕様で確定が必要である。
- `dividend_notices` のユニーク制約を `fiscal_year + title` としたが、同一年度に複数のお知らせを許容する場合は業務要件に応じて見直しが必要である。
- `bank_account_registrations` には口座番号を保持していない。要件上必要であればマスキング方針、暗号化方式、保持可否を別途設計する必要がある。
- `dividend_infos` を 1 お知らせ 1 ユーザ 1 レコードとしたが、同一年度で複数明細を保持する要件がある場合は中間明細テーブルの追加が必要である。
- 監査カラムの `created_by`、`updated_by` は操作主体の `user_code` またはバッチ識別子を格納する前提である。
- 論理削除を採用した `users`、`dividend_notices`、`bank_account_registrations` については、一覧・検索 API で `deleted_flag = false` を標準条件とする必要がある。
- DynamoDB 実装時はテーブル単位課金、GSI 数、アクセス頻度に応じてプロビジョンドキャパシティまたはオンデマンド課金を選定する必要がある。
