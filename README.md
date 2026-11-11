# 样式设置（Style Settings）简体中文版

集中调整 Obsidian 主题、插件和 CSS 代码片段的样式设置。本项目仅对上游插件进行简体中文汉化，保留原有功能和配置格式。

- 汉化版：**1.1.1**；上游稳定版：**1.0.9**。
- 上游提交：`4ebec6ae0131a9d5e8307bb5e26d59db5ba2e81c`。
- 原项目：https://github.com/community-archive/obsidian-style-settings
- 插件 ID：`obsidian-style-settings`（保持不变）。
- 修改日期：2026-11-12。界面、命令、搜索、导入导出、重置、颜色选择器按钮和无障碍标签已汉化。

## BRAT 安装

1. 安装并启用 BRAT 1.1.0 或以上版本。
2. 打开 BRAT 设置，选择 **Add Beta Plugin**。
3. 输入：`https://github.com/nq980926-source/obsidian-style-settings-zh`。
4. 选择最新版本（latest），添加后在 Obsidian 第三方插件列表中启用“样式设置（Style Settings）”。

无需下载 ZIP、复制文件或编译。后续使用 BRAT 检查更新或启用 BRAT 自动更新；不要冻结版本。维护者后续发布递增版本及相同名称的三个 Release 资源后，BRAT 按正常机制更新。

## 从英文版迁移

两个版本使用相同 ID，因此共享同一个插件目录，不能并行安装。

先通过原版导出设置作为备份，再**禁用英文版，不要卸载**，然后按上述步骤在 BRAT 添加本仓库，完成后重新启用。根据当前 BRAT 源码，添加操作会直接写入同 ID 目录的 main.js、manifest.json、styles.css，不删除 data.json；本汉化版也不改变数据结构。无需手动替换文件。不应再通过社区插件更新本插件，以免被上游英文版覆盖。

## 主题中文与兼容性

Obsidian 语言设为简体中文后，优先通过官方 getLanguage API 实时读取语言，旧版本回退到 localStorage；zh-CN / zh-Hans 等简体中文地区码归一到 zh，再读取第三方设置的 `title.zh` 和 `description.zh`。未提供中文的主题、插件、CSS 片段会回退到原文；本项目不修改第三方 CSS，不更改设置 ID、CSS 变量或默认值，也不使用在线翻译。

本汉化版自身界面固定使用简体中文。JSON、CSS、HEX/RGBA/HSLA 等技术名称和第三方解析器返回的底层诊断保留原文。

保持 `isDesktopOnly: false`，沿用上游桌面和移动端实现，未新增运行时依赖。Windows、Android 的真实设备界面、触摸操作、主题切换和配置持久化，以及 BRAT 实际安装尚未验证。构建和发布接口验证不等于实机测试。

## 构建与验证

使用 Node.js 24，执行 `npm ci`、`npm run typecheck`、`npm run build`。生产构建文件为 main.js，随 manifest.json、styles.css 一起作为 Release 附件发布。仓库不提交用户 data.json、密钥或 node_modules。

原项目没有 test 脚本。本项目进行了主题中文及回退机制、颜色选择器中文配置、配置管理器不变性和内部标识符保留检查。ESLint 排除 Windows 检出的 CRLF 行尾后通过；不为此重排全部上游源码。详细结果见 VALIDATION.md。

## 许可证与致谢

原作者：mgmeyers 及上游贡献者。保留上游源码和完整 LICENSE.md。本项目是修改版本，并非上游官方中文发行版。

上游 LICENSE.md 实际为 GNU GPL v3，但其 package.json 标为 MIT，二者存在不一致。本分发保留 GPL v3 全文，汉化改动按 GPL-3.0-only 提供，package.json 同步声明；不将上游误称为 MIT 项目。打包依赖各自许可证及版权见 THIRD_PARTY_NOTICES.txt 和 main.js 内嵌法律注释。

[上游使用文档](README.upstream.md) · [BRAT 官方开发指南](https://github.com/TfTHacker/obsidian42-brat/blob/main/BRAT-DEVELOPER-GUIDE.md)


## 1.0.11 主题中文修复

Blue Topaz 当前发布渠道使用 master/theme.css（manifest 2026110301），旧 Release v6.0 明确提示已不再以 Release 发布最新主题。当前 theme.css 提供 477 个 title.zh 和 77 个 description.zh，包含整体性设置、整体配色、背景设置、界面布局、细节设置和排版。

1.0.10 只在模块加载时读取一次 localStorage 语言且精确匹配字段；主程序语言 API 与旧存储不同、加载后语言改变或地区码不同都可能造成英文回退。1.0.11 使用官方语言 API（1.8.7+）并在每次读取标题/说明时刷新语言，保留旧 Obsidian 兼容性和第三方原文回退。不增加主题专用翻译表。

验证：`node verify-theme-language.cjs`；可传入单独下载的 Blue Topaz theme.css 路径验证六类实际标题。1.0.10 Release 保留可供回退。尚未读取用户设备运行时语言值，未进行实机 BRAT 安装测试。

## 1.0.12 下拉选项显示翻译

支持 class-select 和 variable-select。选项对象可提供 `label.zh`（其他语言使用 `label.<语言码>`），优先使用主题提供的非空译名。简体中文下，缺少译名时仅匹配少量通用词：Default、Auto、Custom、Enabled、Disabled。Fixed、Hide to left、Hide to the left retention drawer、Bubble、Bubble, hide to left 只在工具栏上下文匹配；Bubble 也适用于布局上下文。上下文由设置 ID 和原始标题判断，不绑定 Blue Topaz 主题 ID。未知标签保留原文，不翻译品牌或配色名。

左工具栏样例：Fixed → 固定显示；Hide to left → 向左自动隐藏；Hide to the left retention drawer → 向左自动隐藏（保留侧栏展开按钮）；Bubble → 气泡式；Bubble, hide to left → 气泡式（向左自动隐藏）；Default → 默认。保留按钮的判断来自 Blue Topaz 的侧栏切换按钮 CSS；气泡式表示圆角浮动分组样式。

列表项、选中项和默认值说明统一使用同一标签函数；原生下拉控件保持不变。顶部设置搜索可通过选项英文原名或中文译名找到所属设置，不增加自定义可搜索下拉控件。只变更显示文字，不改原始选项、value、CSS class、默认值或持久化结构。新旧主题无需改文件。

验证：`node verify-option-labels.cjs`，可额外传入 Blue Topaz theme.css 路径。包含两种控件渲染、选中项、选择/重置原值、中文英文搜索、本地化优先和保守回退测试。Windows/Android 实机尚未验证，无新增运行时依赖。1.0.11 Release 保留供回退。

## 1.1.0：可配置 AI 自动翻译

在 Style Settings 设置页的“AI 自动翻译”区域，自行填写 **API Base URL**、**Model ID**，并通过 Obsidian 官方密钥选择器选择已有 **API Key**。地址和模型默认留空，不绑定任何服务商。在线翻译默认关闭；填写配置不代表同意发送请求。主动开启后，只有允许发送、仍缺少中文的当前主题设置文案才进入翻译队列。测试连接按钮会发送一条固定测试文案，可能产生少量费用。

在线功能需要 Obsidian 1.11.4+ 的 SecretStorage/SecretComponent。旧版继续使用已有本地汉化，在线功能禁用。密钥原文只保存在官方密钥库；本插件独立 translation-settings.json 只存密钥名称、开关、地址及模型，translation-cache.json 存上下文缓存和可靠 Token 统计，不改变原有 data.json。

显示优先级：主题原生中文 → 本地词典 → 本地缓存 → 用户启用后的 AI 翻译 → 失败时原文。支持标准 OpenAI Chat Completions 非流式接口，JSON Mode 不受支持时最多回退一次提示词约束 JSON，并继续严格校验结果。不自动切换供应商/模型、不搭建服务器、不发送工具请求。不保证每家服务都接受同一组标准参数，也不通过专属参数控制各家模型的内部推理模式。

API Base URL 应填写公网 HTTPS 基础地址（例如 https://api.example.com/v1），程序追加 /chat/completions；不要填写完整请求路径、查询参数或嵌入密钥。修改地址、模型、密钥后自动关闭开关并忽略旧结果；缓存按接口和模型隔离，切回原配置可复用。

只对能够核实来源的当前主题设置文案自动联网翻译，自定义 CSS Snippet 不联网翻译。路径、链接、代码、占位符、疑似密钥、Markdown 信息项及无法确定安全的格式保守跳过。不能核实主题来源时继续使用本地中文和英文回退。普通机器翻译可能不准确，可通过文字提示查看原文。

**验证状态：**候选阶段类型检查、构建、静态检查和 Mock 测试通过；1.1.0 发布前完成版本与产物检查并重新生产构建。未经授权未使用真实 API Key、未发起付费请求；Windows/Android 实际 Obsidian 表现、SecretStorage 界面和真实模型兼容性尚未实机验收。本次按用户接受剩余风险的决定正式发布。

**回退：**保留 1.0.12 Release 和标签。如需回退，在 BRAT 为本仓库选择并冻结 1.0.12；不要卸载插件，以保留 data.json。翻译缓存和偏好文件可保留，旧版不会使用它们。

实现与候选测试细节见 [历史开发记录](DEVELOPMENT-CANDIDATE.md)；当前发布状态以本节和 GitHub Release 为准。

## 1.1.1 设置界面修复

修正官方 SecretComponent 的构造参数：通过 Setting.addComponent 挂载，并同时传入 App 和容器。1.1.0 缺少 App 参数，运行时异常会导致后续 API Base URL、Model ID 和测试连接控件未创建，并中断设置页余下内容。

本次仅修复已有界面，保留原翻译、缓存和配置格式。密钥控件意外初始化失败时停用在线翻译，后续地址、模型等控件仍能显示。针对性回归测试重现旧错误，并验证正确挂载、输入修改、密钥名称选择、开关和测试连接回调（全部 Mock，无真实 API Key 或付费请求）。保留 1.1.0 Release 和标签供回退。

[官方 SecretStorage / SecretComponent 使用文档](https://docs.obsidian.md/plugins/guides/secret-storage)。Windows/Android 实机及真实 API 验证状态保持如上，不将 Mock 测试描述为实机测试。
