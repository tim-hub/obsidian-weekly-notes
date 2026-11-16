import { HeaderDays, WeekStartDay } from './week';

export interface WeeklyNotesSettings {
	weekStart: WeekStartDay;
	format: string;
	folder: string;
	headerFormat: string;
	headerDays: HeaderDays;
}

export const DEFAULT_SETTINGS: WeeklyNotesSettings = {
	weekStart: 0,
	format: '[Week-]ww-YYYY-MM-DD',
	folder: 'weekly-notes',
	headerFormat: 'ddd YYYY-MM-DD',
	headerDays: 'MF',
};
