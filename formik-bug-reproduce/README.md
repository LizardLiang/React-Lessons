# Formik setValues Race Condition Bug Demo

[English](#english) | [繁體中文](#繁體中文)

---

## English

### What is this?

This project demonstrates a common race condition bug when using Formik's `setValues` with concurrent API calls. It provides a side-by-side comparison of the **buggy behavior** and the **correct solution**.

### The Problem

When multiple API calls update the form state concurrently using `setValues` with spread operator, a stale closure issue occurs:

```tsx
// ❌ BUGGY: Both callbacks capture the SAME initial formik.values
useEffect(() => {
  fetchUserBasicInfo().then((data) => {
    formik.setValues({
      ...formik.values,  // Captured at mount time (empty)
      name: data.name,
      email: data.email,
    })
  })
}, [])

useEffect(() => {
  fetchUserPreferences().then((data) => {
    formik.setValues({
      ...formik.values,  // Also captured at mount time (empty)
      theme: data.theme,
      language: data.language,
    })
  })
}, [])
```

**What happens:**
1. Component mounts, both `useEffect` hooks run
2. Both callbacks capture the initial empty `formik.values` in their closures
3. API A returns at ~100ms, sets `{ name, email }` ✓
4. API B returns at ~150ms, spreads the **stale empty values** and sets `{ theme, language }`
5. **Result:** `name` and `email` are lost!

### Why Functional Updates Don't Help

You might think using the functional update pattern would solve this:

```tsx
// ❌ STILL BUGGY: Functional update doesn't help with Formik
formik.setValues((prev) => ({
  ...prev,
  name: data.name,
  email: data.email,
}))
```

**Unlike React's `useState`, Formik's `setValues` with functional updates still suffers from the same race condition.** This is because Formik's internal state management doesn't properly queue concurrent functional updates - each update may still read stale state.

### The Solution

Use `setFieldValue` instead of `setValues`:

```tsx
// ✅ CORRECT: setFieldValue doesn't rely on closure-captured state
useEffect(() => {
  fetchUserBasicInfo().then((data) => {
    formik.setFieldValue('name', data.name)
    formik.setFieldValue('email', data.email)
  })
}, [])

useEffect(() => {
  fetchUserPreferences().then((data) => {
    formik.setFieldValue('theme', data.theme)
    formik.setFieldValue('language', data.language)
  })
}, [])
```

### Running the Demo

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and observe:
- **Left panel (red):** Buggy form - `name` and `email` fields remain empty
- **Right panel (green):** Correct form - all fields are populated

### Project Structure

```
src/
├── App.tsx                    # Side-by-side comparison layout
├── api/
│   └── mockApi.ts            # Simulated APIs with controlled timing
└── components/
    ├── BuggyForm.tsx         # Demonstrates the bug (setValues)
    └── CorrectForm.tsx       # Shows the solution (setFieldValue)
```

### Key Takeaways

1. **Avoid `setValues` in concurrent async operations** - even functional updates `setValues((prev) => ...)` won't help
2. **Use `setFieldValue` for individual field updates** - it's the only reliable solution for concurrent updates
3. **Don't assume Formik behaves like `useState`** - Formik's state management has different semantics

---

## 繁體中文

### 這是什麼？

這個專案展示了在使用 Formik 的 `setValues` 處理並發 API 請求時常見的競態條件（Race Condition）bug。提供了**錯誤行為**與**正確解法**的並排比較。

### 問題描述

當多個 API 呼叫同時使用 `setValues` 搭配展開運算子更新表單狀態時，會發生閉包過期（Stale Closure）的問題：

```tsx
// ❌ 錯誤寫法：兩個 callback 都捕捉到相同的初始 formik.values
useEffect(() => {
  fetchUserBasicInfo().then((data) => {
    formik.setValues({
      ...formik.values,  // 在 mount 時捕捉（空值）
      name: data.name,
      email: data.email,
    })
  })
}, [])

useEffect(() => {
  fetchUserPreferences().then((data) => {
    formik.setValues({
      ...formik.values,  // 同樣在 mount 時捕捉（空值）
      theme: data.theme,
      language: data.language,
    })
  })
}, [])
```

**發生了什麼：**
1. 元件掛載，兩個 `useEffect` 同時執行
2. 兩個 callback 都在閉包中捕捉了初始的空 `formik.values`
3. API A 在 ~100ms 後回傳，設定 `{ name, email }` ✓
4. API B 在 ~150ms 後回傳，展開**過期的空值**並設定 `{ theme, language }`
5. **結果：** `name` 和 `email` 被覆蓋消失了！

### 為什麼函數式更新也沒用

你可能會想用函數式更新來解決這個問題：

```tsx
// ❌ 還是有 BUG：函數式更新在 Formik 中無效
formik.setValues((prev) => ({
  ...prev,
  name: data.name,
  email: data.email,
}))
```

**與 React 的 `useState` 不同，Formik 的 `setValues` 即使使用函數式更新，仍然會有競態條件問題。** 這是因為 Formik 內部的狀態管理沒有正確地排隊處理並發的函數式更新——每次更新可能仍然讀取到過期的狀態。

### 解決方案

使用 `setFieldValue` 取代 `setValues`：

```tsx
// ✅ 正確寫法：setFieldValue 不依賴閉包捕捉的狀態
useEffect(() => {
  fetchUserBasicInfo().then((data) => {
    formik.setFieldValue('name', data.name)
    formik.setFieldValue('email', data.email)
  })
}, [])

useEffect(() => {
  fetchUserPreferences().then((data) => {
    formik.setFieldValue('theme', data.theme)
    formik.setFieldValue('language', data.language)
  })
}, [])
```

### 執行示範

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

打開瀏覽器觀察：
- **左側面板（紅色）：** 有 bug 的表單 - `name` 和 `email` 欄位保持空白
- **右側面板（綠色）：** 正確的表單 - 所有欄位都有值

### 專案結構

```
src/
├── App.tsx                    # 並排比較佈局
├── api/
│   └── mockApi.ts            # 模擬 API（有控制時間差）
└── components/
    ├── BuggyForm.tsx         # 展示 bug（使用 setValues）
    └── CorrectForm.tsx       # 展示解法（使用 setFieldValue）
```

### 重點整理

1. **避免在並發非同步操作中使用 `setValues`** - 即使函數式更新 `setValues((prev) => ...)` 也無法解決問題
2. **使用 `setFieldValue` 更新個別欄位** - 這是處理並發更新的唯一可靠解法
3. **不要假設 Formik 的行為與 `useState` 相同** - Formik 的狀態管理有不同的語意

---

## License

MIT
