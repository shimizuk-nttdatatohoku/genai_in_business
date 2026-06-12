# API設計書作成プロンプト

## 役割

あなたは業務Webアプリケーションのバックエンド/API設計者です
以下のインプット資料（機能一覧・インタフェース設計書）を読み取り、「API一覧」を作成してください
インタフェース設計書に定義されているIF-ID/API仕様を正として、機能一覧の各機能がどのAPIを利用するか対応付けた一覧にしてください

## インプット（requirements フォルダ）

- 機能一覧（.md）: #file:function-list.md
- インタフェース設計書（.md）: #file:external-design/product/interface-design.md

## ルール（rules フォルダ）

以下のルールを必ず遵守する（命名、用語、エラー表現、例外時の流れ）:

- #file:naming-rule.md
- #file:error-rule.md
- #file:glossary.md
- #file:api-design-rule.md  

## 作成対象（必須）

1. Backendが提供するAPI（Web-API）の一覧を漏れなく作成
2. 各APIについて、最低限以下を確定/整理（未確定は「案」または「要確認」で分離）：
   - API-ID（採番）、IF-ID（interface-design.mdの該当IDがあれば紐付け）
   - API名/目的（何のためのAPIか）
   - method / path
   - リクエスト（path/query/body）主要項目
   - レスポンス主要項目
   - 認証/認可（ロール/権限が要件にあれば）
   - エラー（HTTPステータス、業務エラーコード、代表メッセージ、リトライ可否）
   - 冪等性（二重送信防止が必要なAPI：登録/更新/削除）
   - ページング/ソート/フィルタ（一覧取得系API）
   - 非機能（タイムアウト、レート制限、リトライ方針が記載されていれば反映）
3. 機能一覧の「機能ID」→利用API（API-ID）を必ず対応付ける
4. APIの粒度が曖昧な場合は、機能とインタフェース設計の整合が取れる最小粒度で提案し、「要確認」に記載する

## 設計ルール（重要）

- インタフェース設計書に明記されている内容（エンドポイント、項目、エラー等）を最優先で反映する
- 記載が無い情報は勝手に断定しない（「案」「前提」「要確認」で明確に分離）
- 一覧/検索系はページング（page/size等）とソート（sort等）を考慮し、設計書に合わせて記載
- 更新系（POST/PUT/PATCH/DELETE）は冪等性（Idempotency-Key等）や多重送信防止方針が書かれていれば必ず記載
- 命名は資料内の表記に合わせて統一する（機能名、用語、略語）

## 出力形式（必須：Markdown）

- #createFile api-catalog.md の名前でファイルを作成し、`docs\external-design\product`フォルダ内に格納する
- Markdown形式(.md)で出力する
- フォーマットは #file:fm-api-catalog.md を参照する
