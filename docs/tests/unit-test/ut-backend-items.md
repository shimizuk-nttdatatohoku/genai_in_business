# バックエンド単体試験 試験項目書

## サマリー

| 項目 | 値 |
|------|----|
| 実施総数 | 30 |
| 成功 | 30 |
| 失敗 | 0 |
| 未実施 | 0 |

---

## 試験項目一覧

| No | 対象ファイル | テスト関数名 | 試験観点 | 試験内容 | 期待結果 | ステータス | 備考 |
|----|------------|------------|---------|---------|---------|-----------|------|
| 1 | test_auth_sessions.py | test_create_auth_session_returns_session_payload | 正常系 | 正しい認証情報でログインする | 201でsessionId、csrfToken、Cookieを含む認証セッションが返る | 成功 | |
| 2 | test_auth_sessions.py | test_create_auth_session_rejects_invalid_credentials | 認証 | 誤ったパスワードでログインする | 401でE_001が返る | 成功 | |
| 3 | test_auth_sessions.py | test_create_auth_session_requires_user_code | 必須チェック | userCodeを欠損してログインする | 400でE_101が返る | 成功 | |
| 4 | test_auth_sessions.py | test_create_auth_session_validates_user_code_format | 入力値バリデーション | 不正形式のuserCodeでログインする | 400でE_102が返る | 成功 | |
| 5 | test_auth_sessions.py | test_delete_current_auth_session_requires_authentication | 認証 | セッションCookieなしでログアウトする | 401でE_001が返る | 成功 | |
| 6 | test_auth_sessions.py | test_delete_current_auth_session_requires_csrf | CSRF | CSRFトークンなしでログアウトする | 401でE_001が返る | 成功 | |
| 7 | test_auth_sessions.py | test_delete_current_auth_session_rejects_invalid_csrf | CSRF | 不正なCSRFトークンでログアウトする | 401でE_001が返る | 成功 | |
| 8 | test_auth_sessions.py | test_delete_current_auth_session_logs_out | 正常系 | 有効なセッションでログアウトする | 200でloggedOutAtを含む標準レスポンスが返る | 成功 | |
| 9 | test_dividend_notices.py | test_list_dividend_notices_returns_seeded_items | 正常系 | 配当金お知らせ一覧を取得する | 200で一覧、ページング情報、標準レスポンスが返る | 成功 | |
| 10 | test_dividend_notices.py | test_list_dividend_notices_requires_authentication | 認証 | セッションCookieなしで配当金お知らせ一覧を取得する | 401でE_001が返る | 成功 | |
| 11 | test_dividend_notices.py | test_list_dividend_notices_validates_page_size | 入力値バリデーション | 上限超過のpageSizeで一覧を取得する | 400でE_102が返る | 成功 | |
| 12 | test_dividend_notices.py | test_get_dividend_notice_detail_marks_notice_as_read | 正常系 | 配当金お知らせ詳細を取得する | 200で詳細が返り、次回一覧取得時にisNewがfalseになる | 成功 | |
| 13 | test_dividend_notices.py | test_get_dividend_notice_detail_requires_authentication | 認証 | セッションCookieなしで配当金お知らせ詳細を取得する | 401でE_001が返る | 成功 | |
| 14 | test_dividend_notices.py | test_get_dividend_notice_detail_returns_not_found | 異常系 | 存在しないnoticeIdの詳細を取得する | 404でE_404が返る | 成功 | |
| 15 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_updates_selection | 正常系 | 有効な受取方法で配当金受取方法を更新する | 200で更新後の受取方法と完了メッセージが返る | 成功 | |
| 16 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_requires_authentication | 認証 | セッションCookieなしで配当金受取方法を更新する | 401でE_001が返る | 成功 | |
| 17 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_requires_csrf | CSRF | CSRFトークンなしで配当金受取方法を更新する | 401でE_001が返る | 成功 | |
| 18 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_requires_receipt_method | 必須チェック | receiptMethodを欠損して配当金受取方法を更新する | 400でE_101が返る | 成功 | |
| 19 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_validates_receipt_method | 入力値バリデーション | 不正なreceiptMethodで配当金受取方法を更新する | 400でE_102が返る | 成功 | |
| 20 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_rejects_account_transfer | 異常系 | 変更不可のACCOUNT_TRANSFERへ配当金受取方法を更新する | 400でE_201が返る | 成功 | |
| 21 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_rejects_received_notice | 異常系 | 受取済み通知の配当金受取方法を更新する | 400でE_202が返る | 成功 | |
| 22 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_returns_not_found | 異常系 | 存在しないnoticeIdの配当金受取方法を更新する | 404でE_404が返る | 成功 | |
| 23 | test_health.py | test_get_health_returns_success_payload | 正常系 | ヘルスチェックAPIを呼び出す | 200でstatus=okの標準レスポンスが返る | 成功 | |
| 24 | test_users.py | test_get_my_profile_returns_member_payload | 正常系 | 自分の組合員情報を取得する | 200で組合員情報の標準レスポンスが返る | 成功 | |
| 25 | test_users.py | test_get_my_profile_requires_authentication | 認証 | セッションCookieなしで自分の組合員情報を取得する | 401でE_001が返る | 成功 | |
| 26 | test_users.py | test_update_my_profile_persists_changes | 正常系 | 有効な入力で自分の組合員情報を更新する | 200で更新完了メッセージが返り、再取得で変更が反映される | 成功 | |
| 27 | test_users.py | test_update_my_profile_requires_authentication | 認証 | セッションCookieなしで自分の組合員情報を更新する | 401でE_001が返る | 成功 | |
| 28 | test_users.py | test_update_my_profile_requires_csrf | CSRF | CSRFトークンなしで自分の組合員情報を更新する | 401でE_001が返る | 成功 | |
| 29 | test_users.py | test_update_my_profile_requires_postal_code | 必須チェック | postalCodeを欠損して自分の組合員情報を更新する | 400でE_101が返る | 成功 | |
| 30 | test_users.py | test_update_my_profile_validates_format | 入力値バリデーション | 不正形式のpostalCodeで自分の組合員情報を更新する | 400でE_102が返る | 成功 | |

---

## バックエンド単体試験 試験項目書

### サマリ

| 項目 | 値 |
|------|----|
| 実施総数 | 30 |
| 成功 | 30 |
| 失敗 | 0 |
| 未実施 | 0 |

---

### 試験項目一覧

| No | 対象ファイル | テスト関数名 | 試験観点 | 試験内容 | 期待結果 | ステータス | 備考 |
|----|------------|------------|---------|---------|---------|-----------|------|
| 1 | test_auth_sessions.py | test_create_auth_session_returns_session_payload | 正常系 | 正しい認証情報でログインする | 201でsessionId、csrfToken、Cookieを含む認証セッションが返る | 成功 | |
| 2 | test_auth_sessions.py | test_create_auth_session_rejects_invalid_credentials | 認証 | 誤ったパスワードでログインする | 401でE_001が返る | 成功 | |
| 3 | test_auth_sessions.py | test_create_auth_session_requires_user_code | 必須チェック | userCodeを欠損してログインする | 400でE_101が返る | 成功 | |
| 4 | test_auth_sessions.py | test_create_auth_session_validates_user_code_format | 入力値バリデーション | 不正形式のuserCodeでログインする | 400でE_102が返る | 成功 | |
| 5 | test_auth_sessions.py | test_delete_current_auth_session_requires_authentication | 認証 | セッションCookieなしでログアウトする | 401でE_001が返る | 成功 | |
| 6 | test_auth_sessions.py | test_delete_current_auth_session_requires_csrf | CSRF | CSRFトークンなしでログアウトする | 401でE_001が返る | 成功 | |
| 7 | test_auth_sessions.py | test_delete_current_auth_session_rejects_invalid_csrf | CSRF | 不正なCSRFトークンでログアウトする | 401でE_001が返る | 成功 | |
| 8 | test_auth_sessions.py | test_delete_current_auth_session_logs_out | 正常系 | 有効なセッションでログアウトする | 200でloggedOutAtを含む標準レスポンスが返る | 成功 | |
| 9 | test_dividend_notices.py | test_list_dividend_notices_returns_seeded_items | 正常系 | 配当金お知らせ一覧を取得する | 200で一覧、ページング情報、標準レスポンスが返る | 成功 | |
| 10 | test_dividend_notices.py | test_list_dividend_notices_requires_authentication | 認証 | セッションCookieなしで配当金お知らせ一覧を取得する | 401でE_001が返る | 成功 | |
| 11 | test_dividend_notices.py | test_list_dividend_notices_validates_page_size | 入力値バリデーション | 上限超過のpageSizeで一覧を取得する | 400でE_102が返る | 成功 | |
| 12 | test_dividend_notices.py | test_get_dividend_notice_detail_marks_notice_as_read | 正常系 | 配当金お知らせ詳細を取得する | 200で詳細が返り、次回一覧取得時にisNewがfalseになる | 成功 | |
| 13 | test_dividend_notices.py | test_get_dividend_notice_detail_requires_authentication | 認証 | セッションCookieなしで配当金お知らせ詳細を取得する | 401でE_001が返る | 成功 | |
| 14 | test_dividend_notices.py | test_get_dividend_notice_detail_returns_not_found | 異常系 | 存在しないnoticeIdの詳細を取得する | 404でE_404が返る | 成功 | |
| 15 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_updates_selection | 正常系 | 有効な受取方法で配当金受取方法を更新する | 200で更新後の受取方法と完了メッセージが返る | 成功 | |
| 16 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_requires_authentication | 認証 | セッションCookieなしで配当金受取方法を更新する | 401でE_001が返る | 成功 | |
| 17 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_requires_csrf | CSRF | CSRFトークンなしで配当金受取方法を更新する | 401でE_001が返る | 成功 | |
| 18 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_requires_receipt_method | 必須チェック | receiptMethodを欠損して配当金受取方法を更新する | 400でE_101が返る | 成功 | |
| 19 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_validates_receipt_method | 入力値バリデーション | 不正なreceiptMethodで配当金受取方法を更新する | 400でE_102が返る | 成功 | |
| 20 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_rejects_account_transfer | 異常系 | 変更不可のACCOUNT_TRANSFERへ配当金受取方法を更新する | 400でE_201が返る | 成功 | |
| 21 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_rejects_received_notice | 異常系 | 受取済み通知の配当金受取方法を更新する | 400でE_202が返る | 成功 | |
| 22 | test_dividend_notices.py | test_update_dividend_notice_receipt_method_returns_not_found | 異常系 | 存在しないnoticeIdの配当金受取方法を更新する | 404でE_404が返る | 成功 | |
| 23 | test_health.py | test_get_health_returns_success_payload | 正常系 | ヘルスチェックAPIを呼び出す | 200でstatus=okの標準レスポンスが返る | 成功 | |
| 24 | test_users.py | test_get_my_profile_returns_member_payload | 正常系 | 自分の組合員情報を取得する | 200で組合員情報の標準レスポンスが返る | 成功 | |
| 25 | test_users.py | test_get_my_profile_requires_authentication | 認証 | セッションCookieなしで自分の組合員情報を取得する | 401でE_001が返る | 成功 | |
| 26 | test_users.py | test_update_my_profile_persists_changes | 正常系 | 有効な入力で自分の組合員情報を更新する | 200で更新完了メッセージが返り、再取得で変更が反映される | 成功 | |
| 27 | test_users.py | test_update_my_profile_requires_authentication | 認証 | セッションCookieなしで自分の組合員情報を更新する | 401でE_001が返る | 成功 | |
| 28 | test_users.py | test_update_my_profile_requires_csrf | CSRF | CSRFトークンなしで自分の組合員情報を更新する | 401でE_001が返る | 成功 | |
| 29 | test_users.py | test_update_my_profile_requires_postal_code | 必須チェック | postalCodeを欠損して自分の組合員情報を更新する | 400でE_101が返る | 成功 | |
| 30 | test_users.py | test_update_my_profile_validates_format | 入力値バリデーション | 不正形式のpostalCodeで自分の組合員情報を更新する | 400でE_102が返る | 成功 | |
