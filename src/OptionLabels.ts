import { ClassMultiToggle, SelectOption, VariableSelect } from './SettingHandlers';
import { getThemeLanguage } from './lang/helpers';

type SelectSetting = ClassMultiToggle | VariableSelect;

// Small, conservative UI dictionary. Values and source metadata are never changed.
const common: Record<string, string> = {
    default: '默认', auto: '自动', custom: '自定义',
    enabled: '启用', disabled: '禁用',
};

export function getOptionLabel(setting: SelectSetting, option: string | SelectOption): string {
    const original = typeof option === 'string' ? option : option.label;
    const language = getThemeLanguage();
    if (typeof option !== 'string' && language) {
        const localized = option[`label.${language}`];
        if (typeof localized === 'string' && localized.trim()) return localized;
    }
    if (language !== 'zh' || /[\u3400-\u9fff]/.test(original)) return original;
    const key = original.trim().toLowerCase();
    const context = `${setting.id} ${setting.title}`;
    const ribbon = /(?:^|[\s_-])(?:ribbon|toolbar)(?:$|[\s_-])/i.test(context);
    const layout = /(?:^|[\s_-])layout(?:$|[\s_-])/i.test(context);
    if (ribbon) {
        const labels: Record<string, string> = {
            fixed: '固定显示',
            'hide to left': '向左自动隐藏',
            'hide to the left retention drawer': '向左自动隐藏（保留侧栏展开按钮）',
            bubble: '气泡式',
            'bubble, hide to left': '气泡式（向左自动隐藏）',
        };
        if (Object.prototype.hasOwnProperty.call(labels, key)) return labels[key];
    }
    if (layout && key === 'bubble') return '气泡式';
    return Object.prototype.hasOwnProperty.call(common, key) ? common[key] : original;
}

export function getOptionSearchTerms(setting: SelectSetting): string[] {
    return setting.options.flatMap((option) => {
        const original = typeof option === 'string' ? option : option.label;
        return [original, getOptionLabel(setting, option)];
    });
}

