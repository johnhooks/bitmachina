module.exports = {
	parser: "@typescript-eslint/parser",
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:import/recommended",
		"plugin:import/typescript",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
		"prettier",
	],
	plugins: ["@typescript-eslint"],
	ignorePatterns: ["*.cjs"],
	rules: {
		"import/order": [
			"error",
			{
				alphabetize: {
					order: "asc",
					caseInsensitive: true,
				},
				"newlines-between": "always",
				groups: ["builtin", "external", "parent", "sibling", "index"],
				pathGroupsExcludedImportTypes: ["builtin"],
			},
		],
		"react/react-in-jsx-scope": ["off"],
	},
	overrides: [
		{
			files: ["**/?(*.)+(spec|test).ts"],
			extends: ["plugin:testing-library/dom", "plugin:jest-dom/recommended"],
		},
	],
	settings: {
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"],
		},
		"import/resolver": {
			typescript: {
				alwaysTryTypes: true,
				project: ["./apps/website", "./packages/scope"],
			},
		},
	},
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
};
