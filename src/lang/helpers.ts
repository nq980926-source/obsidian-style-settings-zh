import * as obsidian from 'obsidian';
import { ar } from './locale/ar';
import { cz } from './locale/cz';
import { da } from './locale/da';
import { de } from './locale/de';
import { en } from './locale/en';
import { es } from './locale/es';
import { fr } from './locale/fr';
import { hi } from './locale/hi';
import { id } from './locale/id';
import { it } from './locale/it';
import { ja } from './locale/ja';
import { ko } from './locale/ko';
import { nl } from './locale/nl';
import { no } from './locale/no';
import { pl } from './locale/pl';
import { pt } from './locale/pt';
import { ptBr } from './locale/ptBr';
import { ro } from './locale/ro';
import { ru } from './locale/ru';
import { sq } from './locale/sq';
import { tr } from './locale/tr';
import { uk } from './locale/uk';
import { zh } from './locale/zh';
import { zhTw } from './locale/zhTw';

// Prefer the public API (Obsidian 1.8.7+), retaining compatibility with older hosts.
export function getThemeLanguage(): string | null {
    const api = obsidian as typeof obsidian & { getLanguage?: () => string };
    const language = typeof api.getLanguage === 'function'
        ? api.getLanguage()
        : window.localStorage.getItem('language');
    if (language && /^(zh|zh-cn|zh-sg|zh-hans(?:-[a-z]+)?)$/i.test(language.replace(/_/g, '-'))) {
        return 'zh';
    }
    return language;
}

const localeMap: { [k: string]: Partial<typeof en> } = {
	ar,
	cz,
	da,
	de,
	en,
	es,
	fr,
	hi,
	id,
	it,
	ja,
	ko,
	nl,
	no,
	pl,
	'pt-BR': ptBr,
	pt,
	ro,
	ru,
	sq,
	tr,
	uk,
	'zh-TW': zhTw,
	zh,
};

const locale = localeMap.zh;

export function t(str: keyof typeof en): string {
	if (!locale) {
		console.error('样式设置：未找到界面语言', getThemeLanguage());
	}

	return (locale && locale[str]) || en[str];
}
