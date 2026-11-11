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
