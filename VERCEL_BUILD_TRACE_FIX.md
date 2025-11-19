# 🔧 修复 Vercel 构建堆栈溢出问题

## 问题症状

```
RangeError: Maximum call stack size exceeded
at RegExp.exec (<anonymous>)
at create (/vercel/path0/frontend/node_modules/next/dist/compiled/micromatch/index.js:15:18889)
...
Error: Command "npm run build" exited with 1
```

## ✅ 已实施的修复

1. **降级 `sharp` 到 0.33.1**（已在代码中修复）
2. **使用 `standalone` 输出模式**（已在 `next.config.js` 中配置）
3. **在构建命令中添加 `NEXT_PRIVATE_SKIP_BUILD_TRACE=1`**（已在 `vercel.json` 中配置）

## 🔧 额外步骤：在 Vercel Dashboard 设置环境变量

如果问题仍然存在，请在 Vercel Dashboard 中手动设置环境变量：

### 步骤：

1. **进入 Vercel 项目**
   - 项目：`ntu-dating-platform-kappa`
   - Settings → **Environment Variables**

2. **添加环境变量**
   - **Name**: `NEXT_PRIVATE_SKIP_BUILD_TRACE`
   - **Value**: `1`
   - **Environment**: 选择所有环境（Production, Preview, Development）
   - 点击 **Save**

3. **重新部署**
   - Deployments → 找到最新部署 → ⋯ → Redeploy
   - 选择 **Clear Build Cache** 清除构建缓存

## 📝 其他可能的解决方案

如果上述方法都不起作用，可以尝试：

1. **升级 Next.js 到最新版本**
   ```bash
   npm install next@latest
   ```

2. **检查是否有循环依赖**
   - 检查组件之间的导入关系
   - 确保没有组件 A 导入组件 B，而组件 B 又导入组件 A

3. **清除 Vercel 构建缓存**
   - 在 Vercel Dashboard 中手动触发部署
   - 选择 **Clear Build Cache**

## 🎯 当前配置状态

- ✅ `sharp` 已降级到 `0.33.1`
- ✅ `output: 'standalone'` 已在 `next.config.js` 中配置
- ✅ `NEXT_PRIVATE_SKIP_BUILD_TRACE=1` 已在构建命令中设置
- ⚠️ 建议在 Vercel Dashboard 中手动设置环境变量作为额外保险

