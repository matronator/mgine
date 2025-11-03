const config = {
    compilationOptions: {
        preferredConfigPath: './tsconfig.json',
    },
    entries: [
        {
            filePath: "./src/index.ts",
            outFile: "./dist/mgine.d.ts",
            noCheck: false,
        },
        {
            filePath: "./src/testing/index.ts",
            outFile: "./dist/testing.d.ts",
            noCheck: false,
        },
    ],
};

module.exports = config;
