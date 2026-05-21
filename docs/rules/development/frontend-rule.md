# Frontend実装ルール

# 基本方針

- Reactを使用する
- TypeScriptを使用する
- Function Componentを使用する
- hooksを使用する
- `shared/types/` の型定義を優先して再利用する
- 可読性を優先する
- 保守性を優先する
- AIエージェントが解釈しやすい構成とする

---

# Component設計

- 1つの Component では 1 つの UI 上の責務だけを持つ
- 認証、レイアウト、データ取得、入力フォーム処理など複数責務を 1 Component に混在させない
- 共通部品を再利用する

---

# hooks

- hooksは use prefix を使用する
- hooks内で業務ロジックを共通化する

---

# API呼出

- services層経由で実施する
- Componentから直接fetch禁止

---

# 状態管理

- `docs/rules/design/screen-design-rule.md` で定義した状態を実装に反映する
- loading、error、success の状態遷移をコンポーネントと hooks で適切に管理する

---

# エラー制御

- `docs/rules/common/error-rule.md` を参照する
- 画面表示方針は `docs/rules/design/screen-design-rule.md` を参照する

---

# 環境変数

- API URL直書き禁止
- VITE_API_URL を使用する
- `docs/rules/common/implementation-rule.md` を参照する

---

# TypeScript

- any禁止
- 型定義を明示する
- interface/typeを使用する
- Propsはinterfaceで定義する
- イベントハンドラは正確な型を使用する
- ESLint / Prettier の設定に従う

---

# 禁止事項

- 複数の UI 責務を抱えた巨大 Component を作成すること
- fetch直書き
- any使用
- デバッグ目的の console.log を実装に残すこと
- useEffect乱用
- state過剰分散
