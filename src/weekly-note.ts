import { App, moment, normalizePath, TFile } from 'obsidian';
import { WeeklyNotesSettings } from './settings';
import { buildWeeklyNoteContent, getWeekStart, parseWeekStart } from './week';

export async function openThisWeeksNote(
	app: App,
	settings: WeeklyNotesSettings,
): Promise<void> {
	const weekStart = getWeekStart(moment(), settings.weekStart);
	const folderPath = normalizePath(settings.folder);
	const path = normalizePath(
		`${folderPath}/${weekStart.format(settings.format)}.md`,
	);
	const file =
		app.vault.getFileByPath(path) ??
		(await createWeeklyNote(app, settings, weekStart, folderPath, path));
	await app.workspace.getLeaf(false).openFile(file);
}

async function createWeeklyNote(
	app: App,
	settings: WeeklyNotesSettings,
	weekStart: moment.Moment,
	folderPath: string,
	path: string,
): Promise<TFile> {
	if (!app.vault.getFolderByPath(folderPath)) {
		await app.vault.createFolder(folderPath);
	}
	const previous = findLatestNoteBefore(
		app,
		folderPath,
		settings.format,
		weekStart,
	);
	const previousLink = previous
		? app.fileManager.generateMarkdownLink(
				previous,
				path,
				undefined,
				`previous week - ${previous.basename}`,
			)
		: null;
	return app.vault.create(
		path,
		buildWeeklyNoteContent(
			weekStart,
			settings.headerFormat,
			settings.headerDays,
			previousLink,
		),
	);
}

function findLatestNoteBefore(
	app: App,
	folderPath: string,
	format: string,
	weekStart: moment.Moment,
): TFile | null {
	let latest: { file: TFile; weekStart: moment.Moment } | null = null;
	for (const file of app.vault.getMarkdownFiles()) {
		if (file.parent?.path !== folderPath) continue;
		const noteWeekStart = parseWeekStart(file.basename, format);
		if (
			noteWeekStart?.isBefore(weekStart) &&
			(!latest || noteWeekStart.isAfter(latest.weekStart))
		) {
			latest = { file, weekStart: noteWeekStart };
		}
	}
	return latest?.file ?? null;
}
