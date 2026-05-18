---
applyTo: "frontend/**/*.{ts,tsx}"
---


# Frontend Custom Instruction

## 基本方針
- React（関数コンポーネント）とTypeScriptを使用する
- hooksを活用し、use prefixを付与する
- 可読性・保守性・AIエージェント解釈性を重視

## Component設計
- 1Component1責務を徹底し、巨大Componentを避ける
- 共通部品は再利用する

## hooks
- hooksはuse prefixを付与し、業務ロジック共通化に活用

## API呼出
- services層経由でAPIを呼び出す（Componentから直接fetch禁止）
- APIのベースURLはVITE_API_URL等の環境変数から取得し、直書き禁止

## 状態管理
- loading, error, success状態を考慮し、適切に管理する

## エラー制御
- ユーザ向けメッセージを表示し、stacktrace表示禁止
- console.errorのみで終了禁止

## TypeScript
- any禁止、型定義を明示（interface/typeを使用）
- Propsは必ずinterfaceで定義
- イベントハンドラは正確な型を使う

## 禁止事項
- 巨大Component
- fetch直書き
- any使用
- console.log放置
- URLハードコード
- useEffect乱用
- state過剰分散


## 命名規則

- **可読性を優先し、略語の乱用や意味不明な短縮は禁止**
- **設計書・実装間で名称を統一する**

### Component
- ファイル名・コンポーネント名ともに **PascalCase** を使用
	- 例: `UserList.tsx`, `LoginPage.tsx`

### hooks
- ファイル名・関数名ともに **use** prefix + PascalCase/camelCase
	- 例: `useAuth.ts`, `useUsers.ts`, `useUserList()`

### state変数
- **camelCase** を使用
	- 例: `userName`, `isLoading`

### Boolean型
- `is` / `has` / `can` などのprefixを付与
	- 例: `isDeleted`, `hasError`, `canEdit`

### Props
- interface名は **[Component名]Props** とする（PascalCase）
	- 例: `UserListProps`

### ファイル名
- コンポーネント: PascalCase（例: `UserList.tsx`）
- hooks: camelCase + use prefix（例: `useAuth.ts`）

### その他
- 型定義: `interface`/`type`はPascalCase
- API/URL/定数はハードコード禁止、環境変数や共通定義を利用

#### 禁止事項
- 意味不明な略語、同義語混在、命名ルール違反
- any使用、console.log放置、URLハードコード




## テスト（Vitest / React Testing Library）

- 自動テストを前提とし、**Vitest**・**React Testing Library**を使用する
- テストは単純構造・可読性重視・AIエージェントが解釈しやすい形で記述する
- テスト名は日本語で記載し、正常系/異常系を明示する
- テスト間の依存を禁止し、テストデータのハードコードは最小限にする
- モックを活用し、外部APIや副作用のある処理はモック化する
- 状態や副作用の検証にはReact Testing Libraryの機能（screen, fireEvent, userEvent等）を活用する
- テスト観点：正常系・必須チェック・境界値・異常系・認証・認可・XSS・CSRF等を考慮する
- エラー時はユーザ向けメッセージや画面表示を検証し、console確認やstacktrace出力に依存しない

### 禁止事項
- テスト間の状態共有・順序依存
- 固定sleepやsetTimeoutによる待機
- console.log等の出力確認のみでの検証
- localhost等の固定値依存

