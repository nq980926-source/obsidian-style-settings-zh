import { renderTranslationSettings } from '../translation/TranslationSettings';
import { CSSSetting, ParsedCSSSettings } from '../SettingHandlers';
import { ErrorList } from '../Utils';
import CSSSettingsPlugin from '../main';
import {
	buildSettingComponentTree,
	HeadingSettingComponent,
} from './SettingComponents/HeadingSettingComponent';
import { App, Component, Setting, debounce } from 'obsidian';

export class SettingsMarkup extends Component {
	app: App;
	plugin: CSSSettingsPlugin;
	settingsComponentTrees: HeadingSettingComponent[] = [];
	filterString: string = '';
	private cleanupTranslationSettings: (() => void) | undefined;
	settings: ParsedCSSSettings[] = [];
	errorList: ErrorList = [];
	containerEl: HTMLElement;
	settingsContainerEl: HTMLElement;
	isView: boolean;

	constructor(
		app: App,
		plugin: CSSSettingsPlugin,
		containerEl: HTMLElement,
		isView?: boolean
	) {
		super();
		this.app = app;
		this.plugin = plugin;
		this.containerEl = containerEl;
		this.isView = !!isView;
	}

	onload(): void {
		this.display();
	}

	onunload(): void {
		this.cleanupTranslationSettings?.();
		this.settingsComponentTrees = [];
	}

	display(): void {
		this.generate(this.settings);
	}

	removeChildren() {
		for (const settingsComponentTree of this.settingsComponentTrees) {
			this.removeChild(settingsComponentTree);
		}
	}

	/**
	 * Recursively destroys all setting elements.
	 */
	cleanup() {
		this.removeChildren();
		this.settingsContainerEl?.empty();
	}

	setSettings(settings: ParsedCSSSettings[], errorList: ErrorList) {
		this.settings = settings;
		this.errorList = errorList;

		if (this.containerEl.parentNode) {
			this.generate(settings);
		}
	}

	displayErrors() {
		const { containerEl, errorList } = this;

		errorList.forEach((err) => {
			containerEl.createDiv({ cls: 'style-settings-error' }, (wrapper) => {
				wrapper.createDiv({
					cls: 'style-settings-error-name',
					text: `错误：${err.name}`,
				});
				wrapper.createDiv({
					cls: 'style-settings-error-desc',
					text: err.error,
				});
			});
		});
	}

	displayEmpty() {
		const { containerEl } = this;

		containerEl.createDiv({ cls: 'style-settings-empty' }, (wrapper) => {
			wrapper.createDiv({
				cls: 'style-settings-empty-name',
				text: '未找到样式设置',
			});
			wrapper.createDiv({ cls: 'style-settings-empty-desc' }).appendChild(
				createFragment((frag) => {
					frag.appendText(
						'主题和插件作者定义的样式设置会显示在这里。你也可以在仓库中创建 CSS 代码片段，添加自己的设置。'
					);
					frag.createEl('a', {
						text: '点击查看说明和示例。',
						href: 'https://github.com/mgmeyers/obsidian-style-settings#obsidian-style-settings-plugin',
					});
				})
			);
		});
	}

	generate(settings: ParsedCSSSettings[]) {
		const { containerEl, plugin } = this;

		containerEl.empty();
		this.cleanupTranslationSettings?.();
		if (!this.isView) this.cleanupTranslationSettings = renderTranslationSettings(containerEl, this.plugin.translation);

		this.cleanup();
		this.displayErrors();

		if (settings.length === 0) {
			return this.displayEmpty();
		}

		new Setting(containerEl).then((setting) => {
			// Build and import link to open the import modal
			setting.controlEl.createEl(
				'a',
				{
					cls: 'style-settings-import',
					text: '导入',
					href: '#',
				},
				(el) => {
					el.addEventListener('click', (e) => {
						e.preventDefault();
						this.plugin.settingsManager.import();
					});
				}
			);

			// Build and export link to open the export modal
			setting.controlEl.createEl(
				'a',
				{
					cls: 'style-settings-export',
					text: '导出',
					href: '#',
				},
				(el) => {
					el.addEventListener('click', (e) => {
						e.preventDefault();
						this.plugin.settingsManager.export(
							'全部设置',
							this.plugin.settingsManager.settings
						);
					});
				}
			);

			// Searchbar
			setting.addSearch((searchComponent) => {
				searchComponent.setValue(this.filterString);
				searchComponent.onChange(
					debounce(
						(value) => {
							this.filterString = value;
							if (value) {
								this.filter();
							} else {
								this.clearFilter();
							}
						},
						250,
						true
					)
				);
				searchComponent.setPlaceholder('搜索样式设置…');
				// move the search component from the back to the front
				if (setting.controlEl.lastChild) {
					setting.nameEl.appendChild(setting.controlEl.lastChild);
				}
			});
		});

		this.settingsContainerEl = containerEl.createDiv();
		this.settingsComponentTrees = [];

		for (const s of settings) {
			const options: CSSSetting[] = [
				{
					id: s.id,
					type: 'heading',
					title: s.name,
					level: 0,
					collapsed: s.collapsed ?? true,
					resetFn: () => {
						plugin.settingsManager.clearSection(s.id);
						this.rerender();
					},
				},
				...s.settings,
			];

			this.plugin.translation.inherit(s, options[0]);
			try {
				const settingsComponentTree = buildSettingComponentTree({
					containerEl: this.settingsContainerEl,
					isView: this.isView,
					sectionId: s.id,
					sectionName: s.name,
					settings: options,
					settingsManager: plugin.settingsManager,
				});

				this.addChild(settingsComponentTree);
				this.settingsComponentTrees.push(settingsComponentTree);
			} catch (e) {
				console.error('样式设置（Style Settings） | 渲染设置分组失败', e);
			}
		}
	}

	/**
	 * Recursively filter all setting elements based on `filterString` and then re-renders.
	 */
	filter() {
		for (const settingsComponentTree of this.settingsComponentTrees) {
			settingsComponentTree.filter(this.filterString);
		}
	}

	/**
	 * Recursively clears the filter and then re-renders.
	 */
	clearFilter() {
		for (const settingsComponentTree of this.settingsComponentTrees) {
			settingsComponentTree.clearFilter();
		}
	}

	rerender() {
		this.cleanup();
		this.display();
	}
}
