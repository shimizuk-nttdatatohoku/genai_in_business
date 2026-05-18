# DB設計書（物理設計）

## 1. テーブル一覧
| テーブル名 | 論理名 | 種別（マスタ/トラン/履歴/ログ） | 概要 |
|---|---|---|---|
| xxx | xxx | xxx | xxx |

## 2. テーブル定義

### 2.x <table_name>
- 論理名：
- 概要：
- 種別：
- 主キー（PK）：
- 外部キー（FK）：
- ユニーク制約：
- インデックス（提案）：
- 備考（論理削除/監査/バージョン管理など）：

#### カラム定義
| カラム名 | 論理名 | 型 | 桁 | NULL | PK | FK | UNIQUE | DEFAULT | 説明 |
|---|---|---|---|---|---|---|---|---|---|

## 3. リレーション（物理）
- 外部キー一覧（親→子）を列挙
- ON DELETE / ON UPDATE の動作（CASCADE / RESTRICT 等）を提案

## 4. インデックス設計
- 検索条件を想定したインデックス
- 複合インデックスの提案（例：status + created_at）
- 一覧/searchの性能観点で必要なもの

## 5. DDL（例）
※主要テーブルのみでOK

```sql
CREATE TABLE xxx (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL