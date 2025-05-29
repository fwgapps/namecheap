# @fwgapps/namecheap

<!-- STATUS -->
[![CI/CD Pipeline](https://github.com/fwgapps/namecheap/actions/workflows/publish.yml/badge.svg)](https://github.com/fwgapps/namecheap/actions/workflows/publish.yml)
[![Codecov](https://codecov.io/gh/fwgapps/namecheap/branch/main/graph/badge.svg)](https://codecov.io/gh/fwgapps/namecheap)
![Maintenance](https://img.shields.io/maintenance/yes/2025)

<!-- NPM -->
[![npm](https://img.shields.io/npm/v/@fwgapps/namecheap)](https://www.npmjs.com/package/@fwgapps/namecheap)
![npm downloads](https://img.shields.io/npm/dm/@fwgapps/namecheap)
[![bundlephobia](https://img.shields.io/bundlephobia/minzip/@fwgapps/namecheap)](https://bundlephobia.com/result?p=@fwgapps/namecheap)
[![dependencies](https://img.shields.io/librariesio/release/npm/@fwgapps/namecheap)](https://libraries.io/npm/@fwgapps/namecheap)

<!-- META -->
![license](https://img.shields.io/npm/l/@fwgapps/namecheap)
![TypeScript](https://img.shields.io/badge/typescript-%233178C6.svg?logo=typescript)
![issues](https://img.shields.io/github/issues/fwgapps/namecheap)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

A clean and simple TypeScript wrapper for the Namecheap API, with strongly typed responses and modern developer ergonomics.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Running Tests](#running-tests)
- [Scripts](#scripts)
- [API Coverage](#api-coverage)
- [License](#license)
- [Contributing](#contributing)

## Description
A lightweight and developer-friendly TypeScript client for the Namecheap API. Designed for both Node.js and browser environments, it provides full type safety with comprehensive TypeScript definitions. This library simplifies and automates domain management tasks, enabling developers to integrate Namecheap's services seamlessly into their applications.

## Features
* Fully typed API responses using TypeScript
* Supports both ESM and CommonJS projects
* Easy-to-use, object-oriented interface
* Works in Node.js and modern runtimes
* Includes real-world usage examples with Express.js

## Installation
You can install the library via npm or yarn:

### Using npm
```bash
npm install @fwgapps/namecheap
```

### Using yarn
```bash
yarn add @fwgapps/namecheap
```

### Browser / CDN Usage

You can also use the library directly in the browser via CDN without bundlers or Node.js.

Just include this script tag in your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@fwgapps/namecheap/dist/index.global.js"></script>
```

## Examples
The repository contains real examples, including usage with Express.js:
```bash
git clone git@github.com:fwgapps/namecheap.git
cd examples/express
yarn
yarn run dev
```

## Running Tests
We use Vitest for unit testing:
```bash
yarn test
```

## Scripts
* `build`: Compile the code using tsup
* `test`: Run tests with Vitest
* `lint`: Lint code using ESLint
* `release`: Release a new version using semantic-release

## API Coverage
Check the [API Docs](https://www.namecheap.com/support/api/methods) for full endpoint support. This library aims to cover the most-used endpoints first, with plans to expand.

## License
This project is licensed under the [ISC License](./LICENSE).

## Contributing
Feel free to open an issue or submit a pull request if you'd like to contribute!

