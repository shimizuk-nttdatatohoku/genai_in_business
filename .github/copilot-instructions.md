# GitHub Copilot Instructions

> プロジェクト詳細・規約・ビルド手順は `AGENTS.md` を正本とする。

## VS Code 補完向け要点

- **言語**: フロントエンド TypeScript/React、バックエンド Python + FastAPI
- **DB**: Amazon DynamoDB（テーブル: `members`, `distributions`）
- **実行環境**: AWS Lambda（`app/handlers/` 配下にハンドラを集約）
- **型定義共有**: `shared/types/` を再利用すること
- コードコメント・変数名は英語、ユーザー向けメッセージは日本語
- 詳細規約は `docs/rules/` を参照

---

## 命名規則 クイックリファレンス

| 対象 | 規則 | OK例 | NG例 |
|------|------|------|------|
| React Component / ファイル | PascalCase | `UserList.tsx` | `userList.tsx` |
| hooks | `use` prefix + camelCase | `useAuth.ts` | `auth.ts` |
| Props interface | `[Component名]Props` | `UserListProps` | `Props` |
| Boolean 変数 | `is`/`has`/`can` prefix | `isLoading` | `loadingFlag` |
| Python ファイル | snake_case | `user_service.py` | `UserService.py` |
| Python クラス | PascalCase | `UserService` | `user_service` |
| Python 関数 | snake_case | `get_user()` | `getUser()` |
| DB フィールド | snake_case | `user_name` | `userName` |
| DB 日時フィールド | `_at` suffix | `created_at` | `createdDate` |
| DB ID フィールド | `_id` suffix | `member_id` | `memberId` |
| テスト名 | 日本語 + 正常系/異常系明示 | `正常系_ログイン成功` | `login_success` |

---

## 禁止事項

### Backend（Python）

- Router に業務ロジックを書く（Service に書く）
- Repository に業務ロジックを書く
- `print()` デバッグ（`logger` を使う）
- グローバル状態への依存
- Lambda 常駐前提のコード（ステートレス設計）
- Secret / URL のハードコード（`os.getenv` を使う）

### Frontend（TypeScript/React）

- Component から直接 `fetch`（`services` 層経由）
- `any` 型の使用
- `console.log` を実装に残す
- `useEffect` の乱用
- 複数の UI 責務を 1 Component に混在

---

## DynamoDB 共通パターン

全テーブル（`members`, `distributions`）に必須の共通フィールド:

- `created_at` / `updated_at`（ISO 8601 形式）
- `created_by` / `updated_by`
- `is_deleted`（論理削除フラグ、通常検索では除外）

Boolean フィールドは必ず `is_` prefix を付ける。
