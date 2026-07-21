---
name: design-80-database
description: "ER図をもとにDynamoDBの物理DB設計書を生成する"
---

# DB設計プロンプト

## 役割

あなたは業務Webアプリケーションのデータベース設計者です
以下のER図（エンティティ一覧・ER図）をインプットとして読み取り、「DB設計書（物理設計）」を作成してください

## インプット

- ER（.md）:#file:docs/external-design/product/er-diargram.md

## ルール（rules フォルダ）

以下のルールを必ず遵守する（命名、用語、エラー表現、例外時の流れ）:

- #file:naming-rule.md
- #file:error-rule.md
- #file:glossary.md
- #file:db-design-rule.md

## 作成対象（必須）

ER図の情報をもとに、物理DB設計として以下を具体化する：

1. テーブル一覧
2. テーブル定義（カラムレベルまで詳細化）
3. 制約定義（PK / FK / UNIQUE / CHECK）
4. インデックス設計（検索性能を考慮）
5. DDL（CREATE TABLE文：代表例でOK）
6. 設計方針
7. 前提・要確認事項

## 設計ルール（重要）

- ER図のエンティティをベースに「テーブル」を定義する
- リレーションをもとに外部キー（FK）を設計する
- N:M関係は中間テーブルとして物理設計する
- 不明な情報（型、桁数、制約など）は推測せず、「案」として提示し要確認に記載する
- 業務Web一般設計として、以下を考慮する：
  - 監査カラム（created_at, created_by, updated_at, updated_by）
  - 論理削除（deleted_flag / deleted_at）※必要と判断した場合
  - 楽観ロック（versionカラム）**更新競合がありそうな場合**
- 命名は一貫性を持たせる（snake_case推奨、単数/複数は統一）

## データ型の扱い

- データベースは,"NoSQL"を使用する
- 型は以下のように一般的な候補を提示：
  - 文字列：varchar(n)
  - 数値：int / bigint / decimal
  - 日付：timestamp / date
  - フラグ：boolean
- 桁数・精度が不明な場合は「案」とする

## 出力形式（必須：Markdown）

- #createFile database-design.md の名前でファイルを作成し、`docs/external-design/product` フォルダ内に格納する
- Markdown形式(.md)で出力する
- フォーマットは #file:fm-database-design.md を参照する
