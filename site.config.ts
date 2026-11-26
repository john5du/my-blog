import siteConfig, { providers } from "./src/lib/config";

const env = import.meta.env ?? {};

const config = siteConfig({
	site: "https://blog.john5.work",
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
	comment: {
		enable: false
	},
	latest: ["note"]
});

const monolocale = Number(config.i18n.locales.length) === 1;

const comment = Boolean(config.comment && config.comment.enable !== false);

const turnstile = comment && env.CLOUDFLARE_TURNSTILE_SECRET_KEY ? env.CLOUDFLARE_TURNSTILE_SITE_KEY : undefined;

const push = comment && env.VAPID_PRIVATE_KEY ? env.VAPID_PUBLIC_KEY : undefined;

const email = comment && Boolean(env.EMAIL_FROM);

const { oauth, oauthConfig } = comment
	? providers({
			github: {
				name: "GitHub",
				logo: "simple-icons--github",
				clientID: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
				scopes: ["read:user"]
			},
			google: {
				name: "Google",
				logo: "simple-icons--google",
				clientID: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				scopes: ["profile"]
			}
		})
	: { oauth: [], oauthConfig: {} };

if ((oauth.length > 0 || email) && !env.PASS_KEY) {
	throw new Error("PASS_KEY is required when OAuth or email notification is enabled");
}

export { comment, turnstile, oauth, oauthConfig, monolocale, push, email };

export default config;
