# intro + the idle field

A static homepage linking to a separate black-and-white top-down idle game at `game.html` when the doodle character is clicked.

The page is deliberately generic so the same file can be dropped on any host. It currently says "This is ~noahisarider on the web." which fits envs.net, nekoweb, or anywhere else without edits.

## Files

- `index.html` — homepage only; no game scripts or hidden scene
- `game.html`, `field.css`, `field.js` — independent game page; no external requests
- `weird.html`, `ideas.html`, `rooms.css` — the two plates behind the field: a painted background and one line of type set in the same Fell face and size as the title
- `assets/rooms/bg-weird.webp`, `assets/rooms/bg-ideas.webp` — the two plates, 1672 × 941
- `assets/fonts/` — IM Fell English, self-hosted woff2, no external requests
- `art-src/` — the generated source art, the prompt set and the cutting scripts' output; never served
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
cp index.html game.html weird.html ideas.html field.css rooms.css field.js world-layout.js coffee.png favicon.png dist/
cp assets/sprites.js assets/river-v5.png dist/assets/
cp -r assets/sprites dist/assets/sprites
cp -r assets/rooms assets/fonts dist/assets/
python scripts/make-zip.py
```

`dist/` holds only what the browser requests. The unsliced source art in `assets/` stays local. `scripts/make-zip.py` writes `intro-nekoweb.zip` with `index.html` at the archive root, which is what nekoweb's import expects.

## Viewing

Open `index.html` directly, or serve the folder. No package installation, build or backend is required:

```sh
node scripts/preview.cjs
```

Published at https://noahisarider.github.io/intro/ and https://noahisarider.envs.net/; the nekoweb copy comes from `intro-nekoweb.zip`.

## The two doors in the field

Three camp objects were drawn in the game and two of them carry a link. The tent opens `weird.html`, the stone arch opens `ideas.html`. Each is an anchor laid over the object's own box, with no tooltip, no cursor change and no hover state, so the drawing itself behaves as the link. The log stool by the fire is not a door.

Each plate is a single composition: one painted background, the title, and one sentence set at `clamp(2.4rem, 6.2vw, 5.4rem)` in IM Fell English. Nothing else is on the page. Labels, panels, badges and objects were tried and taken out again.

## Controls

- Click the character to enter
- Click the tent or the stone arch to leave the field for one of the two plates
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
