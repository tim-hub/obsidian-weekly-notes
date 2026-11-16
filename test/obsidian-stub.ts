import { mock } from 'bun:test';
import moment from 'moment';

function normalizePath(path: string): string {
	const trimmed = path.replace(/[\\/]+/g, '/').replace(/^\/|\/$/g, '');
	return trimmed === '' ? '/' : trimmed;
}

void mock.module('obsidian', () => ({ moment, normalizePath }));
