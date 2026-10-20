# Art source notes

Generated using the built-in image generation tool, then cropped losslessly into `assets/sprites/` with `node scripts/slice-assets.cjs`. The game uses plain static image files and no image-generation API at runtime.

The full-map concept `field-world.png` established the composition: an open camp clearing, irregular tall woodland on the perimeter, a ruin to the north and a winding stream with a plank bridge to the southeast. It is a reference only, never a stretched game background.

## Final prompt set

Shared art direction: slightly overhead three-quarter survival-game view; primitive rough black pen doodles with wobbly contours, opaque white interiors and generous transparent margins. Black and white only. No shading, gray wash, texture, realism, anime, labels or grid lines. Objects isolated and fully visible.

- `character-v3.png`: three columns, four rows; eccentric thin adult with an oversized angular head, messy black triangular hair, rectangular glasses, small moustache/goatee, small T-shirt torso, long skinny limbs and oversized shoes. Front, rear and right-profile heads; matching torsos; separate arms; separate legs; mug and axe. Exaggerated head/body proportions, suitable for a jointed puppet rather than animation frames.
- `side-body-v4.png`: three isolated vertical parts in pure right-facing side profile: tiny loose T-shirt torso, complete thin arm with mitten hand, complete leg with shorts cuff and oversized striped shoe pointing right. Shoulder and hip joints at the top. No head.
- `trees-v4.png`: six tall crooked woodland trees in a 3 × 2 sheet: round canopy, skinny pine, bare forked tree, bent pine, double canopy, young pine. Complete roots, simple sparse outlines, no ground circles.
- `camp-v4.png`: six separate camp props in a 3 × 2 sheet: crooked triangular tent, narrow workbench, chest, stone-ring fire, broken stone arch and blank signpost. Compatible world scale, slight overhead view.
- `plants-v4.png`: twelve separate small plants in a 4 × 3 sheet: grass tuft, tall blades, daisies, mushrooms, thorn bush, berries, fern, reeds, sprout, clover, bent flowers and leaves.
- `ground-v4.png`: eight ground props in a 4 × 2 sheet: angular rock, pebbles, ore, stump, fallen log, short logs, twigs and hollow log.
- `stream-v4.png`: one long narrow winding stream crossing diagonally from upper right to lower left, two irregular banks, opaque white water with a few black ripples, small rocks and reeds, and one crooked plank bridge. All surrounding ground transparent. No pond, oval, terrain fill or trees.

## Additional v5 prompt set

- `river-v5.png`: a single continuous transparent terrain asset. Stream enters the right edge near the upper corner, winds diagonally toward the lower left, turns down and leaves the bottom edge. One crooked plank bridge near its center. Two unbroken organic black bank contours, white water, minimal ripples, very few stones/reeds. No segments, gaps, seams, islands, ponds, trees or terrain fill. This replaces both repeated v4 river pieces. The native 1774 × 887 canvas is displayed at the same size.
- `woodland-v5.png`: six isolated sprites, 3 × 2: fallen branch, bird nest with two eggs, drooping bell flowers, hollow snag, seed-head grasses and leaf-covered burrow. Primitive rough black pen, flat white fill, generous gutters.
- `camp-details-v5.png`: six isolated sprites, 3 × 2: coffee pot on tripod, steaming mug, log stool, short crooked fence, blank cloth banner and wooden water trough. Same simple sparse black pen aesthetic.
- `wildlife-v5.png`: six isolated sprites, 3 × 2: side-profile rabbit, bird body, detached wing, snail, sleeping hedgehog and butterfly wings. Tiny naive black-and-white doodles; no gray, shading, realistic textures or anime. The bird wing is independently animated.
- `favicon-n.png`: one neat, upright lowercase monospaced slab-serif `n`, following Courier New from `D:/Projects/个人主页/srht-home/site/favicon.svg`, drawn in black wax crayon with restrained white grain and imperfect edges. Transparent square, balanced margins, no surrounding decoration. `favicon.png` is the losslessly cropped and padded final icon.

## Current v6 character

`character-v6.png` was generated with the built-in image-generation tool and saved in this project. Prompt: a transparent 3-column, 4-row modular puppet atlas; front, back and right-profile columns; detached heads, shirt torsos, arms and legs in successive rows. Don't Starve-like proportions: enormous angular head with pointed unruly black hair, rectangular glasses and tiny goatee; a tiny tapered shirt torso, spindly short legs and pointed shoes. Sparse rough black pen contours, opaque white interiors; no anime, realism, grayscale, backgrounds, labels or assembled animation frames. Generous transparent gutters and consistent attachment points across all components.

The v6 sheet replaces all heads, torsos and directional limbs. Front neck center is at 54.3% of its cropped head width, rear at 48.8%, and profile at 62.2%; CSS offsets align those anchors with the torso stems. Forearm sprites are clipped below their duplicate sleeves and tucked under the torso cuffs. Leg tops overlap the shirt hem. The whole puppet hops as one hierarchy; the head has no separate rotation animation.

The smaller favicon uses 1.65× transparent square padding around the cropped crayon glyph. Source art for removed vegetation and clutter remains on disk for reversible layout experiments, but is no longer placed in the scene.

Simpler chest/stool/trough regeneration was attempted twice, but the image service returned HTTP 429. No replacement asset was produced; the current game uses the enlarged existing cutouts.

The sprite slicer uses manually verified bands for the character, trees and camp props because generated sheets do not follow exact equal cell spacing. Its PNG processing only crops artwork and samples alpha for collision; it does not draw assets. `sprites.js` is generated metadata, so the page also works without `fetch` when opened as a local file.
