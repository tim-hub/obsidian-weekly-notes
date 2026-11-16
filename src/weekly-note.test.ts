import { afterEach, describe, expect, setSystemTime, test } from 'bun:test';
import type { App } from 'obsidian';
import { DEFAULT_SETTINGS, WeeklyNotesSettings } from './settings';
import { openThisWeeksNote } from './weekly-note';

interface FakeFile {
	path: string;
	basename: string;
	parent: { path: string };
}

function fakeVault(existing: Record<string, string>) {
	const files = new Map(Object.entries(existing));
	const folders = new Set(['/']);
	for (const path of files.keys()) folders.add(parentPath(path));
	const opened: string[] = [];

	const toFile = (path: string): FakeFile => ({
		path,
		basename: path.split('/').pop()!.replace(/\.md$/, ''),
		parent: { path: parentPath(path) },
	});

	const app = {
		vault: {
			getFileByPath: (path: string) =>
				files.has(path) ? toFile(path) : null,
			getFolderByPath: (path: string) =>
				folders.has(path) ? { path } : null,
			createFolder: (path: string) => {
				folders.add(path);
				return Promise.resolve();
			},
			create: (path: string, content: string) => {
				files.set(path, content);
				return Promise.resolve(toFile(path));
			},
			getMarkdownFiles: () => [...files.keys()].map(toFile),
		},
		fileManager: {
			generateMarkdownLink: (file: FakeFile) => `[[${file.basename}]]`,
		},
		workspace: {
			getLeaf: () => ({
				openFile: (file: FakeFile) => {
					opened.push(file.path);
					return Promise.resolve();
				},
			}),
		},
	} as unknown as App;

	return { app, files, folders, opened };
}

function parentPath(path: string): string {
	const slash = path.lastIndexOf('/');
	return slash === -1 ? '/' : path.slice(0, slash);
}

const settings = (
	overrides: Partial<WeeklyNotesSettings> = {},
): WeeklyNotesSettings => ({ ...DEFAULT_SETTINGS, folder: 'Weekly', ...overrides });

describe('openThisWeeksNote', () => {
	afterEach(() => setSystemTime());

	test('defaults: weekly-notes folder, Sunday-start file, Mon to Fri headers', async () => {
		setSystemTime(new Date(2026, 10, 18, 9, 30));
		const { app, files, opened } = fakeVault({});

		await openThisWeeksNote(app, DEFAULT_SETTINGS);

		const path = 'weekly-notes/Week-47-2026-11-15.md';
		expect(opened).toEqual([path]);
		expect(files.get(path)).toBe(
			[
				'## Mon 2026-11-16',
				'## Tue 2026-11-17',
				'## Wed 2026-11-18',
				'## Thu 2026-11-19',
				'## Fri 2026-11-20',
			].join('\n\n') + '\n',
		);
	});

	test('Sunday to Saturday headers', async () => {
		setSystemTime(new Date(2026, 10, 18, 9, 30));
		const { app, files } = fakeVault({});

		await openThisWeeksNote(app, settings({ headerDays: 'SS' }));

		expect(files.get('Weekly/Week-47-2026-11-15.md')).toBe(
			[
				'## Sun 2026-11-15',
				'## Mon 2026-11-16',
				'## Tue 2026-11-17',
				'## Wed 2026-11-18',
				'## Thu 2026-11-19',
				'## Fri 2026-11-20',
				'## Sat 2026-11-21',
			].join('\n\n') + '\n',
		);
	});

	test('Monday start with all days runs Monday to Sunday', async () => {
		setSystemTime(new Date(2026, 10, 15, 9, 30));
		const { app, files } = fakeVault({});

		await openThisWeeksNote(
			app,
			settings({ weekStart: 1, headerDays: 'SS' }),
		);

		const content = files.get('Weekly/Week-46-2026-11-09.md');
		expect(content?.split('\n\n')[0]).toBe('## Mon 2026-11-09');
		expect(content?.trim().split('\n\n')[6]).toBe('## Sun 2026-11-15');
	});

	test('links latest earlier weekly note in the same folder', async () => {
		setSystemTime(new Date(2026, 10, 18));
		const { app, files } = fakeVault({
			'Weekly/Week-44-2026-10-25.md': '',
			'Weekly/Week-46-2026-11-08.md': '',
			'Weekly/Week-48-2026-11-22.md': '',
			'Weekly/notes.md': '',
			'Other/Week-46-2026-11-14.md': '',
		});

		await openThisWeeksNote(app, settings());

		expect(files.get('Weekly/Week-47-2026-11-15.md')).toStartWith(
			'Previous: [[Week-46-2026-11-08]]\n\n## Mon 2026-11-16',
		);
	});

	test('opens existing note without overwriting it', async () => {
		setSystemTime(new Date(2026, 10, 21, 23, 59));
		const path = 'Weekly/Week-47-2026-11-15.md';
		const { app, files, opened } = fakeVault({ [path]: 'my notes' });

		await openThisWeeksNote(app, settings());

		expect(opened).toEqual([path]);
		expect(files.get(path)).toBe('my notes');
	});

	test('creates missing nested folder', async () => {
		setSystemTime(new Date(2026, 10, 18));
		const { app, files, folders } = fakeVault({});

		await openThisWeeksNote(app, settings({ folder: 'Journal/Weekly/' }));

		expect(folders.has('Journal/Weekly')).toBe(true);
		expect(files.has('Journal/Weekly/Week-47-2026-11-15.md')).toBe(true);
	});

	test('vault root when folder is empty', async () => {
		setSystemTime(new Date(2026, 10, 18));
		const { app, files } = fakeVault({ 'Week-46-2026-11-08.md': '' });

		await openThisWeeksNote(app, settings({ folder: '' }));

		expect(files.get('Week-47-2026-11-15.md')).toStartWith(
			'Previous: [[Week-46-2026-11-08]]',
		);
	});

	test('week crossing the year boundary', async () => {
		setSystemTime(new Date(2027, 0, 1));
		const { app, files } = fakeVault({});

		await openThisWeeksNote(app, settings({ headerDays: 'SS' }));

		const content = files.get('Weekly/Week-01-2026-12-27.md');
		expect(content).toContain('## Fri 2027-01-01');
		expect(content).toContain('## Sat 2027-01-02');
	});
});
