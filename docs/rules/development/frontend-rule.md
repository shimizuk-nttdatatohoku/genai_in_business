# Frontend実装ルール

# 基本方針

- Reactを使用する
- TypeScriptを使用する
- Function Componentを使用する
- hooksを使用する
- 可読性を優先する
- AIエージェントが解釈しやすい構成とする

---

# Component設計

- 1Component1責務
- 巨大Componentを避ける
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

以下状態を考慮する

- loading
- error
- success

---

# エラー制御

- ユーザ向けメッセージを表示する
- stacktrace表示禁止
- console.errorのみで終了禁止

---

# 環境変数

- API URL直書き禁止
- VITE_API_URL を使用する

---

# TypeScript

- any禁止
- 型定義を明示する
- interface/typeを使用する

---

# 禁止事項

- 巨大Component
- fetch直書き
- any使用
- console.log放置
- URLハードコード
- useEffect乱用
- state過剰分散
