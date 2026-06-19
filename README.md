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
│   ├── architecture.md
│   ├── api.yaml
│   ├── requirements.md
│   ├── test-spec.md
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
│   │   ├── develop/          # 実装用プロンプト
│   │   ├── external-design/  # 設計用プロンプト
│   │   ├── review/           # レビュー用プロンプト
│   │   └── test/             # テスト用プロンプト
│   ├── copilot-instructions.md
│   ├── instructions/         # Copilot 向け追加指示
│   └── workflows/            # GitHub Actions ワークフロー
├── shared/
│   └── types/                # 共通型定義
├── tests/                    # テスト観点・成果物
```

## ドキュメント

- [要件定義](docs/requirements.md)
- [アーキテクチャ設計](docs/architecture.md)
- [API 仕様](docs/api.yaml)
- [テスト仕様](docs/test-spec.md)
- [開発ルール](docs/rules/)

## 生成AI活用

`.github/prompts/` 配下のプロンプトテンプレートを使用して、設計・実装・テスト・レビューを効率化できます。

- [実装用プロンプト](.github/prompts/develop/)
- [設計用プロンプト](.github/prompts/external-design/)
- [レビュー用プロンプト](.github/prompts/review/)
- [テスト用プロンプト](.github/prompts/test/)

## 補足

- GitHub Copilot 向けのプロジェクト指示は `.github/copilot-instructions.md` と `AGENTS.md` に記載しています。
- バックエンドは FastAPI、フロントエンドは React + TypeScript を採用しています。
