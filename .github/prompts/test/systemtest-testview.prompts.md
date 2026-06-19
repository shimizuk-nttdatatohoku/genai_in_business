---
name: "システムテスト観点表を作成する"
description: "設計書をもとにSTテスト観点を洗い出し、観点表（Markdown）を生成する"
---

# システムテストテスト観点表 作成プロンプト

## 目的

ユーザの操作シナリオを起点に、抜け漏れのないST用のテスト観点を網羅的に洗い出してください。

- 本プロンプトの成果物（**テスト観点表**）は、後続の「**システムテスト項目書**」を作成するための材料とする
- 単体・結合テストではカバーしきれない、**ユーザの一連の操作シナリオ**に着眼した観点を抽出する
- 「何を確認すべきか（観点）」のレベルで記述し、具体的な手順・期待結果（項目書側で記述）までは踏み込みすぎない

## ステップ概要

1. **インプット資料の参照** - インプット資料の存在確認をし、システムの構成情報を取得する
2. **テスト観点の抽出** - インプット資料及び記載の条件からテスト観点を抽出する
3. **テスト観点表の作成** - 抽出した観点をもとに観点表をMarkdown形式(.md)で作成する

## 1. 最初に読む参照ファイル

以下のファイルを解釈する

### 1.1 要件定義書

- #file:docs\requirements.md
- #file:docs\requirement-definition\function-list.md

### 1.2 設計書

- #file:docs\external-design\product\screen-design.md
- #file:docs\external-design\product\sequence-diagram.md
- #file:docs\external-design\product\process-design\div-001-process-design.md
- #file:docs\external-design\product\process-design\div-002-process-design.md
- #file:docs\external-design\product\process-design\lgn-001-process-design.md
- #file:docs\external-design\product\process-design\lgn-002-process-design.md
- #file:docs\external-design\product\process-design\myp-001-process-design.md
- #file:docs\external-design\product\process-design\top-001-process-design.md
- #file:docs\external-design\product\api-catalog.md
- #file:docs\external-design\product\interface-design.md
- #file:docs\external-design\product\database-design.md
- #file:docs\external-design\product\er-diargram.md

## 2. テスト観点の抽出

### 2.1 着眼すべき観点の軸

最低限、以下の軸を考慮して観点の抜け漏れを防ぐ  
対象システムに該当しない観点は無理に含めない  

- **業務シナリオの一貫性**：登録→参照→更新→削除など一連の流れでデータ・状態が整合するか
- **画面遷移**：遷移先・遷移条件・戻り（ブラウザバック含む）が正しいか
- **メッセージ**:入出力時、画面遷移時の画面メッセージが正しく出力されているか
- **誤操作・例外操作**：エラーメッセージ、二重送信、連打、タイムアウト、セッション切れ、同時実行、操作の途中離脱
- **権限・ロール**：ロール別の操作可否・表示制御が正しいか
- **外部連携**：API・他システム連携時の正常／異常（連携失敗・タイムアウト）時の挙動と復旧
- **データ整合性**：処理結果がDB・帳票・画面表示で矛盾しないか
- **使用性**：エラーメッセージの正当性、操作のわかりやすさ、ガイダンス
- **信頼性**：障害・中断後の復旧、再実行時の挙動
- **セキュリティ**：認証・認可、不正操作・不正遷移の防止

## 3. テスト観点表の作成

### 3.1 出力フォーマット

以下の Markdown テーブル形式で出力する

| No | 大分類 | 小分類 | テスト観点 | 説明 |
|----|-------|--------|-----------|------|

各列の定義：

- **No**：連番
- **大分類**：品質特性（機能性、使用性、信頼性 等）
- **小分類**：観点特性（メッセージの正当性、画面遷移の網羅、業務フローの網羅　等）
- **テスト観点**：小分類に属するテスト項目を作成の際に基準とする観点
- **説明**：テスト観点の説明

記入例：

```markdown
| No | 大分類 | 小分類 | テスト観点 | 説明 |
|----|--------|--------|--------|----------------|
| 1 | 機能性 | エンティティの状態遷移の網羅| エンティティの状態遷移の網羅性 | エンティティの状態遷移のパターンを網羅的に確認する |
| 2 | 機能性 | 機能間連携の網羅 | 機能間連携の網羅性 | 連携して実行される機能について、組合せのパターンを網羅的に確認する。 |
```

### 3.2 制約・ルール

- 観点は曖昧表現（「正しく動くこと」のみ等）を避け、**どのような観点でテスト項目を作成すればよいか**が分かるよう具体化する
- **入力材料に記載のない仕様を推測で補完しない**。
- Markdown形式(.md)で出力する
- 出力先は `docs\tests\system-test\items\` 配下とし、ファイル名は `systemtest-testview.md` とする

## 重要：不明点の確認

- 入力材料が不足している、または仕様が読み取れず観点を確定できない場合は、**推測で観点を作成せず、処理を止めて質問する**
