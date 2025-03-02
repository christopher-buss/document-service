import style from "@isentinel/eslint-config";

export default style({
	formatters: false,
	jsonc: false,
	markdown: false,
	react: false,
	rules: {
		"shopify/prefer-class-properties": "off",
		"unicorn/filename-case": "off",
	},
	toml: false,
	type: "package",
	typescript: {
		parserOptions: {
			project: "tsconfig.build.json",
		},
		tsconfigPath: "tsconfig.build.json",
	},
	yaml: false,
});
