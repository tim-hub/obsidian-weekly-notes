# Weekly notes

Obsidian plugin that works like the core **Daily notes** plugin, but for weeks.

## Usage

Select the **Open this week's note** ribbon icon (or run the command of the same name).

- If this week's note exists, it opens
- Otherwise it is created with a header for each day (Mon–Fri by default), and a `Previous:` link to the latest earlier weekly note in the same folder. The link follows **Settings → Files and links** (`[[wikilink]]` or `[markdown](link)`)

```
Previous: [[Week-46-2026-11-08]]

## Mon 2026-11-16

## Tue 2026-11-17
...
```

## Settings

| Setting | Default |
|---|---|
| Week starts on | Sunday (or Monday) |
| Date format (file name, from first day of week) | `[Week-]ww-YYYY-MM-DD` |
| New file location | `weekly-notes` |
| Day header format | `ddd YYYY-MM-DD` |
| Day headers | Monday to Friday (or Sunday to Saturday) |

Formats use [Moment.js syntax](https://momentjs.com/docs/#/displaying/format/). `ww` is the locale week number, `WW` the ISO week number.

## Release

1. Bump `version` in `manifest.json` and add it to `versions.json`
2. Commit, then push a tag matching the version (no leading `v`): `git tag 1.0.1 && git push origin 1.0.1`
3. GitHub Actions builds and attaches `main.js`, `manifest.json`, `styles.css` to the release

## Development

```bash
bun install
bun run dev     # watch build
bun run build   # production build
bun test
bun run lint
```

Manual install: copy `main.js`, `manifest.json`, `styles.css` to `<Vault>/.obsidian/plugins/weekly-notes/`, then enable the plugin in **Settings → Community plugins**.
