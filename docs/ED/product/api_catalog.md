# API一覧

## 1. API一覧（Backend提供API）
| API-ID | IF-ID | API名 | 目的/概要 | method | path | 認証/認可 | 関連機能ID | 冪等性 | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| API-001 | IF-LOGIN | ログイン | 組合員コード・パスワードによる認証、JWT発行 | POST | /api/v1/login | なし | LGN_001 | 不要 | レート制限5回/分/ユーザー |
| API-002 | IF-LOGOUT | ログアウト | セッション破棄・JWT無効化 | POST | /api/v1/logout | JWT | LGN_002 | 要 | レート制限10回/分/ユーザー |
| API-003 | IF-MEMBER-GET | 組合員情報取得 | ログイン中組合員の情報取得 | GET | /api/v1/member | JWT | MYP_001 | 要 | PIIはマスキングして返却 |
| API-004 | IF-MEMBER-UPDATE | 組合員情報更新 | 組合員情報の更新 | PUT | /api/v1/member | JWT | MYP_001 | 要 | |
| API-005 | IF-DIVIDEND-LIST | 配布金お知らせ一覧取得 | 配布金お知らせ一覧取得 | GET | /api/v1/dividend/list | JWT | TOP_001 | 要 | ページング/ソート要件は要確認 |
| API-006 | IF-DIVIDEND-DETAIL | 配布金お知らせ詳細取得 | 年度指定で配布金詳細取得 | GET | /api/v1/dividend/{year} | JWT | DIV_001 | 要 | |
| API-007 | IF-DIVIDEND-METHOD-GET | 配布金受取方法取得 | 配布金受取方法取得 | GET | /api/v1/dividend/method | JWT | DIV_002 | 要 | |
| API-008 | IF-DIVIDEND-METHOD-UPDATE | 配布金受取方法更新 | 配布金受取方法の更新 | PUT | /api/v1/dividend/method | JWT | DIV_002 | 要 | |
| API-010 | IF-NOTICE-LIST | お知らせ一覧取得 | お知らせ一覧取得 | GET | /api/v1/notice/list | JWT | TOP_001 | 要 | ページング/ソート要件は要確認 |

## 2. API詳細（APIごと）
### 2.1 API-001: ログイン
- IF-ID: IF-LOGIN
- 目的: 組合員コード・パスワードによる認証、JWT発行
- method/path: POST /api/v1/login
- 認証/認可: なし
- 想定呼出元: ログイン画面
- 関連機能ID: LGN_001
- 冪等性: 不要
- タイムアウト: 10秒
- レート制限: 5回/分/ユーザー
- セキュリティ: パスワードはハッシュ化、JWTは署名付き。PIIはレスポンスに含めない

#### リクエスト
- body:
  - member_code: string, 必須, 7桁, 半角数字
  - password: string, 必須, 8-72桁, 英大文字・小文字・数字・記号を各1文字以上含む

#### レスポンス
- 正常時:
  - token: string (JWT)
  - expires_in: number (有効期限秒)

#### エラー
- 400: E_101 必須項目未入力・形式不正
- 401: E_001 認証失敗
- 500: E_900 サーバー内部エラー
- リトライ: 不可

#### 非機能
- タイムアウト: 10秒
- レート制限: 5回/分/ユーザー

---

### 2.2 API-002: ログアウト
- IF-ID: IF-LOGOUT
- 目的: セッション破棄・JWT無効化
- method/path: POST /api/v1/logout
- 認証/認可: JWT
- 想定呼出元: ログアウト操作
- 関連機能ID: LGN_002
- 冪等性: 要
- タイムアウト: 5秒
- レート制限: 10回/分/ユーザー
- セキュリティ: JWTブラックリスト化

#### リクエスト
- header: Authorization: Bearer {JWT}

#### レスポンス
- 正常時:
  - success: boolean

#### エラー
- 401: E_001 JWT不正・期限切れ
- 500: E_900 サーバー内部エラー
- リトライ: 可

---

### 2.3 API-003: 組合員情報取得
- IF-ID: IF-MEMBER-GET
- 目的: ログイン中組合員の情報取得
- method/path: GET /api/v1/member
- 認証/認可: JWT
- 想定呼出元: マイページ
- 関連機能ID: MYP_001
- 冪等性: 要
- タイムアウト: 5秒
- セキュリティ: PIIはマスキングして返却

#### リクエスト
- header: Authorization: Bearer {JWT}

#### レスポンス
- 正常時: 組合員情報オブジェクト

#### エラー
- 401: E_001 JWT不正・期限切れ
- 404: E_201 組合員情報未登録
- 500: E_900 サーバー内部エラー
- リトライ: 可

---

### 2.4 API-004: 組合員情報更新
- IF-ID: IF-MEMBER-UPDATE
- 目的: 組合員情報の更新
- method/path: PUT /api/v1/member
- 認証/認可: JWT
- 想定呼出元: マイページ
- 関連機能ID: MYP_001
- 冪等性: 要（Idempotency-Key対応要検討）
- タイムアウト: 5秒

#### リクエスト
- header: Authorization: Bearer {JWT}
- body: 組合員情報主要項目

#### レスポンス
- 正常時: 更新後組合員情報

#### エラー
- 400: E_101 入力値不正
- 401: E_001 JWT不正
- 409: E_301 競合
- 500: E_900 サーバー内部エラー
- リトライ: 可

---

### 2.5 API-005: 配布金お知らせ一覧取得
- IF-ID: IF-DIVIDEND-LIST
- 目的: 配布金お知らせ一覧取得
- method/path: GET /api/v1/dividend/list
- 認証/認可: JWT
- 想定呼出元: トップ画面
- 関連機能ID: TOP_001
- 冪等性: 要
- タイムアウト: 5秒
- ページング/ソート: page, size, sort（要件要確認）

#### リクエスト
- header: Authorization: Bearer {JWT}
- query: page, size, sort（案）

#### レスポンス
- 正常時: 配布金お知らせ一覧

#### エラー
- 401: E_001 JWT不正
- 500: E_900 サーバー内部エラー
- リトライ: 可

---

### 2.6 API-006: 配布金お知らせ詳細取得
- IF-ID: IF-DIVIDEND-DETAIL
- 目的: 年度指定で配布金詳細取得
- method/path: GET /api/v1/dividend/{year}
- 認証/認可: JWT
- 想定呼出元: 配布金詳細画面
- 関連機能ID: DIV_001
- 冪等性: 要
- タイムアウト: 5秒

#### リクエスト
- header: Authorization: Bearer {JWT}
- path: year

#### レスポンス
- 正常時: 配布金詳細情報

#### エラー
- 401: E_001 JWT不正
- 404: E_202 配布金情報未登録
- 500: E_900 サーバー内部エラー
- リトライ: 可

---

### 2.7 API-007: 配布金受取方法取得
- IF-ID: IF-DIVIDEND-METHOD-GET
- 目的: 配布金受取方法取得
- method/path: GET /api/v1/dividend/method
- 認証/認可: JWT
- 想定呼出元: 配布金受取方法画面
- 関連機能ID: DIV_002
- 冪等性: 要
- タイムアウト: 5秒

#### リクエスト
- header: Authorization: Bearer {JWT}

#### レスポンス
- 正常時: 受取方法情報

#### エラー
- 401: E_001 JWT不正
- 404: E_203 受取方法未登録
- 500: E_900 サーバー内部エラー
- リトライ: 可

---

### 2.8 API-008: 配布金受取方法更新
- IF-ID: IF-DIVIDEND-METHOD-UPDATE
- 目的: 配布金受取方法の更新
- method/path: PUT /api/v1/dividend/method
- 認証/認可: JWT
- 想定呼出元: 配布金受取方法画面
- 関連機能ID: DIV_002
- 冪等性: 要（Idempotency-Key対応要検討）
- タイムアウト: 5秒

#### リクエスト
- header: Authorization: Bearer {JWT}
- body: 受取方法主要項目

#### レスポンス
- 正常時: 更新後受取方法情報

#### エラー
- 400: E_101 入力値不正
- 401: E_001 JWT不正
- 409: E_302 競合
- 500: E_900 サーバー内部エラー
- リトライ: 可

---

### 2.9 API-009: パスワードリセット申請
- IF-ID: IF-PASSWORD-RESET
- 目的: パスワードリセット申請
- method/path: POST /api/v1/password/reset
- 認証/認可: なし
- 想定呼出元: パスワードリセット画面
- 関連機能ID: -
- 冪等性: 不要
- タイムアウト: 10秒

#### リクエスト
- body: member_code, email

#### レスポンス
- 正常時: success: boolean

#### エラー
- 400: E_101 入力値不正
- 404: E_201 組合員情報未登録
- 500: E_900 サーバー内部エラー
- リトライ: 可

---

### 2.10 API-010: お知らせ一覧取得
- IF-ID: IF-NOTICE-LIST
- 目的: お知らせ一覧取得
- method/path: GET /api/v1/notice/list
- 認証/認可: JWT
- 想定呼出元: トップ画面
- 関連機能ID: TOP_001
- 冪等性: 要
- タイムアウト: 5秒
- ページング/ソート: page, size, sort（要件要確認）

#### リクエスト
- header: Authorization: Bearer {JWT}
- query: page, size, sort（案）

#### レスポンス
- 正常時: お知らせ一覧

#### エラー
- 401: E_001 JWT不正
- 500: E_900 サーバー内部エラー
- リトライ: 可

---

## 3. 機能ID → API対応表（必須）
| 機能ID | 機能名 | 利用API（API-ID） | 備考 |
|---|---|---|---|
| LGN_001 | ログイン | API-001 | |
| LGN_002 | ログアウト | API-002 | |
| TOP_001 | トップ画面表示 | API-005, API-010 | |
| DIV_001 | 配布金お知らせ確認 | API-006 | |
| DIV_002 | 配布金受取方法変更 | API-007, API-008 | |
| MYP_001 | マイページ（組合員情報表示/更新） | API-003, API-004 | |

## 4. 外部連携API一覧（該当なし）

## 5. 前提・要確認事項
- ページング/ソート仕様は要件・設計書に明記がないため要確認
- 冪等性（Idempotency-Key等）の実装要否は要確認
- レスポンス項目の詳細は設計書に従い調整
- エラーコードはerror-rule.mdに準拠
