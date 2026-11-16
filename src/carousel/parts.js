/**
 * Finding a carousel's parts in the editor's block tree. Navigation and
 * Pagination can sit directly in the Carousel or in a Row or Group inside it
 * (e.g. a heading and the navigation on one line), but not in its slides.
 * Mirrors gopublish_carousel_has_part() in PHP.
 */

// Blocks whose content isn't the carousel's own parts: its slides, and
// carousels inside it.
const NOT_PARTS = [ 'gopublish/carousel', 'gopublish/carousel-slides' ];

/**
 * The first block with a name among a carousel's parts, at any depth.
 *
 * @param {Object[]} blocks The Carousel's inner blocks (block objects with
 *                          innerBlocks, from the block editor store).
 * @param {string}   name   Block name, e.g. 'gopublish/carousel-navigation'.
 * @return {Object|undefined} The block, if the carousel has one.
 */
export function findPart( blocks, name ) {
	for ( const block of blocks ) {
		if ( block.name === name ) {
			return block;
		}
		if ( ! NOT_PARTS.includes( block.name ) ) {
			const found = findPart( block.innerBlocks ?? [], name );
			if ( found ) {
				return found;
			}
		}
	}
	return undefined;
}
