---
name: develop-frontend-mockup
description: "URLで指定された画面ををReact/TypeScriptで実装する"
---

# 画面を実装する

Figmaに作成されたデザインをもとにReact/Typescriptで実装する

## 1. デザイン読み込み（URL添付）

- 次の手順でデザインを取得して反映する:
  1. チャット内に添付したURLからFigma MCP経由でデザインを取得し、デザイン（色/余白）、部品を取得する
   **デザインの取得はできる限り1回で実施し、複数回に分けて取得しない**
  2. 分析し結果を元に、レイアウト・余白・状態・位置を再現
  3. 丸写しせず本リポジトリの規約・構成に合わせて実装し直す

## 2. 実装手順

1. Figma MCP経由で取得した画面デザインを分析する
2. 必要な汎用UIが `src/components/` に無ければ作成（あれば再利用）
3. API層（`src/api/[resource].ts` のフック）を実装
4. 必要な汎用フックが src/hooks/に無ければ作成（あれば再利用）
5. 画面本体 `src/pages/[ScreenName]/` を実装
6. MSW handlers に当該APIの正常/異常モックを src/mocks に追加
7. *.test.tsx を作成（規約のテスト観点を網羅）  
**共通型を定義する場合は src/types 定義ファイルを作成する（あれば再利用）**  
**補助関数を作成する場合は src/utils にファイルを作成する（あれば再利用）**  

## 3. ルール

frontend 実装時の共通ルールは #file:../../.github/instructions/frontend.instructions.md を参照する
用語の定義は #file:../../docs/rules/common/glossary.md を参照する
