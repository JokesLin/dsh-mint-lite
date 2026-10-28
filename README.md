# dsh-mint-lite

一个给 **DeepSeek Harness（DSH）** 用的极轻量浅色主题：淡薄荷绿的内容区、圆润字体，深色完全沿用原生配色。

> 为「性能敏感」而做。DSH 主题插件常见的做法是叠壁纸层、毛玻璃、监听 DOM 重绘——这些都会持续吃 GPU 和电。这个插件反过来：**只改 3 个 token、注入 1 段样式，运行时没有任何循环、监听或重绘。**

<img src="./assets/preview.png" alt="dsh-mint-lite 浅色效果" width="100%">

*上图为配色渲染示意，不是应用截图。*

---

## 它到底有多轻

| 项目 | 数值 |
|---|---|
| 覆盖的 theme token | **3 个**（全部 61 个 token 里只动 3 个） |
| 注入的 `<style>` | **1 个** |
| `client.js` 体积 | 约 5 KB（未压缩） |
| 宿主侧代码 | 0 行逻辑（`apply()` 是空函数） |
| `backdrop-filter` | 无 |
| `MutationObserver` / `ResizeObserver` | 无 |
| `setTimeout` / `setInterval` / `requestAnimationFrame` | 无 |
| `localStorage` / 状态文件 / 设置面板 | 无 |
| 卸载后残留 | 无（`ctx.effect` 的 disposer 会摘掉样式和 token 层） |

深色模式下这个插件**连背景图都不写**——样式表里那条绘制规则只匹配 `body:not([data-ds-dark-theme])`。

## 它长什么样

- **内容区**：白色以 15% 透过率叠在极淡薄荷绿渐变上，合成后约 `#f8fefb → #f4fbf6`。
- **侧栏**：绿灰 `#dfe4df`，和内容区拉开约 1.26:1 的分界，两侧不糊在一起。
- **字体**：`SF Pro Rounded` / `ui-rounded`，仅浅色生效；字重靠 `-webkit-text-stroke: 0.18px` 微调（`font-weight` 最小跳档是 400→500，墨水量 +25%，太粗了）。
- **深色**：**原厂**。不注入任何绘制，全部 token 侧值都是宿主自己的变量引用。

## 强调色一个都没改

按钮、链接、焦点环、成功/警告/错误状态色、边框、滚动条、代码块、diff 配色、所有文字颜色——**全部来自 DSH 原生调色板**。这个插件只碰两件事：内容区背景的透明度与色调，以及浅色的字体族。

对比度（原厂 ink 落在实际合成背景上）：

| 用途 | token | 对比度 |
|---|---|---|
| 正文 | `label-primary` | 18.3:1 |
| 次要文字 | `label-secondary` | 5.63:1 |
| 三级文字 | `label-tertiary` | 3.59:1 |
| 说明文字 | `label-caption` | 2.07:1 |
| 链接 | `link` | 4.11:1 |

说明文字 2.07 与它在纯白上的原生值 2.13 几乎一致——这就是没偷偷改文字色的证据。

## 安装

插件通过 DSH profile 的 bundle 机制加载。把仓库放到任意目录，然后在 profile 的 `package.json` 里加一行依赖：

```json
{
  "dependencies": {
    "dsh-mint-lite": "link:/绝对路径/到/dsh-mint-lite"
  },
  "dsh": {
    "profile": {
      "bundles": ["…", "dsh-mint-lite"]
    }
  }
}
```

对应 profile 目录一般是 `~/.dsh/profiles/<名字>/`。改完重启 DSH 或重载 Web UI 生效。

也可以用 `file:` 或直接解包到 `node_modules/dsh-mint-lite`。

## 切换浅色 / 深色

本插件**不注册自己的主题 id，也不存任何偏好**。浅色、深色、跟随系统走 DSH 自带的「设置 → 通用 → 外观」，由宿主的 `ui-theme.preference` 持久化。

## 想自己改

全部可调项都在 `client.js` 顶部：

| 想改什么 | 改哪里 |
|---|---|
| 绿一点 / 淡一点 | `BACKDROP_LIGHT` 的四个色值 |
| 内容区透明度 | `--dsw-alias-bg-base` 的 `alpha`，**注意是平方关系**：`(1-a)²` 才是实际透出率。`0.61 → 15%` |
| 侧栏深浅 | `--dsw-specific-sidebar-fill` |
| 字体 | `FONT_ROUNDED` |
| 字重 | `STROKE`（`0.18px` ≈ +7% 墨水量，`0.30px` ≈ +13%） |

关于透明度那条：`--dsw-alias-bg-base` 会被**两层**嵌套面板同时绘制（`ui-layout` 的中列，然后 `ui-conversation` 的根节点），alpha 会叠加。写 `0.75` 实际只剩 6% 透出，几乎看不出透明。

## 兼容性

- 面向 DSH 的 Cordis 客户端插件接口（`window.__ModuleLoader__` + `ctx.theme.overrideTokens`）。
- 浏览器半边声明在 `package.json` 的 `dsh.client`，`inject: ["theme"]`。
- 宿主半边 `index.js` 为空——它不提供路由、不存状态，只作为 bundle 占位。

## 许可

[MIT](./LICENSE)
