# AGENTS.md — 組合員情報・配布金管理 Web アプリ

このファイルは、AI コーディングアシスタント向けのプロジェクト入口です。
実装・設計・命名・テストの詳細ルールは `docs/rules/` を正本とします。

## プロジェクト概要

| 項目 | 内容 |
| ---- | ---- |
| アプリ名 | 組合員情報・配布金管理 Web アプリ |
| 目的 | 組合員が自分の組合員情報と配布金取得方法を参照・更新するための Web アプリ |
| 主なユーザー | 組合員（一般ユーザー） |
| 主な機能 | 組合員情報の参照・更新、配布金取得方法の参照・更新 |

## 技術スタック

| レイヤー | 技術 | 参照先 |
| -------- | ---- | ------ |
| フロントエンド | React + TypeScript | `frontend/package.json` |
| バックエンド | Python + FastAPI | `backend/requirements.txt`, `backend/requirements-dev.txt` |
| DB | Amazon DynamoDB | インフラコード |
| サーバー | AWS Lambda | インフラコード |

## 主なディレクトリ

| パス | 内容 |
| ---- | ---- |
| `docs/rules/` | 設計・実装・試験ルール |
| `docs/external-design/` | 外部設計書 |
| `docs/requirement-definition/` | 要件定義 |
| `frontend/` | React / TypeScript |
| `backend/` | FastAPI / Python |
| `shared/` | 共通定義 |
| `.github/copilot-instructions.md` | GitHub Copilot 共通動作 |
| `.github/prompts/` | タスク別 Prompt Files |

## セットアップ・実行

### 前提条件

- Node.js 20 LTS 以上
- Python 3.12 以上

### フロントエンド

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
```

### バックエンド

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

### ローカル DynamoDB

```bash
docker run -d -p 8000:8000 amazon/dynamodb-local
python infra/scripts/create_local_tables.py
```

## 環境変数

`.env.example` をコピーして、フロントエンドは `.env.local`、バックエンドは `.env` を作成します。
実際のシークレットや AWS キーはを `.env` ファイルに直接記載しないでください。

```bash
# backend/.env
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_REGION=ap-northeast-1
MEMBERS_TABLE=members
DISTRIBUTIONS_TABLE=distributions
JWT_SECRET=<ローカル開発用のみ設定>
```

環境依存値とシークレットの扱いは `docs/rules/common/implementation-rule.md` を参照してください。

## テスト

```bash
cd frontend && npm run test
cd frontend && npm run test:e2e
cd backend && pytest --cov=app --cov-report=term-missing
```

テスト実装ルールは `docs/rules/development/test-rule.md` を参照してください。

## 参照ルール

| 対象 | 正本 |
| ---- | ---- |
| 用語 | `docs/rules/common/glossary.md` |
| 命名 | `docs/rules/common/naming-rule.md` |
| 共通実装 | `docs/rules/common/implementation-rule.md` |
| エラー | `docs/rules/common/error-rule.md` |
| フロントエンド | `docs/rules/development/frontend-rule.md` |
| バックエンド | `docs/rules/development/backend-rule.md` |
| Serverless / Lambda | `docs/rules/development/serverless-rule.md` |
| テスト | `docs/rules/development/test-rule.md` |
