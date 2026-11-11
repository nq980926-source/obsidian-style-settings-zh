import { SettingValue } from './SettingsManager';
import CSSSettingsPlugin from './main';
import {
	App,
	ButtonComponent,
	Modal,
	Setting,
	TextAreaComponent,
} from 'obsidian';

export class ImportModal extends Modal {
	plugin: CSSSettingsPlugin;

	constructor(app: App, plugin: CSSSettingsPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl, modalEl } = this;

		modalEl.addClass('modal-style-settings');

		new Setting(contentEl)
			.setName('导入样式设置')
			.setDesc(
				'导入全部或部分配置。注意：这可能覆盖现有设置'
			);

		new Setting(contentEl).then((setting) => {
			// Build an error message container
			const errorSpan = createSpan({
				cls: 'style-settings-import-error',
				text: '导入配置失败',
			});

			setting.nameEl.appendChild(errorSpan);

			// Attempt to parse the imported data and close if successful
			const importAndClose = async (str: string) => {
				if (str) {
					try {
						const importedSettings = JSON.parse(str) as Record<
							string,
							SettingValue
						>;

						await this.plugin.settingsManager.setSettings(importedSettings);

						this.plugin.settingsTab.display();
						this.close();
					} catch (e) {
						errorSpan.addClass('active');
						errorSpan.setText(`导入样式设置失败： ${e}`);
					}
				} else {
					errorSpan.addClass('active');
					errorSpan.setText(`导入样式设置失败： 配置为空`);
				}
			};

			// Build a file input
			setting.controlEl.createEl(
				'input',
				{
					cls: 'style-settings-import-input',
					attr: {
						id: 'style-settings-import-input',
						name: 'style-settings-import-input',
						type: 'file',
						accept: '.json',
					},
				},
				(importInput) => {
					// Set up a FileReader so we can parse the file contents
					importInput.addEventListener('change', (e) => {
						if (!e.target) return;

						const reader = new FileReader();

						reader.onload = async (e: ProgressEvent<FileReader>) => {
							if (!e.target?.result) return;
							await importAndClose(e.target.result.toString().trim());
						};

						const target = e.target as HTMLInputElement;
						if (target.files) {
							reader.readAsText(target.files[0]);
						}
					});
				}
			);

			// Build a label we will style as a link
			setting.controlEl.createEl('label', {
				cls: 'style-settings-import-label',
				text: '从文件导入',
				attr: {
					for: 'style-settings-import-input',
				},
			});

			new TextAreaComponent(contentEl)
				.setPlaceholder('在此粘贴配置…')
				.then((ta) => {
					new ButtonComponent(contentEl)
						.setButtonText('保存')
						.onClick(async () => {
							await importAndClose(ta.getValue().trim());
						});
				});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
