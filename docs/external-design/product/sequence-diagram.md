## シーケンス図

# シーケンス図一覧
- 図ID: SQ-001 / 対象機能: LGN_001 ログイン / 概要: ユーザが組合員コードとパスワードで認証し、トップ画面を表示する
- 図ID: SQ-002 / 対象機能: MYP_001 マイページ（組合員情報表示・更新） / 概要: ユーザがマイページを表示し、組合員情報を更新する
- 図ID: SQ-003 / 対象機能: DIV_002 配当金受取方法変更 / 概要: ユーザが出資配当金のお知らせ画面から受取方法を変更する
- 図ID: SQ-004 / 対象機能: LGN_001 ログイン（例外系） / 概要: 認証失敗時にエラーメッセージを表示する

# シーケンス図（Mermaid）

## SQ-001 ログイン

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザ
    participant UI as ログイン画面(UI)
    participant API as Auth API/Backend
    participant DB as 新組DB

    Note over User,DB: 前提条件: ユーザはログイン画面へアクセス済み

    User->>UI: 組合員コードとパスワードを入力し、ログインを実行
    UI->>API: 認証要求を送信
    API->>DB: 認証情報を照合
    DB-->>API: 認証結果を返却
    API-->>UI: 認証成功レスポンスとトップ画面表示用データを返却
    UI-->>User: トップ画面を表示
```

## SQ-002 マイページ表示・更新

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザ
    participant TopUI as トップ画面(UI)
    participant MyPageUI as マイページ画面(UI)
    participant API as User API/Backend
    participant DB as 新組DB

    Note over User,DB: 前提条件: ユーザはログイン済みでトップ画面を表示中

    User->>TopUI: マイページリンクを押下
    TopUI->>API: 組合員情報取得要求を送信
    API->>DB: ログインユーザの組合員情報を取得
    DB-->>API: 組合員情報を返却
    API-->>MyPageUI: 組合員情報レスポンスを返却
    MyPageUI-->>User: マイページ画面を表示
    User->>MyPageUI: 更新項目を入力
    User->>MyPageUI: 更新内容を送信
    MyPageUI->>API: 組合員情報更新要求を送信
    API->>DB: 組合員情報を更新
    DB-->>API: 更新結果を返却
    API-->>MyPageUI: 更新成功レスポンスを返却
    MyPageUI-->>User: 更新後のマイページ画面を表示
```

## SQ-003 配当金受取方法変更

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザ
    participant TopUI as トップ画面(UI)
    participant NoticeUI as 出資配当金お知らせ画面(UI)
    participant API as Distribution API/Backend
    participant DB as 新組DB

    Note over User,DB: 前提条件: ユーザはログイン済みでトップ画面を表示中

    User->>TopUI: 出資配当金のお知らせを開く
    TopUI->>NoticeUI: 出資配当金お知らせ画面へ遷移
    NoticeUI-->>User: 出資残高と配当金額を表示
    User->>NoticeUI: 受取方法を選択
    User->>NoticeUI: 確定を実行
    NoticeUI->>API: 配当金受取方法更新要求を送信
    API->>DB: 配当金受取方法を更新
    DB-->>API: 更新結果を返却
    API-->>NoticeUI: 更新成功レスポンスを返却
    NoticeUI-->>User: 変更処理完了を表示
```

## SQ-004 ログイン認証失敗

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザ
    participant UI as ログイン画面(UI)
    participant API as Auth API/Backend
    participant DB as 新組DB

    Note over User,DB: 前提条件: ユーザはログイン画面へアクセス済み

    User->>UI: 組合員コードとパスワードを入力し、ログインを実行
    UI->>API: 認証要求を送信
    API->>DB: 認証情報を照合
    DB-->>API: 認証失敗結果を返却
    API-->>UI: 401 Unauthorized とエラー応答を返却
    UI-->>User: 認証エラーメッセージを表示

    Note over API,UI: エラー応答例
    rect rgb(245, 245, 245)
        Note over API,UI: {"success": false, "data": null, "errors": [{"code": "E_001", "message": "組合員コードまたはパスワードが正しくありません"}]}
    end
```
