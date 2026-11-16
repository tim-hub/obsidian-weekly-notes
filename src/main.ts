import { Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, WeeklyNotesSettings } from './settings';
import { WeeklyNotesSettingTab } from './ui/settings-tab';
import { openThisWeeksNote } from './weekly-note';

export default class WeeklyNotesPlugin extends Plugin {
	settings!: WeeklyNotesSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('calendar-range', "Open this week's note", () =>
			this.openThisWeek(),
		);
		this.addCommand({
			id: 'open-this-week',
			name: "Open this week's note",
			callback: () => this.openThisWeek(),
		});
		this.addSettingTab(new WeeklyNotesSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<WeeklyNotesSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async openThisWeek() {
		try {
			await openThisWeeksNote(this.app, this.settings);
		} catch (error) {
			new Notice(`Could not open weekly note: ${String(error)}`);
		}
	}
}
