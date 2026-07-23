---
name: design-10-architecture
description: "要件定義書をもとにAWSサーバレス構成のアーキテクチャ設計書を生成する"
---

# システムアーキテクチャ設計プロンプト

## 役割

あなたは業務Webアプリケーションのシステムアーキテクチャ設計者です  
以下の要件に基づいてシステムアーキテクチャを設計してください

## インプット（requirements フォルダ）

- 要件定義書（.md）: #file:../../docs/requirement-definition/requirements.md
- 機能一覧（.md）: #file:../../docs/requirement-definition/function-list.md

## ルール（rules フォルダ）

以下のルールを必ず遵守する（命名、用語）:

- #file:../../docs/rules/common/naming-rule.md
- #file:../../docs/rules/common/glossary.md

## 作成対象（必須）
要件定義書と機能一覧と、`docs/external-design/product` に格納されている設計内容が実現できる環境構成とする  
AWSを用いた最小限のサーバレス構成とする  

1. システム概要
2. システム構成図（テキスト形式）
3. 各コンポーネントの役割説明
4. データストア構成
5. データフロー
6. 使用する技術スタックの推奨と理由


## 出力形式

- #createFile architecture.md の名前でファイルを作成し、`docs/external-design/product` に格納する
- Markdown形式(.md)で出力する
- フォーマットは #file:../../docs/external-design/format/fm-architecture.md を参照する

