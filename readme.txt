=== Go:Publish Carousel ===
Contributors:      retrofitter
Tags:              carousel, slider, block, interactivity api
Requires at least: 6.6
Tested up to:      7.1
Requires PHP:      7.2
Stable tag:        0.2.6
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A looping carousel block for any blocks, built on the Interactivity API.

== Description ==

Go:Publish Carousel adds a Carousel block to the block editor. Each slide is a Carousel Slide block that can hold any other blocks: images, text, buttons, groups, cards and so on.

The carousel is rendered on the server and runs on the WordPress Interactivity API, so no jQuery or third-party slider library is loaded.

Features:

* Slides can contain any blocks.
* 1–6 slides visible at once (Columns).
* Choose how many slides to move per step (Slides to Scroll).
* Cutoff effect: the last visible slide is partly shown, hinting that there is more to scroll through.
* Separate slide width on mobile (in percent of the carousel width).
* Endless looping in both directions.
* Previous/next buttons, touch swipe and mouse drag.
* If every slide fits in view, the navigation is hidden and the carousel stays still.
* Wide and full alignment, padding, margin and minimum height.
* Several carousels on the same page.
* Slides keep the block context they inherit, and slides that render empty (e.g. hidden by a visibility plugin) are skipped.

Accessibility (following the W3C carousel pattern):

* Labelled navigation buttons, with a visible focus ring for keyboard users.
* Screen readers announce the carousel and each slide ("slide, 2 of 9"), and an optional label turns the carousel into a landmark.
* Slide changes are announced politely ("Slide 3 of 9").
* Keyboard focus only reaches slides that are in view, and the copies used for looping are skipped.
* On touch screens, the navigation appears for keyboard and switch users, and screen readers can always reach it.
* Respects the reduced motion setting: slides change instantly instead of sliding.

Go:Publish Carousel was originally based on [demo-carousel](https://github.com/eirichmond/demo-carousel) by Elliott Richmond. It has since been rewritten and extended, and is now developed as a separate plugin.

= Planned =

* Carousel for posts in a Query Loop.
* Separate blocks for navigation and pagination, so they can be placed freely.

== Installation ==

1. Download the plugin as a zip file, or build one yourself (see Development below).
2. In WordPress, go to Plugins → Add New → Upload Plugin and upload the zip file.
3. Activate Go:Publish Carousel.
4. In the block editor, insert a Carousel block and add content to its slides.

== Frequently Asked Questions ==

= How do I add more slides? =

Select the Carousel block and use the inserter (+) inside it to add another Carousel Slide. Carousel Slide blocks can only be placed inside a Carousel.

= How do I make the carousel accessible? =

Most of it is built in. To help screen reader users, give the carousel a label that describes it, e.g. "Customer testimonials": select the Carousel block and open Advanced → Carousel label. Screen reader users can then jump to the carousel as a landmark. Leave it empty if the surrounding content (such as a heading right above it) already makes the purpose clear.

Avoid forms and other complex interactive content inside slides.

= How do I style the navigation buttons? =

The navigation is styled with CSS custom properties, which you can override in your theme or in Additional CSS. For example:

`.wp-block-gopublish-carousel { --nav-button-background-hover: #1e1e1e; --nav-container-justify-content: center; }`

Available properties:

* `--nav-container-padding`, `--nav-container-padding-left`, `--nav-container-padding-right`
* `--nav-container-justify-content`, `--nav-container-gap`, `--nav-container-text-align`
* `--nav-button-width`, `--nav-button-height`, `--nav-button-radius`
* `--nav-button-background`, `--nav-button-background-hover`
* `--nav-button-icon-color`, `--nav-button-icon-color-hover`
* `--nav-button-outline-color`, `--nav-button-outline-width`, `--nav-button-outline-offset` (keyboard focus ring)
* `--slide--padding-right` (space between slides)

= Why are the navigation buttons hidden on my phone? =

On small touch screens the carousel is navigated by swiping, so the buttons are visually hidden. They appear as soon as someone uses a keyboard or switch device to move focus into the carousel, and screen readers can always reach them. On any screen size where all slides fit in view, there is nothing to navigate and the buttons are removed.

= What is the breakpoint for mobile? =

782 px, the same as the WordPress admin and many block themes.

== Development ==

Source files are in `src/`, and the compiled blocks in `build/` are what WordPress loads. Requires Node.js and npm.

* `npm install` – install the build tools.
* `npm start` – build and watch for changes during development.
* `npm run build` – production build.
* `npm run lint:js` / `npm run lint:css` – lint JavaScript and styles.
* `npm run plugin-zip` – create an installable zip file.

See README.md for more developer notes.

== Changelog ==

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
