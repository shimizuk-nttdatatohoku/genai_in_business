# SCR-001_ログイン画面を実装する

\docs\ED\product配下の設計書をもとにReact/Typescriptで実装する。

## 1. デザイン読み込み（添付画像）
- 次の手順でデザインを取得して反映すること:
  1. チャット内に添付した画像を分析し、デザイン（色/余白）、部品を取得する。
  2. 分析し結果を元に、レイアウト・余白・状態・位置を再現。
  3. 丸写しせず本リポの規約・構成に合わせて実装し直す。
- 設計書に無い部品がある場合は、設計書を優先し、実装しない。

## 2. 画面仕様
- #file:function-list.md　#file:screen_design.mdに記載されている内容に必ず従うこと。

## 3. 連携API（FastAPI / Lambda）
- 使用エンドポイント、リクエスト、レスポンス等のAPI連携に必要な項目は、 API設計書（ #file:screen_design.md ）、インターフェース設計書（ #file:interface_design.md ）を参考に実装すること。

## 4. 実装手順（この順で進めること）
1. 添付画像を分析する。
2. 必要な汎用UIが src/components/ に無ければ作成（あれば再利用）
3. API層（src/api/<resource>.ts のフック）を実装
4. 必要な汎用フックが src/hooks/に無ければ作成（あれば再利用）
5. 画面本体 src/pages/<ScreenName>/ を実装
6. MSW handlers に当該APIの正常/異常モックを src\mocks に追加
7. *.test.tsx を作成（規約のテスト観点を網羅）
※共通型を定義する場合は src/typs 定義ファイルを作成すること（あれば再利用）
※補助関数を作成する場合は src/utils にファイルを作成する。（あれば再利用） 

## 5. ルール（rules フォルダ）
以下のルールを必ず遵守してくだい。
- #file:naming-rule.md
- #file:error-rule.md
- #file:glossary.md
- #file:frontend-rule.md 