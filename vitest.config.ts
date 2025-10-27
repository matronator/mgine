/// <reference types="vitest/config" />
import { playwright, PlaywrightBrowserProvider } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from './vite.config';
import { UserConfig } from "vite";

export default mergeConfig(viteConfig, defineConfig({
    test: {
        projects: [
            {
                test: {
                    include: [
                        'test/unit/**/*.{test,spec}.ts',
                        'test/**/*.unit.{test,spec}.ts',
                        'test/unit/*.{test,spec}.ts',
                    ],
                    name: 'unit',
                    environment: 'jsdom',
                    setupFiles: ['vitest.setup.ts'],
                },
            },
        ],
        reporters: [
            ['default', { outputFile: './test-results.txt' }],
            ['html', { outputFile: './test-results.html' }],
            ['json', { outputFile: './test-results.json' }]
        ],
        outputFile: {
            html: './test-results.html',
            json: './test-results.json',
            default: './test-results.txt',
        },
        coverage: {
            exclude: ['dts-bundle-generator.config.ts', 'vitest.setup.ts', 'vitest-canvas-mock.ts', 'test-coverage/**', 'coverage/**'],
            reporter: [
                ['html-spa', { file: './test-coverage-spa.html', subdir: 'html-spa', projectRoot: './' }],
                ['html', { file: './test-coverage.html', subdir: 'html', projectRoot: './' }],
                ['json', { file: './test-coverage.json', subdir: 'json', projectRoot: './' }],
                ['text', { file: './test-coverage.txt', subdir: 'text', projectRoot: './' }],
            ],
            reportsDirectory: './test-coverage',
            enabled: true,
            reportOnFailure: true,
        },
        globals: true,
        environment: "jsdom",
        setupFiles: ['./vitest.setup.ts'],
        deps: {
            optimizer: {
                web: {
                    include: ['vitest-canvas-mock']
                }
            }
        },
        environmentOptions: {
            jsdom: {
                resources: 'usable',
            },
        }
    },
}) as UserConfig);
