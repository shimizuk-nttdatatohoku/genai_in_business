# シーケンス図一覧

- 図ID: SQ-001 / 対象機能: ログイン（LGN_001） / 概要: 組合員コード・パスワードによる認証
- 図ID: SQ-002 / 対象機能: トップ画面表示（TOP_001） / 概要: 出資配当金お知らせ一覧・マイページリンク表示
- 図ID: SQ-003 / 対象機能: 出資配当金お知らせ確認・受取方法変更（DIV_001, DIV_002） / 概要: 配当金情報参照・受取方法変更
- 図ID: SQ-004 / 対象機能: マイページ（MYP_001） / 概要: 組合員情報参照・更新

---

## SQ-001 ログイン（正常系・例外系）

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザ
    participant UI as ログイン画面(UI)
    participant API as API/Backend
    participant DB as DB

    Note over User,DB: 【前提】ユーザは組合員コード・パスワードを保持

    User->>UI: ① 組合員コード・パスワード入力
    UI->>API: ② login APIリクエスト
    API->>DB: ③ 認証情報照会
    DB-->>API: ④ 結果返却
    alt 認証成功
        API-->>UI: ⑤ 認証OKレスポンス
        UI-->>User: ⑥ トップ画面へ遷移
    else 認証失敗
        API-->>UI: エラー応答（E_001:「組合員コードまたはパスワードが正しくありません」）
        UI-->>User: エラーメッセージ表示
    end
```

---

## SQ-002 トップ画面表示

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザ
    participant UI as トップ画面(UI)
    participant API as API/Backend
    participant DB as DB

    Note over User,DB: 【前提】認証済みセッション

    User->>UI: ① トップ画面アクセス
    UI->>API: ② getDividendNoticeList APIリクエスト
    API->>DB: ③ 出資配当金お知らせ一覧取得
    DB-->>API: ④ 結果返却
    API-->>UI: ⑤ お知らせ一覧レスポンス
    UI-->>User: ⑥ お知らせ一覧・マイページリンク表示

    alt セッション切れ
        API-->>UI: エラー応答（E_002:「再ログインが必要です」）
        UI-->>User: ログイン画面へ遷移
    end
```

---

## SQ-003 出資配当金お知らせ確認・受取方法変更

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザ
    participant UI as お知らせ画面(UI)
    participant API as API/Backend
    participant DB as DB

    Note over User,DB: 【前提】認証済み・トップ画面から遷移

    User->>UI: ① お知らせ選択
    UI->>API: ② getDividendDetail APIリクエスト
    API->>DB: ③ 出資配当金詳細取得
    DB-->>API: ④ 結果返却
    API-->>UI: ⑤ 詳細レスポンス
    UI-->>User: ⑥ 詳細表示

    User->>UI: ⑦ 受取方法選択・確定
    UI->>API: ⑧ updateDividendMethod APIリクエスト
    API->>DB: ⑨ 受取方法更新
    DB-->>API: ⑩ 更新結果返却
    alt 更新成功
        API-->>UI: ⑪ 更新完了レスポンス
        UI-->>User: ⑫ 完了メッセージ表示
    else バリデーションエラー
        API-->>UI: エラー応答（E_101:「受取方法は必須です」）
        UI-->>User: エラーメッセージ表示
    else DBエラー
        API-->>UI: エラー応答（E_201:「システムエラーが発生しました」）
        UI-->>User: エラーメッセージ表示
    end
```

---

## SQ-004 マイページ（組合員情報参照・更新）

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザ
    participant UI as マイページ画面(UI)
    participant API as API/Backend
    participant DB as DB

    Note over User,DB: 【前提】認証済み・トップ画面から遷移

    User->>UI: ① マイページリンク押下
    UI->>API: ② getUserInfo APIリクエスト
    API->>DB: ③ 組合員情報取得
    DB-->>API: ④ 結果返却
    API-->>UI: ⑤ 組合員情報レスポンス
    UI-->>User: ⑥ 組合員情報表示

    User->>UI: ⑦ 情報編集・保存
    UI->>API: ⑧ updateUserInfo APIリクエスト
    API->>DB: ⑨ 組合員情報更新
    DB-->>API: ⑩ 更新結果返却
    alt 更新成功
        API-->>UI: ⑪ 更新完了レスポンス
        UI-->>User: ⑫ 完了メッセージ表示
    else バリデーションエラー
        API-->>UI: エラー応答（E_102:「住所は必須です」等）
        UI-->>User: エラーメッセージ表示
    else DBエラー
        API-->>UI: エラー応答（E_202:「システムエラーが発生しました」）
        UI-->>User: エラーメッセージ表示
    end
```

---

※命名・用語・エラー形式は各ルールファイルに準拠しています。
