/**
 * 共通ユーザー型定義
 * フロントエンドとバックエンド間で共有される型定義です
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface UserCreate {
  name: string;
  email: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
}
