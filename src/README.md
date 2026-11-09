# Source files

Block source files. `npm run build` compiles them into `build/`, which is what WordPress loads (see `gopublish-carousel.php`).

## `carousel/` – Carousel (`gopublish/carousel`)

A dynamic block. Its output is rendered in PHP, and it runs in the browser with the [Interactivity API](https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/).

| File | Purpose |
| --- | --- |
| `block.json` | Block metadata, attributes and supports. |
| `index.js` | Registers the block in the editor, with a default variation that inserts three slides. |
| `edit.js` | Editor UI: settings, toolbar (Add slide, Show all slides), and a front-end-like carousel view with scroll-only arrows. |
| `save.js` | Saves the inner blocks. The front end is rendered by `render.php`. |
| `render.php` | Front-end markup: navigation, slides, clones for looping and the Interactivity API context. |
| `view.js` | Front-end behaviour: the `gopublish-carousel` store (moving, looping, swipe and drag). |
| `style.scss` | Front-end and editor styles. Small-screen styles are generated in PHP (see `gopublish_carousel_add_small_screen_styles()`). |
| `editor.scss` | Editor-only styles: the scrollable row and the "Show all slides" grid. |

All blocks are registered from `build/blocks-manifest.php`, which `npm run build` generates. The carousel gets `skip_inner_blocks` through the `register_block_type_args` filter. `render.php` renders each slide once with `gopublish_carousel_render_inner_block()` (in `gopublish-carousel.php`), so the slides keep their inherited block context.

## `carousel-slide/` – Carousel Slide (`gopublish/carousel-slide`)

A static wrapper block for one slide. It can only be placed inside a Carousel (`parent` in `block.json`). In the editor, it gets the extra class `carousel-slide` (not saved), so it's styled like the front-end slide.
