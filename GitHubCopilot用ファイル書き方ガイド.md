# GitHub Copilot 用ファイル書き方ガイド

## 1. 目的

本ガイドは、このリポジトリで GitHub Copilot が参照するファイルをどのように記述、分割、保守するかを説明する資料である。

対象は次のファイル群である。

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.github/prompts/*.prompt.md`
- `docs/rules/**`

「別プロジェクトへ適用するときに、どのファイルを修正すべきか」を知りたい場合は `docs/template-adaptation-guide.md` を参照すること。

## 2. このガイドで使う用語

このガイドでは、GitHub Copilot やファイル指定の書き方に関する用語を使う。

### 2-1. ファイル

| ファイル名 | ファイルの内容 |
| ---- | ---- |
| `AGENTS.md` | プロジェクト全体の概要、使用技術、実行コマンド、参照先をまとめた案内ファイル |
| `.github/copilot-instructions.md` | GitHub Copilot に対して常に伝える共通方針をまとめたファイル |
| `.github/instructions/*.instructions.md` | 特定の種類のファイルを編集するときに、自動で参照される追加指示ファイル |
| `.github/prompts/*.prompt.md` | Copilot Chat で `/ファイル名` の形で呼び出して使う指示文ファイル |
| `docs/rules/**` | 命名、実装、テストなどのルールをまとめたファイル群 |

### 2-2. 用語・書き方

| 用語 | 意味 |
| ---- | ---- |
| `applyTo` | instruction ファイルが「どのファイルに適用されるか」を示す設定 |
| `frontend/**/*.{ts,tsx}` のような書き方 | 対象ファイルをまとめて表すパターン。例では `frontend` 配下の TypeScript ファイル全体を指す |
| `docs/rules/**` のような書き方 | あるフォルダ配下のすべてのファイルをまとめて指すパターン |
| プロンプト | AI に何をしてほしいかを伝える指示文 |
| instruction | AI が特定のファイルを扱うときに従う追加ルール |

## 3. ファイルごとの役割

| ファイル | 役割 | 書く内容 | 書かない内容 |
| --- | --- | --- | --- |
| `AGENTS.md` | プロジェクト全体の入口 | 技術スタック、ディレクトリ構成、実行コマンド、参照ルール | 個別機能の詳細実装手順 |
| `.github/copilot-instructions.md` | Copilot 共通方針 | 説明言語、参照優先順位、全体方針 | 技術別の詳細規約の本文 |
| `.github/instructions/*.instructions.md` | 対象ファイル向けの自動適用指示 | `applyTo`、参照する rules、最小限の補足 | ルール本文の重複記載 |
| `.github/prompts/*.prompt.md` | 工程ごとの実行指示 | 目的、入力、参照資料、出力先、制約 | 恒久的な共通規約 |
| `docs/rules/**` | ルール | 命名、実装、テスト、設計、エラーの基準 | Copilot 固有の操作説明 |

## 4. 書き分けの原則

1. ルール本文は `docs/rules/**` に記載にする
2. `.github/instructions/*.instructions.md` には rules への参照だけを置く
3. `.github/prompts/*.prompt.md` には工程ごとの具体指示だけを書く
4. `AGENTS.md` は入口情報にとどめる
5. 同じ規則を複数ファイルへ重複記載しない

## 5. `AGENTS.md` の書き方

書くべき内容:

- プロジェクト概要
- 技術スタック
- ディレクトリ構成
- セットアップ、実行、テストコマンド
- 参照すべき rules の一覧

避けるべき内容:

- 画面単位、API 単位の詳細実装手順
- 各ルール本文の転載

## 6. `.github/copilot-instructions.md` の書き方

書くべき内容:

- 回答言語
- 説明方針
- 参照優先順位
- 設計変更時に整理すべき観点

避けるべき内容:

- 言語別命名規則の詳細
- 例外処理やテスト方針の本文

## 7. `.github/instructions/*.instructions.md` の書き方

### 7-1. 基本

instruction ファイルは、特定のファイルを編集するときに GitHub Copilot が自動で参照する追加指示である。

### 7-2. `applyTo` の考え方

- `applyTo` には対象とするファイルの場所や拡張子を書く
- 例: `frontend/**/*.{ts,tsx}` は `frontend` 配下の TypeScript ファイル全体を指す
- 例: `backend/**/*.py` は `backend` 配下の Python ファイル全体を指す

### 7-3. 書くべき内容

- 対象言語、対象ディレクトリの説明
- 参照する rules ファイル
- そのスコープに固有の最小補足

### 7-4. 避けるべき内容

- naming-rule の内容全文
- test-rule の内容全文
- 他 instruction と重複する補足

## 8. `.github/prompts/*.prompt.md` の書き方

書くべき内容:

- その prompt の目的
- 参照する入力資料
- 出力先
- 実施順序
- 制約や禁止事項

見直すべき観点:

- 技術名が固定化されていないか
- 出力先パスが現行構成と合っているか
- 実行コマンドが現行環境と合っているか
- rules の参照先が正しいか

## 9. `docs/rules/**` の書き方

書くべき内容:

- 命名規則
- 実装規約
- エラー処理方針
- テスト方針
- 設計方針

構成の原則:

- 共通規約は `docs/rules/common/` に置く
- 技術固有規約は `docs/rules/development/` に置く
- 特定基盤専用の規約は分離する

## 10. 変更時の推奨順序

1. `docs/rules/**` を更新する
2. `AGENTS.md` を更新する
3. `.github/instructions/*.instructions.md` を更新する
4. `.github/prompts/*.prompt.md` を更新する
5. `.github/copilot-instructions.md` を必要に応じて更新する

## 11. チェックポイント

- rules が正本として維持されている
- instruction に rules 本文を重複記載していない
- prompt に恒久ルールを埋め込みすぎていない
- `applyTo` が実際の構成と一致している
- AGENTS と README が現行構成を説明できている
