import { CSSSetting } from '../SettingHandlers';
import { getDescription, getTitle } from '../Utils';
import { getOptionLabel } from '../OptionLabels';
import { activeTranslation } from './TranslationService';
import { Setting } from 'obsidian';

// Bind only the known labels of one rendered setting, never the document as a whole.
export function bindSetting(setting: CSSSetting, view: Setting): () => void {
	const service = activeTranslation;
	if (!service) return () => undefined;
	let title = getTitle(setting),
		description = getDescription(setting) || '';
	const options = 'options' in setting ? setting.options : [];
	let labels = options.map((o) => getOptionLabel(setting as any, o));
	const replaceText = (
		root: Node,
		before: string,
		after: string,
		skipDefaults = false
	) => {
		if (!before || before === after) return;
		for (const child of Array.from(root.childNodes)) {
			if (child.nodeType === 3 && child.nodeValue === before)
				child.nodeValue = after;
			else if (
				child.nodeType === 1 &&
				!(skipDefaults && (child as Element).tagName?.toLowerCase() === 'small')
			)
				replaceText(child, before, after, skipDefaults);
		}
	};
	const refresh = () => {
		if (!view.settingEl.isConnected) return;
		const nextTitle = getTitle(setting),
			nextDescription = getDescription(setting) || '';
		replaceText(view.nameEl, title, nextTitle);
		replaceText(view.descEl, description, nextDescription, true);
		title = nextTitle;
		description = nextDescription;
		const select = view.controlEl.querySelector('select');
		const nextLabels = options.map((o) => getOptionLabel(setting as any, o));
		options.forEach((o, index) => {
			const value = typeof o === 'string' ? o : o.value;
			// Native select renders the selected item with this same option label.
			if (select)
				for (const element of Array.from(select.options)) {
					if (element.value === value) {
						element.textContent = nextLabels[index];
						element.title = typeof o === 'string' ? o : o.label;
					}
				}
			if ('default' in setting && setting.default === value)
				replaceText(view.descEl, labels[index], nextLabels[index]);
		});
		labels = nextLabels;
		if (!setting['title.zh']) service.enqueue(setting, 'title', setting.title);
		if (!setting['description.zh'] && setting.description)
			service.enqueue(setting, 'description', setting.description);
		options.forEach((o, index) => {
			const original = typeof o === 'string' ? o : o.label;
			if (
				!(typeof o !== 'string' && o['label.zh']) &&
				nextLabels[index] === original
			)
				service.enqueue(setting, `option:${index}`, original);
		});
	};
	view.nameEl.title = setting.title;
	if (setting.description) view.descEl.title = setting.description;
	const unsubscribe = service.subscribe(setting, refresh);
	refresh();
	return unsubscribe;
}
