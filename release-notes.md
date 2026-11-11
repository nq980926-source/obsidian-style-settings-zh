# 1.0.11 主题中文语言匹配修复

- 优先通过 Obsidian 官方 getLanguage API 读取当前语言，旧主程序回退到原 localStorage 方式。
- 每次显示主题标题和说明时读取语言，避免模块加载时缓存语言。
- 将 zh-CN、zh_CN、zh-SG、zh-Hans 及其地区变体归一到主题通用的 zh 字段。
- 保留英文、繁体中文及缺少翻译时的原文回退行为。
- 使用 Blue Topaz 当前 theme.css 验证 General settings、Color scheme、Background images、Layout、Detail settings、Typography 六类标题读取现有中文。

不修改主题文件、CSS 变量、设置 ID 或配置格式，无新增依赖。1.0.10 保留供回退。

类型检查、生产构建、针对性回归测试和排除 Windows CRLF 的 ESLint 均通过。未进行真实设备与 BRAT 安装测试；用户设备中具体的旧语言存储值未读取。
