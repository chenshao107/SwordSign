# SwordSign 🗡️

为 VS Code 窗口添加「名剑」标识，快速区分多窗口环境

![效果图](https://github.com/chenshao107/SwordSign/raw/main/image.png)

## 功能介绍

当你同时开启多个 VS Code 窗口时，是否经常难以区分它们的用途？SwordSign 为你的每个窗口赋予一把「名剑」作为标识，让你在 Alt+Tab 切换时一眼识别。

### 三种标识方式

| 方式 | 位置 | 效果 | 默认 |
|-----|------|------|------|
| 🗡️ **状态栏** | 左下角 | `天问` | ✅ 开启 |
| 📝 **窗口标题** | 标题栏 | `[天问] index.ts - SwordSign` | ✅ 开启 |
| 🎨 **背景水印** | 编辑器背景 | 半透明平铺文字 | ❌ 关闭 |

### 特点

- 🎲 **随机名剑** - 从历史名剑和秦时明月剑谱中随机选取（轩辕剑、湛卢、赤霄、天问、渊虹...）
- ✏️ **自定义文字** - 支持设置自己的标识，如「开发环境」「项目A」
- ⚡ **实时生效** - 修改配置即时更新，无需重启
- 🎛️ **独立开关** - 三种标识方式可独立控制，按需启用

## 快速开始

1. 安装插件后自动生效
2. 查看左下角状态栏的剑图标和名剑名字
3. 观察窗口标题前缀的 `[名剑]` 标识
4. 按 `Ctrl+Shift+P` 输入 `SwordSign` 查看所有命令

## 命令

按 `Ctrl+Shift+P` 打开命令面板：

| 命令 | 功能 |
|------|------|
| **SwordSign: 设置自定义标识文字** | 快速设置自己的标识文字 |
| **SwordSign: 刷新标识** | 随机切换一把名剑 |
| **SwordSign: 切换总开关** | 开启/关闭整个插件 |
| **SwordSign: 切换状态栏显示** | 显示/隐藏状态栏标识 |
| **SwordSign: 切换窗口标题显示** | 显示/隐藏窗口标题标识 |
| **SwordSign: 切换背景水印** | 显示/隐藏背景水印（默认关闭） |

## 配置项

在 VS Code 设置中搜索 `swordsign`：

### 主要配置（仅工作区有效）

> ⚠️ **重要**：所有配置仅对当前工作区生效，这样每个项目可以有独立的标识。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `swordsign.enabled` | boolean | `true` | 总开关 |
| `swordsign.text` | string | `""` | 自定义标识文字，为空则随机名剑 |
| `swordsign.showStatusBar` | boolean | `true` | 状态栏显示 |
| `swordsign.statusBarColor` | string | `""` | 状态栏文字颜色，如 `#FF0000`、`red` |
| `swordsign.statusBarBackground` | string | `""` | 状态栏背景颜色，如 `#FF0000`、`red` |
| `swordsign.showWindowTitle` | boolean | `true` | 窗口标题显示 |
| `swordsign.showWatermark` | boolean | `false` | 背景水印显示 |

### 水印样式（仅当开启背景水印时有效）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `swordsign.opacity` | number | `0.08` | 透明度 (0-1) |
| `swordsign.fontSize` | number | `50` | 文字大小 |
| `swordsign.angle` | number | `-30` | 倾斜角度 |
| `swordsign.color` | string | `"#808080"` | 文字颜色 |

## 推荐用法

- **日常开发**：使用默认的状态栏 + 窗口标题组合，稳定可靠
- **多项目切换**：为不同工作区设置不同的自定义文字，如「前端」「后端」「文档」
- **演示场景**：开启背景水印，视觉效果更强

## 文字水印
目前文字水印在vscode编辑器上体验不佳，像python代码，vscode会锁紧滚动，导致背景失效。默认关闭。