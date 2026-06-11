# フロントエンド単体試験 試験項目書

## サマリー

| 項目 | 値 |
|------|----|
| 実施総数 | 18 |
| 成功 | 18 |
| 失敗 | 0 |
| 未実施 | 0 |

---

## 試験項目一覧

| No | 対象ファイル | describe | テスト名(it) | 試験観点 | 試験内容 | 期待結果 | ステータス | 備考 |
|----|------------|---------|-------------|---------|---------|---------|-----------|------|
| 1 | App.test.tsx | App | renders the login form | 初期表示 | ログイン画面を表示する | システム名、組合員コード入力欄、パスワード入力欄、無効状態のログインボタンが表示される | 成功 | |
| 2 | App.test.tsx | App | shows a validation error when the user code format is invalid | バリデーション | 不正形式の組合員コードを入力してフォーカスを外す | 組合員コードの形式エラーメッセージが表示される | 成功 | |
| 3 | App.test.tsx | App | shows the submitting state while the login request is in flight | ローディング | 正しい認証情報でログインを送信する | 送信中表示と認証中メッセージが表示され、ボタンが無効化される | 成功 | |
| 4 | App.test.tsx | App | navigates to the top page after a successful login | 正常系 | 正しい認証情報でログインする | トップ画面に遷移し、お知らせ一覧の導線が表示される | 成功 | |
| 5 | App.test.tsx | App | shows the authentication error and clears the password | 認証 | 誤ったパスワードでログインする | 認証エラーメッセージが表示され、パスワード欄がクリアされる | 成功 | |
| 6 | App.test.tsx | App | shows the system error when the API returns E_901 | 異常系 | ログインAPIがシステムエラーを返す状態で送信する | システムエラーメッセージが表示される | 成功 | |
| 7 | App.test.tsx | App | renders the top page notice list and login information | 初期表示 | トップ画面を表示する | 組合員コード、ログイン名、お知らせ一覧、New表示、マイページ導線が表示される | 成功 | |
| 8 | App.test.tsx | App | shows the empty state when there are no dividend notices | 異常系 | お知らせ一覧が0件の状態でトップ画面を表示する | 空状態メッセージが表示される | 成功 | |
| 9 | App.test.tsx | App | redirects to the login form when the top page request returns E_001 | 認証 | セッション切れ状態でトップ画面を表示する | ログイン画面へリダイレクトされる | 成功 | |
| 10 | App.test.tsx | App | logs out from the top page and returns to the login form | ユーザ操作 | トップ画面でログアウトを実行する | ログイン画面へ戻る | 成功 | |
| 11 | DividendNoticePage.test.tsx | DividendNoticePage | navigates from the top page to the dividend notice detail page | ユーザ操作 | トップ画面からお知らせ詳細を開く | 配当金のお受取に関する情報と受取方法入力欄が表示される | 成功 | |
| 12 | DividendNoticePage.test.tsx | DividendNoticePage | updates the receipt method and shows a success message | 正常系 | 配当金の受取方法を変更して確定する | 更新成功メッセージが表示され、選択値が更新後の値になる | 成功 | |
| 13 | DividendNoticePage.test.tsx | DividendNoticePage | shows a business error when the update request is rejected | 異常系 | 配当金受取方法更新APIが業務エラーを返す状態で確定する | 業務エラーメッセージが表示される | 成功 | |
| 14 | DividendNoticePage.test.tsx | DividendNoticePage | renders the receipt method as read-only when updates are not allowed | 初期表示 | 受取方法変更不可のお知らせ詳細を表示する | 受取方法が読み取り専用で、確定ボタンが無効化される | 成功 | |
| 15 | MyPage.test.tsx | MyPage | navigates from the top page to the my page | ユーザ操作 | トップ画面からマイページを開く | マイページ見出しと組合員情報詳細が表示される | 成功 | |
| 16 | MyPage.test.tsx | MyPage | switches to edit mode, saves the profile, and shows a success message | 正常系 | マイページを編集モードに切り替えて情報を更新保存する | 更新成功メッセージが表示され、保存後に更新内容が表示される | 成功 | |
| 17 | MyPage.test.tsx | MyPage | shows validation errors and does not submit invalid values | バリデーション | 不正な郵便番号とメールアドレスで保存する | 入力エラーメッセージが表示され、更新成功表示は出ない | 成功 | |
| 18 | MyPage.test.tsx | MyPage | shows an API error when the update request is rejected | 異常系 | 組合員情報更新APIが業務エラーを返す状態で保存する | APIエラーメッセージが表示される | 成功 | |