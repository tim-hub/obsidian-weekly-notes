import { App, PluginSettingTab, Setting } from 'obsidian';
import WeeklyNotesPlugin from '../main';
import { DEFAULT_SETTINGS } from '../settings';
import { FolderSuggest } from './folder-suggest';

export class WeeklyNotesSettingTab extends PluginSettingTab {
	plugin: WeeklyNotesPlugin;

	constructor(app: App, plugin: WeeklyNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		const settings = this.plugin.settings;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Week starts on')
			.setDesc('First day of each weekly note.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('0', 'Sunday')
					.addOption('1', 'Monday')
					.setValue(String(settings.weekStart))
					.onChange(async (value) => {
						settings.weekStart = value === '1' ? 1 : 0;
						await this.plugin.saveSettings();
					}),
			);

		this.addMomentFormatSetting(
			'Date format',
			'File name, formatted from the first day of the week. Use ww for locale week number, WW for ISO week number.',
			DEFAULT_SETTINGS.format,
			settings.format,
			async (value) => {
				settings.format = value;
				await this.plugin.saveSettings();
			},
		);

		new Setting(containerEl)
			.setName('New file location')
			.setDesc('New weekly notes will be placed here.')
			.addText((text) => {
				text.setPlaceholder('Example: folder 1/folder 2')
					.setValue(settings.folder)
					.onChange(async (value) => {
						settings.folder = value;
						await this.plugin.saveSettings();
					});
				new FolderSuggest(this.app, text.inputEl);
			});

		this.addMomentFormatSetting(
			'Day header format',
			'Heading for each of the 7 days.',
			DEFAULT_SETTINGS.headerFormat,
			settings.headerFormat,
			async (value) => {
				settings.headerFormat = value;
				await this.plugin.saveSettings();
			},
		);

		new Setting(containerEl)
			.setName('Day headers')
			.setDesc('Which days of the week get a heading.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('MF', 'Monday to Friday')
					.addOption('SS', 'Sunday to Saturday')
					.setValue(settings.headerDays)
					.onChange(async (value) => {
						settings.headerDays = value === 'SS' ? 'SS' : 'MF';
						await this.plugin.saveSettings();
					}),
			);
	}

	private addMomentFormatSetting(
		name: string,
		description: string,
		defaultFormat: string,
		value: string,
		save: (value: string) => Promise<void>,
	): void {
		const sampleEl = createSpan();
		new Setting(this.containerEl)
			.setName(name)
			.setDesc(
				createFragment((fragment) => {
					fragment.appendText(description);
					fragment.createEl('br');
					fragment.appendText('Your current syntax looks like this: ');
					fragment.appendChild(sampleEl);
				}),
			)
			.addMomentFormat((format) =>
				format
					.setDefaultFormat(defaultFormat)
					.setValue(value)
					.setSampleEl(sampleEl)
					.onChange((newValue) => save(newValue || defaultFormat)),
			);
	}
}
