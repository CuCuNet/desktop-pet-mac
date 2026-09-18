# 桌面宠物 macOS 版打包说明

本目录是从 Windows 安装包中提取的完整 Electron 源码（electron + renderer + assets），已加入 mac 打包配置，可直接产出 `.dmg`。

## 目录内容

```
app-src/
├── electron/          # 主进程源码（含 Windows 专用截屏逻辑，mac 上自动跳过）
├── renderer/          # 渲染进程（宠物动画、UI）
├── assets.zip         # 宠物素材压缩包（构建时由 GitHub Actions 自动解压为 assets/）
├── package.json       # 已加入 electron-builder mac 配置
└── .github/workflows/build-mac.yml   # GitHub Actions 云端打包工作流
```

## 方式一：在 Mac 上本地打包（推荐）

要求：macOS + Node.js 18+。

```bash
cd app-src
npm install        # 安装 electron 和 electron-builder（首次较慢）
npm start          # 可先试运行，宠物应出现在桌面上
npm run dist:mac   # 打包，产出 dist/桌面宠物-1.0.0-arm64.dmg 和 -x64.dmg
```

- `arm64.dmg` → Apple Silicon（M1/M2/M3/M4）
- `x64.dmg` → Intel 芯片

> 未签名应用首次打开需右键 →「打开」，或在「系统设置 → 隐私与安全性」中允许。

## 方式二：没有 Mac？用 GitHub Actions 云端打包

1. 在 GitHub（或 AtomGit 迁移过去）新建一个仓库，把本目录全部文件推上去；
2. 仓库页面 → Actions → 选择 "Build macOS DMG" → Run workflow；
3. 跑完后在对应 run 的 Artifacts 里下载 `desktop-pet-mac`，内含两个 dmg。

## 已知移植说明

- 代码中唯一的 Windows 专属功能（截屏穿透捕获，`main.js` 中 `CAPTURE_MODE`）已有 `process.platform !== 'win32'` 保护，mac 上自动禁用，不影响宠物核心功能。
- 托盘图标、开机自启、置顶、透明窗口等 API 均为 Electron 跨平台能力，mac 原生支持。
- `assets/icon.png` 需为 512×512 以上 PNG；若想要标准 `.icns` 效果，可用 `iconutil` 转换后把 `build/mac` 路径配置进 `mac.icon`。
