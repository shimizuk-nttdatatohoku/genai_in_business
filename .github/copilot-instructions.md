# GitHub Copilot Instructions

> プロジェクト詳細・規約・ビルド手順は `AGENTS.md` を正本とする。

## VS Code 補完向け要点

- **言語**: フロントエンド TypeScript/React、バックエンド Python + FastAPI
- **DB**: Amazon DynamoDB（テーブル: `members`, `distributions`）
- **実行環境**: AWS Lambda（`app/handlers/` 配下にハンドラを集約）
- **型定義共有**: `shared/types/` を再利用すること
- コードコメント・変数名は英語、ユーザー向けメッセージは日本語
- 詳細規約は `docs/rules/` を参照
