import * as obsidian from 'obsidian';
import { TranslationService } from './TranslationService';
import { ButtonComponent, Setting, ToggleComponent } from 'obsidian';

export function renderTranslationSettings(
	container: HTMLElement,
	service: TranslationService
) {
	const root = container.createDiv({ cls: 'style-settings-auto-translation' });
	new Setting(root).setHeading().setName('AI 自动翻译');
	let enableToggle: ToggleComponent | undefined;
	const update = async (
		change: Parameters<TranslationService['configure']>[0]
	) => {
		await service.configure(change);
		enableToggle?.setValue(service.preferences.enabled);
	};
	const supported =
		!!service.secretStorage &&
		!!(obsidian as any).SecretComponent &&
		typeof (Setting.prototype as any).addComponent === 'function';
	new Setting(root)
		.setName('启用 AI 自动翻译')
		.setDesc(
			'开启后，插件会将尚无中文翻译的主题设置文案发送至所选 API 服务商，可能产生少量 API 费用。自定义 CSS 片段不联网翻译。'
		)
		.addToggle((toggle) =>
			(enableToggle = toggle)
				.setValue(service.preferences.enabled)
				.setDisabled(!supported)
				.onChange(async (enabled) => {
					await update({ enabled });
				})
		);
	if (!supported)
		root.createEl('p', {
			text: '在线翻译已禁用：需要 Obsidian 1.11.4+ 的官方 SecretStorage 和密钥选择组件。',
		});
	const secretSetting = new Setting(root)
		.setName('API Key')
		.setDesc(
			'选择官方密钥库中的现有密钥，或在官方密钥管理入口添加。不会读取其他插件配置。'
		);
	let secretMounted = false;
	if (supported) {
		try {
			(secretSetting as any).addComponent((el: HTMLElement) =>
				new (obsidian as any).SecretComponent(service.app, el)
					.setValue(service.preferences.secretName)
					.onChange(async (name: string | null) => {
						await update({ secretName: name || '', enabled: false });
					})
			);
			secretMounted = true;
		} catch {
			// One failed component must not abort the rest of the settings page.
			enableToggle?.setDisabled(true).setValue(false);
			void service.configure({ enabled: false });
			secretSetting.setDesc(
				'官方密钥选择器加载失败，在线翻译已停用。地址和模型仍可编辑；请重新打开设置后重试。'
			);
		}
	}

	new Setting(root)
		.setName('API Base URL')
		.setDesc(
			'使用与所选密钥匹配的 HTTPS 地址。更换地址后自动关闭联网翻译，请确认服务商后再启用。'
		)
		.addText((text) =>
			text
				.setPlaceholder('https://api.example.com/v1')
				.setValue(service.preferences.base)
				.onChange(async (base) => {
					await update({ base: base.trim(), enabled: false });
				})
		);
	new Setting(root)
		.setName('Model ID')
		.setDesc(
			'填写服务商提供的模型标识。仅支持标准 Chat Completions，不自动切换模型或服务商。'
		)
		.addText((text) =>
			text
				.setPlaceholder('填写 Model ID')
				.setValue(service.preferences.model)
				.onChange(async (model) => {
					await update({ model: model.trim(), enabled: false });
				})
		);
	const statistics = root.createEl('p');
	const refresh = () => {
		statistics.textContent = `缓存 ${service.cache.size} 条 · 最近响应 ${
			service.lastUsage.known ? service.lastUsage.total : '未知'
		} Token · 已记录成功响应累计 ${service.totalTokens} Token。${
			service.status
		}`;
	};
	const testSetting = new Setting(root)
		.setName('测试连接')
		.setDesc(
			'点击会发送一条固定测试文案，可能产生 API 费用。仅在你同意该调用时点击。'
		);
	const button = new ButtonComponent(testSetting.controlEl)
		.setButtonText('测试连接')
		.setDisabled(!secretMounted);
	button.onClick(async () => {
		button.setDisabled(true);
		try {
			await service.testConnection();
		} catch (e) {
			service.status = e instanceof Error ? e.message : '连接失败';
		} finally {
			button.setDisabled(false);
			refresh();
		}
	});
	refresh();
	const timer = setInterval(refresh, 1500);
	return () => clearInterval(timer);
}
