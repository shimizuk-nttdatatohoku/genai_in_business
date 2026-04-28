# GitHub Copilot Instructions

## プロジェクト概要

本プロジェクトは生成AI実業務適用のリポジトリです。

## 技術スタック

- **フロントエンド**: React (TypeScript)
- **バックエンド**: Python
- **共通型定義**: TypeScript (`shared/types/`)

## コーディング規約

### TypeScript / React
- `shared/types/` の型定義を積極的に再利用してください
- 関数コンポーネントを使用し、型定義を必ず付けてください
- ESLint / Prettier の設定に従ってください

### Python
- 型ヒント (Type Hints) を必ず使用してください
- docstring を関数・クラスに記述してください
- PEP 8 に準拠してください

## ディレクトリ構成

```
project-root/
├── docs/           # 要件・設計ドキュメント
├── frontend/       # React (TypeScript) フロントエンド
│   ├── src/        # ソースコード
│   └── tests/      # フロントエンドテスト
├── backend/        # Python バックエンド
│   ├── app/        # アプリケーションコード
│   └── tests/      # バックエンドテスト
├── shared/         # 共通定義
│   └── types/      # 共通型定義
├── prompts/        # 生成AI用プロンプトテンプレート
└── .github/        # GitHub Actions ワークフロー
```

## 参照すべきドキュメント

- 要件定義: `docs/requirements.md`
- アーキテクチャ: `docs/architecture.md`
- API 仕様: `docs/api.yaml`
- テスト仕様: `docs/test-spec.md`

## 生成AI活用ガイド

コード生成や設計支援には `prompts/` 配下のプロンプトテンプレートを活用してください。

- 設計: `prompts/design.md`
- 実装: `prompts/implement.md`
- テスト: `prompts/test.md`
