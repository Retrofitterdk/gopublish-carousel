/**
 * The Query Loop that the Posts carousel variation and "Add to carousel →
 * Posts" put in Carousel Slides: the latest posts, a slide each, with the
 * featured image and the title.
 */
import { __ } from '@wordpress/i18n';

/**
 * The Query Loop as a block template ([ name, attributes, inner blocks ]).
 *
 * The query is core's default with a custom (not inherited) query: the
 * latest posts. The number of posts is left empty, like in any new Query
 * Loop, so it comes from the site's "Blog pages show at most" setting (the
 * Query Loop's editor fills it in).
 *
 * The title is the only link, so each slide is one stop for keyboard users;
 * the images get the same shape, so the slides line up.
 *
 * @return {Array} Block template.
 */
export function getPostsQueryTemplate() {
	return [
		'core/query',
		{
			query: {
				perPage: null,
				pages: 0,
				offset: 0,
				postType: 'post',
				order: 'desc',
				orderBy: 'date',
				author: '',
				search: '',
				exclude: [],
				sticky: '',
				inherit: false,
			},
			metadata: { name: __( 'Posts', 'gopublish-carousel' ) },
		},
		[
			[
				'core/post-template',
				{},
				[
					[
						'core/post-featured-image',
						{ aspectRatio: '4/3', scale: 'cover' },
					],
					[ 'core/post-title', { level: 3, isLink: true } ],
				],
			],
		],
	];
}
