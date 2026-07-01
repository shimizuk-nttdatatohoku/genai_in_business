# AGENTS.md — 組合員情報・配布金管理 Web アプリ

> このファイルは GitHub Copilot（およびその他の AI コーディングアシスタント）が
> プロジェクトの文脈・規約・ワークフローを理解するための指示書です。
> リポジトリルートに配置し、常に最新の状態を維持してください。

## プロジェクト概要（Project Overview）

### 概要

| 項目 | 内容 |
|------|------|
| **アプリ名** | 組合員情報・配布金管理 Web アプリ |
| **目的** | 組合員が自分の組合員情報と配布金取得方法を参照・更新するための Web アプリ |
| **主なユーザー** | 組合員（一般ユーザー） |
| **主な機能** | 組合員情報の参照・更新、配布金取得方法の参照・更新 |

### 技術スタック

| レイヤー | 技術 | バージョン管理ファイル |
|----------|------|----------------------|
| フロントエンド | React + TypeScript | `frontend/package.json` |
| バックエンド | Python + FastAPI | `backend/pyproject.toml` |
| DB | Amazon DynamoDB (NoSQL) | インフラコード参照 |
| サーバー | AWS Lambda | インフラコード参照 |

### ドメイン用語集

| 用語 | 説明 |
|------|------|
| 組合員 | 本システムの利用者。組合に所属する個人。 |
| 組合員情報 | 氏名・住所・連絡先など組合員に紐づく基本情報 |
| 配布金 | 組合から組合員へ配布される金銭 |
| 配布金取得方法 | 口座振込・窓口受取など、配布金の受取手段の設定情報 |

## ディレクトリ構造（Directory Structure）

```Markdown
project-root/
├── docs/                     # 要件・設計・各種ルール
│   ├── rules/                # 設計・実装・試験ルール
│   ├── external-design/      # 外部設計書
│   └── requirement-definition/ # 要件定義
│
├── frontend/                 # React (TypeScript)
│   ├── src/
│   └── tests/
│
├── backend/                  # FastAPI (Python)
│   ├── app/
│   └── tests/
│
├── shared/                   # 共通定義
│   └── types/
│
├── .github/
│   ├── copilot-instructions.md   # Copilot共通動作
│   ├── prompts/                  # タスク別Prompt Files
│   ├── instructions/             # スコープ別Instructions
│   └── workflows/                # GitHub Actions
│
└── AGENTS.md                 # プロジェクト共通ガイド
```

---

## ビルド・テストコマンド（Build & Test Commands)

### 前提条件

- Node.js 20 LTS 以上
- Python 3.12 以上

### フロントエンド

```bash
cd frontend
npm install
npm run dev        # 開発サーバー起動（Vite）
npm run build      # 本番ビルド
npm run lint       # ESLint
npm run typecheck  # TypeScript 型チェック
```

### バックエンド

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload  # 開発サーバー起動
```

### ローカル DynamoDB

```bash
docker run -d -p 8000:8000 amazon/dynamodb-local
# テーブル作成スクリプト
python infra/scripts/create_local_tables.py
```

### 環境変数

`.env.example` をコピーして `.env.local`（フロント）と `.env`（バックエンド）を作成する。
**実際のシークレットや AWS キーを `.env` ファイルにハードコードしないこと。**

```bash
# backend/.env
DYNAMODB_ENDPOINT=http://localhost:8000   # ローカルのみ
DYNAMODB_REGION=ap-northeast-1
MEMBERS_TABLE=members
DISTRIBUTIONS_TABLE=distributions
JWT_SECRET=<ローカル開発用のみ設定>
```

### テスト実行コマンド

```bash
# フロントエンド ユニットテスト
cd frontend && npm run test

# E2E テスト
cd frontend && npm run test:e2e

# バックエンド テスト
cd backend && pytest --cov=app --cov-report=term-missing
```

---

## コーディング規約（Code Style）

### 共通

- コードコメント・変数名・関数名はすべて **英語**
- ユーザ向けのメッセージ・ラベルは **日本語**
- 命名規則は、docs/rules/common/naming-rule.md を正本とする。
- 環境依存値や固定URLの扱いは、docs/rules/common/implementation-rule.md を正本とする。

### TypeScript / React

- TypeScript / React の実装規約は、docs/rules/development/frontend-rule.md を正本とする。

### Python

- Python の実装規約は、docs/rules/development/backend-rule.md を正本とする。

### Lambda

- ハンドラ関数は `app/handlers/` に集約する
- ハンドラ関数のシグネチャ: `async def handler(event: dict, context: LambdaContext) -> dict`
- 関数の実行時間制限は **900 秒** を想定（タイムアウト設定に注意）
- Lambda の実装規約は、docs/rules/development/serverless-rule.md を正本とする。

## テスト指示（Testing Instructions）

### フロントエンドテストケース

#### React Testing Library（ユニット・コンポーネントテスト）

- フロントエンドテストの実装規約は、docs/rules/development/test-rule.md を正本とする。

```typescript
// tests/unit/features/member/MemberInfoCard.test.tsx
import { render, screen } from '@testing-library/react'
import { MemberInfoCard } from '@/features/member/MemberInfoCard'

test('組合員名が表示される', () => {
  render(<MemberInfoCard member={mockMember} />)
  expect(screen.getByText('山田 太郎')).toBeInTheDocument()
})
```

### バックエンドテストケース

#### pytest

- カバレッジ目標: **80% 以上**

- バックエンドテストの実装規約は、docs/rules/development/test-rule.md を正本とする。

```python
# tests/unit/services/test_member_service.py
import pytest
from unittest.mock import AsyncMock
from app.services.member_service import MemberService

async def test_get_member_returns_member(mock_member_repository):
    service = MemberService(repository=mock_member_repository)
    member = await service.get_member("m-001")
    assert member.member_id == "m-001"
  
```

#### Playwright（E2E テスト）

- 主要なユーザフローを必ず E2E テストでカバーする
- テストは `tests/e2e/` に配置する
- テスト対象のフロー:
  - [ ] ログイン・ログアウト
  - [ ] 組合員情報の参照
  - [ ] 組合員情報の更新
  - [ ] 配布金取得方法の参照
  - [ ] 配布金取得方法の更新

```typescript
// tests/e2e/member-info.spec.ts
import { test, expect } from '@playwright/test'

test('組合員情報を更新できる', async ({ page }) => {
  await page.goto('/member/info')
  await page.getByLabel('電話番号').fill('090-1234-5678')
  await page.getByRole('button', { name: '更新する' }).click()
  await expect(page.getByText('更新しました')).toBeVisible()
})
```

## 禁止事項（Boundaries）

- `.env` ファイルはローカル開発のみ使用し、絶対に Git にコミットしない
- `.gitignore` に `.env` が含まれていることを常に確認する
- 組合員情報（氏名・住所・口座番号等）は **個人情報** として厳格に扱う
- ログに個人情報を出力しない（マスキング処理を行う）
- データベースのマイグレーションを自動実行しない



> **Note**: このファイルはプロジェクトの進化に合わせて継続的に更新してください。
> 大きな設計変更・新機能追加・ツール変更の際は必ず AGENTS.md を見直してください。
