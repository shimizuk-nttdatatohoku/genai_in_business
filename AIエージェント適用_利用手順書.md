# AI駆動開発 手順書

|  |  |
|:---|:---|
| **システム名** | 組合情報参照システム |
| **作成日** | 2026/07/03 |
| **対象読者** | 開発者・AI駆動開発検証担当者・レビュー担当（上長含む） |

---

## 目次

1. [本手順書の目的とゴール](#1-本手順書の目的とゴール)
2. [フォルダ構成](#2-フォルダ構成)
3. [開発フロー全体図](#3-開発フロー全体図)
4. [設計〜試験で使用するプロンプトの概要](#4-設計試験で使用するプロンプトの概要)
5. [インストラクションファイルの説明と構成](#5-インストラクションファイルの説明と構成)
6. [要件定義・設計・環境構築・実装・単体試験](#6-要件定義設計環境構築実装単体試験)
7. [AWS環境構築](#7-aws環境構築)
8. [デプロイ環境構築（CI/CD）](#8-デプロイ環境構築cicd)
9. [試験（システムテスト）](#9-試験システムテスト)
10. [付録](#10-付録)

---

## 1. 本手順書の目的とゴール

### 1-1. 本手順書の目的

本手順書は、**GitHub Copilot（エージェントモード）を中心とした AI 駆動開発**の進め方を説明した資料であり、 Web アプリケーションを「要件定義」から「システムテスト」まで一気通貫で開発・検証するための手順となっている。

### 1-2. AI駆動開発とは（前提知識）

- **AI 駆動開発**とは、設計・実装・テストなどの各工程を、人間が定義した**プロンプト（指示書）**と**ルール（規約）**をもとにGitHub Copilot が生成・支援する開発スタイルのことを指す。
- 本プロジェクトでは、以下の3種類のファイルで Copilot の挙動を制御している。
  - **Prompt Files（`.github/prompts/`）**: 工程ごとの具体的な作業指示
  - **Instructions（`.github/instructions/` と `.github/copilot-instructions.md`）**: 常時適用される共通ルールへの導線
  - **Rules（`docs/rules/`）**: 命名・設計・実装・テストなどの規約の正本
- 開発者は Copilot Chat で「どのプロンプトを実行するか」を選ぶだけで、規約に沿った成果物を生成することができる。

### 1-3. ゴール（完成状態）

本手順書のゴール像は下記の通りである。

| ゴール | 内容 |
|:---|:---|
| 外部設計書一式 | `docs/external-design/product/` 配下に設計書が生成されている |
| フロントエンド | React + TypeScript の画面が実装され、単体テストが通過している |
| バックエンド | FastAPI + Lambda + DynamoDB のAPIが実装され、単体テストが通過している |
| インフラ | AWS 上に DynamoDB / Lambda / API Gateway / S3 / CloudFront が構築されている |
| CI/CD | `main` ブランチへのマージで自動デプロイされる |
| システムテスト | Playwright による E2E テストが実施され、結果が試験項目書に反映されている |

### 1-4. 開発対象システムの概要

| 項目 | 内容 |
|:---|:---|
| システム名 | 組合情報参照システム |
| 主なユーザー | 組合員（一般ユーザー） |
| 主な機能 | ログイン／トップ画面／出資配当金お知らせ確認／配当金受取方法変更／マイページ（組合員情報参照・更新） |
| 技術スタック | React + TypeScript（フロント）／ Python + FastAPI（バック）／ Amazon DynamoDB ／ AWS Lambda |

**機能一覧（`docs/requirement-definition/function-list.md` より抜粋）**:

| 機能ID | 機能名 | 概要 |
|:---|:---|:---|
| LGN_001 | ログイン | 組合員コード・パスワードによるログイン |
| LGN_002 | ログアウト | システムから安全にログアウト |
| TOP_001 | トップ画面表示 | 出資配当金お知らせ一覧とマイページへの導線を表示 |
| DIV_001 | 出資配当金お知らせ確認 | 出資残高・配当金額等の詳細を表示 |
| DIV_002 | 配当金受取方法変更 | 当年の配当金受取方法を選択・変更 |
| MYP_001 | マイページ | 登録済みの組合員情報（住所等）を表示・更新 |

---

## 2. フォルダ構成

AI 駆動開発では「どのフォルダに何を置くか」が Copilot の参照精度に直結するため、役割ごとにフォルダを作成し、下記の構成としている。

```text
project-root/
├── AGENTS.md                     # プロジェクト共通ガイド（AIが最初に読む正本）
├── AI-DRIVEN-DEVELOPMENT.md      # 本手順書
├── README.md
│
├── .github/
│   ├── copilot-instructions.md   # Copilot 共通の振る舞い（常時適用）
│   ├── instructions/             # スコープ別 Instructions（ファイルパターンで自動適用）
│   │   ├── frontend.instructions.md
│   │   └── backend.instructions.md
│   ├── prompts/                  # 工程別 Prompt Files（手動で選択・実行）
│   │   ├── design-10-sequence-diagram.prompt.md
│   │   ├── design-20-interface.prompt.md
│   │   ├── design-30-api-catalog.prompt.md
│   │   ├── design-40-er-diargram.prompt.md
│   │   ├── design-50-database.prompt.md
│   │   ├── design-60-process.prompt.md
│   │   ├── design-70-screen.prompt.md
│   │   ├── design-80-architecture.prompt.md
│   │   ├── develop-frontend.prompt.md
│   │   ├── develop-backend.prompt.md
│   │   ├── review-frontend.prompt.md
│   │   ├── review-backend.prompt.md
│   │   ├── test-unit-frontend.prompt.md # 単体テストで試験項目書が必要な場合にのみ使用。今回は対象外。
│   │   ├── test-unit-frontend-run.prompt.md
│   │   ├── test-unit-backend.prompt.md # 単体テストで試験項目書が必要な場合にのみ使用。今回は対象外。
│   │   ├── test-unit-backend-run.prompt.md
│   │   ├── test-system-10-viewpoint.prompt.md
│   │   ├── test-system-20-testcode.prompt.md
│   │   ├── test-system-30-testdata.prompt.md
│   │   ├── test-system-40-items.prompt.md
│   │   └── test-system-50-run.prompt.md
│   └── workflows/                # GitHub Actions（CI/CD）
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
│
├── docs/                         # ドキュメント（AIの入力・出力先）
│   ├── requirement-definition/   # 要件定義（手動作成）
│   │   ├── requirements.md
│   │   └── function-list.md
│   ├── external-design/
│   │   ├── format/               # 設計書のフォーマット（AIの出力テンプレート）
│   │   └── product/              # 設計書の成果物（AIの出力先）
│   ├── rules/                    # 規約の正本（AIが遵守するルール）
│   │   ├── common/               # naming / error / glossary / implementation
│   │   ├── design/               # api / db / screen / process の設計ルール
│   │   └── development/          # frontend / backend / serverless / test ルール
│   └── tests/                    # テスト観点・試験項目書
│
├── frontend/                     # React (TypeScript)
│   ├── src/                      # api / components / hooks / pages / mocks / types
│   └── tests/                    # 単体テスト・E2E テスト（Playwright）
│
├── backend/                      # FastAPI (Python)
│   ├── app/                      # routers / services / repositories / schemas / models / common
│   ├── infra/scripts/            # ローカル DynamoDB テーブル作成スクリプト
│   └── tests/                    # unit / integration
│
└── shared/                       # フロント・バック共通の型定義
    └── types/
```

### フォルダ構成のポイント

| フォルダ | 役割 | AIとの関係 |
|:---|:---|:---|
| `docs/requirement-definition/` | 要件定義（人間が作成） | AIの**入力** |
| `docs/rules/` | 規約の正本 | AIが**遵守** |
| `docs/external-design/format/` | 設計書テンプレート | AIの**出力書式** |
| `docs/external-design/product/` | 設計書成果物 | AIの**出力先** |
| `.github/prompts/` | 工程別の指示書 | AIへの**作業指示** |
| `.github/instructions/` | スコープ別の常時ルール | AIに**自動適用** |

---

## 3. 開発フロー全体図

```text
要件定義（手動）
  └─ 要件定義書・機能一覧を作成する
        ↓
外部設計（AI生成：design-*.prompt.md）
  ├─ アーキテクチャ設計・シーケンス図・処理設計書
  ├─ 画面設計書・ER図・DB設計書
  └─ インタフェース設計書・API一覧
        ↓
ローカル環境構築（手動：コマンド実行）
  ├─ フロントエンド（npm install）
  └─ バックエンド（venv + pip + moto DynamoDB）
        ↓
実装（AI生成：develop-*.prompt.md）
  ├─ フロントエンド（画面単位）
  └─ バックエンド（一括）
        ↓
レビュー（AI：review-*.prompt.md）
  ├─ フロントエンドレビュー
  └─ バックエンドレビュー
        ↓
単体テスト（AI生成・実施：test-unit-*.prompt.md）
  ├─ フロントエンド（Vitest + RTL）
  └─ バックエンド（pytest + moto）
        ↓
AWS環境構築（AWSマネジメントコンソール：手動）
  └─ DynamoDB / Lambda / API Gateway / S3 / CloudFront / IAM
        ↓
デプロイ環境構築（GitHub Actions：CI/CD）
  ├─ フロントエンドデプロイ（S3 + CloudFront）
  └─ バックエンドデプロイ（Lambda）
        ↓
システムテスト（AI生成・実施：test-system-*.prompt.md）
  └─ 観点表 → テストコード → テストデータ → 項目書 → 実施・結果反映
```

> **進め方の原則**: 上から順に実施する。設計工程は前の成果物を次工程の入力とするため、**番号順ではなく依存関係の順**（下表「実行順」）で実行すること。

---

## 4. 設計〜試験で使用するプロンプトの概要

Prompt Files は `.github/prompts/` に配置されている。Copilot Chat（エージェントモード）でファイル名を指定することで、プロンプトの実行が可能である。

### 4-1. プロンプトの実行方法（共通）

1. VS Code で Copilot Chat を開き、**エージェントモード**を選択する
2. チャット入力欄で対象のプロンプトファイルを指定する（`/` またはファイル添付で選択）
3. 画像入力が必要なプロンプト（画面デザイン・業務フロー図）は、**PNG をチャットに直接添付**する
4. 生成結果を確認し、設計書・規約との整合性をレビューする

### 4-2. 設計フェーズのプロンプト

> 設計書の出力先はすべて `docs/external-design/product/` となる。**実行順**は依存関係に基づく推奨順序としている。

| 実行順 | プロンプトファイル | 概要 | 主な入力 |
|:---:|:---|:---|:---|
| 1 | `design-80-architecture.prompt.md` | AWSサーバレス構成のアーキテクチャ設計書を生成 | 要件定義書 |
| 2 | `design-10-sequence-diagram.prompt.md` | シーケンス図（Mermaid）を生成 | 要件定義書・機能一覧・業務フロー図(PNG) |
| 3 | `design-70-screen.prompt.md` | 画面設計書を生成 | 要件定義書・機能一覧・デザイン画像(PNG) |
| 4 | `design-20-interface.prompt.md` | インタフェース設計書を生成 | 要件定義書・機能一覧・画面設計書 |
| 5 | `design-30-api-catalog.prompt.md` | API一覧（api-catalog）を生成 | 機能一覧・インタフェース設計書 |
| 6 | `design-60-process.prompt.md` | 機能ごとの処理設計書を生成 | 機能一覧・画面設計書・インタフェース設計書 |
| 7 | `design-40-er-diargram.prompt.md` | ER図（Mermaid）を生成 | 要件定義書・機能一覧・処理設計書 |
| 8 | `design-50-database.prompt.md` | DynamoDB物理DB設計書を生成 | ER図 |

### 4-3. 実装フェーズのプロンプト

| プロンプトファイル | 概要 |
|:---|:---|
| `develop-frontend.prompt.md` | 画面（LGN-001 等）を React/TypeScript で実装する |
| `develop-backend.prompt.md` | FastAPI + Lambda + DynamoDB のバックエンドを設計書に基づき一括実装する |

### 4-4. レビューフェーズのプロンプト

| プロンプトファイル | 概要 |
|:---|:---|
| `review-frontend.prompt.md` | フロントエンドとテストコードを観点ベースでレビューし、指摘を優先度順に整理 |
| `review-backend.prompt.md` | バックエンドと pytest コードを観点ベースでレビューし、指摘を優先度順に整理 |

### 4-5. 単体テストフェーズのプロンプト

| プロンプトファイル | 概要 |
|:---|:---|
| `test-unit-frontend-run.prompt.md` | Vitest/RTL を実施し、カバレッジを出力 |
| `test-unit-backend-run.prompt.md` | pytest を実施し、カバレッジを出力 |

### 4-6. システムテストフェーズのプロンプト

| 実行順 | プロンプトファイル | 概要 |
|:---:|:---|:---|
| ST-01 | `test-system-10-viewpoint.prompt.md` | 設計書からテスト観点を洗い出し、観点表を生成 |
| ST-02 | `test-system-20-testcode.prompt.md` | 観点表・設計書から Playwright テストコードを生成 |
| ST-03 | `test-system-30-testdata.prompt.md` | テストコードから DynamoDB 初期投入データ（JSON/CSV）を生成 |
| ST-04 | `test-system-40-items.prompt.md` | Playwright テストコードからシステムテスト項目書を生成 |
| ST-05 | `test-system-50-run.prompt.md` | Playwright を実施し、結果をテスト項目書に反映 |

---

## 5. インストラクションファイルの説明と構成

インストラクション（Instructions）は、プロンプトのように毎回選択しなくても**常時 Copilot に適用されるルール**を記載したものである。
「共通の振る舞い」と「規約の正本」を分離することで、重複記載を避け、保守性を高める役割を持つ。

### 5-1. 制御ファイルの全体構成

```text
.github/copilot-instructions.md   … Copilot 共通の振る舞い（常時適用）
        │  参照
        ▼
AGENTS.md                          … プロジェクト全体の前提（正本）
        │  参照
        ▼
.github/instructions/*.md          … スコープ別ルールへの導線（applyTo で自動適用）
        │  参照
        ▼
docs/rules/**                      … 命名・設計・実装・テスト規約の正本
        ▲
        │  参照
.github/prompts/*.prompt.md        … 工程別の作業指示（都度実行）
```

### 5-2. 各ファイルの役割

| ファイル | 適用タイミング | 役割 |
|:---|:---|:---|
| `.github/copilot-instructions.md` | 常時 | 回答は日本語・コードは英語、既存実装優先、最小変更、推測実装禁止などの基本方針 |
| `AGENTS.md` | 常時（AIが参照） | プロジェクト概要・技術スタック・ビルド/テストコマンド・禁止事項の正本 |
| `.github/instructions/frontend.instructions.md` | `frontend/**/*.{ts,tsx}` 編集時に自動適用 | フロント実装時に参照すべき `docs/rules` への導線 |
| `.github/instructions/backend.instructions.md` | `backend/**/*.py` 編集時に自動適用 | バック実装時に参照すべき `docs/rules` への導線 |
| `docs/rules/**` | 上記から参照される | 規約の**正本**（重複記載しない） |

### 5-3. Instructions ファイルの仕組み（applyTo）

Instructions は先頭の YAML フロントマターの `applyTo` で**適用対象のファイルパターン**を指定している。
対象パターンに一致するファイルを編集するとき、該当ルールが自動で読み込まれ、適用される。

```markdown
---
applyTo: "backend/**/*.py"
---

# Backend Custom Instruction
## 参照先
- docs/rules/development/backend-rule.md
- docs/rules/development/serverless-rule.md
- docs/rules/common/naming-rule.md ...
```

- **ポイント**: Instructions 自体には規約本文を書かず、`docs/rules` への**導線（参照先リスト）**のみを記載する。
  規約の正本を1箇所（`docs/rules`）に集約することで、二重管理を防ぐ。

### 5-4. 規約（docs/rules）の構成

| 分類 | ファイル | 内容 |
|:---|:---|:---|
| 共通 | `common/naming-rule.md` | 命名規則 |
| 共通 | `common/error-rule.md` | エラー設計規則 |
| 共通 | `common/glossary.md` | 用語集 |
| 共通 | `common/implementation-rule.md` | 環境依存値・固定URLの扱い等の実装規約 |
| 設計 | `design/api-design-rule.md` | API設計規則 |
| 設計 | `design/db-design-rule.md` | DB設計規則 |
| 設計 | `design/screen-design-rule.md` | 画面設計規則 |
| 設計 | `design/process-design-rule.md` | 処理設計規則 |
| 開発 | `development/frontend-rule.md` | フロントエンド実装規約 |
| 開発 | `development/backend-rule.md` | バックエンド実装規約 |
| 開発 | `development/serverless-rule.md` | サーバレス（Lambda）実装規約 |
| 開発 | `development/test-rule.md` | テスト規約 |

### 5-5. 参照の優先順位

複数の指示が競合する場合、Copilot は以下の優先順位で判断すること（`copilot-instructions.md` に規定）。

1. ユーザーからの指示
2. `AGENTS.md`（プロジェクト全体の前提）
3. 関連する `docs/rules`（実装・設計・試験ルール）
4. Prompt Files（今回のタスク固有の指示）
5. 既存ソースコード
6. 一般的なベストプラクティス

---

## 6. 要件定義・設計・環境構築・実装・単体試験

下記より実際の開発手順となる。項番の順で進めること。

### 6-1. 要件定義（手動）

> **目的**: AI が設計・実装で参照する「入力の正本」を人間が用意する。

| 作業者 | 成果物 | パス |
|:---|:---|:---|
| プロジェクトオーナー / 開発リーダー | 要件定義書 | `docs/requirement-definition/requirements.md` |
| 同上 | 機能一覧 | `docs/requirement-definition/function-list.md` |

**作成内容**:
1. システム概要・目的
2. システム構成（技術スタック）
3. 業務フロー
4. 機能要件（機能ID・業務ID・機能名・概要）
5. 非機能要件（セキュリティ・パフォーマンス等）

**機能一覧の形式**:

```markdown
| No | 業務ID | 機能ID | 機能名 | 概要 | 呼び出し元IF_ID | 機能種別 |
|----|--------|--------|--------|------|----------------|---------|
| 1  | LGN_0001 | LGN_001 | ログイン | ... | - | オンライン |
```

---

### 6-2. 外部設計（AI生成）

> **目的**: 要件定義書をもとに、実装の設計図（設計書一式）を AI に生成させる。
> **前提**: Copilot Chat のエージェントモードを使用。設計書の出力先は `docs/external-design/product/`。

[セクション4-2](#4-2-設計フェーズのプロンプト)の**実行順**に沿って、各プロンプトを順に実行する。

**手順（各設計書共通）**:
1. Copilot Chat（エージェントモード）を開く
2. 対象のプロンプトファイルを選択して実行する
3. 画像が必要なもの（画面設計書・シーケンス図）は **PNG をチャットに添付**する（インタフェース設計・処理設計は前工程の画面設計書を入力として使用するため PNG 不要）
4. 生成された設計書を `docs/external-design/product/` で確認する
5. 前工程の設計書を次工程の入力とするため、**順番を守る**

**設計書ごとの生成内容（要点）**:

| 設計書 | 主な生成内容 |
|:---|:---|
| アーキテクチャ | システム構成図・コンポーネント役割・データフロー・技術スタックの推奨理由 |
| シーケンス図 | 各機能の正常系／代表的な異常系（Mermaid） |
| 処理設計書 | 機能概要・入出力定義・処理フロー・状態遷移・トランザクション（機能単位に分割出力） |
| 画面設計書 | 画面概要・項目一覧・アクション・バリデーション・画面遷移 |
| ER図 | エンティティ一覧・概念ER図・論理ER図（DynamoDB前提で過度な正規化を避ける） |
| DB設計書 | テーブル定義・PK/SK・GSI・監査カラム・論理削除フラグ |
| インタフェース設計書 | 画面⇄API のIF定義・認証認可・エラー設計・非機能 |
| API一覧 | API-ID・method・path・req/res・認証・エラー・機能⇄API対応表 |

---

### 6-3. ローカル環境構築（手動・コマンド実行）

> **目的**: 生成したコードをローカルで動作確認・テストできるようにする。
> **前提条件**: Node.js 20 LTS 以上、Python 3.12 以上。

#### 6-3-1. 環境変数ファイルの作成

`.env.example` をコピーして作成する。**シークレットや AWS キーをコミットしないこと。**

**フロントエンド（`frontend/.env.local`）**:

```bash
VITE_API_BASE_URL=https://{API_GATEWAYのエンドポイントURL}
```

**バックエンド（`backend/.env`）**:

```bash
DYNAMODB_ENDPOINT=http://localhost:8000   # ローカルのみ
DYNAMODB_REGION=ap-northeast-1
MEMBERS_TABLE=members
DISTRIBUTIONS_TABLE=distributions
JWT_SECRET=<ローカル開発用のみ設定>
```

#### 6-3-2. フロントエンドのセットアップ

```powershell
cd frontend
npm install        # 依存パッケージのインストール
npm run dev        # 開発サーバー起動（Vite）
```

#### 6-3-3. バックエンドのセットアップ

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows（macOS/Linux は source .venv/bin/activate）
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

#### 6-3-4. moto による DynamoDB モック起動とテーブル作成

> moto は `requirements-dev.txt` に含まれる AWS モックライブラリ。`moto_server` コマンドでスタンドアロンサーバーとして起動することで、Docker なしでローカル DynamoDB をエミュレートが可能。

```powershell
# ターミナル1：仮想環境が有効な状態で moto サーバーを起動（ポート 8000）
# 6-3-3 で仮想環境を有効化済みであること（.venv\Scripts\activate）
moto_server dynamodb -H localhost -p 8000
```

```powershell
# ターミナル2：moto サーバー起動後にテーブル作成スクリプトを実行
cd backend
python infra/scripts/create_local_tables.py
```

#### 6-3-5. バックエンド開発サーバー起動

```powershell
cd backend
uvicorn app.main:app --reload    # http://127.0.0.1:8000
```

---

### 6-4. 実装（AI生成）

> **目的**: 設計書と規約に基づき、フロント・バックのコードを AI に生成させる。
> **前提**: `docs/external-design/product/` の設計書が揃っていること。

#### 6-4-1. フロントエンド実装（画面単位）

**プロンプト**: `develop-frontend.prompt.md`

**手順**:
1. 対象画面のデザイン（PNG）を Copilot Chat に添付する
2. `develop-frontend.prompt.md` を選択して実行する
3. AI が以下の順で実装を出力する:
   - `src/components/` … 汎用UIコンポーネント
   - `src/api/` … APIフック（`[resource].ts`）
   - `src/hooks/` … 汎用フック
   - `src/pages/[ScreenName]/` … 画面本体
   - `src/mocks/` … MSW（Mock Service Worker）ハンドラ
   - `tests/*.test.tsx` … 単体テスト
   - `src/types/` … 共通型定義（必要時）
4. 生成コードと設計書（画面設計・インタフェース設計）の整合性を確認する

> 画面が複数ある場合は、対象画面のデザインを差し替えてプロンプトを繰り返し実行する（LGN-001 → TOP-001 → DIV-001/002 → MYP-001）。

#### 6-4-2. バックエンド実装（一括）

**プロンプト**: `develop-backend.prompt.md`

**手順**:
1. `develop-backend.prompt.md` を実行する
2. AI が以下の設計書・ルールを読み込み、一括実装を出力する:

| カテゴリ | 参照 |
|:---|:---|
| 要件・機能 | function-list.md、screen-design.md |
| API仕様 | interface-design.md、api-catalog.md |
| 業務フロー | process-design/ 配下全ファイル |
| データ設計 | database-design.md、er-diargram.md |
| 実装ルール | backend-rule.md、serverless-rule.md |

3. 実装対象:

```text
backend/app/
├── routers/       # FastAPI ルーター（業務ロジックは書かない）
├── services/      # ビジネスロジック
├── repositories/  # DynamoDB アクセス
├── schemas/       # リクエスト・レスポンスの型
├── models/        # ドメインモデル
└── common/        # 共通処理（認証・エラー・ミドルウェア等）
```

4. 生成コードを確認する（特にセキュリティ・エラーハンドリング・個人情報のログ出力禁止）

---

### 6-5. コードレビュー（AI）

> **目的**: 実装が設計書・規約に沿っているか、セキュリティ上の問題がないかを AI に点検させる。

#### 6-5-1. フロントエンドレビュー

**プロンプト**: `review-frontend.prompt.md`

- 観点: 設計書との整合性 / `frontend-rule.md` 遵守 / バグ・ロジック誤り / 型安全性（`any` 禁止）/ テスト不足
- 指摘は優先度順（Critical / Major / Minor / Info）に整理される。修正後に再レビューする。

#### 6-5-2. バックエンドレビュー

**プロンプト**: `review-backend.prompt.md`

- 観点: API仕様・設計書との整合性 / `backend-rule.md` 遵守 / セキュリティ（OWASP Top 10）/ 個人情報のログ出力禁止 / `print()` ではなく `logger` を使用 / Lambda ステートレス設計

---

### 6-6. 単体テスト（AI生成・実施）

> **目的**: 実装の品質をコードレベルで担保する。**目標カバレッジは 80% 以上**。

#### 6-6-1. フロントエンド単体テスト

**テスト実施・カバレッジ確認**（`test-unit-frontend-run.prompt.md`）:

```powershell
cd frontend
npm run test -- --coverage
```

#### 6-6-2. バックエンド単体テスト

**テスト実施・カバレッジ確認**（`test-unit-backend-run.prompt.md`）:

```powershell
cd backend
pytest --cov=app --cov-report=term-missing
```

---

## 7. AWS環境構築

> **目的**: 実装したアプリを稼働させるインフラを AWS 上に構築する。
> **前提**: AWS アカウントおよび適切な IAM 権限を持つユーザーで作業すること。`database-design.md` の設計に従う。

### 7-1. DynamoDB テーブル作成

1. AWSマネジメントコンソールで **DynamoDB** →「テーブル」→「テーブルの作成」
2. 以下のテーブルを作成する

| テーブル名 | パーティションキー | ソートキー | 備考 |
|:---|:---|:---|:---|
| `members` | `member_id`（文字列） | - | 組合員情報 |
| `distributions` | `member_id`（文字列） | `year`（文字列） | 配布金 |
| `auth_sessions` | `session_id`（文字列） | - | 認証セッション |
| `notice_reads` | `member_id`（文字列） | `notice_id`（文字列） | お知らせ既読 |

3. キャパシティモード: **オンデマンド**
4. GSI が必要な場合は「インデックス」タブで追加、TTL が必要なテーブル（`auth_sessions` 等）は TTL 属性を設定

### 7-2. Lambda 関数作成

1. **Lambda** →「関数の作成」→「一から作成」

| 項目 | 値 |
|:---|:---|
| 関数名 | `genai-in-business-dev-backend` |
| ランタイム | Python 3.12 |
| アーキテクチャ | x86_64 |

2. 「設定」→「一般設定」

| 項目 | 値 |
|:---|:---|
| タイムアウト | 900 秒（15分） |
| メモリ | 512 MB（要件に応じて調整） |
| ハンドラ | `app.main.handler` |

3. 「環境変数」

| キー | 値 |
|:---|:---|
| `DYNAMODB_REGION` | `ap-northeast-1` |
| `MEMBERS_TABLE` | `members` |
| `DISTRIBUTIONS_TABLE` | `distributions` |
| `JWT_SECRET` | Secrets Manager の ARN（本番推奨） |

### 7-3. API Gateway 設定

1. **API Gateway** →「APIの作成」→「HTTP API」→「構築」
2. 統合に作成した Lambda を指定、ルートは `ANY /{proxy+}`、ステージは `$default`
3. 「CORS」設定

| 項目 | 値 |
|:---|:---|
| 許可オリジン | CloudFront のURL（開発時のみ `*`） |
| 許可ヘッダー | `Content-Type`, `Authorization` |
| 許可メソッド | `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` |

4. 発行された **API エンドポイント URL** を控える（フロントの `VITE_API_BASE_URL` に使用）

### 7-4. S3 バケット作成（フロント配信用）

1. **S3** →「バケットを作成」

| 項目 | 値 |
|:---|:---|
| バケット名 | 一意な名前（例: `genai-in-business-frontend-{アカウントID}`） |
| リージョン | `ap-northeast-1` |
| パブリックアクセス | 全てブロック（CloudFront 経由配信） |

2. バケット名を控える（GitHub Secrets に使用）

### 7-5. CloudFront ディストリビューション作成

1. **CloudFront** →「ディストリビューションを作成」
2. オリジン: 作成した S3 バケット、オリジンアクセス: **OAC（推奨）**（表示されるバケットポリシーを S3 に適用）
3. ビューワープロトコル: **Redirect HTTP to HTTPS**、キャッシュ: CachingOptimized
4. デフォルトルートオブジェクト: `index.html`
5. SPA対応のカスタムエラーページ

| HTTPエラー | レスポンスページ | レスポンスコード |
|:---|:---|:---|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

6. 発行された **CloudFront ドメイン名** を控える

### 7-6. IAM ロール・ポリシー設定

#### Lambda 実行ロールへのポリシー（最小権限）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
        "dynamodb:DeleteItem", "dynamodb:Query", "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-northeast-1:{アカウントID}:table/members",
        "arn:aws:dynamodb:ap-northeast-1:{アカウントID}:table/members/index/*",
        "arn:aws:dynamodb:ap-northeast-1:{アカウントID}:table/distributions",
        "arn:aws:dynamodb:ap-northeast-1:{アカウントID}:table/distributions/index/*",
        "arn:aws:dynamodb:ap-northeast-1:{アカウントID}:table/auth_sessions",
        "arn:aws:dynamodb:ap-northeast-1:{アカウントID}:table/notice_reads"
      ]
    }
  ]
}
```

#### GitHub OIDC プロバイダー登録（初回のみ）

1. **IAM** →「IDプロバイダ」→「プロバイダを追加」
2. プロバイダタイプ: **OpenID Connect**、URL: `https://token.actions.githubusercontent.com`、対象者: `sts.amazonaws.com`

#### GitHub Actions 用 IAM ロール作成（OIDC連携）

「カスタム信頼ポリシー」で以下を設定する。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::{アカウントID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
        "StringLike": { "token.actions.githubusercontent.com:sub": "repo:{GitHubユーザー名}/{リポジトリ名}:*" }
      }
    }
  ]
}
```

- **バックエンド用ロール**: `lambda:UpdateFunctionCode`, `lambda:GetFunction`, `lambda:GetFunctionConfiguration`
- **フロントエンド用ロール**: `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`, `cloudfront:CreateInvalidation`, `cloudfront:GetInvalidation`

各ロールの ARN を控える（GitHub Secrets に使用）。

---

## 8. デプロイ環境構築（CI/CD）

> **目的**: `main` ブランチへのマージをトリガーに、テスト・ビルド・デプロイを自動化する。
> **前提**: [セクション7](#7-aws環境構築)の AWS 環境と IAM ロールが構築済みであること。
> **ワークフロー**: `.github/workflows/deploy-frontend.yml` / `deploy-backend.yml`

### 8-1. GitHub Secrets の設定

GitHub リポジトリ →「Settings」→「Secrets and variables」→「Actions」→「New repository secret」に登録

| Secret名 | 値 |
|:---|:---|
| `AWS_BACKEND_ROLE_ARN` | バックエンド用 IAM ロールの ARN |
| `AWS_FRONTEND_ROLE_ARN` | フロントエンド用 IAM ロールの ARN |
| `S3_BUCKET_NAME` | フロントエンド用 S3 バケット名 |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront ディストリビューション ID |

### 8-2. GitHub Variables の設定（任意）

「Variables」タブで登録しする。

| Variable名 | 値 |
|:---|:---|
| `BACKEND_LAMBDA_FUNCTION_NAME` | Lambda 関数名（省略時: `genai-in-business-dev-backend`） |

### 8-3. フロントエンドデプロイ（deploy-frontend.yml）

**トリガー**: `main` への push（`frontend/**` 変更時）または手動実行（`workflow_dispatch`）

**実行ステップ**:
1. コードチェックアウト
2. Node.js 24 のセットアップ（`npm ci` キャッシュ利用）
3. `npm ci`（依存インストール）
4. `npm run lint`（ESLint）
5. `npm run test`（ユニットテスト）
6. `npm run build`（本番ビルド）
7. AWS 認証（OIDC）
8. S3 へアップロード
   - キャッシュ可能アセット（JS/CSS 等）: `Cache-Control: public, max-age=31536000, immutable`
   - `index.html`: `Cache-Control: no-cache, no-store, must-revalidate`
9. CloudFront キャッシュ無効化（`/*`）と完了待機

**確認方法**: GitHub の「Actions」タブで実行結果を確認 → 成功後 CloudFront URL で動作確認。

### 8-4. バックエンドデプロイ（deploy-backend.yml）

**トリガー**: `main` への push（`backend/**` 変更時）または手動実行（`workflow_dispatch`）

**実行ステップ**:
1. コードチェックアウト
2. Python 3.12 のセットアップ（pip キャッシュ利用）
3. `requirements.txt` / `requirements-dev.txt` のインストール
4. `pytest` 実行（失敗時はデプロイ中断）
5. デプロイパッケージのビルド（依存を `package/` に展開 → `app/` をコピー → `deploy.zip` に圧縮）
6. AWS 認証（OIDC）
7. `aws lambda update-function-code` でデプロイ
8. `aws lambda wait function-updated-v2` で更新完了待機

**確認方法**: 「Actions」タブで結果確認 → Lambda の最終更新日時を確認 → API Gateway のエンドポイントで動作確認。

### 8-5. 手動デプロイ（参考）

CI/CD を使わずに動作確認する場合の参考コマンドです（通常は不要）。

```powershell
# フロントエンド（ローカルビルド → S3 同期 → キャッシュ無効化）
cd frontend
npm run build
aws s3 sync dist/ s3://{S3_BUCKET_NAME} --delete
aws cloudfront create-invalidation --distribution-id {CLOUDFRONT_DISTRIBUTION_ID} --paths "/*"
```

---

## 9. 試験（システムテスト）

> **目的**: デプロイ済みの実環境（CloudFront URL）に対して、業務シナリオが正しく動作するかを E2E で検証する。
> **前提**: CI/CD でデプロイ済みの環境が稼働していること。ST-01 → ST-05 の順に実施する。

### 9-1. ST-01 テスト観点表の作成

**プロンプト**: `test-system-10-viewpoint.prompt.md`

1. プロンプトを実行し、AI が設計書からテスト観点を抽出する
2. 主な観点

| 観点 | 内容 |
|:---|:---|
| 業務シナリオの一貫性 | 登録→参照→更新の一連フロー整合性 |
| 画面遷移 | 遷移先・条件・ブラウザバック |
| メッセージ | 正常時・エラー時のメッセージ表示 |
| 誤操作・例外操作 | 二重送信・タイムアウト・セッション切れ |
| 権限・ロール | ロールによる表示・操作可否 |
| 外部連携 | API 正常・異常時の挙動 |

3. 出力: `docs/tests/system-test/` 配下の観点表（Markdown）

### 9-2. ST-02 テストコード生成（Playwright）

**プロンプト**: `test-system-20-testcode.prompt.md`

1. ST-01 完了後に実行する
2. AI が観点表・設計書をもとに Playwright の E2E テストコードを生成する
3. 出力:
   - `frontend/tests/pages/` … ページクラス（Page Object Model）
   - `frontend/tests/e2e/*.spec.ts` … テストコード

**テスト対象**（機能一覧より）:
- `login.spec.ts`（LGN-001）/ `top.spec.ts`（TOP-001）/ `dividend-notice.spec.ts`（DIV-001/002）/ `my-page.spec.ts`（MYP-001）/ `smoke.spec.ts`（スモーク）

### 9-3. ST-03 テストデータ作成

**プロンプト**: `test-system-30-testdata.prompt.md`

1. ST-02 完了後に実行する
2. AI がテストコードを分析し、DynamoDB 初期投入データを生成する
3. 出力: `tests/fixtures/dynamodb/[テーブル名]_seed.json` / `.csv`

**DynamoDB へのデータ投入（テスト実施前に手動実行）**:

```powershell
aws dynamodb batch-write-item `
  --request-items file://tests/fixtures/dynamodb/members_seed.json `
  --region ap-northeast-1
```

### 9-4. ST-04 試験項目書の作成

**プロンプト**: `test-system-40-items.prompt.md`

1. ST-02 完了後に実行する
2. AI が Playwright テストコードを分析し、システムテスト項目書を生成する
3. 出力: `docs/tests/system-test/` 配下の Markdown

**項目書の構成**: No・テストID・テスト名 / テスト手順 / 期待結果・判定基準 / 前提条件・備考

### 9-5. ST-05 テスト実施・結果反映

**プロンプト**: `test-system-50-run.prompt.md`

1. テストデータ投入済みの状態で実行する
2. AI が Playwright を実行する

```powershell
cd frontend
npm run test:e2e -- --project=chromium
```

3. テスト結果（OK/NG）が試験項目書に自動反映される
4. NG の場合は備考欄に原因が記載される。修正後に再実施する。

---

## 10. 付録

### A. プロンプト一覧

| フェーズ | 用途 | ファイル（`.github/prompts/`） |
|:---|:---|:---|
| 外部設計 | アーキテクチャ設計 | `design-80-architecture.prompt.md` |
| 外部設計 | シーケンス図 | `design-10-sequence-diagram.prompt.md` |
| 外部設計 | 処理設計書 | `design-60-process.prompt.md` |
| 外部設計 | 画面設計書 | `design-70-screen.prompt.md` |
| 外部設計 | ER図 | `design-40-er-diargram.prompt.md` |
| 外部設計 | DB設計書 | `design-50-database.prompt.md` |
| 外部設計 | インタフェース設計書 | `design-20-interface.prompt.md` |
| 外部設計 | API一覧 | `design-30-api-catalog.prompt.md` |
| 実装 | フロントエンド実装 | `develop-frontend.prompt.md` |
| 実装 | バックエンド一括実装 | `develop-backend.prompt.md` |
| レビュー | フロントエンドレビュー | `review-frontend.prompt.md` |
| レビュー | バックエンドレビュー | `review-backend.prompt.md` |
| 単体テスト | フロントUT生成 | `test-unit-frontend.prompt.md` |
| 単体テスト | フロントUT実施 | `test-unit-frontend-run.prompt.md` |
| 単体テスト | バックUT生成 | `test-unit-backend.prompt.md` |
| 単体テスト | バックUT実施 | `test-unit-backend-run.prompt.md` |
| システムテスト | ST-01 観点表 | `test-system-10-viewpoint.prompt.md` |
| システムテスト | ST-02 テストコード | `test-system-20-testcode.prompt.md` |
| システムテスト | ST-03 テストデータ | `test-system-30-testdata.prompt.md` |
| システムテスト | ST-04 試験項目書 | `test-system-40-items.prompt.md` |
| システムテスト | ST-05 テスト実施 | `test-system-50-run.prompt.md` |

### B. 設計フォーマット一覧（`docs/external-design/format/`）

| 設計書種別 | フォーマットファイル |
|:---|:---|
| アーキテクチャ | `fm-architecture.md` |
| 画面設計書 | `fm-screen-design.md` |
| シーケンス図 | `fm-sequence-diagram.md` |
| 処理設計書 | `fm-process-design.md` |
| ER図 | `fm-er-diargram.md` |
| DB設計書 | `fm-database-design.md` |
| インタフェース設計書 | `fm-interface-design.md` |
| API一覧 | `fm-api-catalog.md` |

### C. ルール・規約ファイル一覧（`docs/rules/`）

| カテゴリ | ファイルパス |
|:---|:---|
| 命名規則 | `common/naming-rule.md` |
| エラー設計規則 | `common/error-rule.md` |
| 用語集 | `common/glossary.md` |
| 実装規約 | `common/implementation-rule.md` |
| API設計規則 | `design/api-design-rule.md` |
| DB設計規則 | `design/db-design-rule.md` |
| 画面設計規則 | `design/screen-design-rule.md` |
| 処理設計規則 | `design/process-design-rule.md` |
| フロントエンド実装規約 | `development/frontend-rule.md` |
| バックエンド実装規約 | `development/backend-rule.md` |
| サーバレス実装規約 | `development/serverless-rule.md` |
| テスト規約 | `development/test-rule.md` |

### D. ローカル開発環境セットアップ（コマンドまとめ）

```powershell
# ターミナル1：バックエンド仮想環境のセットアップ
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# ターミナル1：moto サーバー起動（DynamoDB エミュレーター、ポート 8000）
moto_server dynamodb -H localhost -p 8000

# ターミナル2：テーブル作成 → API サーバー起動
cd backend
.venv\Scripts\activate
python infra/scripts/create_local_tables.py
uvicorn app.main:app --reload

# ターミナル3：フロントエンド
cd frontend
npm install
npm run dev
```

### E. テスト実行コマンドまとめ

```powershell
# フロントエンド 単体テスト（カバレッジ）
cd frontend; npm run test -- --coverage

# バックエンド 単体テスト（カバレッジ）
cd backend; pytest --cov=app --cov-report=term-missing

# E2E（システムテスト）
cd frontend; npm run test:e2e -- --project=chromium
```

### F. 重要注意事項

| 区分 | 注意事項 |
|:---|:---|
| セキュリティ | `.env` ファイルを Git にコミットしない（`.gitignore` を確認） |
| 個人情報 | 組合員情報（氏名・住所・口座番号等）をログに出力しない（マスキング） |
| Lambda | ステートレス設計を守る（グローバル状態への依存禁止） |
| デプロイ | `main` へのマージは必ずレビュー・テスト通過後に行う |
| AWS | IAM ポリシーは最小権限の原則に従う |

---

