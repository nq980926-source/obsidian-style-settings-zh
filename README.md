# 样式设置（Style Settings）简体中文版

集中调整 Obsidian 主题、插件和 CSS 代码片段的样式设置。本项目仅对上游插件进行简体中文汉化，保留原有功能和配置格式。

- 汉化版：**1.0.10**；上游稳定版：**1.0.9**。
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

Obsidian 语言设为简体中文（zh）后，继续使用上游机制读取第三方设置的 `title.zh` 和 `description.zh`。未提供中文的主题、插件、CSS 片段会回退到原文；本项目不修改第三方 CSS，不更改设置 ID、CSS 变量或默认值，也不使用在线翻译。

本汉化版自身界面固定使用简体中文。JSON、CSS、HEX/RGBA/HSLA 等技术名称和第三方解析器返回的底层诊断保留原文。

保持 `isDesktopOnly: false`，沿用上游桌面和移动端实现，未新增运行时依赖。Windows、Android 的真实设备界面、触摸操作、主题切换和配置持久化，以及 BRAT 实际安装尚未验证。构建和发布接口验证不等于实机测试。

## 构建与验证

使用 Node.js 24，执行 `npm ci`、`npm run typecheck`、`npm run build`。生产构建文件为 main.js，随 manifest.json、styles.css 一起作为 Release 附件发布。仓库不提交用户 data.json、密钥或 node_modules。

原项目没有 test 脚本。本项目进行了主题中文及回退机制、颜色选择器中文配置、配置管理器不变性和内部标识符保留检查。ESLint 排除 Windows 检出的 CRLF 行尾后通过；不为此重排全部上游源码。详细结果见 VALIDATION.md。

## 许可证与致谢

原作者：mgmeyers 及上游贡献者。保留上游源码和完整 LICENSE.md。本项目是修改版本，并非上游官方中文发行版。

上游 LICENSE.md 实际为 GNU GPL v3，但其 package.json 标为 MIT，二者存在不一致。本分发保留 GPL v3 全文，汉化改动按 GPL-3.0-only 提供，package.json 同步声明；不将上游误称为 MIT 项目。打包依赖各自许可证及版权见 THIRD_PARTY_NOTICES.txt 和 main.js 内嵌法律注释。

[上游使用文档](README.upstream.md) · [BRAT 官方开发指南](https://github.com/TfTHacker/obsidian42-brat/blob/main/BRAT-DEVELOPER-GUIDE.md)

