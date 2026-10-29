# dsh-mint-lite

一个给 **DeepSeek Harness（DSH）** 用的轻量月光配色主题：冷白偏蓝的内容区、深海军蓝的深色模式、圆润字体，强调色一个都不动。设置 → 通用 →「外观」下面多一行「主题细节」，三个开关都能现调。

> 为「性能敏感」而做。DSH 主题插件常见的做法是叠壁纸层、毛玻璃、监听 DOM 重绘——这些都会持续吃 GPU 和电。这个插件反过来：**重算一张样式表就完事，运行时没有定时器、没有 DOM 观察器。**

<img src="./assets/preview.png" alt="dsh-mint-lite 四种组合：浅色/深色 × 气泡/会话" width="100%">

*上图为配色渲染示意，不是应用截图。四格：上排气泡形态，下排会话形态；左列浅色，右列深色。*

---

## 三个开关

都在「设置 → 通用 → 主题细节」，紧跟在 DSH 自带的深浅色方块下面。

| 开关 | 选项 | 影响 |
|---|---|---|
| **消息形态** | 气泡 / 会话 | 只影响**你自己的消息**：带底色的圆角气泡，或者去掉底色铺成正文 |
| **配色** | 月光 / 原生 | 月光 = 本插件的 22 个颜色 token；原生 = 把 DSH 原厂值写回去 |
| **侧栏浓度** | 0–100%，默认 40% | 侧栏颜色相对内容区拉开多少。0 = 两栏同色，100 = 完整月光侧栏 |

浓度是**相对内容区的色阶**，不是真半透明——DSH 的侧栏本身已经叠了一层窗口渐变，再叠 alpha 会难调准。40% 时侧栏合成 `#f3f6fa`，对内容区 1.03:1。

| 浓度 | 浅色侧栏 | 对内容区 | 深色侧栏 | 对内容区 |
|---|---|---|---|---|
| 0% | `#f7f9fc` | 1.00:1 | `#0b1020` | 1.00:1 |
| 40% | `#f3f6fa` | 1.03:1 | `#0d1324` | 1.02:1 |
| 100% | `#eef2f8` | 1.07:1 | `#10172a` | 1.06:1 |

月光这套靠**色温**分离两栏，不靠明度，所以整条曲线的对比度都很低。要强分界感就往 100% 拉，或者直接改 `MOON.*.sidebar`。

## 它到底有多轻

| 项目 | 数值 |
|---|---|
| 覆盖的 theme token | **22 个颜色 + 1 个字体**（全部 61 个 token 里只动这些） |
| 注入的 `<style>` | **1 个**（内容就地重写，不增不减） |
| `client.js` 体积 | 22 KB（未压缩）/ 7 KB（gzip） |
| 宿主侧代码 | 0 行逻辑（`apply()` 是空函数） |
| `MutationObserver` / `ResizeObserver` | 无 |
| `setTimeout` / `setInterval` / `requestAnimationFrame` | 无 |
| `backdrop-filter` | 无 |
| 偏好存储 | 1 个 `localStorage` 键，只写不轮询 |

## 它长什么样

配色表来自 ds-bot 的 Moonlight 主题，8 色卡：

| 键 | light | dark |
|---|---|---|
| bg | `#f7f9fc` | `#0b1020` |
| sidebar | `#eef2f8` | `#10172a` |
| bubble | `#e5ebf5` | `#1a2340` |
| bubbleHi | `#d8e2f2` | `#232f52` |
| card | `#ffffff` | `#141c33` |
| text | `#121826` | `#e8edf7` |

- **浅色**：冷白 `#f7f9fc` 内容区，蓝灰侧栏。
- **深色**：深海军蓝 `#0b1020` 内容区，卡片抬到 `#141c33`。
- **字体**：`SF Pro Rounded` / `ui-rounded`，仅浅色生效；字重靠 `-webkit-text-stroke: 0.18px` 微调（`font-weight` 最小跳档是 400→500，墨水量 +25%，太粗了）。字体**不随配色开关变化**，它是这个包「lite」的部分。

## 强调色一个都没改

按钮、链接、焦点环、成功/警告/错误状态色、diff 配色、品牌色、滚动条——**全部来自 DSH 原生调色板**。这个插件只碰两件事：**表面色**（底、侧栏、气泡、分层、输入框、代码块）和**文字灰阶**（primary / secondary / tertiary + 边框 4 档）。

对比度（落在实际实色背景上）：

| 用途 | light | dark |
|---|---|---|
| 正文 on bg | 16.81:1 | 16.13:1 |
| 正文 on sidebar（40%） | 16.36:1 | 15.75:1 |
| 正文 on bubble | 14.80:1 | 13.17:1 |
| 二级文字（74%） | 7.39:1 | 9.11:1 |
| 三级文字（60%） | 4.57:1 | 6.31:1 |

原生 `link` `#4176e6` 落在 `#f7f9fc` 上是 4.02:1（白底 4.23），刚好卡在 AA 边缘；深色下 `#7aaaff` 是 8.13:1。

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

## 和 ds-bot 一起用

两者都会往同一批 shell token 里写值，而 ds-bot 的 token 层每次名单变化都会重新叠一次，永远在上面。所以本插件**不用 token 层写颜色**，改用带 `!important` 的样式表——CSS 的 `!important` 压得过 inline style，而 ds-bot 和 ui-layout 都是用 inline 写的。

**「原生」不是不画，是画回原厂值。** 这点容易踩：ds-bot 的层还在往 inline style 里写月光值，如果本插件只是「停止注入」，外壳会继续是月光，「原生」等于没切。所以原生分支把 DSH 自己的 22 个 token 定义用同样高的优先级写回去（`STOCK` 常量，值直接引用宿主的 `--dsw-static-*`，宿主改色板这里自动跟随）。

**代价**：ds-bot 自己的界面用 `--bt-*` 变量，不受本插件控制。把配色切成「原生」时，DSH 外壳回到原厂，ds-bot 会话里仍是月光色。切不齐，只能让 ds-bot 的团队主题也跟着切。

字体是例外——故意留在 token 层，否则会压死「设置 → 通用」里的字体设置。

## 偏好存在哪

`localStorage["dsh-mint-lite:prefs"]`：

```json
{"layout":"bubble","palette":"moonlight","sidebarAlpha":40}
```

**每个浏览器各一份，不跨设备同步**——而 DSH 的浅色/深色是跨设备同步的。这两个值来源不同，可能出现「A 设备深色 + 月光，B 设备浅色 + 月光」这类组合，属预期行为。脏数据会逐字段回退到默认值，超范围的浓度会夹到 0–100。

## 想自己改

全部可调项都在 `client.js` 顶部：

| 想改什么 | 改哪里 |
|---|---|
| 整体色调 | `MOON` 那张色卡（light / dark 各 7 个键） |
| 「原生」写回的值 | `STOCK` 常量 |
| 默认浓度 | `DEFAULTS.sidebarAlpha` |
| 文字灰阶浓度 | `paletteTokens()` 里 `label-secondary` / `label-tertiary` 的 `0.74` / `0.6` |
| 边框强度 | `border-l1~l4` 的四个 alpha |
| 字体 | `FONT_ROUNDED` |
| 字重 | `STROKE`（`0.18px` ≈ +7% 墨水量，`0.30px` ≈ +13%） |
| 会话形态的规则 | `layoutCss()` |

## 兼容性

- 面向 DSH 的 Cordis 客户端插件接口（`window.__ModuleLoader__` + `ctx.slots` + `ctx.theme`）。
- 浏览器半边声明在 `package.json` 的 `dsh.client`，`inject: ["theme", "slots", "locale"]`。
- 设置行用 `@deepseek-ai/dsh-client-ui-primitives` 的 `SegmentedControl`；这个模块不可用时会降级成普通按钮，不会连累整个插件。
- 宿主半边 `index.js` 为空——它不提供路由、不存状态，只作为 bundle 占位。

## 许可

[MIT](./LICENSE)
