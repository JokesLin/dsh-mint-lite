# dsh-mint-lite

一个给 **DeepSeek Harness（DSH）** 用的轻量月光配色主题：冷白偏蓝的内容区、深海军蓝的深色模式、圆润字体，强调色一个都不动。设置 → 通用 →「外观」下面多一行「主题细节」，三个开关都能现调。

> 为「性能敏感」而做。DSH 主题插件常见的做法是叠壁纸层、毛玻璃、监听 DOM 重绘——这些都会持续吃 GPU 和电。这个插件反过来：**重算一张样式表就完事，运行时没有定时器、没有 DOM 观察器。**

<img src="./assets/preview.png" alt="dsh-mint-lite 四种组合：浅色/深色 × 气泡/会话" width="100%">

*上图为配色渲染示意，不是应用截图。四格：上排气泡形态，下排会话形态；左列浅色，右列深色。*

---

## 两个开关

都在「设置 → 通用 → 主题细节」，紧跟 DSH 自带的深浅色方块。

| 开关 | 选项 | 影响 |
|---|---|---|
| **消息形态** | 气泡 / 会话 | 助手回复要不要套圆角面板 |
| **配色** | 月光 / 原生 | 月光 = 本插件的 24 个 token；原生 = 把 DSH 原厂值写回去 |

**消息形态管的是助手回复，不是你的消息。** 这跟 DSH 原生相反，跟 ds-bot 一致：

- **你的消息**：永远是深靛蓝面板 + 白字（`#1e3a8a` / `#3b6fd8`），两种形态都不变。ds-bot 也是这样——它的平铺规则只碰 `.bt-bubble`（助手），不碰 `.bt-ububble`（你）。
- **助手回复**：气泡模式套 `#e5ebf5` / `#1a2340` 圆角面板；会话模式去掉面板铺成正文。

DSH 原生只有用户消息有气泡元素，助手回复是裸 Markdown，所以面板是这个插件额外画的。左右两个 flow item 分别是「思考过程」和「回复正文」（`data-chat-group-part`），只有正文那块上色。

## 它到底有多轻

| 项目 | 数值 |
|---|---|
| 覆盖的 theme token | **22 个外壳 token + 2 个布局变量 + 1 个字体** |
| 注入的 `<style>` | **1 个**（内容就地重写，不增不减） |
| `client.js` 体积 | 22 KB（未压缩）/ 7 KB（gzip） |
| 宿主侧代码 | 0 行逻辑（`apply()` 是空函数） |
| `MutationObserver` / `ResizeObserver` | 无 |
| `setTimeout` / `setInterval` / `requestAnimationFrame` | 无 |
| `backdrop-filter` | 无 |
| 偏好存储 | 1 个 `localStorage` 键，只写不轮询 |

## 它长什么样

配色表来自 ds-bot 的 Moonlight 主题，8 色卡 + 用户气泡两色：

| 键 | light | dark |
|---|---|---|
| bg | `#f7f9fc` | `#0b1020` |
| sidebar | `#eef2f8` | `#10172a` |
| bubble | `#e5ebf5` | `#1a2340` |
| bubbleHi | `#d8e2f2` | `#232f52` |
| card | `#ffffff` | `#141c33` |
| text | `#121826` | `#e8edf7` |
| **user** | **`#1e3a8a`** | **`#3b6fd8`** |
| userInk | `#ffffff` | `#ffffff` |

- **浅色**：冷白 `#f7f9fc` 内容区，蓝灰侧栏。
- **深色**：深海军蓝 `#0b1020` 内容区，卡片抬到 `#141c33`。
- **你的气泡**：深靛蓝底 + 白字，和 ds-bot 完全一致。深色模式那个 `#3b6fd8` 上白字只有 **4.72:1**，刚过 AA，是这套配色里最紧的一处。
- **字体**：`SF Pro Rounded` / `ui-rounded`，仅浅色生效；字重靠 `-webkit-text-stroke: 0.18px` 微调（`font-weight` 最小跳档是 400→500，墨水量 +25%，太粗了）。字体**不随配色开关变化**，它是这个包「lite」的部分。

## 强调色一个都没改

按钮、链接、焦点环、成功/警告/错误状态色、diff 配色、品牌色、滚动条——**全部来自 DSH 原生调色板**。这个插件只碰两件事：**表面色**（底、侧栏、气泡、分层、输入框、代码块）和**文字灰阶**（primary / secondary / tertiary + 边框 4 档）。唯一的例外是**你自己的气泡内文字**——靛蓝底上必须换白字，否则深色字落在 9.82:1 的深底上直接看不见。这个覆盖只作用于气泡内部，不碰其它文字。

对比度（落在实际实色背景上）：

| 用途 | light | dark |
|---|---|---|
| 正文 on 内容区 | 16.81:1 | 16.13:1 |
| 正文 on 侧栏 | 15.78:1 | 15.18:1 |
| 白字 on 你的气泡 | 10.36:1 | 4.72:1 |
| 正文 on 助手面板 | 14.80:1 | 13.17:1 |
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
{"layout":"bubble","palette":"moonlight"}
```

**每个浏览器各一份，不跨设备同步**——而 DSH 的浅色/深色是跨设备同步的。旧版本存过 `sidebarAlpha` 字段，读取时直接忽略，不会报错。

## 想自己改

全部可调项都在 `client.js` 顶部：

| 想改什么 | 改哪里 |
|---|---|
| 整体色调 | `MOON` 那张色卡（light / dark 各 9 个键） |
| 你的气泡颜色 | `MOON.*.user` / `MOON.*.userInk` |
| 「原生」写回的值 | `STOCK` 常量 |
| 文字灰阶浓度 | `paletteTokens()` 里 `label-secondary` / `label-tertiary` 的 `0.74` / `0.6` |
| 边框强度 | `border-l1~l4` 的四个 alpha |
| 字体 | `FONT_ROUNDED` |
| 字重 | `STROKE`（`0.18px` ≈ +7% 墨水量，`0.30px` ≈ +13%） |
| 消息形态的规则 | `layoutCss()` |

## 兼容性

- 面向 DSH 的 Cordis 客户端插件接口（`window.__ModuleLoader__` + `ctx.slots` + `ctx.theme`）。
- 浏览器半边声明在 `package.json` 的 `dsh.client`，`inject: ["theme", "slots", "locale"]`。
- 设置行用 `@deepseek-ai/dsh-client-ui-primitives` 的 `SegmentedControl`；这个模块不可用时会降级成普通按钮，不会连累整个插件。
- 宿主半边 `index.js` 为空——它不提供路由、不存状态，只作为 bundle 占位。

## 许可

[MIT](./LICENSE)
