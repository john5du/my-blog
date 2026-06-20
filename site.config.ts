import siteConfig from "./src/lib/config";

const config = siteConfig({
	title: "卿之羽",
	prologue: "记录日常折腾的技术笔记。",
	author: {
		name: "卿之羽",
		link: "https://blog.john5.work"
	},
	description: "记录日常折腾的技术笔记。",
	copyright: {
		type: "CC BY-NC-ND 4.0",
		year: "2021-2026"
	},
	timezone: "Asia/Shanghai",
	i18n: {
		locales: ["zh-cn"],
		defaultLocale: "zh-cn"
	},
	pagination: {
		note: 10,
		jotting: 24
	},
	heatmap: {
		unit: "day",
		weeks: 20
	},
	feed: {
		section: ["note"],
		limit: 20
	},
	latest: ["note"]
});

export const monolocale = Number(config.i18n.locales.length) === 1;

export default config;
