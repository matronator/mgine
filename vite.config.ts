import path from 'path';
import { defineConfig } from 'vite';
import packageJson from './package.json';

const getPackageName = () => {
    return packageJson.name;
};

const getPackageNameCamelCase = () => {
    try {
        return getPackageName().replace(/-./g, char => char[1].toUpperCase());
    } catch (err) {
        throw new Error("Name property in package.json is missing.");
    }
};

const fileName = {
    "mgine/testing": {
        es: `testing.esm.js`,
        cjs: `testing.cjs`,
        iife: `testing.iife.js`,
    },
    mgine: {
        es: `${getPackageName()}.esm.js`,
        cjs: `${getPackageName()}.cjs`,
        iife: `${getPackageName()}.iife.js`,
    },
};

const config = {
  mgine: {
    entry: path.resolve(__dirname, "src/index.ts"),
    name: 'Mgine',
    fileName: (format, entryName) => fileName[entryName][format],
  },
  testing: {
    entry: path.resolve(__dirname, "src/testing/index.ts"),
    name: 'MgineTesting',
    fileName: (format, entryName) => fileName[entryName][format],
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
