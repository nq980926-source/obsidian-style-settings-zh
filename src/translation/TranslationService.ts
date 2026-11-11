import { App } from 'obsidian';
import { ParsedCSSSettings } from '../SettingHandlers';
import { getThemeLanguage } from '../lang/helpers';
import {
	DEFAULT_BASE,
	DEFAULT_MODEL,
	Item,
	safeText,
	translate,
	Usage,
	endpoint,
	TranslationError,
} from './ChatCompletion';

type Metadata = {
	source: string;
	path: string;
	context: string[];
	epoch: number;
};
type RecordEntry = { text: string; used: number };
type Job = { key: string; item: Item; epoch: number; owner: object };
export type Preferences = {
	enabled: boolean;
	secretName: string;
	base: string;
	model: string;
};
export let activeTranslation: TranslationService | undefined;
export function displayText(owner: object, role: string, text: string): string {
	return activeTranslation?.lookup(owner, role, text) || text;
}
export function stableId(text: string): string {
	let a = 2166136261,
		b = 5381;
	for (let i = 0; i < text.length; i++) {
		a = Math.imul(a ^ text.charCodeAt(i), 16777619);
		b = Math.imul(b, 33) ^ text.charCodeAt(i);
	}
	return 't' + (a >>> 0).toString(16) + (b >>> 0).toString(16);
}
export class TranslationService {
	preferences: Preferences = {
		enabled: false,
		secretName: '',
		base: DEFAULT_BASE,
		model: DEFAULT_MODEL,
	};
	cache = new Map<string, RecordEntry>();
	lastUsage: Usage = { prompt: 0, completion: 0, total: 0 };
	totalTokens = 0;
	status = '联网翻译未启用';
	epoch = 0;
	private sourceEpoch = 0;
	private metadata = new WeakMap<object, Metadata>();
	private listeners = new Map<object, Set<() => void>>();
	private queue = new Map<string, Job>();
	private attempted = new Set<string>();
	private running = false;
	private paused = false;
	private disposed = false;
	private calls = 0;
	private timer: ReturnType<typeof setTimeout> | undefined;
	private writeChain: Promise<void> = Promise.resolve();
	private directory: string;
	constructor(
		public app: App,
		directory: string,
		private client = translate
	) {
		this.directory = directory;
		activeTranslation = this;
	}
	get secretStorage(): { getSecret(name: string): string | null } | undefined {
		return (this.app as any).secretStorage;
	}
	get ready() {
		return (
			this.preferences.enabled &&
			!!this.secretStorage &&
			!!this.preferences.secretName &&
			!!this.preferences.base &&
			!!this.preferences.model &&
			!this.paused &&
			!this.disposed
		);
	}
	private file(name: string) {
		return `${this.directory}/translation-${name}.json`;
	}
	async load() {
		const read = async (name: string) => {
			try {
				const s = await this.app.vault.adapter.read(this.file(name));
				return s.length <= 2200000 ? JSON.parse(s) : undefined;
			} catch {
				return undefined;
			}
		};
		const config = await read('settings');
		if (config) {
			for (const key of ['secretName', 'base', 'model'] as const)
				if (typeof config[key] === 'string' && config[key].length <= 500)
					this.preferences[key] = config[key];
			this.preferences.enabled = config.enabled === true;
		}
		const stored = await read('cache');
		if (stored?.version === 1 && Array.isArray(stored.entries)) {
			for (const pair of stored.entries.slice(-1200)) {
				if (!Array.isArray(pair) || pair.length !== 2) continue;
				const [key, entry] = pair;
				if (
					typeof key === 'string' &&
					key.length <= 5000 &&
					safeText(entry?.text) &&
					Number.isFinite(entry.used)
				)
					this.cache.set(key, entry);
			}
			if (Number.isSafeInteger(stored.totalTokens) && stored.totalTokens >= 0)
				this.totalTokens = stored.totalTokens;
		}
		this.status = this.preferences.enabled
			? '等待显示需要翻译的主题设置'
			: '联网翻译未启用';
	}
	private write(name: string, value: unknown) {
		const body = JSON.stringify(value);
		this.writeChain = this.writeChain
			.then(() => this.app.vault.adapter.write(this.file(name), body))
			.catch(() => {
				this.status = '翻译本地文件保存失败；本次结果仅在内存中使用';
			});
		return this.writeChain;
	}
	async configure(change: Partial<Preferences>) {
		if (
			change.base !== undefined ||
			change.model !== undefined ||
			change.secretName !== undefined
		) {
			this.preferences.enabled = false;
			this.resetGeneration(false);
		}
		if (change.base !== undefined) {
			try {
				endpoint(change.base);
			} catch {
				await this.write('settings', this.preferences);
				this.status =
					'API 地址无效，未保存；请使用无凭证、无查询参数的公网 HTTPS 基础地址';
				return;
			}
		}
		if (
			change.model !== undefined &&
			!/^[a-zA-Z0-9._:/-]{1,100}$/.test(change.model)
		) {
			await this.write('settings', this.preferences);
			this.status = '模型名称无效，未保存';
			return;
		}
		this.preferences = { ...this.preferences, ...change };
		this.resetGeneration(false);
		this.paused = false;
		this.calls = 0;
		this.status = this.preferences.enabled
			? '等待显示需要翻译的主题设置'
			: '联网翻译未启用';
		await this.write('settings', this.preferences);
		for (const owner of this.listeners.keys()) this.notify(owner);
	}
	resetGeneration(sourceChanged = true) {
		this.epoch++;
		if (sourceChanged) this.sourceEpoch++;
		this.queue.clear();
		this.attempted.clear();
		if (this.timer) clearTimeout(this.timer);
	}
	registerSection(section: ParsedCSSSettings, source: string) {
		const headings: Array<{ level: number; title: string }> = [];
		this.metadata.set(section, {
			source,
			path: section.id,
			context: [source, section.name],
			epoch: this.sourceEpoch,
		});
		section.settings.forEach((setting, index) => {
			if ('level' in setting) {
				while (
					headings.length &&
					headings[headings.length - 1].level >= setting.level
				)
					headings.pop();
			}
			const context = [
				source,
				...headings.slice(-2).map((h) => h.title),
				setting.title,
			];
			if (safeText(setting.description))
				context.push(setting.description.slice(0, 300));
			this.metadata.set(setting, {
				source,
				path: `${section.id}/${setting.id}/${index}`,
				context,
				epoch: this.sourceEpoch,
			});
			if ('level' in setting)
				headings.push({ level: setting.level, title: setting.title });
		});
	}
	inherit(from: object, to: object) {
		const meta = this.metadata.get(from);
		if (meta) this.metadata.set(to, meta);
	}
	private job(owner: object, role: string, text: string): Job | undefined {
		const meta = this.metadata.get(owner);
		if (
			!meta ||
			meta.epoch !== this.sourceEpoch ||
			getThemeLanguage() !== 'zh' ||
			!safeText(text) ||
			!/[a-zA-Z]{2}/.test(text) ||
			/[\u3400-\u9fff]/.test(text) ||
			meta.context.some((c) => !safeText(c)) ||
			(owner as any).markdown
		)
			return undefined;
		const key = JSON.stringify([
			'v1',
			this.preferences.base,
			this.preferences.model,
			'zh',
			meta.source,
			meta.path,
			role,
			text,
			meta.context,
		]);
		return {
			key,
			item: {
				id: stableId(key),
				text,
				role: role.split(':')[0],
				context: meta.context,
			},
			epoch: this.epoch,
			owner,
		};
	}
	lookup(owner: object, role: string, text: string) {
		const job = this.job(owner, role, text);
		const entry = job && this.cache.get(job.key);
		if (entry) entry.used = Date.now();
		return entry?.text;
	}
	enqueue(owner: object, role: string, text: string) {
		const job = this.job(owner, role, text);
		if (
			!job ||
			!this.ready ||
			this.cache.has(job.key) ||
			this.attempted.has(job.key) ||
			this.queue.has(job.key)
		)
			return;
		if (this.queue.size >= 250) return;
		this.queue.set(job.key, job);
		if (!this.timer && !this.running)
			this.timer = setTimeout(() => {
				this.timer = undefined;
				void this.flush();
			}, 300);
	}
	subscribe(owner: object, callback: () => void) {
		let set = this.listeners.get(owner);
		if (!set) this.listeners.set(owner, (set = new Set()));
		set.add(callback);
		return () => {
			set?.delete(callback);
			if (!set?.size) {
				this.listeners.delete(owner);
				for (const [key, job] of this.queue)
					if (job.owner === owner) this.queue.delete(key);
			}
		};
	}
	private notify(owner: object) {
		this.listeners.get(owner)?.forEach((callback) => callback());
	}
	async flush() {
		if (this.running || !this.ready) return;
		if (this.calls >= 40) {
			this.paused = true;
			this.status = '本次会话请求上限已达（40 次）；自动请求已暂停';
			return;
		}
		const jobs: Job[] = [];
		let length = 0;
		for (const [key, job] of this.queue) {
			if (!this.listeners.has(job.owner)) {
				this.queue.delete(key);
				continue;
			}
			if (length + JSON.stringify(job.item).length > 6000 || jobs.length >= 12)
				break;
			jobs.push(job);
			length += JSON.stringify(job.item).length;
			this.queue.delete(key);
			this.attempted.add(key);
		}
		if (!jobs.length) return;
		const epoch = this.epoch;
		const key = this.secretStorage?.getSecret(this.preferences.secretName);
		if (!key) {
			this.paused = true;
			this.queue.clear();
			this.status = '未找到所选密钥；请在官方密钥库中选择';
			return;
		}
		this.running = true;
		this.calls++;
		this.status = '正在翻译主题设置';
		try {
			const result = await this.client(
				this.preferences.base,
				this.preferences.model,
				key,
				jobs.map((j) => j.item),
				undefined,
				25000,
				() => epoch === this.epoch && !this.disposed
			);
			if (epoch !== this.epoch || this.disposed) return;
			this.lastUsage = result.usage;
			this.totalTokens += result.usage.total;
			for (const job of jobs) {
				const text = result.translations.get(job.item.id);
				if (text) this.cache.set(job.key, { text, used: Date.now() });
			}
			const entries = [...this.cache.entries()].sort(
				(a, b) => a[1].used - b[1].used
			);
			let bytes = 0;
			this.cache.clear();
			for (const [k, v] of entries.reverse()) {
				bytes += (k.length + v.text.length) * 2;
				if (this.cache.size < 1200 && bytes < 1800000) this.cache.set(k, v);
			}
			this.status = '翻译完成';
			await this.write('cache', {
				version: 1,
				entries: [...this.cache],
				totalTokens: this.totalTokens,
			});
			jobs.forEach((j) => this.notify(j.owner));
		} catch (error) {
			if (epoch === this.epoch) {
				this.paused = true;
				this.queue.clear();
				this.status =
					error instanceof TranslationError
						? error.reason
						: '请求失败、超时或返回格式不符；自动请求已暂停，可用“测试连接”检查';
			}
		} finally {
			this.running = false;
			if (this.queue.size && this.ready)
				this.timer = setTimeout(() => {
					this.timer = undefined;
					void this.flush();
				}, 400);
		}
	}
	async testConnection() {
		if (!this.secretStorage)
			throw new Error('此 Obsidian 版本不支持官方安全密钥库（需要 1.11.4+）');
		const key = this.secretStorage.getSecret(this.preferences.secretName);
		if (!key) throw new Error('请先选择有效密钥');
		if (this.running) throw new Error('已有请求进行中，请稍后测试');
		this.running = true;
		const epoch = this.epoch;
		try {
			const result = await this.client(
				this.preferences.base,
				this.preferences.model,
				key,
				[
					{
						id: 'connection_test',
						text: 'Appearance',
						role: 'title',
						context: ['Obsidian theme settings'],
					},
				],
				undefined,
				25000,
				() => epoch === this.epoch && !this.disposed
			);
			if (epoch !== this.epoch || this.disposed)
				throw new TranslationError('配置已改变，已忽略旧连接测试结果');
			this.lastUsage = result.usage;
			this.totalTokens += result.usage.total;
			await this.write('cache', {
				version: 1,
				entries: [...this.cache],
				totalTokens: this.totalTokens,
			});
			this.paused = false;
			this.calls = 0;
			this.attempted.clear();
			this.status = '连接成功，模型和 JSON 响应校验通过';
		} finally {
			this.running = false;
		}
	}
	dispose() {
		this.disposed = true;
		this.resetGeneration();
		this.listeners.clear();
		if (activeTranslation === this) activeTranslation = undefined;
	}
}
