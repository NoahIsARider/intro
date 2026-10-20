# intro + the idle field

A static homepage linking to a separate black-and-white top-down idle game at `game.html` when the doodle character is clicked.

The page is deliberately generic so the same file can be dropped on any host. It currently says "This is ~noahisarider on the web." which fits envs.net, nekoweb, or anywhere else without edits.

## Files

- `index.html` — homepage only; no game scripts or hidden scene
- `game.html`, `field.css`, `field.js` — independent game page; no external requests
- `world-layout.js` — hand-placed groves, clearings and camp
- `coffee.png` — the doodle, 779×1254, transparent background
- `assets/sprites/`, `assets/sprites.js` — 70 generated sprite entries, their sizes and a river collision mask
- `favicon.png` — centered lowercase crayon `n`, following the monospaced `n` in the sibling srht-home site
- `assets/ART.md` — art prompts and source notes
- `scripts/` — optional development helpers; not needed for hosting

## Packaging

`node scripts/preview.cjs` serves the working copy on http://127.0.0.1:4174. To build the files that are actually published:

```sh
rm -rf dist && mkdir -p dist/assets
cp index.html game.html field.css field.js world-layout.js coffee.png favicon.png dist/
cp assets/sprites.js assets/river-v5.png dist/assets/
cp -r assets/sprites dist/assets/sprites
python scripts/make-zip.py
```

`dist/` holds only what the browser requests. The unsliced source art in `assets/` stays local. `scripts/make-zip.py` writes `intro-nekoweb.zip` with `index.html` at the archive root, which is what nekoweb's import expects.

## Viewing

Open `index.html` directly, or serve the folder. No package installation, build or backend is required:

```sh
node scripts/preview.cjs
```

Published at https://noahisarider.github.io/intro/ and https://noahisarider.envs.net/; the nekoweb copy comes from `intro-nekoweb.zip`.

## Controls

- Click the character to enter
- Click the ground or use WASD / arrow keys to steer temporarily
- The complete map stays centered and visible; no camera following, dragging or game zoom
- The character finds resources automatically; click a tree, rock or edible plant to gather there
- Water blocks movement; the illustrated wooden bridge permits crossing
- The outer thicket encloses the explorable area
- Progress saves in localStorage

The ground is plain white. All visible game artwork consists of generated PNG cutouts. The complete composition scales uniformly to fit the viewport, including after browser zoom or resize. The generated full-map concept is retained in `assets/field-world.png` only as an art reference and is not loaded by the game. Physics and navigation do not draw terrain.

The clearing deliberately excludes small scattered ground props and plants. Only the simple three-blade grass remains, mostly around the woodland edges. Chest, stool and trough are enlarged. The newly generated modular character has a large head and tiny body; each directional neck anchor is measured from the actual cropped image, rather than assuming its center. Legs overlap the shirt hem, and the hop animation moves the complete rig without rotating the head separately.

The river is now a single continuous asset, not repeated segments. Campsite props, ground details and plants reserve their full image bounds around trees; tree crowns can still overlap other tree crowns to make woodland groves. The lossless slicer preserves the river's full canvas so its visible banks and sampled collision mask use identical coordinates.

## Link rule

Links on this copy stay as they are. The canonical landing point is https://noahisarider.pages.dev/ since it survives any single platform losing the account.
