# Formik setValues Race Condition Bug Demo

[English](#english) | [繁體中文](#繁體中文)

---

## English

### What is this?

This project demonstrates a **race condition bug** when using Formik's `setValues` with:
- Multiple context values that need to sync to form state
- Nested RxJS subscriptions (or Promise chains)
- Multiple `useEffect` hooks calling `setValues` concurrently

It provides a **three-panel comparison** showing the bug and two different fixes.

### The Problem Scenario

A common pattern in enterprise applications:

1. **Context provides multiple values** (from an API or global state)
2. **Multiple `useEffect` hooks** sync these context values to Formik
3. **Nested API calls** also update the form with additional data

```tsx
// Multiple useEffects syncing context values
useEffect(() => {
  if (configVersion && values.configId !== configVersion) {
    setValues((prev) => ({ ...prev, configId: configVersion }));
  }
}, [configVersion, values.configId, setValues]);

useEffect(() => {
  if (standard && values.standard !== standard) {
    setValues((prev) => ({ ...prev, standard }));
  }
}, [standard, values.standard, setValues]);

// Nested API subscription
useEffect(() => {
  OuterService.getData().subscribe(() => {
    InnerService.getData().subscribe(() => {
      // BUG: By now, prev is STALE!
      setValues((prev) => ({
        ...prev,  // prev.configId is "" - context values are LOST!
        unitIds: newUnitIds,
      }));
    });
  });
}, []);
```

### What Happens (The Bug)

| Time | Event | Result |
|------|-------|--------|
| ~50ms | Context ready | Values available |
| ~50ms | Effects 1-4 run | Each calls `setValues((prev) => ...)` |
| ~100ms | Outer API returns | Starts inner subscription |
| ~250ms | Inner API returns | Calls `setValues((prev) => ...)` with **stale `prev`** |
| Final | | **Context values (configId, standard, etc.) are LOST!** |

### Why Functional Updates Don't Help

Unlike React's `useState`, Formik's `setValues((prev) => ...)` does **NOT** properly queue concurrent updates:

```tsx
// ❌ STILL BUGGY - Formik doesn't queue these like useState would
setValues((prev) => ({ ...prev, configId }));   // Effect 1
setValues((prev) => ({ ...prev, standard }));    // Effect 2
setValues((prev) => ({ ...prev, unitIds }));     // Effect 3 (nested API)
// Each `prev` may capture stale state!
```

### The Solutions

#### Fix 1: Use `setFieldValue` (Recommended)

```tsx
// ✅ Each field updated independently - no closure issues
useEffect(() => {
  if (configVersion && values.configId !== configVersion) {
    setFieldValue('configId', configVersion);
  }
}, [configVersion, values.configId, setFieldValue]);

// In nested API:
InnerService.getData().subscribe((data) => {
  setFieldValue('unitIds', data.unitIds);
  setFieldValue('parentUnitId', data.parentUnitId);
});
```

#### Fix 2: Batch All Updates

```tsx
// ✅ Wait for all data, then single setValues call
useEffect(() => {
  if (contextLoading) return;

  forkJoin({
    innerData: from(InnerService.getData()),
  }).subscribe(({ innerData }) => {
    setValues({
      configId: configVersion,
      standard: standard,
      // ... all context values
      unitIds: innerData.unitIds,
    });
  });
}, [contextLoading, ...deps]);
```

### Running the Demo

```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

Open your browser and observe three panels:

| Panel | Approach | Result |
|-------|----------|--------|
| **Left (Red)** | Multiple `setValues((prev) => ...)` | ❌ Context values LOST |
| **Middle (Green)** | `setFieldValue()` for each field | ✅ All values preserved |
| **Right (Blue)** | Single batched `setValues` | ✅ All values preserved |

### Project Structure

```
src/
├── App.tsx                           # Three-panel comparison layout
├── context/
│   └── UserContext.tsx               # Simulates context with multiple values
├── api/
│   └── mockApi.ts                    # Mock APIs with controlled timing
└── components/
    ├── FunctionalUpdateBuggyForm.tsx # ❌ Shows the bug
    ├── SetFieldValueFixForm.tsx      # ✅ Fix 1: setFieldValue
    └── BatchedSetValuesForm.tsx      # ✅ Fix 2: Batched setValues
```

### Key Takeaways

1. **`setValues((prev) => ...)` is NOT like `useState`** - Formik doesn't properly queue concurrent functional updates
2. **Use `setFieldValue` for concurrent updates** - It updates each field independently without closure issues
3. **Multiple `useEffect` + `setValues` = Race condition** - Even with functional updates
4. **Nested subscriptions make it worse** - The deeper the nesting, the more stale the closure

---

## 繁體中文

### 這是什麼？

這個專案展示了使用 Formik 的 `setValues` 時發生的**競態條件 bug**，包含：
- 多個需要同步到表單狀態的 Context 值
- 巢狀 RxJS subscriptions（或 Promise 鏈）
- 多個 `useEffect` 同時呼叫 `setValues`

提供了**三欄比較**，展示 bug 和兩種不同的修復方式。

### 問題場景

企業應用中常見的模式：

1. **Context 提供多個值**（來自 API 或全域狀態）
2. **多個 `useEffect`** 將這些 context 值同步到 Formik
3. **巢狀 API 呼叫**也會更新表單的額外資料

```tsx
// 多個 useEffect 同步 context 值
useEffect(() => {
  if (configVersion && values.configId !== configVersion) {
    setValues((prev) => ({ ...prev, configId: configVersion }));
  }
}, [configVersion, values.configId, setValues]);

useEffect(() => {
  if (standard && values.standard !== standard) {
    setValues((prev) => ({ ...prev, standard }));
  }
}, [standard, values.standard, setValues]);

// 巢狀 API subscription
useEffect(() => {
  OuterService.getData().subscribe(() => {
    InnerService.getData().subscribe(() => {
      // BUG: 此時 prev 已經過期了！
      setValues((prev) => ({
        ...prev,  // prev.configId 是 "" - context 值消失了！
        unitIds: newUnitIds,
      }));
    });
  });
}, []);
```

### 發生了什麼（Bug）

| 時間 | 事件 | 結果 |
|------|------|------|
| ~50ms | Context 準備好 | 值可用 |
| ~50ms | Effect 1-4 執行 | 各自呼叫 `setValues((prev) => ...)` |
| ~100ms | 外層 API 回傳 | 開始內層 subscription |
| ~250ms | 內層 API 回傳 | 用**過期的 `prev`** 呼叫 `setValues((prev) => ...)` |
| 最終 | | **Context 值（configId、standard 等）消失了！** |

### 為什麼函數式更新也沒用

與 React 的 `useState` 不同，Formik 的 `setValues((prev) => ...)` **不會**正確排隊處理並發更新：

```tsx
// ❌ 還是有 BUG - Formik 不會像 useState 那樣排隊
setValues((prev) => ({ ...prev, configId }));   // Effect 1
setValues((prev) => ({ ...prev, standard }));    // Effect 2
setValues((prev) => ({ ...prev, unitIds }));     // Effect 3 (巢狀 API)
// 每個 `prev` 可能都捕捉到過期狀態！
```

### 解決方案

#### 修復 1：使用 `setFieldValue`（推薦）

```tsx
// ✅ 每個欄位獨立更新 - 沒有閉包問題
useEffect(() => {
  if (configVersion && values.configId !== configVersion) {
    setFieldValue('configId', configVersion);
  }
}, [configVersion, values.configId, setFieldValue]);

// 在巢狀 API 中：
InnerService.getData().subscribe((data) => {
  setFieldValue('unitIds', data.unitIds);
  setFieldValue('parentUnitId', data.parentUnitId);
});
```

#### 修復 2：批次更新

```tsx
// ✅ 等待所有資料，然後單次 setValues
useEffect(() => {
  if (contextLoading) return;

  forkJoin({
    innerData: from(InnerService.getData()),
  }).subscribe(({ innerData }) => {
    setValues({
      configId: configVersion,
      standard: standard,
      // ... 所有 context 值
      unitIds: innerData.unitIds,
    });
  });
}, [contextLoading, ...deps]);
```

### 執行示範

```bash
# 安裝依賴
npm install
# 或
bun install

# 啟動開發伺服器
npm run dev
# 或
bun dev
```

打開瀏覽器觀察三個面板：

| 面板 | 方式 | 結果 |
|------|------|------|
| **左側（紅色）** | 多個 `setValues((prev) => ...)` | ❌ Context 值消失 |
| **中間（綠色）** | 每個欄位用 `setFieldValue()` | ✅ 所有值保留 |
| **右側（藍色）** | 單次批次 `setValues` | ✅ 所有值保留 |

### 專案結構

```
src/
├── App.tsx                           # 三欄比較佈局
├── context/
│   └── UserContext.tsx               # 模擬有多個值的 context
├── api/
│   └── mockApi.ts                    # 有控制時間的模擬 API
└── components/
    ├── FunctionalUpdateBuggyForm.tsx # ❌ 展示 bug
    ├── SetFieldValueFixForm.tsx      # ✅ 修復 1: setFieldValue
    └── BatchedSetValuesForm.tsx      # ✅ 修復 2: 批次 setValues
```

### 重點整理

1. **`setValues((prev) => ...)` 不等於 `useState`** - Formik 不會正確排隊處理並發的函數式更新
2. **並發更新請用 `setFieldValue`** - 它獨立更新每個欄位，沒有閉包問題
3. **多個 `useEffect` + `setValues` = 競態條件** - 即使用函數式更新也一樣
4. **巢狀 subscription 會讓問題更嚴重** - 巢狀越深，閉包越過期

---

## License

MIT
