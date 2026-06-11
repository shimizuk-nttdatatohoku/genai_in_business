# SCR-002_トップ画面を実装する

/docs/external-design/product配下の設計書をもとにReact/Typescriptで実装する

## 1. デザイン読み込み（添付画像）

- 次の手順でデザインを取得して反映する:
  1. チャット内に添付した画像を分析し、デザイン（色/余白）、部品を取得する
  2. 分析し結果を元に、レイアウト・余白・状態・位置を再現
  3. 丸写しせず本リポの規約・構成に合わせて実装し直す
  - 設計書に無い部品がある場合は、設計書を優先し、実装しない

## 2. 画面仕様

以下の設計書に記載されている内容に必ず従う

- #file:function-list.md
- #file:screen-design.md

## 3. 連携API（FastAPI / Lambda）

以下の設計書を参考に、使用エンドポイント、リクエスト、レスポンスなどのAPI連携に必要な項目を実装する

- API設計書（ #file:screen-design.md ）
- インターフェース設計書（ #file:interface-design.md ）

## 4. 実装手順（この順で進める）

1. 添付画像を分析する
2. 必要な汎用UIが `src/components/` に無ければ作成（あれば再利用）
3. API層（`src/api/[resource].ts` のフック）を実装
4. 必要な汎用フックが src/hooks/に無ければ作成（あれば再利用）
5. 画面本体 `src/pages/[ScreenName]/` を実装
6. MSW handlers に当該APIの正常/異常モックを src/mocks に追加
7. *.test.tsx を作成（規約のテスト観点を網羅）  
※共通型を定義する場合は src/types 定義ファイルを作成する（あれば再利用）  
※補助関数を作成する場合は src/utils にファイルを作成する（あれば再利用）  

## 5. ルール

frontend 実装時の共通ルールは #file:frontend.instructions.md を参照する  
用語の定義は #file:glossary.md を参照する
