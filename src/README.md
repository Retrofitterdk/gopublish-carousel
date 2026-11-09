# Source files

Block source files. `npm run build` compiles them into `build/`, which is what WordPress loads (see `gopublish-carousel.php`).

## `carousel/` – Carousel (`gopublish/carousel`)

The wrapper: settings, the Interactivity API context and the live region, around its parts (Carousel Navigation, Carousel Slides, Carousel Pagination). A dynamic block: its output is rendered in PHP, and it runs in the browser with the [Interactivity API](https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/). This folder also holds modules the other blocks share.

| File | Purpose |
| --- | --- |
| `block.json` | Block metadata, attributes and supports; provides Rewind at the end to the parts (block context). |
| `index.js` | Registers the block: the default variation (Navigation, Carousel Slides with three slides, Pagination), the deprecation that converts carousels from before 0.5.0, and the filter that allows one of each part. |
| `edit.js` | Editor UI: Layout panel (Screen size switch tied to the device preview, per-viewport settings), Navigation panel, "Add to carousel" in the toolbar, and the per-viewport CSS. |
| `save.js` | Saves the inner blocks. The front end is rendered by `render.php`. |
| `render.php` | Front-end markup: the live region and the parts (Carousel Slides first, then the others with the slides' ID and count in the block context), the layout and gap CSS, and the Interactivity API context. Renders carousels from before 0.5.0 as before. |
| `view.js` | Front-end behaviour: the `gopublish-carousel` store (button and dot scrolling, rewind, start/end state, pagination, announcements). Scrolling itself is native. |
| `layouts.js` | Shared: the layout per viewport (columns, cutoff, slides to scroll, inheritance). Mirrors `gopublish_carousel_layouts()` in PHP. |
| `pages.js` | Shared (`view.js` and the editor): measurements of the scroll area – the step between slides, the scroll direction, slides to scroll and the pagination's pages. |
| `use-carousel-track.js` | Shared (editor): finds and measures the carousel's scroll area for Navigation and Pagination, and scrolls it. |
| `style.scss` | Front-end and editor styles for the carousel and all its parts: the scroll-snap area, slide widths, navigation, dots, and the parts' width. Small-screen and per-viewport styles are generated in PHP (in `gopublish-carousel.php`). |
| `editor.scss` | Editor-only styles: softer snapping while editing, the "Show all slides" grid, and dimmed parts while all slides fit. |

All blocks are registered from `build/blocks-manifest.php`, which `npm run build` generates. The Carousel and Carousel Slides get `skip_inner_blocks` through the `register_block_type_args` filter, and render their inner blocks with `gopublish_carousel_render_inner_block()` (in `gopublish-carousel.php`), so the slides keep their inherited block context.

## `carousel-slides/` – Carousel Slides (`gopublish/carousel-slides`)

The scroll area with the slides, only inside a Carousel (one per carousel, and it can't be removed on its own). `render.php` uses `gopublish_carousel_render_slides()`; the editor has the same classes as the front end (`.carousel-container > .carousel-track`) and the toolbar buttons Add slide and Show all slides.

## `carousel-slide/` – Carousel Slide (`gopublish/carousel-slide`)

A static wrapper block for one slide. It can only be placed inside Carousel Slides (`parent` in `block.json`). In the editor, it gets the extra class `carousel-slide` (not saved), so it's styled like the front-end slide.

## `carousel-navigation/` – Carousel Navigation (`gopublish/carousel-navigation`)

The Previous and Next buttons, only inside a Carousel (one per carousel). A dynamic block (`save` returns nothing); `render.php` uses `gopublish_carousel_render_navigation()`. Justification (flex layout support), width (`align`), margin and padding are block settings, and the icon (`icon` attribute, picked in `icon-picker.js` from WordPress's icon registry). The Color panel (own attributes, `withColors`), Button padding and Icon size (own attributes in the Dimensions panel) and the Border settings style the buttons, as `--nav-button-*` custom properties on the wrapper (`button-styles.js`, mirroring `gopublish_carousel_navigation_button_styles()`); the buttons' behaviour comes from the Carousel's store.

## `carousel-pagination/` – Carousel Pagination (`gopublish/carousel-pagination`)

The dots, only inside a Carousel (one per carousel). A dynamic block; `render.php` renders a dot per slide, each bound to its entry in the Carousel's `context.dots`, which `view.js` keeps up to date. Same settings as the navigation. The editor computes the dots with `pages.js`.
