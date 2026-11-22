import { moment } from 'obsidian';

export type WeekStartDay = 0 | 1;

export type HeaderDays = 'SS' | 'MF';

const WEEKDAYS: Record<HeaderDays, number[]> = {
	SS: [0, 1, 2, 3, 4, 5, 6],
	MF: [1, 2, 3, 4, 5],
};

export function getWeekStart(
	date: moment.Moment,
	startDay: WeekStartDay,
): moment.Moment {
	const daysSinceStart = (date.day() - startDay + 7) % 7;
	return date
		.clone()
		.locale('en')
		.startOf('day')
		.subtract(daysSinceStart, 'days');
}

export function parseWeekStart(
	basename: string,
	format: string,
): moment.Moment | null {
	const parsed = moment(basename, format, 'en', true);
	return parsed.isValid() && parsed.format(format) === basename
		? parsed
		: null;
}

export function buildWeeklyNoteContent(
	weekStart: moment.Moment,
	headerFormat: string,
	headerDays: HeaderDays,
	previousLink: string | null,
): string {
	const dayHeaders = Array.from({ length: 7 }, (_, offset) =>
		weekStart.clone().add(offset, 'days'),
	)
		.filter((day) => WEEKDAYS[headerDays].includes(day.day()))
		.map((day) => `## ${day.format(headerFormat)}`);
	const sections = [
		...(previousLink ? [previousLink] : []),
		...dayHeaders,
		'---',
		'## Next week',
	];
	return `${sections.join('\n\n')}\n`;
}
