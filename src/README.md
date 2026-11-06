# Source files

Block source files. `npm run build` compiles them into `build/`, which is what WordPress loads (see `gopublish-carousel.php`).

## `carousel/` – Carousel (`gopublish/carousel`)

A dynamic block. Its output is rendered in PHP, and it runs in the browser with the [Interactivity API](https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/).

| File | Purpose |
| --- | --- |
| `block.json` | Block metadata, attributes and supports. |
| `index.js` | Registers the block in the editor. |
| `edit.js` | Editor UI: inspector controls and inner blocks. |
| `save.js` | Saves the inner blocks. The front end is rendered by `render.php`. |
| `render.php` | Front-end markup: navigation, slides, clones for looping and the Interactivity API context. |
| `view.js` | Front-end behaviour: the `gopublish-carousel` store (moving, looping, swipe and drag). |
| `style.scss` | Front-end and editor styles. |
| `editor.scss` | Editor-only styles. |

The carousel is registered with `skip_inner_blocks`. `render.php` renders each slide once with `gopublish_carousel_render_inner_block()` (in `gopublish-carousel.php`), so the slides keep their inherited block context.

## `carousel-slide/` – Carousel Slide (`gopublish/carousel-slide`)

A static wrapper block for one slide. It can only be placed inside a Carousel (`parent` in `block.json`).
