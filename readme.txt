=== Go:Publish Carousel ===
Contributors:      retrofitter
Tags:              carousel, slider, block, interactivity api
Requires at least: 6.8
Tested up to:      7.1
Requires PHP:      7.2
Stable tag:        0.6.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A carousel block for any blocks, built on native scrolling and the Interactivity API.

== Description ==

Go:Publish Carousel adds a Carousel block to the block editor. A carousel is made of parts, each its own block:

* Carousel Slides: the row of slides. Each slide is a Carousel Slide block that can hold any other blocks: images, text, buttons, groups, cards and so on.
* Carousel Navigation: the Previous and Next buttons.
* Carousel Pagination: dots for jumping to a position.

Navigation and Pagination can be placed above or below the slides, aligned left, center, right or with space between, and given content, wide or full width. The navigation can also sit on top of the slides. A carousel has one of each, and both can be removed. Headings and paragraphs can be added inside the carousel too, e.g. a title and a description above the slides.

The carousel is rendered on the server and built on the browser's own scrolling (CSS scroll snap). Swiping, trackpad scrolling and momentum work like anywhere else on the device. A small script on the WordPress Interactivity API adds the buttons and dots, so no jQuery or third-party slider library is loaded.

Features:

* Slides can contain any blocks.
* 1–6 slides visible at once (Columns).
* Choose how many slides to move per step (Slides to scroll).
* Cutoff effect: the last visible slide is partly shown (with one column, the next slide peeks in), hinting that there is more to scroll through.
* Columns, cutoff effect and slides to scroll can be set separately for desktop, tablet and mobile. New carousels start with 3, 2 and 1 columns.
* Rewind at the end: on the last slide, Next goes back to the first (and Previous on the first goes to the last). Turn it off to stop at the ends instead.
* Previous/next buttons, pagination dots, touch swipe, trackpad and keyboard scrolling, all snapping to the start of a slide.
* The pagination has one dot per position the buttons can reach, and marks the current one.
* Navigation icon from WordPress's icon library (WordPress 7.1), left- or right-pointing.
* Colours for the navigation buttons (icon and background, also on hover and focus), borders, button padding and icon size.
* Navigation over the slides: Previous and Next at the edges of the slides, hidden on mobile.
* Colours, size and spacing for the pagination dots.
* Headings and paragraphs inside the carousel, to introduce or describe it.
* If every slide fits in view, the navigation and pagination are hidden.
* The Block spacing setting sets the space between slides, with separate values per viewport in WordPress 7.1.
* Wide and full alignment, padding, margin and minimum height.
* Right-to-left languages.
* Several carousels on the same page.
* Slides keep the block context they inherit. Empty slides, and slides that render nothing (e.g. hidden by a visibility plugin), are skipped.
* The editor shows the carousel as on the front end: one row with the real slide widths, the cutoff effect, navigation arrows and dots. Switch to "Show all slides" for an overview.
* Translation-ready, with a Danish translation included.

Accessibility (following the W3C carousel pattern):

* Labelled navigation buttons, with a visible focus ring for keyboard users.
* Screen readers announce the carousel and each slide ("slide, 2 of 9"). A label, or a heading inside the carousel, turns it into a landmark.
* The pagination is a group of buttons ("Choose slide"), each labelled with the slide it goes to ("Go to slide 4"), the current one marked as current. Dots are at least 24 × 24 px to tap and at least 24 px apart, and keyboard focus shows a ring around the dot.
* After using the buttons or dots, the visible slides are announced politely ("Slide 3 of 9", or "Slides 3 to 5 of 9" when several are in view).
* Every slide can be reached with Tab; the carousel scrolls a focused slide into view. If the slides contain nothing focusable, the row of slides can be focused itself and scrolled with the arrow keys.
* With Rewind at the end turned off, the buttons are marked as unavailable at the ends, but stay focusable, so keyboard focus isn't lost.
* On small touch screens, and on mobile when it's over the slides, the navigation is only hidden visually: it appears for keyboard and switch users, and screen readers can always reach it.
* Respects the reduced motion setting: the carousel jumps instead of scrolling smoothly.

Go:Publish Carousel was originally based on [demo-carousel](https://github.com/eirichmond/demo-carousel) by Elliott Richmond. It has since been rewritten and extended, and is now developed as a separate plugin.

= Planned =

* Carousel for posts in a Query Loop.

== Installation ==

1. Download the plugin as a zip file, or build one yourself (see Development below).
2. In WordPress, go to Plugins → Add New → Upload Plugin and upload the zip file.
3. Activate Go:Publish Carousel.
4. In the block editor, insert a Carousel block and add content to its slides.

== Frequently Asked Questions ==

= How do I add more slides? =

Select the Carousel and choose Add to carousel (+) → Slide in the block toolbar, or select Carousel Slides and click Add slide. The new slide is added at the end. With a slide selected, "Add carousel slide" (+, next to "Select parent") adds one after it. List View is handy for selecting the right block.

= How do I add, move or remove the navigation and dots? =

New carousels have Navigation above the slides and Pagination below. Move them with the block toolbar's arrows or in List View, or remove them like any block. To add them back, select the Carousel and choose Add to carousel (+) → Navigation or Pagination. A carousel can have one of each.

Both have the same settings: Justification (left, center, right, space between) in the block's settings, and width (none = content width, wide or full) with the alignment button in the toolbar.

= How do I see or rearrange all slides in the editor? =

The editor shows the carousel as a scrollable row, like on the front end; use the arrows or scroll sideways to reach the other slides. To see every slide at once, select Carousel Slides and click Show all slides in its block toolbar. This grid view is only shown in the editor and is handy for rearranging slides. Click the button again to return to the carousel view.

= How do I set a different layout for tablet and mobile? =

Select the Carousel and choose Tablet or Mobile under Screen size in the Layout panel. Columns, Use cutoff effect and Slides to scroll then apply to that screen size only. The editor preview switches along, so you see the layout you're changing.

Desktop settings apply to every screen size unless Tablet or Mobile changes them, and Mobile inherits from Tablet. Each setting shows whether it's the same as the larger screen size or changed; "Reset to Desktop" (or "Reset to Tablet") removes the changes.

= Does the editor show the tablet and mobile layout? =

Yes. Switch the editor's preview to Tablet or Mobile, and the carousel uses that screen size's columns, slides to scroll and spacing, as on the front end.

= What happens at the end of the carousel? =

With Rewind at the end turned on (the default), Next on the last slide scrolls back to the first, and Previous on the first slide scrolls to the last. The carousel doesn't loop endlessly: it scrolls back through the slides. If that feels jarring, e.g. with many slides, turn Rewind at the end off in the Navigation panel. The buttons then stop at the ends and are shown dimmed.

= Can I drag the carousel with the mouse? =

No. On a computer, use the buttons, scroll sideways with a trackpad or with Shift and the scroll wheel, or the arrow keys. On touch screens, swipe.

= How do I change the space between slides? =

Select the Carousel and change Block spacing in the Dimensions panel. From WordPress 7.1, you can set a different value for tablet and mobile. Themes can also set the `--carousel-gap` custom property.

= Can I change the arrows? =

Yes, from WordPress 7.1. Select Carousel Navigation and click Choose icon in the Icon panel to pick any icon from WordPress's icon library (and collections your theme or plugins add). Previous and Next show the icon mirrored, pointing back and forward: an icon pointing left (e.g. Chevron left) works as well as one pointing right. Reset returns to the default arrow. The icon's size is set with the `--nav-button-icon-size` custom property (default 24 px).

= Can I add a title or description to a carousel? =

Yes. Select the Carousel and choose Add to carousel → Heading or Paragraph in its toolbar (or insert them between the carousel's parts). They sit inside the carousel, above the slides or wherever you move them, at content width. A heading also names the carousel for screen reader users (unless Carousel label is set).

= Can the arrows sit on top of the slides? =

Yes. Select Carousel Navigation and turn on Position → Over the slides. Previous and Next then sit at the left and right edges of the slides, vertically centred (Justification is set to Space between; Padding sets the distance from the edges). They're white buttons with a soft shadow, unless you choose colours. On mobile they're hidden: visitors swipe, and keyboard users still reach them. This needs a browser with CSS anchor positioning (current versions of all major browsers); older browsers show the navigation above or below the slides.

= Can I change the dots? =

Yes. Select Carousel Pagination and open the Styles tab. In the Color panel, choose the colour of the Dots and of the Current dot (hovering a dot shows a colour halfway between them). Under Dimensions, set Dot size and Dot spacing. Dots stay at least 24 px apart, centre to centre, so they're easy to tap: with large dots, a small spacing can't go lower than that. Without a Dots colour, the dots are the text colour, faded.

= Can I change the size of the arrows? =

Yes. Select Carousel Navigation, open the Styles tab and use Icon size and Button padding in the Dimensions panel. The buttons grow to fit the icon plus the padding (by default a 24 px icon with 4 px padding: 32 px buttons) and are never smaller than 24 × 24 px. Padding (above them) is the space around the whole navigation.

= Can I change the colours of the arrows? =

Yes. Select Carousel Navigation and open the Styles tab. In the Color panel, choose the Icon and Background colours and, if you like, their colours on hover and keyboard focus: Icon (hover & focus) and Background (hover & focus). Without hover colours, the icon and background colours swap on hover; with only an icon colour, the background takes the icon colour. Borders adds a border around each button (outside the button, so it doesn't cover the background) and rounds the corners: the buttons are 32 px, so a radius of 16 px or more makes them round, like the default. Themes can set the same through custom properties (see below). The Border settings for Carousel Navigation under Styles → Blocks in the Site Editor don't reach the buttons, so use custom properties for site-wide styles.

= How do I make the carousel accessible? =

Most of it is built in. To help screen reader users, give the carousel a label that describes it, e.g. "Customer testimonials": select the Carousel block and open Advanced → Carousel label. Screen reader users can then jump to the carousel as a landmark. Or add a heading inside the carousel (Add to carousel → Heading): without a label, the heading names the carousel, with the same effect. Leave both out if the surrounding content already makes the purpose clear.

Avoid forms and other complex interactive content inside slides.

= How do I style the carousel? =

The carousel is styled with CSS custom properties, which you can override in your theme or in Additional CSS. For example:

`.wp-block-gopublish-carousel { --nav-button-background-hover: #1e1e1e; --nav-container-justify-content: center; }`

Available properties:

* `--nav-container-padding`, `--nav-container-padding-left`, `--nav-container-padding-right`
* `--nav-container-justify-content`, `--nav-container-gap`, `--nav-container-text-align`
* `--nav-button-width`, `--nav-button-height` (minimum size, default `24px`; the button fits the icon plus padding), `--nav-button-padding` (default `4px`), `--nav-button-radius`
* `--nav-button-border-width` (default `0`), `--nav-button-border-style` (default `solid`), `--nav-button-border-color` (default `currentcolor`, the icon colour)
* `--nav-button-background`, `--nav-button-background-hover`
* `--nav-button-icon-color`, `--nav-button-icon-color-hover`, `--nav-button-icon-size` (default `24px`)
* `--nav-button-outline-color`, `--nav-button-outline-width`, `--nav-button-outline-offset` (keyboard focus ring)
* `--nav-button-shadow` (default `none`)
* `--nav-overlay-button-background`, `--nav-overlay-button-background-hover`, `--nav-overlay-button-icon-color`, `--nav-overlay-button-icon-color-hover`, `--nav-overlay-button-shadow`, `--nav-overlay-inset` (navigation over the slides)
* `--nav-button-disabled-opacity` (buttons at the ends, with Rewind at the end off)
* `--carousel-gap` (space between slides; normally set with Block spacing). The older `--slide--padding-right` still works as a fallback.
* `--pagination-dot-size` (default `10px`), `--pagination-dot-spacing` (space between dots, default `14px`; dots stay at least 24 px apart, centre to centre), `--pagination-dot-color` (default: the text colour), `--pagination-dot-current-color` (default: the text colour), `--pagination-dot-opacity` (dots other than the current one, default `0.3`), `--pagination-gap` (extra space between the dot buttons, default `0`)
* `--cutoff-amount` (how much of a slide the cutoff effect cuts off the last visible slide, or shows of the next one with one column; default `0.3`, from 0 to 0.9).

The space between the navigation buttons is set with `--nav-container-gap` rather than in the editor, so themes control it. The dots' size, spacing and colours are block settings (see above).

The carousel also has classes for its state: `is-scrollable` (the slides don't all fit), `is-at-start` and `is-at-end`, plus `columns-N` and `cutoff` or `no-cutoff` for its settings.

= Why are the navigation buttons hidden on my phone? =

On small touch screens the carousel is navigated by swiping, so the buttons are visually hidden. They appear as soon as someone uses a keyboard or switch device to move focus into the carousel, and screen readers can always reach them. On any screen size where all slides fit in view, there is nothing to navigate and the buttons and dots are hidden. The dots stay visible on touch screens.

= What are the breakpoints for tablet and mobile? =

The same as WordPress uses for its own per-screen-size settings: mobile up to 480 px, tablet from 480 to 782 px, and desktop above that. From WordPress 7.1, themes can change them in theme.json (settings.viewport), and the carousel follows. Touch navigation (hidden buttons) applies to tablet and mobile.

== Development ==

Source files are in `src/`, and the compiled blocks in `build/` are what WordPress loads. Requires Node.js and npm.

* `npm install` – install the build tools.
* `npm start` – build and watch for changes during development.
* `npm run build` – production build.
* `npm run lint:js` / `npm run lint:css` – lint JavaScript and styles.
* `npm run lint:php` – check PHP against the WordPress coding standards (run `composer install` first).
* `npm run plugin-zip` – create an installable zip file.

See README.md for more developer notes, including how to update translations.

== Changelog ==

= Unreleased =
* New: headings and paragraphs directly in the Carousel, e.g. a title and a description above the slides (Add to carousel → Heading or Paragraph). They're content width (headings can be wide or full). Without a Carousel label, the carousel's heading names it for screen readers, making it a landmark.
* New: navigation over the slides (Carousel Navigation → Position → Over the slides): Previous and Next at the edges of the slides, vertically centred, as white buttons with a shadow by default (the block's colours override them). Clicks and swipes outside the buttons reach the slides; a button that can't go further (Rewind off) is invisible but stays keyboard-focusable; hidden on mobile, where visitors swipe. Uses CSS anchor positioning (current Chrome, Edge, Safari and Firefox); older browsers show the navigation above or below the slides.
* New: `--nav-overlay-*` and `--nav-button-shadow` custom properties.
* New: colour and size settings for the pagination dots (Carousel Pagination → Styles): Dots and Current dot colours, Dot size and Dot spacing. Dots stay at least 24 px apart, centre to centre. The default look is unchanged.
* New: `--pagination-dot-current-color` and `--pagination-dot-spacing` custom properties.
* Fixed: clicking a dot or a navigation button left the theme's focus outline around it (around a wide dot button, an ellipse). Focus from a click shows no ring; keyboard focus shows a round ring around the dot itself.
* Fixed: empty slides (no blocks inside, e.g. added with Add slide and never filled) showed as a blank gap, at the end of the carousel looking like the slides had run out. They're left out on the front end, and don't count as slides or get a dot.

= 0.6.0 =
* New: choose the navigation's icon from WordPress's icon library (WordPress 7.1): an Icon panel on Carousel Navigation with a searchable picker. Previous and Next show it mirrored, pointing back and forward, whether the icon points left or right.
* New: `--nav-button-icon-size` custom property (default 24 px). The default arrow looks as before.
* Changed: the icon colour is set as the button's text colour, so filled and outlined icons both follow `--nav-button-icon-color`; Previous mirrors the icon instead of rotating it.
* New: colour and border settings for the navigation buttons (Carousel Navigation → Styles): icon and background colours, also on hover, and border colour, width, style and radius. Without hover colours, hover and focus swap the icon and background colours. A border is added outside the button.
* New: Icon size and Button padding settings for the navigation buttons (Carousel Navigation → Styles → Dimensions). The buttons now fit the icon plus padding; `--nav-button-width` and `--nav-button-height` are minimum sizes (default 24 px), and `--nav-button-padding` is new (default 4 px). The default look is unchanged.
* New: `--nav-button-border-width`, `--nav-button-border-style` and `--nav-button-border-color` custom properties.
* Fixed: a carousel with an empty Carousel Slides before the one with slides (possible in content edited during 0.5.0 development) showed nothing; the first Carousel Slides with slides is used.

= 0.5.0 =
* New: Carousel Navigation and Carousel Pagination blocks. The buttons and the new dots are separate blocks inside the Carousel: place them above or below the slides, justify them (left, center, right, space between) and choose their width (content, wide or full).
* New: pagination dots, one per position the buttons reach, following the scroll position; clicking one scrolls there. Accessible as a group of labelled buttons with the current one marked, each at least 24 × 24 px.
* New: the slides are wrapped in a Carousel Slides block. Existing carousels are converted when opened in the editor (Navigation at full width, as before) and render as before until saved.
* New: "Add to carousel" in the Carousel's toolbar (Slide, Navigation, Pagination); Add slide and Show all slides moved to Carousel Slides. A carousel has one Carousel Slides, Navigation and Pagination.
* New: `--pagination-*` custom properties.

= 0.4.0 =
* New: columns, cutoff effect and slides to scroll per screen size (desktop, tablet, mobile), with a Screen size switch in the Layout panel that also switches the editor preview. Tablet and mobile inherit from the larger screen size unless changed.
* New: with one column, the cutoff effect lets the next slide peek in.
* New: the `--cutoff-amount` custom property, so themes can change how much the cutoff effect shows (default 0.3 of a slide).
* Changed: replaces the Mobile slide width setting. Existing carousels get 2 columns on tablet (1 if they have 1) and 1 column with the cutoff effect on mobile, which looks almost the same as the old default of 75 %. Custom mobile widths are not carried over.
* Changed: the settings are split into a Layout and a Navigation panel.
* Changed: the navigation buttons are always labelled "Previous slide" and "Next slide", as the number of slides they move can differ per screen size.
* Fix: a Block spacing of 0 broke the slide widths.

= 0.3.0 =
* Changed: the carousel is built on native scrolling (CSS scroll snap) instead of moving the slides with transforms. Swiping, trackpad scrolling and momentum are handled by the browser, and the carousel needs far less JavaScript.
* Changed: endless looping is replaced by rewinding. New setting: Rewind at the end (on by default). When it's off, the buttons are disabled at the ends (aria-disabled, dimmed).
* Changed: mouse dragging is removed. Use the buttons, a trackpad, Shift and the scroll wheel, or the arrow keys.
* Changed: the Block spacing setting sets the space between slides (the `--carousel-gap` custom property). `--slide--padding-right` still works as a fallback.
* Changed: off-screen slides are no longer inert, and no copies of slides are rendered. Tabbing to a slide scrolls it into view. If no slide contains anything focusable, the row of slides can be focused and scrolled with the arrow keys.
* Changed: the scrollbar is hidden.
* Changed: after using the buttons, all fully visible slides are announced ("Slides 3 to 5 of 9"), not only the first.
* Changed: a carousel without slides renders nothing.
* Changed: requires WordPress 6.8. All blocks are registered from a blocks manifest.
* Changed: a new carousel gets its three starting slides from a default block variation. Deleting every slide no longer adds three new ones automatically.
* New: Block spacing per viewport (WordPress 7.1), on the front end and in the editor's Tablet and Mobile preview.
* New: the mobile/tablet breakpoint follows the theme's viewport settings (theme.json settings.viewport, WordPress 7.1).
* New: right-to-left languages: the buttons scroll in the reading direction and the arrows point the right way.
* New: with a minimum height set, the slides fill it.
* New: state classes `is-scrollable`, `is-at-start` and `is-at-end`, and the `--nav-button-disabled-opacity` custom property.
* New: the editor shows the carousel as on the front end: one scrollable row with the real slide widths, the cutoff effect and navigation arrows, and the mobile slide width in Tablet and Mobile preview.
* New: Add slide and Show all slides (a grid view of every slide) in the Carousel's block toolbar.
* New: Danish translation (da_DK), including the screen reader texts ("karrusel", "dias", "Dias 4 af 9"). Translations ship with the plugin in languages/.
* Removed: the `data-slide-index` attribute on slides.
* Development: updated to @wordpress/scripts 37.

= 0.2.7 =
* Fix: Groups inside slides keep their own layout (Row, Grid, Stack) instead of always being forced into a column.
* Editor: Slides to scroll only allows values the carousel can use, and adjusts automatically when Columns or the cutoff effect change.
* Editor: all settings and help texts are translatable, and labels use sentence case.
* Editor: blocks inside slides no longer get extra spacing that the front end doesn't have.
* Removed debug logging from the editor script.
* JavaScript, CSS and PHP now follow the WordPress coding standards, and unused code was removed.

= 0.2.6 =
* Accessibility: navigation buttons have accessible names, aria-controls and type="button", and the icons are hidden from screen readers.
* Accessibility: the copies used for looping are hidden from screen readers and the tab order.
* Accessibility: slides outside the view are inert, so keyboard focus only reaches visible slides.
* Accessibility: carousel and slide roles ("slide, 2 of 9"), and a new Carousel label setting (Advanced panel).
* Accessibility: slide changes are announced in a polite live region.
* Accessibility: respects prefers-reduced-motion.
* Accessibility: on small touch screens, the navigation is visually hidden instead of removed, and appears on keyboard focus.
* Accessibility: visible focus style for the navigation buttons, with new --nav-button-outline-* custom properties.

= 0.2.5 =
* Fix: the Interactivity API directives now match the store, and each carousel keeps its own state.
* Fix: the mobile slide width no longer stops working when padding or minimum height is set.
* Fix: duplicate and changing IDs. Each carousel has one stable ID.
* Fix: the Carousel Slide stylesheet was missing from the build.
* Fix: Carousel Slide can only be inserted inside a Carousel.
* Fix: looping with fewer slides than columns. Navigation is hidden when all slides fit in view.
* Fix: transitions inside slides could unlock the carousel early, and a missing transitionend event could lock it.
* Fix: dragging with the mouse over a link or button no longer activates it.
* Fix: slides keep their inherited block context (Query Loop, synced pattern overrides) and are rendered only once.
* Removed leftovers from the original demo plugin (metadata, readme files and old build files).
* Removed Grunt from the build tools.

= 0.2.4 =
* Rebuilt assets. No functional changes.

= 0.2.3 =
* New: Cutoff effect can be turned on and off.
* New: configurable slide width on mobile.
* New: CSS class for the number of columns.

= 0.2.1 =
* Fix: touch dragging on iOS.

= 0.2.0 =
* Renamed to Go:Publish Carousel, with the gopublish namespace and text domain.
* New: Carousel Slide inner block, and support for several carousels on one page.
* New: endless looping, cutoff layout, touch swipe and mouse drag.
* New: wide and full alignment, spacing and dimensions support.
* New: translatable labels.

= 0.1.0 =
* First release, as demo-carousel.

== Upgrade Notice ==

= 0.6.0 =
The navigation buttons get icon, colour, border and size settings. The default look is unchanged; themes that set `--nav-button-width` or `--nav-button-height`: these are now minimum sizes (the button fits the icon plus padding).

= 0.5.0 =
Navigation and pagination are now separate blocks. Existing carousels are converted when opened in the editor and look the same; save them to keep the new structure.

= 0.4.0 =
Columns per screen size replace the Mobile slide width setting. Existing carousels get 2 columns on tablet and 1 on mobile; check carousels that used a custom mobile width.

= 0.3.0 =
New scrolling engine: endless looping is replaced by rewinding (Rewind at the end setting), and mouse dragging is removed. Theme CSS that targeted the old slide copies or the track's transform no longer applies. Requires WordPress 6.8.
