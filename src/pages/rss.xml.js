import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_PATHS, SITE_TITLE, SITE_URL } from '../consts';

export async function GET() {
	const posts = (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: SITE_URL,
		items: posts.map((post) => ({
			...post.data,
			link: SITE_PATHS.post(post.id),
		})),
	});
}
