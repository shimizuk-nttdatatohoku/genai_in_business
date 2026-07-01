# genai_in_business

生成AI実業務適用のリポジトリです

## ディレクトリ構成

```text
project-root/
├── AGENTS.md                 # プロジェクト運用・開発ルール
├── README.md
├── backend/                  # Python / FastAPI バックエンド
│   ├── app/
│   │   ├── common/           # 共通設定・例外・依存関係
│   │   ├── models/           # ドメインモデル
│   │   ├── repositories/     # DynamoDB アクセス
│   │   ├── routers/          # API ルーター
│   │   ├── schemas/          # リクエスト/レスポンス定義
│   │   └── services/         # 業務ロジック
│   ├── infra/scripts/        # ローカル環境用スクリプト
│   └── tests/                # バックエンドテスト
├── docs/                     # 要件・設計・開発ルール
│   ├── api.yaml
│   ├── external-design/       # 詳細設計
│   ├── requirement-definition/# 要件定義/機能一覧
│   └── rules/                # 共通・設計・開発ルール
├── frontend/                 # React / TypeScript フロントエンド
│   ├── src/
│   │   ├── api/              # API クライアント
│   │   ├── components/       # UI コンポーネント
│   │   ├── hooks/            # カスタムフック
│   │   ├── mocks/            # モックデータ
│   │   ├── pages/            # 画面コンポーネント
│   │   └── types/            # フロントエンド用型定義
│   └── tests/                # フロントエンドテスト / E2E
├── .github/
│   ├── prompts/              # GitHub Copilot 向けプロンプト
│   ├── copilot-instructions.md
│   ├── instructions/         # Copilot 向け追加指示
│   └── workflows/            # GitHub Actions ワークフロー
├── shared/
│   └── types/                # 共通型定義
├── tests/                    # テスト観点・成果物
```

## ドキュメント

- [要件定義](docs/requirement-definition/)
- [設計書](docs/external-design/)
- [開発ルール](docs/rules/)

## 生成AI活用

`.github/prompts/` 配下のプロンプトテンプレートを使用して、設計・実装・テスト・レビューを効率化できます。

- 設計用プロンプト  
 .github/prompts/desigin-*.prompt.md

- 実装用プロンプト  
 .github/prompts/develop-*.prompt.md

- レビュー用プロンプト  
 .github/prompts/review-*.prompt.md

- テスト用プロンプト  
 .github/prompts/test-*.prompt.md

## 補足

- GitHub Copilot 向けのプロジェクト指示は `.github/copilot-instructions.md` と `AGENTS.md` に記載しています。
- バックエンドは FastAPI、フロントエンドは React + TypeScript を採用しています。
