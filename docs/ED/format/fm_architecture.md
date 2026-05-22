# アーキテクチャ設計

## 概要

本ドキュメントは、システム全体のアーキテクチャを定義します。

## システム構成

```
[クライアント (React/TypeScript)]
        |
        | HTTPS
        v
[バックエンド API (Python/FastAPI)]
        |
        v
[データベース]
```

## ディレクトリ構成

```
project-root/
├── docs/           # 要件・設計ドキュメント
├── frontend/       # React (TypeScript) フロントエンド
├── backend/        # Python バックエンド
├── shared/         # 共通型定義
├── prompts/        # 生成AI用プロンプト
├── .copilot/       # GitHub Copilot 設定
└── .github/        # GitHub Actions ワークフロー
```

## 技術スタック

### フロントエンド
- React (TypeScript)
- 状態管理: （選定してください）
- スタイリング: （選定してください）

### バックエンド
- Python
- フレームワーク: （選定してください）

## API 通信
- REST API（`docs/api.yaml` 参照）