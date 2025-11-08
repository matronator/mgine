import path from 'path';
import { defineConfig } from 'vite';

const fileName = {
    "mgine/testing": {
        es: `testing.esm.js`,
        cjs: `testing.cjs`,
        iife: `testing.iife.js`,
    },
    mgine: {
        es: `mgine.esm.js`,
        cjs: `mgine.cjs`,
        iife: `mgine.iife.js`,
    },
};

const config = {
  mgine: {
    entry: path.resolve(__dirname, "src/index.ts"),
    name: 'Mgine',
    fileName: (format: string, entryName: string) => fileName[entryName][format],
  },
  testing: {
    entry: path.resolve(__dirname, "src/testing/index.ts"),
    name: 'MgineTesting',
    fileName: (format: string, entryName: string) => fileName[entryName][format],
  },
};

const rollupInputs = {
    mgine: {
        "mgine": path.resolve(__dirname, "src/index.ts"),
    },
    testing: {
        "mgine/testing": path.resolve(__dirname, "src/testing/index.ts"),
    }
}

const currentConfig = config[process.env.LIB_NAME ?? 'mgine'];
const currentInput = rollupInputs[process.env.LIB_NAME ?? 'mgine'];

if (currentConfig === undefined || currentInput === undefined) {
  throw new Error('LIB_NAME is not defined or is not valid');
}

const formats = Object.keys(fileName.mgine) as Array<keyof typeof fileName.mgine>;

export default defineConfig({
    base: "./",
    build: {
        outDir: "./dist",
        lib: {
            ...currentConfig,
            formats,
        },
        emptyOutDir: false,
        minify: 'terser',
        terserOptions: {
            keep_classnames: true,
            keep_fnames: true,
        },
        rollupOptions: {
            output: {
                exports: 'named',
                compact: true,
                esModule: true,
                preserveModules: false,
            },
            input: currentInput,
        }
    },
    resolve: {
        alias: [
            { find: "@", replacement: path.resolve(__dirname, "src") },
            { find: "@@", replacement: path.resolve(__dirname) },
            { find: "@/testing", replacement: path.resolve(__dirname, "src", "testing") },
        ],
    },
});
