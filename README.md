# genai_in_business

生成AI実業務適用のリポジトリです。

## ディレクトリ構成

```
project-root/
├── docs/                     # 要件・設計
│   ├── requirements.md       # 要件定義
│   ├── architecture.md       # アーキテクチャ設計
│   ├── api.yaml              # API 仕様 (OpenAPI)
│   └── test-spec.md          # テスト仕様
│
├── frontend/                 # React (TypeScript)
│   ├── src/                  # ソースコード
│   └── tests/                # フロントエンドテスト
│
├── backend/                  # Python
│   ├── app/                  # アプリケーションコード
│   └── tests/                # バックエンドテスト
│
├── shared/                   # 共通定義
│   └── types/
│       └── user.ts           # ユーザー型定義
│
├── prompts/                  # 設計、製造、テスト用のプロンプト
│   ├── design.md             # 設計プロンプト
│   ├── implement.md          # 実装プロンプト
│   └── test.md               # テストプロンプト
│
├── .copilot/                 # PJ定義
│   └── instructions.md       # GitHub Copilot 設定
│
├── .github/
│   └── workflows/            # GitHub Actions ワークフロー
│
└── README.md
```

## ドキュメント

- [要件定義](docs/requirements.md)
- [アーキテクチャ設計](docs/architecture.md)
- [API 仕様](docs/api.yaml)
- [テスト仕様](docs/test-spec.md)

## 生成AI活用

`prompts/` 配下のプロンプトテンプレートを使用して、設計・実装・テストを効率化できます。

- [設計プロンプト](prompts/design.md)
- [実装プロンプト](prompts/implement.md)
- [テストプロンプト](prompts/test.md)
