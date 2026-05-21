# 命名規則

# 基本方針

- 可読性を優先する
- 略語を乱用しない
- 同一概念には同一名称を使用する
- 設計書と実装で名称を統一する

---

# 共通ルール

|対象|ルール|
|---|---|
|単語区切り|英単語を使用|
|略語|一般的なもののみ許可|
|予約語|使用禁止|
|意味不明な短縮|禁止|

---

# 記載ルール

- OK / NG の例は、各ルールの対象に合わせて同一粒度で記載する
- ファイル名のルールではファイル名を例示し、関数名のルールでは関数名を例示する
- ファイル名と関数名の両方にルールがある場合は、必要に応じて両方の例を記載する

---

# React / TypeScript

## Component

- Component のファイル名とコンポーネント名は PascalCase を使用する

### OK

UserList.tsx  
LoginPage.tsx  
UserList

### NG

userlist.tsx  
login_page.tsx  
userList

---

## hooks

- hooks のファイル名と関数名は `use` prefix を付け、camelCase で命名する

### OK

useAuth.ts  
useUsers.ts  
useUserList()

### NG

auth.ts  
UserListHook.ts  
getUserList()

---

## state変数

- camelCase を使用する

### OK

userName  
isLoading

### NG

UserName  
user_name

---

## Boolean

- `is`
- `has`
- `can`

prefixを使用する

### OK

isDeleted  
hasError  
canEdit

### NG

deletedFlag  
errorExists  
editable

---

## Props

- interface名は `[Component名]Props` を使用する

### OK

UserListProps

### NG

Props  
userListProps

---

# Python

## ファイル名

- snake_case を使用する

### OK

user_service.py  
auth_controller.py

### NG

UserService.py  
authController.py

---

## Class名

- PascalCase を使用する

### OK

UserService  
AuthRepository

### NG

userService  
auth_repository

---

## Function名

- snake_case を使用する

### OK

get_user  
create_order

### NG

getUser  
CreateOrder

---

## 定数

- UPPER_SNAKE_CASE を使用する

### OK

MAX_RETRY_COUNT

### NG

max_retry_count  
MaxRetryCount

---

# API

## URL

- 小文字のみ
- 複数形
- 名詞ベース

### OK

/api/v1/users
/api/v1/order-items

### NG

/api/v1/getUsers
/api/v1/user_list

---

# DB

## Collection名

- snake_case
- 複数形

### OK

users  
order_items

### NG

user  
OrderItems

---

## 項目名

- snake_case

### OK

user_name  
created_at

### NG

userName  
CreatedAt

---

## 日時項目

- `_at` suffix

### OK

created_at  
updated_at

### NG

created_date  
updateTime

---

## ID項目

- `_id` suffix

### OK

user_id  
order_id

### NG

userId  
id

---

# テスト

## テスト名

- 日本語で記載する
- 正常系/異常系を明示する

### OK

正常系_ログイン成功  
異常系_パスワード未入力

### NG

login_success  
パスワード未入力

---

# 禁止事項

- 意味不明な略語
- 同義語混在
- 命名ルール違反
- DB/API/画面で異なる名称使用
