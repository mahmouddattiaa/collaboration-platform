# 🎯 Quick Memory Optimization Checklist

Use this checklist when building new features to ensure optimal performance.

---

## ✅ For Every New Component

### **Small Components (< 50 lines)**

- [ ] Is it rendered in a list? → Add `React.memo`
- [ ] Does it receive object/array props? → Memoize props in parent
- [ ] Does it have expensive calculations? → Use `useMemo`

### **Large Components (> 50 lines)**

- [ ] Are event handlers passed to children? → Use `useCallback`
- [ ] Are there expensive computations? → Use `useMemo`
- [ ] Can it be code-split? → Use `React.lazy()`

### **List Components**

- [ ] Always use `React.memo`
- [ ] Use `key` prop (not array index)
- [ ] Memoize `onClick` handlers
- [ ] Consider virtual scrolling for > 100 items

---

## ✅ For Every New Feature

### **State Management**

- [ ] Is state used by multiple components? → Move to context
- [ ] Is state updated frequently? → Use `useReducer`
- [ ] Does state cause re-renders? → Check with React DevTools

### **API Calls**

- [ ] Are responses cached? → Use SWR or React Query
- [ ] Are requests debounced? → Add debounce for search
- [ ] Are requests cancelled? → Clean up in useEffect

### **Real-time Features (Socket.io)**

- [ ] Is socket closed on unmount? → Add cleanup
- [ ] Are listeners removed? → Clean up event listeners
- [ ] Is reconnection handled? → Add reconnection logic

---

## ✅ Before Committing Code

### **Quick Checks**

- [ ] Run `npm run build` - Check bundle size
- [ ] Open DevTools Performance tab - Record interaction
- [ ] Check Task Manager - Memory usage < 1.5GB
- [ ] Test on slow device - Smooth 60fps?

### **Code Review**

- [ ] No inline functions in JSX?
- [ ] No inline objects/arrays in props?
- [ ] All useEffect have cleanup?
- [ ] All dependencies listed?

---

## 🚨 Red Flags (Fix Immediately!)

### **Critical Issues**

- ❌ Memory usage > 2GB in development
- ❌ Page load time > 3 seconds
- ❌ Janky scrolling (< 30fps)
- ❌ Unclosed socket connections
- ❌ Event listeners not cleaned up

### **Warning Signs**

- ⚠️ Component re-renders > 5 times per interaction
- ⚠️ Bundle size > 1MB per route
- ⚠️ useEffect runs on every render
- ⚠️ Deeply nested components (> 5 levels)

---

## 📊 Performance Budgets

### **Memory (Development)**

| Component | Limit   | Current  |
| --------- | ------- | -------- |
| Node.js   | < 400MB | \_\_\_MB |
| Browser   | < 800MB | \_\_\_MB |
| Total     | < 1.2GB | \_\_\_GB |

### **Memory (Production)**

| Component | Limit   | Current  |
| --------- | ------- | -------- |
| Browser   | < 400MB | \_\_\_MB |

### **Bundle Size**

| Route     | Limit   | Current  |
| --------- | ------- | -------- |
| Main      | < 500KB | \_\_\_KB |
| Dashboard | < 400KB | \_\_\_KB |
| Room      | < 800KB | \_\_\_KB |

### **Performance**

| Metric       | Target   | Current    |
| ------------ | -------- | ---------- |
| Initial Load | < 2s     | \_\_\_s    |
| Route Change | < 300ms  | \_\_\_ms   |
| Re-renders   | < 50/sec | \_\_\_/sec |

---

## 🔧 Quick Fixes

### **High Memory Usage?**

```bash
# 1. Clear cache
rm -rf node_modules/.vite

# 2. Restart dev server
npm run dev

# 3. Close unnecessary browser tabs
# 4. Disable React DevTools when not debugging
```

### **Slow Component?**

```tsx
// 1. Add React DevTools Profiler
import { Profiler } from "react";

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>;

// 2. Check re-render count
// 3. Add React.memo if > 5 re-renders
```

### **Large Bundle?**

```bash
# 1. Analyze bundle
npm run build
npx vite-bundle-visualizer

# 2. Look for large imports
# 3. Add lazy loading
```

---

## 📱 Device Testing Targets

### **Minimum Specs**

- RAM: 4GB
- CPU: Intel i3 or equivalent
- Network: 3G connection
- Browser: Chrome 90+

### **Test Scenarios**

- [ ] Open app on fresh browser (no cache)
- [ ] Navigate through all routes
- [ ] Open 10+ tabs
- [ ] Use app for 30 minutes continuously
- [ ] Check memory after each scenario

---

## 🎓 Learning Resources

### **When to Use Each Hook**

- `useState` - Simple state, single value
- `useReducer` - Complex state, multiple actions
- `useEffect` - Side effects, subscriptions
- `useCallback` - Memoize functions
- `useMemo` - Memoize values
- `React.memo` - Memoize components

### **Optimization Priority**

1. **High Impact, Low Effort** ← Start here!

   - Add React.memo to list items
   - Lazy load routes
   - Ignore node_modules in file watching

2. **High Impact, High Effort**

   - Virtual scrolling
   - Service worker caching
   - Image optimization

3. **Low Impact, Low Effort**

   - useCallback for event handlers
   - useMemo for simple calculations

4. **Low Impact, High Effort** ← Skip!
   - Micro-optimizations
   - Premature optimizations

---

## 🎯 Monthly Checklist

### **End of Each Sprint**

- [ ] Run performance audit
- [ ] Check bundle size trends
- [ ] Review Memory usage
- [ ] Update performance budgets
- [ ] Document any regressions

### **Tools to Use**

- Chrome DevTools Performance
- React DevTools Profiler
- Lighthouse audit
- Bundle analyzer
- Task Manager / Activity Monitor

---

## 🚀 Next Steps

After implementing basic optimizations:

1. Add monitoring (Sentry, LogRocket)
2. Set up performance CI checks
3. Create performance dashboard
4. Train team on optimization techniques
5. Document project-specific optimizations

---

**Remember:** Measure first, optimize second! 📊
