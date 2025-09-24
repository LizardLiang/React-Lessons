# React Context 重新渲染測試

此專案展示並證明了 React Context **不會造成不必要的重新渲染**，即使在深層組件階層中，中間不使用 context 的組件也不會被重新渲染。

## 此專案測試與證明的內容

### 🎯 **核心假設**
React Context 會繞過不使用它的中間組件，相比在深層組件樹中使用 prop drilling，具有更好的效能表現。

### 🧪 **測試設置**
- **4層組件階層**: App → LayerOne → LayerTwo → LayerThree → LayerFour
- **Context Provider**: 位於 LayerOne，使用 useReducer 管理狀態
- **非消費層**: LayerTwo 和 LayerThree 不使用 context
- **消費層**: LayerFour 消費 context 並顯示狀態
- **控制台記錄**: 每個組件在渲染時都會記錄，以便驗證

### ✅ **已證實的結果**

#### **初始載入:**
```
🚀 App component rendered
1️⃣ LayerOne rendered
🔄 StoreProvider re-rendered
2️⃣ LayerTwo rendered (should NOT re-render on context changes)
3️⃣ LayerThree rendered (should NOT re-render on context changes)
4️⃣ LayerFour rendered (consumes context - will re-render)
```

#### **狀態改變時（點擊按鈕）:**
```
🔄 StoreProvider re-rendered
4️⃣ LayerFour rendered (consumes context - will re-render)
```

**✅ LayerTwo 和 LayerThree 在 context 狀態改變時不會重新渲染！**

### 🚀 **關鍵發現**

1. **效能最佳化**: 只有消費 context 的組件會重新渲染
2. **無需 Prop Drilling**: 狀態直接從 Provider 傳遞到 Consumer
3. **中間組件安全**: 在 Provider 和 Consumer 之間添加層級沒有效能成本
4. **選擇性重新渲染**: Context 提供精準的重新渲染控制

## 專案結構

```
src/
├── App.tsx                     # 根組件，帶有渲染記錄
├── components/
│   ├── StoreProvider.tsx       # Context Provider，使用 useReducer
│   ├── LayerOne.tsx           # 包含 Provider 的根層
│   ├── LayerTwo.tsx           # 中間層（不使用 context）
│   ├── LayerThree.tsx         # 中間層（不使用 context）
│   └── LayerFour.tsx          # 消費層（使用 context）
```

## 如何測試

1. **啟動應用程式:**
   ```bash
   bun dev
   ```

2. **打開瀏覽器開發者工具控制台**

3. **點擊按鈕:**
   - "Increment Count"
   - "Update Message"

4. **觀察控制台輸出** - 只有 `StoreProvider` 和 `LayerFour` 應該記錄重新渲染

## 實驗變化

### 測試 1: 在中間層添加 Context
修改 `LayerTwo.tsx` 來消費 context:
```tsx
const { state } = useStore();
```
結果: LayerTwo 現在會在狀態改變時重新渲染。

### 測試 2: 與 Prop Drilling 比較
建立並行實現，通過所有層級傳遞 props，並比較效能。

### 測試 3: 多個 Context
將狀態分割為多個 context，實現更加選擇性的重新渲染。

## 技術堆疊

- **React 19** 配合 TypeScript
- **Vite** 用於開發和建置
- **useReducer** 用於狀態管理
- **createContext** 用於狀態分發
- **控制台記錄** 用於渲染驗證

## 結論

此專案明確證明了 **React Context 是高度最佳化的**，並不會造成經常被歸咎於它的「重新渲染所有東西」問題。Context 智能地繞過不消費它的組件，使其成為複雜應用程式中狀態管理的優秀選擇。
