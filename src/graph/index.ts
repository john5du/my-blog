import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const fontPath = require.resolve("@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-700-normal.woff");

/**
 * Load the local Chinese serif font used for generated Open Graph images.
 * @param locale locale code
 * @returns Font data
 */
export async function loadFont(_locale: string) {
	return fs.promises.readFile(fontPath);
}
