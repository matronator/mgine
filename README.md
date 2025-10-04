# Mgine

![Ping Tracker logo](.github/logo.png)

![NPM Version](https://img.shields.io/npm/v/mgine) ![NPM Downloads](https://img.shields.io/npm/dw/mgine) ![npm TypeScript version](https://img.shields.io/npm/dependency-version/mgine/dev/typescript) ![Tree shaking](https://badgen.net/bundlephobia/tree-shaking/mgine) ![Dependencies](https://badgen.net/bundlephobia/dependency-count/mgine) ![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/mgine) ![Commits](https://badgen.net/github/commits/matronator/mgine) ![Issues](https://img.shields.io/github/issues/matronator/mgine.svg) ![License](https://img.shields.io/github/license/matronator/mgine.svg) <a href="https://github.com/matronator">![Follow](https://img.shields.io/github/followers/matronator.svg?style=social&label=Follow&maxAge=2592000)</a> <a href="https://github.com/sponsors/matronator/">![GitHub Sponsors](https://img.shields.io/github/sponsors/matronator)</a>

**Mgine** (read as *em*gine) is a simple library to make working with HTML5 canvas graphics easier.

## Installation

```
npm i mgine
```

```
pnpm i mgine
```

```
yarn add mgine
```

```
bun i mgine
```

## Usage

```js
import { Mgine } from 'mgine';

const mgine = Mgine.Init('canvas-id');
mgine.fillRect({ x: 10, y: 10 }, { width: 50, height: 50 }, 'green');
```
