module.exports = {
	root: true,
	env: { es2021: true, node: true, browser: true },
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "react", "react-hooks", "import"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
	],
	settings: { react: { version: "detect" } },
	overrides: [
		{ files: ["**/*.ts", "**/*.tsx"], parserOptions: { ecmaVersion: "latest", sourceType: "module" } }
	],
	rules: {
		"react/prop-types": "off",
		"@typescript-eslint/no-explicit-any": "off"
	}
};