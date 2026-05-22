# DIV_001 出資配当金お知らせ確認 処理設計書

## 1. 機能概要

| 項目 | 内容 |
|---|---|
| 機能ID | DIV_001 |
| 機能名 | 出資配当金お知らせ確認 |
| 目的/ゴール | 出資残高、出資配当金額、受取状況、注意事項を組合員本人へ表示する。 |
| 利用者 | 組合員 |
| 画面/操作トリガー | トップ画面のお知らせタイトル押下後に詳細画面表示 |
| 入力 | noticeId、セッション Cookie |
| 出力 | 出資配当詳細、受取方法初期値、受取状況、注意事項 |
| 前提条件 | ログイン済みであり、選択した noticeId が存在すること。 |
| 関連画面 | SCR-003 出資配当金お知らせ画面 |
| 関連IF | IF-004 出資配当金お知らせ詳細取得 |

## 2. 入出力データ定義

### 2.1 入力項目

| 項目名 | 型 | 必須 | 制約 | 初期値 |
|---|---|---|---|---|
| noticeId | string | Y | 一覧で選択済みであること | 画面保持値 |
| セッション Cookie | string | Y | 有効セッションであること | ブラウザ保持値 |
| X-Request-Id | string | Y | UUID 形式 | クライアント生成 |

### 2.2 出力項目

| 項目名 | 型 | 説明 |
|---|---|---|
| noticeTitle | string | お知らせタイトル |
| userCode | string | ヘッダ表示用組合員コード |
| loginName | string | ヘッダ表示用ログイン名 |
| receiptStatus | string | 受取済/未受取 |
| receiptMethod | string | 現在の配当金受取方法 |
| receiptMethodOptions | array | 受取方法候補 |
| dividendDetails | array | 出資残高、出資配当金額、出資配当率等 |
| remarks | array | 注意事項 |
| canUpdateReceiptMethod | boolean | 受取方法変更可否 |

### 2.3 画面状態

| 状態 | 内容 |
|---|---|
| loading | 詳細エリアをスケルトン表示 |
| loaded | 取得データを表示 |
| readonly | 受取済または受付期間外のため受取方法変更不可 |
| error | 画面上部にエラーメッセージ表示 |

## 3. 正常系処理フロー

1. UI は SCR-003 表示時に noticeId の存在を確認する。
2. noticeId が存在する場合、UI は GET /api/v1/dividend-notices/{noticeId} を送信する。
3. NoticeController はセッションを検証し、noticeId を受領する。
4. NoticeService は DividendNoticeRepository.dividend_notices から対象 noticeId の公開情報を取得する。
5. NoticeService は DistributionRepository.distributions から対象組合員の当年出資配当情報を取得する。
6. NoticeService は ReceiptMethodMasterRepository.receipt_method_master から受取方法候補を取得する。
7. NoticeService は受取済フラグ、受付期間、本人データ判定から `canUpdateReceiptMethod` を算出する。
8. NoticeController は詳細データを返却する。
9. UI は noticeTitle、receiptStatus、receiptMethod、dividendDetails、remarks を表示する。
10. `canUpdateReceiptMethod=false` の場合、UI は受取方法選択欄を読取専用とし、確定ボタンを非活性化する。

### 3.1 トランザクション境界

| 境界 | 内容 |
|---|---|
| TX-01 | 詳細取得は参照トランザクションとして扱う |

## 4. 例外/エラー処理

### 4.1 認証・認可エラー

| エラーコード | 検知条件 | 表示内容 | 復帰方法 |
|---|---|---|---|
| E_001 | セッション無効、タイムアウト | 「セッションの有効期限が切れました」を表示して SCR-001 へ遷移 | 再ログイン |
| E_002 | noticeId は存在するが他組合員向けデータ | 403 相当の共通エラー表示 | トップ画面へ戻る |

### 4.2 業務エラー

| エラーコード | 検知条件 | 表示内容 | 復帰方法 |
|---|---|---|---|
| E_404 | noticeId が未存在または非公開 | トップ画面へ戻し「お知らせが見つかりません」を表示 | 一覧再選択 |

### 4.3 システムエラー

| エラーコード | 検知条件 | ユーザー通知 | 処理 |
|---|---|---|---|
| E_901 | 詳細取得失敗、DB 障害、タイムアウト | 画面上部に「時間をおいて再度お試しください」を表示 | loading を解除し、再試行可能状態へ戻す |

## 5. データ更新・整合性

| 項目 | 内容 |
|---|---|
| 参照データ | `dividend_notices`、`distributions`、`receipt_method_master` |
| 更新データ | 本機能単体では DB 更新なし |
| 使用 Repository | DividendNoticeRepository、DistributionRepository、ReceiptMethodMasterRepository |
| 参照順序 | 1. お知らせ情報 2. 出資配当情報 3. 受取方法マスタ 4. 更新可否判定 |
| 整合性ルール | 公開対象でないお知らせ、本人以外のデータは返却しない |
| 冪等性 | あり |
| 排他 | 参照系のため排他制御なし |

## 6. ログ/監査/運用観点

| 観点 | 内容 |
|---|---|
| 操作ログ | request_id、endpoint、method、user_code、notice_id |
| 監査ログ | notice_id の参照履歴、user_code、参照日時 |
| エラーログ | request_id、例外内容、stacktrace |
| 性能観点 | 詳細取得は 10 秒以内を目標とする |
| 運用観点 | 配当金受取方法の説明文と受付期限文言は運用担当が更新可能な管理値とする |

## 7. 前提・要確認事項

- 前提: 詳細表に表示する項目順は運用上固定とする。
- 要確認: お知らせ表示時に既読更新が必要か。
