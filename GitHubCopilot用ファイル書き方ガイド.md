# GitHub Copilot 用ファイル書き方ガイド

## 目次

- [GitHub Copilot 用ファイル書き方ガイド](#github-copilot-用ファイル書き方ガイド)
  - [目次](#目次)
  - [1. 目的](#1-目的)
  - [2. このガイドで使う用語](#2-このガイドで使う用語)
    - [2-1. ファイル](#2-1-ファイル)
    - [2-2. 用語・書き方](#2-2-用語書き方)
  - [3. 書き分けの原則](#3-書き分けの原則)
  - [4. `AGENTS.md` の書き方](#4-agentsmd-の書き方)
  - [5. `.github/copilot-instructions.md` の書き方](#5-githubcopilot-instructionsmd-の書き方)
  - [6. `.github/instructions/*.instructions.md` の書き方](#6-githubinstructionsinstructionsmd-の書き方)
    - [6-1. 基本](#6-1-基本)
    - [6-2. `applyTo` の考え方](#6-2-applyto-の考え方)
    - [6-3. 書くべき内容](#6-3-書くべき内容)
    - [6-4. 避けるべき内容](#6-4-避けるべき内容)
  - [7. `.github/prompts/*.prompt.md` の書き方](#7-githubpromptspromptmd-の書き方)
  - [8. `docs/rules/**` の書き方](#8-docsrules-の書き方)
  - [9. チェックポイント](#9-チェックポイント)

## 1. 目的

本ガイドは、このリポジトリで GitHub Copilot が参照するファイルをどのように記述、分割、保守するかを説明する資料である。

対象は次のファイル群である。

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.github/prompts/*.prompt.md`
- `docs/rules/**`

## 2. このガイドで使う用語

このガイドでは、GitHub Copilot やファイル指定の書き方に関する用語を使う。

### 2-1. ファイル

| ファイル | 役割 | 書く内容 | 書かない内容 |
| --- | --- | --- | --- |
| `AGENTS.md` | プロジェクト全体の入口 | 技術スタック、ディレクトリ構成、実行コマンド、参照ルール | 個別機能の詳細実装手順 |
| `.github/copilot-instructions.md` | Copilot 共通方針 | 説明言語、参照優先順位、全体方針 | 技術別の詳細規約の本文 |
| `.github/instructions/*.instructions.md` | 対象ファイル向けの自動適用指示 | `applyTo`、参照する rules、最小限の補足 | ルール本文の重複記載 |
| `.github/prompts/*.prompt.md` | 工程ごとの実行指示 | 目的、入力、参照資料、出力先、制約 | 恒久的な共通規約 |
| `docs/rules/**` | ルール | 命名、実装、テスト、設計、エラーの基準 | Copilot 固有の操作説明 |

### 2-2. 用語・書き方

| 用語 | 意味 |
| ---- | ---- |
| `applyTo` | instruction ファイルが「どのファイルに適用されるか」を示す設定 |
| `frontend/**/*.{ts,tsx}` のような書き方 | 対象ファイルをまとめて表すパターン。例では `frontend` 配下の TypeScript ファイル全体を指す |
| `docs/rules/**` のような書き方 | あるフォルダ配下のすべてのファイルをまとめて指すパターン |
| プロンプト | AI に何をしてほしいかを伝える指示文 |
| instruction | AI が特定のファイルを扱うときに従う追加ルール |

## 3. 書き分けの原則

1. ルール本文は `docs/rules/**` に記載にする
2. `.github/instructions/*.instructions.md` には rules への参照だけを置く
3. `.github/prompts/*.prompt.md` には工程ごとの具体的な入力・出力指示を書く
4. `AGENTS.md` はプロジェクト概要・特有の技術情報にとどめる
5. 同じ規則を複数ファイルへ重複記載しない

## 4. `AGENTS.md` の書き方

書くべき内容:

- プロジェクト概要
- 技術スタック
- ディレクトリ構成
- セットアップ、実行、テストコマンド
- 参照すべき rules の一覧

避けるべき内容:

- 画面単位、API 単位の詳細実装手順
- 各ルール本文の転載

## 5. `.github/copilot-instructions.md` の書き方

書くべき内容:

- AIの回答に使用する言語（日本語、英語等）
- 説明方針
- 参照優先順位
- 設計変更時に整理すべき観点

避けるべき内容:

- 言語別命名規則の詳細
- 例外処理やテスト方針の本文

## 6. `.github/instructions/*.instructions.md` の書き方

### 6-1. 基本

instruction ファイルは、特定のファイルを編集するときに GitHub Copilot が自動で参照する追加指示である。

### 6-2. `applyTo` の考え方

- `applyTo` には対象とするファイルの場所や拡張子を書く
- 例: `frontend/**/*.{ts,tsx}` は `frontend` 配下の TypeScript ファイル全体を指す
- 例: `backend/**/*.py` は `backend` 配下の Python ファイル全体を指す

### 6-3. 書くべき内容

- 対象言語、対象ディレクトリの説明
- 参照する rules ファイル
- そのスコープに固有の最小補足

### 6-4. 避けるべき内容

- naming-rule の内容全文
- test-rule の内容全文
- 他 instruction と重複する補足

## 7. `.github/prompts/*.prompt.md` の書き方

書くべき内容:

- その prompt の目的
- 参照する入力資料
- 出力先
- 実施順序
- 制約や禁止事項

見直すべき観点:

- 特定の技術・製品名/バージョン名を前提にしていないか（一般的な内容を記載する、必要なら根拠URLや更新手順を併記する等）
- 入力がある場合、現状のフォルダ構成や資材名と合っているか
- 出力先パスが現状のフォルダ構成と合っているか
- 実行コマンドが現行環境と合っているか
- rules の参照先が正しいか

## 8. `docs/rules/**` の書き方

書くべき内容:

- 命名規則
- 実装規約
- エラー処理方針
- テスト方針
- 設計方針

構成の原則:

- 共通規約は `docs/rules/common/` に置く
- 設計規約は `docs/rules/design/` に置く
- 製造規約は `docs/rules/development/` に置く

## 9. チェックポイント

- 共通規約（恒久ルール）は docs/rules/** に記載する
- instruction に rules の内容を重複記載していない
- AGENTS.md、copilot-instructions.md、`/instructions/*.instructions.md`、`prompts/*.prompt.md` には共通規約は記載せず、`docs/rules/**`への参照のみとなっている
- `applyTo` が実際の構成と一致している
- AGENTS.md と README.md が現行構成を説明できている
