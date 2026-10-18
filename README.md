# intro

A single static page. White, black text, one doodle of a man holding coffee, no scrolling.

The page is deliberately generic so the same file can be dropped on any host. It currently says "This is ~noahisarider on the web." which fits envs.net, nekoweb, or anywhere else without edits.

## Files

- `index.html` — the whole page, styles inline, no external requests
- `coffee.png` — the doodle, 779×1254, transparent background

## Viewing

Open `index.html` directly, or serve the folder:

```sh
python -m http.server 8000
```

Published at https://noahisarider.github.io/intro/

## Link rule

Links on this copy stay as they are. The canonical landing point is https://noahisarider.pages.dev/ since it survives any single platform losing the account.
