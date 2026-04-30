export const SITE_TITLE = '卿之羽';
export const SITE_DESCRIPTION = '记录日常折腾的技术笔记。';
export const SITE_URL = 'https://blog.john5.work';

export const SITE_PATHS = {
	home: '/',
	blog: '/blog/',
	about: '/about/',
	rss: '/rss.xml',
	sitemap: '/sitemap-index.xml',
	faviconSvg: '/favicon.svg',
	faviconIco: '/favicon.ico',
	post: (id: string) => `/blog/${id}/`,
} as const;
