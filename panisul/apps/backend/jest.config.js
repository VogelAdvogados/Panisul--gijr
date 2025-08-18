export default {
	testEnvironment: "node",
	transform: { 
		"^.+\\.(t|j)sx?$": ["ts-jest", { 
			useESM: true,
			tsconfig: "tsconfig.json"
		}] 
	},
	moduleFileExtensions: ["ts", "js"],
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.test.ts"],
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1"
	}
};