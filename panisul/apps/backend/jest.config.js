export default {
	testEnvironment: "node",
	transform: { "^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: "tsconfig.json" }] },
	moduleFileExtensions: ["ts", "js"],
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.test.ts"],
};