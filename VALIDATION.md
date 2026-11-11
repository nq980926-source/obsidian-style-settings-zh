# 验证记录（2026-11-12）

- 上游稳定 Release 1.0.9，提交 4ebec6ae0131a9d5e8307bb5e26d59db5ba2e81c；未采用上游 main 的后续开发提交。
- npm install --ignore-scripts 完成；未新增运行时依赖。锁定本次 npm 依赖以便复现。
- npm run typecheck：通过（未跳过依赖类型检查）。
- npm run build：通过，生成 main.js。
- 原项目无 test 脚本；node verify-local.cjs：通过，检查所有原内部标识符、配置管理器源码不变、zh/en/缺失中文时的主题文案回退、颜色选择器中文配置、manifest 和构建产物。
- npm run lint：受 Windows 检出 CRLF 影响；npx eslint ./src --rule 'linebreak-style: off'：通过，无其他错误。
- manifest/package/versions 版本一致，ID 不变，isDesktopOnly=false；styles.css 保留，源码无新增桌面依赖。
- npm 安装报告上游依赖树存在 16 项安全告警（5 moderate、9 high、2 critical，含开发依赖）。本汉化未执行可能改变原功能的强制升级；告警不代表所有问题均可从插件运行路径触发。
- GPL v3 LICENSE.md 原样保留；上游 package.json 的 MIT 元数据冲突已说明；打包依赖版权见 THIRD_PARTY_NOTICES.txt，esbuild 内嵌法律注释保留于 main.js。
- BRAT 当前官方指南及源码已检查：使用 GitHub Releases 的语义版本选择和三个独立资源，非冻结版本可更新；同 ID 安装只写程序资源，保留 data.json。
- Windows / Android Obsidian 实机功能、手机触摸和 BRAT 实际安装未执行。未访问用户仓库或笔记数据。

## 1.0.11 针对性验证（2026-11-12）

- Blue Topaz master 533c228f9719f37e64b0d35453aa568283b3e9b6，theme.css，manifest 2026110301；v6.0 Release 提示不再代表当前主题版本。
- 实际解析 2 个 @settings 块、632 项设置，477 个 title.zh、77 个 description.zh；用户列出的六类标题均已有中文。
- 修复前：存储为 zh 可正确显示；存储为 en/null/zh-CN 会回退英文，即使插件自身固定中文。
- 修复后：官方 API 优先、旧主程序回退、简体中文地区码匹配、运行中语言刷新、英文/繁体保留、缺失翻译回退通过。
- node verify-theme-language.cjs E:/AI/blue-topaz-theme.css：六类实际 Blue Topaz 标题测试通过；CSS 仅下载到独立验证路径，未改用户主题文件。
- node verify-local.cjs：配置管理器原样、未涉及的内部标识符和安装资源检查通过。
- npm run typecheck、npm run build、npx eslint ./src --rule 'linebreak-style: off'：通过。
- 保留 minAppVersion；对 getLanguage 做可用性检测，未增加运行时依赖。
- 未读取用户实际设备运行时状态，未进行 Windows/Android/BRAT 实际安装测试。

## 1.0.12 针对性验证（2026-11-12）

- 检查两个原生 DropdownComponent 渲染器、SelectOption 结构和设置搜索，添加独立轻量标签函数。
- Blue Topaz left-ribbon-style 五个值的行为来自 CSS：普通隐藏时连同切换按钮移出，retention drawer 变体保留侧栏切换按钮；气泡变体给动作/设置分组添加圆角边框并可叠加向左隐藏。
- npm run typecheck、npm run build、npx eslint ./src --rule 'linebreak-style: off'：通过。
- node verify-option-labels.cjs E:/AI/blue-topaz-theme.css：通过；使用控件替身执行两种实际组件 render/onChange/reset，确认每个 option value 和回调写入值不变、默认值不变、选中项显示一致，中英文选项搜索均可命中；主题译名优先、英文/繁体/已有中文/未知词回退通过。
- node verify-theme-language.cjs、node verify-local.cjs：通过。配置管理器仍保持原样；本次改动的四个文件交由专门控件测试验证。
- 未新增运行时依赖、未修改主题文件；Windows、Android、BRAT 实机安装仍未执行。

## 1.1.0-dev.1 本地开发候选

最终需求已调整为用户配置的单一 OpenAI Chat Completions 接口。详情见 DEVELOPMENT-CANDIDATE.md。所有翻译请求仅使用 Mock；未使用真实凭证或付费 API。本候选未发布，1.0.12 仍为正式版。

## 1.1.0 正式发布检查（2026-11-12）

- 用户明确接受真实 API 与 Windows/Android 未实机验收的剩余风险，授权使用现有仓库正式发布。
- 仅定版和更新文档，沿用 1.1.0-dev.1 已通过的实现与完整 Mock 测试结果，不增加功能，不重构，不重复完整测试。
- AI 自动翻译初始 enabled=false；地址、模型、密钥名称初始为空；自动请求受 enabled、密钥库、配置和队列状态约束。
- 保留 SecretStorage、独立缓存、原设置管理器与 data.json 格式，没有读取其他插件私人配置或使用真实 API Key。
- 发布前重新生产构建，核对版本、ID、构建资源和公开下载内容。
- 未创建独立测试仓库或测试知识库；1.0.12 Release/标签保留。Windows/Android 和真实 API 尚未验证。

## 1.1.1 界面缺陷修复（2026-11-12）

- 对照官方 SecretComponent(app, containerEl) 和 Setting.addComponent 文档确认 1.1.0 参数缺失，非 CSS 隐藏问题。
- verify-translation-settings-ui.cjs 使用严格双参数构造契约：旧版代码抛错且没有创建地址、模型和按钮；修复版创建全部控件并正确注册组件。
- 验证地址/模型编辑、密钥名称回调、开关、显式连接按钮的 Mock 回调；密钥控件失败/安全密钥库不受支持时，其余字段继续显示。
- 保留先前翻译/缓存架构，仅调整 TranslationSettings.ts 的界面挂载和异常边界，补强原 UI Mock 的构造契约。
- 运行针对性回归、类型检查、生产构建及改动文件静态检查，不重复整个主题/翻译测试矩阵。
- 未访问其他插件配置、未使用真实密钥、未进行付费 API 调用；Windows/Android 实机仍未验证。
