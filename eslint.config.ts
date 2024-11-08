import style from "@isentinel/eslint-config";

export default style({
	rules: {
		"shopify/prefer-class-properties": "off",
		"unicorn/filename-case": "off",
	},
	typescript: {
		parserOptions: {
			project: "tsconfig.build.json",
		},
		tsconfigPath: "tsconfig.build.json",
	},
});
